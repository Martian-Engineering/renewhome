# CloudWatch Logs Runbook for Presentation Demo

This runbook provides detailed instructions on how to interact with, monitor, and debug the CloudWatch logging system for the presentation demo.

## AWS CLI Setup

All commands in this runbook use the AWS CLI with the `martian` profile and `us-west-2` region:

```bash
# Base format for all commands
aws [service] [command] --profile martian --region us-west-2 [options]
```

## Architecture Overview

The logging system consists of:

1. **Lambda Function**: `presentation-logger` - Receives log events and writes to CloudWatch
2. **API Gateway**: `presentation-logger-api` - Exposes HTTP endpoint for the Lambda
3. **CloudWatch Log Groups**:
   - `/presentation-demo/slide-events` - Main log group for presentation events
   - `/aws/lambda/presentation-logger` - Lambda execution logs

## Querying Log Streams

### Listing Log Streams

To view all available log streams in the main log group:

```bash
aws logs describe-log-streams \
  --log-group-name "/presentation-demo/slide-events" \
  --profile martian \
  --region us-west-2
```

For Lambda logs:

```bash
aws logs describe-log-streams \
  --log-group-name "/aws/lambda/presentation-logger" \
  --profile martian \
  --region us-west-2
```

### Reading Log Events

To read events from a specific log stream:

```bash
aws logs get-log-events \
  --log-group-name "/presentation-demo/slide-events" \
  --log-stream-name "slide-events-2025-05-08" \
  --profile martian \
  --region us-west-2
```

Note: The log stream name includes the date (format: `slide-events-YYYY-MM-DD`).

### Filtering Log Events

To search across all streams in a log group:

```bash
aws logs filter-log-events \
  --log-group-name "/presentation-demo/slide-events" \
  --filter-pattern "eventType" \
  --profile martian \
  --region us-west-2
```

For specific event types:

```bash
aws logs filter-log-events \
  --log-group-name "/presentation-demo/slide-events" \
  --filter-pattern "slide_navigation" \
  --profile martian \
  --region us-west-2
```

### Getting the Latest Logs

To see the most recent log entries:

```bash
aws logs get-log-events \
  --log-group-name "/presentation-demo/slide-events" \
  --log-stream-name "slide-events-$(date +%Y-%m-%d)" \
  --limit 10 \
  --profile martian \
  --region us-west-2
```

## Testing and Verification

### Testing with curl

Send a test log event:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"eventType":"test","slideId":"test-slide"}' \
  https://8yjaa747xl.execute-api.us-west-2.amazonaws.com/prod/log
```

### Verifying Lambda Execution

To directly invoke the Lambda function:

```bash
aws lambda invoke \
  --function-name presentation-logger \
  --payload '{"body": "{\"eventType\":\"test\",\"slideId\":\"test-slide\"}"}' \
  --cli-binary-format raw-in-base64-out \
  --profile martian \
  --region us-west-2 \
  output.json
```

Check the Lambda output:

```bash
cat output.json
```

## Troubleshooting

### Checking Lambda Permissions

If logs are not appearing, check the Lambda execution role permissions:

```bash
aws iam get-role \
  --role-name presentation-logger-role \
  --profile martian

aws iam list-role-policies \
  --role-name presentation-logger-role \
  --profile martian
```

View the policy details:

```bash
aws iam get-role-policy \
  --role-name presentation-logger-role \
  --policy-name presentation-logger-policy \
  --profile martian
```

### Checking API Gateway Configuration

To verify the API Gateway configuration:

```bash
aws apigatewayv2 get-api \
  --api-id 8yjaa747xl \
  --profile martian \
  --region us-west-2

aws apigatewayv2 get-routes \
  --api-id 8yjaa747xl \
  --profile martian \
  --region us-west-2
```

### Monitoring Lambda Errors

To check Lambda execution errors:

```bash
# Get the latest log stream
LATEST_STREAM=$(aws logs describe-log-streams \
  --log-group-name "/aws/lambda/presentation-logger" \
  --order-by LastEventTime \
  --descending \
  --limit 1 \
  --profile martian \
  --region us-west-2 \
  --query 'logStreams[0].logStreamName' \
  --output text)

# Get log events
aws logs get-log-events \
  --log-group-name "/aws/lambda/presentation-logger" \
  --log-stream-name "$LATEST_STREAM" \
  --profile martian \
  --region us-west-2
```

### Common Errors

1. **Lambda Permission Issues**:
   - Error: "User is not authorized to perform: logs:PutLogEvents"
   - Solution: Update the IAM role with CloudWatch Logs permissions

2. **Missing Log Group**:
   - Error: "ResourceNotFoundException: The specified log group does not exist"
   - Solution: Create the log group manually
   ```bash
   aws logs create-log-group \
     --log-group-name "/presentation-demo/slide-events" \
     --profile martian \
     --region us-west-2
   ```

3. **API Gateway Integration Issues**:
   - Error: "Internal Server Error" when calling the API endpoint
   - Solution: Check Lambda permissions for API Gateway
   ```bash
   aws lambda add-permission \
     --function-name presentation-logger \
     --statement-id api-gateway-permission \
     --action lambda:InvokeFunction \
     --principal apigateway.amazonaws.com \
     --source-arn "arn:aws:execute-api:us-west-2:767828764585:8yjaa747xl/*" \
     --profile martian \
     --region us-west-2
   ```

## Using Log-Analyzer-with-MCP

To connect the Log-Analyzer-with-MCP tool to your CloudWatch logs:

1. Clone the repository:
   ```bash
   git clone https://github.com/awslabs/Log-Analyzer-with-MCP.git
   cd Log-Analyzer-with-MCP
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up AWS credentials (use the martian profile):
   ```bash
   export AWS_PROFILE=martian
   export AWS_REGION=us-west-2
   ```

4. Run the MCP server:
   ```bash
   python mcp_server.py
   ```

5. Connect to the MCP server from Claude or another LLM, and use it to query logs.

## Log Format Reference

The logs stored in CloudWatch have the following structure:

```json
{
  "eventType": "slide_navigation",
  "slideId": "introduction",
  "fromSlide": "previous-slide-id",
  "toSlide": "introduction",
  "sessionId": "user-session-id",
  "timestamp": "2025-05-08T21:00:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "source": "next-js-presentation",
  "recordedAt": "2025-05-08T21:00:01.123Z"
}
```

### Event Types

- `slide_navigation`: Logged when users navigate between slides
- `user_interaction`: Logged when users interact with slide content

## Further Resources

- [AWS CloudWatch Logs CLI Reference](https://docs.aws.amazon.com/cli/latest/reference/logs/)
- [AWS Lambda CLI Reference](https://docs.aws.amazon.com/cli/latest/reference/lambda/)
- [Log-Analyzer-with-MCP GitHub Repository](https://github.com/awslabs/Log-Analyzer-with-MCP)