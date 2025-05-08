# RenewHome AI Presentation Demo

This monorepo contains components for demonstrating AI-assisted development through CloudWatch logs and the Model Context Protocol (MCP).

## Repository Structure

- **presentation/**: Next.js slide presentation with CloudWatch logging integration
- **cloudwatch-lambda/**: AWS Lambda function for receiving and writing logs to CloudWatch

## Setup

### Prerequisites

- Node.js 18+
- AWS CLI configured with appropriate credentials
- An AWS account with permissions for Lambda, API Gateway, and CloudWatch

### CloudWatch Lambda Deployment

The Lambda function handles logging from the presentation to CloudWatch:

```bash
cd cloudwatch-lambda
./deploy.sh
```

### Presentation Setup

To run the slide presentation locally:

```bash
cd presentation
npm install
# Create .env.local with the CloudWatch API endpoint from Lambda deployment
npm run dev
```

## Features

- **Slide Presentation** - Interactive presentation about AI-assisted development
- **CloudWatch Logging** - Real-time logging of user interactions and slide navigation
- **MCP Integration** - Demo of AI-assisted log analysis using MCP

## Documentation

- See `presentation/cloudwatch-logs-runbook.md` for CloudWatch operations
- See `cloudwatch-lambda/README.md` for Lambda deployment details