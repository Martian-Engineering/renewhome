#!/bin/bash
set -e

# Configuration
FUNCTION_NAME="presentation-logger"
LOG_GROUP_NAME="/presentation-demo/slide-events"
ROLE_NAME="presentation-logger-role"
API_NAME="presentation-logger-api"
AWS_REGION="us-east-1"
AWS_PROFILE="martian"

echo "Deploying presentation logger Lambda function..."

# Create zip package
echo "Creating Lambda deployment package..."
rm -f function.zip
zip -r function.zip index.js node_modules

# Create IAM role if it doesn't exist
echo "Setting up IAM role..."
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text --profile $AWS_PROFILE 2>/dev/null || echo "")

if [ -z "$ROLE_ARN" ]; then
  echo "Creating new IAM role: $ROLE_NAME"
  
  # Create trust policy document
  cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

  # Create role
  ROLE_ARN=$(aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document file://trust-policy.json \
    --query 'Role.Arn' \
    --output text \
    --profile $AWS_PROFILE)
  
  # Create policy document for CloudWatch Logs
  cat > policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": [
        "arn:aws:logs:$AWS_REGION:*:log-group:$LOG_GROUP_NAME:*",
        "arn:aws:logs:$AWS_REGION:*:log-group:$LOG_GROUP_NAME"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:$AWS_REGION:*:log-group:/aws/lambda/$FUNCTION_NAME:*"
    }
  ]
}
EOF

  # Attach policy
  aws iam put-role-policy \
    --role-name $ROLE_NAME \
    --policy-name "${ROLE_NAME}-policy" \
    --policy-document file://policy.json \
    --profile $AWS_PROFILE
  
  # Give AWS time to propagate the role
  echo "Waiting for IAM role to propagate..."
  sleep 10
fi

echo "Role ARN: $ROLE_ARN"

# Create CloudWatch Log Group if it doesn't exist
echo "Creating CloudWatch Log Group if it doesn't exist..."
aws logs create-log-group --log-group-name "$LOG_GROUP_NAME" --profile $AWS_PROFILE 2>/dev/null || true

# Check if Lambda function exists
FUNCTION_EXISTS=$(aws lambda get-function --function-name $FUNCTION_NAME --query 'Configuration.FunctionName' --output text --profile $AWS_PROFILE 2>/dev/null || echo "")

if [ -z "$FUNCTION_EXISTS" ]; then
  # Create Lambda function
  echo "Creating Lambda function: $FUNCTION_NAME"
  aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --runtime nodejs18.x \
    --handler index.handler \
    --role $ROLE_ARN \
    --zip-file fileb://function.zip \
    --environment "Variables={LOG_GROUP_NAME=$LOG_GROUP_NAME}" \
    --timeout 30 \
    --profile $AWS_PROFILE
else
  # Update Lambda function
  echo "Updating Lambda function: $FUNCTION_NAME"
  aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://function.zip \
    --profile $AWS_PROFILE > /dev/null
  
  # Update configuration
  aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --environment "Variables={LOG_GROUP_NAME=$LOG_GROUP_NAME}" \
    --timeout 30 \
    --profile $AWS_PROFILE > /dev/null
fi

# Check if API Gateway exists
API_ID=$(aws apigatewayv2 get-apis --query "Items[?Name=='$API_NAME'].ApiId" --output text --profile $AWS_PROFILE)

if [ -z "$API_ID" ]; then
  echo "Creating API Gateway: $API_NAME"
  
  # Create HTTP API
  API_ID=$(aws apigatewayv2 create-api \
    --name $API_NAME \
    --protocol-type HTTP \
    --cors-configuration "AllowOrigins=['*'],AllowMethods=['POST','OPTIONS'],AllowHeaders=['Content-Type']" \
    --query 'ApiId' \
    --output text \
    --profile $AWS_PROFILE)
  
  # Get Lambda function ARN
  LAMBDA_ARN=$(aws lambda get-function \
    --function-name $FUNCTION_NAME \
    --query 'Configuration.FunctionArn' \
    --output text \
    --profile $AWS_PROFILE)
  
  # Create integration
  INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --api-id $API_ID \
    --integration-type AWS_PROXY \
    --integration-uri $LAMBDA_ARN \
    --payload-format-version 2.0 \
    --query 'IntegrationId' \
    --output text \
    --profile $AWS_PROFILE)
  
  # Create route
  aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key "POST /log" \
    --target "integrations/$INTEGRATION_ID" \
    --profile $AWS_PROFILE > /dev/null
  
  # Create OPTIONS route for CORS
  aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key "OPTIONS /log" \
    --target "integrations/$INTEGRATION_ID" \
    --profile $AWS_PROFILE > /dev/null
  
  # Deploy API
  STAGE_NAME="prod"
  aws apigatewayv2 create-deployment \
    --api-id $API_ID \
    --profile $AWS_PROFILE > /dev/null
  
  aws apigatewayv2 create-stage \
    --api-id $API_ID \
    --stage-name $STAGE_NAME \
    --auto-deploy \
    --profile $AWS_PROFILE > /dev/null
  
  # Add permission for API Gateway to invoke Lambda
  aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id apigateway-permission \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$AWS_REGION:$(aws sts get-caller-identity --query 'Account' --output text --profile $AWS_PROFILE):$API_ID/*" \
    --profile $AWS_PROFILE > /dev/null
else
  echo "API Gateway already exists: $API_ID"
fi

# Get API endpoint URL
API_URL=$(aws apigatewayv2 get-api \
  --api-id $API_ID \
  --query 'ApiEndpoint' \
  --output text \
  --profile $AWS_PROFILE)

echo ""
echo "Deployment completed successfully!"
echo ""
echo "API Endpoint: $API_URL/log"
echo ""
echo "Test with: curl -X POST -H 'Content-Type: application/json' -d '{\"eventType\":\"test\",\"slideId\":\"intro\"}' $API_URL/log"
echo ""
echo "Add this endpoint to your Next.js application's environment variables:"
echo ""
echo "NEXT_PUBLIC_CLOUDWATCH_API=$API_URL"