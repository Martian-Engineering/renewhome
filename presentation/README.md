# AI-Assisted Development Presentation

This presentation demonstrates AI-assisted development techniques, particularly the Model Context Protocol (MCP) for connecting Large Language Models to external services like AWS CloudWatch.

## Features

- **Slide-based Presentation**: Built with Next.js
- **CloudWatch Integration**: Logs user actions for AI analysis demo
- **MCP Integration**: Connects Claude or other LLMs to real-time CloudWatch logs

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## CloudWatch Integration

This presentation includes CloudWatch logging of user interactions:

1. **Setup**:
   - The logging system is configured in `.env.local`
   - The API endpoint for CloudWatch is configured via `NEXT_PUBLIC_CLOUDWATCH_API`

2. **What Gets Logged**:
   - Slide navigation (when switching between slides)
   - User interactions (clicks on slide content)
   - Each log includes a session ID, timestamp, and slide information

3. **Viewing Logs**:
   - See the `cloudwatch-logs-runbook.md` for detailed instructions
   - Use the AWS CLI to query logs
   - Connect to logs with Log-Analyzer-with-MCP for AI-assisted analysis

4. **Demo Slide**:
   - The `cloudwatch-demo.md` slide demonstrates the logging functionality
   - It includes an interactive button to create custom log events

## MCP Integration

During the presentation, you can demonstrate connecting Claude or other LLMs to CloudWatch logs using:

1. [Log-Analyzer-with-MCP](https://github.com/awslabs/Log-Analyzer-with-MCP)
2. Follow the setup instructions in `cloudwatch-logs-runbook.md`
