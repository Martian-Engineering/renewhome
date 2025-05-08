# Presentation CloudWatch Logger

This is a simple AWS Lambda function that logs presentation slide navigation and interaction events to CloudWatch. It works with the Next.js presentation to demonstrate AWS CloudWatch logging for the [Log-Analyzer-with-MCP](https://github.com/awslabs/Log-Analyzer-with-MCP) demo.

## Setup

1. Make sure you have AWS CLI installed and configured with the `martian` profile.

2. Deploy the Lambda function and API Gateway:

```bash
# Navigate to the cloudwatch-lambda directory
cd /Users/josh/Projects/renewhome/cloudwatch-lambda

# Deploy the Lambda and API Gateway
./deploy.sh
```

3. After deployment, the script will output the API Gateway endpoint. Copy this endpoint and create a `.env.local` file in the presentation directory:

```
# /Users/josh/Projects/renewhome/presentation/.env.local
NEXT_PUBLIC_CLOUDWATCH_API=https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com
```

4. Restart your Next.js development server for the environment variable to take effect.

## Testing

You can test the API with curl:

```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"eventType":"test","slideId":"intro"}' \
  https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com/log
```

## CloudWatch Logs

Logs will be stored in the `/presentation-demo/slide-events` log group in CloudWatch. You can view them in the AWS Console or use the [Log-Analyzer-with-MCP](https://github.com/awslabs/Log-Analyzer-with-MCP) to query and analyze them.

## Frontend Integration

The presentation application uses the `cloudwatch-logger.js` module to log:

1. Slide navigation events (`slide_navigation`)
2. User interaction events (`user_interaction`)

Each log entry includes:
- Event type
- Session ID (generated per page load)
- Timestamp
- User agent
- Slide/interaction information