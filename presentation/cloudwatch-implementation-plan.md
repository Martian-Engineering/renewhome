# CloudWatch Implementation Plan for Presentation Demo

Absolutely, here's a comprehensive implementation plan for integrating AWS CloudWatch logging into your Next.js slide presentation, designed specifically for a live demo using [Log-Analyzer-with-MCP](https://github.com/awslabs/Log-Analyzer-with-MCP).

---

## 1. Architecture Diagram Explanation

**Components:**
- **Next.js Frontend**: The presentation app, running in the browser
- **API Gateway REST API**: Serves as a secure interface for log submissions from the frontend
- **AWS Lambda Function**: Receives API requests and submits logs to CloudWatch Logs
- **CloudWatch Logs Group**: Stores the custom logs
- **Log-Analyzer-with-MCP**: Queries CloudWatch logs for demo/analysis; runs separately

**Diagram:**
```
          [Browser / Next.js Slides App]
                      |
        (HTTPS - Slide Navigation or Interaction Event)
                      |
             [API Gateway REST API]
                      |
              [AWS Lambda Function]
                      |
              [CloudWatch Logs Group]
                      |
          [Log-Analyzer-with-MCP (AI Log Analysis)]
```

- User actions (e.g., changing slides) in browser POST log events to the API Gateway.
- API Gateway passes requests to a Lambda function, which writes them to CloudWatch Logs.
- Log Analyzer tools (Log-Analyzer-with-MCP) query and analyze logs for the demo.

---

## 2. Step-by-Step Implementation Guide

### **Step 1: Setup AWS Infrastructure**

#### a. **Create a CloudWatch Log Group**

- Name: `/presentation-demo/slide-events`
    - Can use AWS Console, CLI, or CDK/CloudFormation.

#### b. **Lambda Function (write-logs-to-cloudwatch)**
- Receives log data via POST, writes events to the log group.
- Node.js 18.x runtime is recommended.

#### c. **API Gateway**
- REST API (or HTTP API).
- Endpoint: `POST /log` (for log submissions)
- Integrate with the Lambda function.

#### d. **IAM Policies**
- Lambda needs permissions:  
  - Write to the CloudWatch Log Group (logs:PutLogEvents, logs:CreateLogStream, logs:DescribeLogStreams)

#### e. **(Optional for Demo) Create API Keys**
- Throttle or restrict who can submit logs.

---

### **Step 2: Backend - Lambda Function**

- **Handler receives events** from API Gateway (JSON POST with event details).
- **Validates** event content (e.g., required fields: timestamp, eventType, slideId, user info if available).
- **Writes to Log Group** as a structured JSON event.

---

### **Step 3: Backend - API Gateway**

- Accepts requests from any origin for demo (restrict in production!).
- Configures Lambda proxy integration.
- Enables CORS for frontend.

---

### **Step 4: Frontend Integration (Next.js)**

- **When to log?**
  - On slide transitions (Arrow keys, navigation via router)
  - On specific interactions (buttons, timers, or quiz answers)
- **How to log?**
  - Use `fetch` to POST to the API Gateway endpoint.
- **What to log?**
  - Slide ID, from/to slide number, timestamp, session/user ID, interaction type, optional metadata.
- **Keep logs lightweight** so logging won't affect UX.

---

## 3. Code Samples

### A. **Lambda Function (Node.js 18.x)**
_(Assuming environment variable LOG_GROUP_NAME is set)_

```js
import { CloudWatchLogsClient, CreateLogStreamCommand, DescribeLogStreamsCommand, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";

const LOG_GROUP_NAME = process.env.LOG_GROUP_NAME || "/presentation-demo/slide-events";
// ... (Best practice: Store log stream per day or presentation session)
const LOG_STREAM_PREFIX = "slide-events-";

const logs = new CloudWatchLogsClient({});

/**
 * Helper: Get or create log stream for today
 */
async function getLogStreamName() {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const logStreamName = `${LOG_STREAM_PREFIX}${date}`;
  // Describe if exists
  const desc = await logs.send(new DescribeLogStreamsCommand({
    logGroupName: LOG_GROUP_NAME,
    logStreamNamePrefix: logStreamName,
    limit: 1
  }));
  if (!desc.logStreams.length) {
    await logs.send(new CreateLogStreamCommand({
      logGroupName: LOG_GROUP_NAME,
      logStreamName
    }));
    return logStreamName;
  }
  return logStreamName;
}

// Lambda handler
export const handler = async (event) => {
  // Accept logs via POST body (API Gateway proxy integration)
  const logEvent = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  // You can add validation here!

  const logStreamName = await getLogStreamName();
  // Get upload sequence token
  const streams = await logs.send(new DescribeLogStreamsCommand({
    logGroupName: LOG_GROUP_NAME,
    logStreamNamePrefix: logStreamName
  }));
  const token = streams.logStreams.find(s => s.logStreamName === logStreamName)?.uploadSequenceToken;

  // Prepare log entry
  const message = JSON.stringify({
    ...logEvent, // { eventType, slideId, ... }
    source: "next-js-presentation",
    timestamp: new Date().toISOString()
  });

  const params = {
    logGroupName: LOG_GROUP_NAME,
    logStreamName,
    logEvents: [{
      message,
      timestamp: Date.now()
    }],
    ...(token ? { sequenceToken: token } : {})
  };

  await logs.send(new PutLogEventsCommand(params));
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
```

---

### B. **API Gateway Configuration**

- **Method**: POST `/log`
- **Integration**: Lambda proxy
- **CORS**:  
  - Allow Origin: `*` (demo)  
  - Allow Headers: `Content-Type`
- **Throttle/Rate Limit**: Optional
- **API Key**: Optional for demo

---

### C. **Frontend Integration (Next.js: slides page or SlideClientComponent)**
Insert this into your client-side event handler:

```tsx
// In SlideClientComponent.tsx or similar

function logToCloudWatch(eventType, data) {
  // Replace with your API Gateway endpoint!
  fetch("https://<API_GATEWAY_ID>.execute-api.<region>.amazonaws.com/prod/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Optionally: Add x-api-key header if protected by API Key
    },
    body: JSON.stringify({
      eventType,
      slideId: data.slideId,
      fromSlide: data.fromSlide,
      toSlide: data.toSlide,
      userSession: getSessionId(), // (can be a random uuid/v4 per reload)
      timestamp: new Date().toISOString(),
      ...data
    }),
  }).catch((err) => {
    // Maybe report locally in the UI for demo?
    console.error("Log API error", err);
  });
}

// Example usage on slide change:
useEffect(() => {
  const currentSlide = slides[slideIndex]; // update this as per your state mgmt
  logToCloudWatch("slide_navigation", {
    slideId: currentSlide.id,
    fromSlide: prevSlideId,
    toSlide: currentSlide.id,
  });
}, [slideIndex]);
```

For maximum effect, log both navigation and user-specific interactions, e.g., button clicks, quiz answers.

---

## 4. Security Considerations & IAM Policies

### Lambda Execution Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:PutLogEvents",
        "logs:CreateLogStream",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:<region>:<account_id>:log-group:/presentation-demo/slide-events:*"
    }
  ]
}
```

### API Gateway Security
- **Demo**: Open CORS, public endpoint (but throttle!)
- **Production**: Use an API Key, IAM auth, or Cognito JWT.  
- **Input validation**: Lambda should validate log format.  
- **Rate limiting**: API Gateway default throttling; stricter if exposed to public.
- **Logging**: API Gateway should **not** log the full body if there's user PII.

**Note:** For a public demo, keep the endpoint open but clean up/delete after!

---

## 5. Testing Strategy

- **CloudWatch**: Confirm events appear in the group/stream within a few seconds.
- **Frontend**:  
  - Network: Observe outgoing POST requests with correct payload.
  - Error handling: Simulate backend 4xx/5xx to check frontend notification.
- **Lambda Logs**:  
  - Log errors for bad payloads, observe in Lambda console/CloudWatch.
- **Log-Analyzer-with-MCP**:  
  - Query newly generated events live, filter by session/user ID, slide ID, eventType.

**Automation:** Create a lightweight test script for stress testing/log flooding (optional).

---

## 6. Demo Script (Presentation Runbook)

### **Slide 1: Introduction**
- "We're logging user navigation and events to CloudWatch in real time."
- Open CloudWatch console, show Log Group, log streams.

### **Slide 2: Navigation Example**
- "Now I'll move to the next slide. Notice a _slide_navigation_ log event appears."
- Advance to next slide; show log entry appears in CloudWatch.

### **Slide 3: Interaction**
- "Let's interact with the demo (click a button/answer a quiz, etc)."
- As you interact, a _user_interaction_ log event is sent.
- Point out eventType, session, and slide IDs in the log.

### **Slide 4: Log Analyzer**
- "Now let's use Log-Analyzer-with-MCP to answer: Which slides were most visited? Or who interacted most?"
- Run AI Query (in Log-Analyzer-with-MCP):  
  - "Show me all navigation events in the last 10 minutes"
  - "Which slide received the most clicks?"
- Display the AI-generated analysis live.

### **Slide 5: Security & Wrap-up**
- "We use a Lambda-permissioned API, and rate-limit with API Gateway. All logs are ephemeral for the demo."
- "The same pattern can be used for real auditing, analytics, or debugging in production—just restrict public access."

---

## Appendix: Further Enhancements

- If you want **per-session analytics**, generate a UUIDv4 in client JS on page load and include it in all logs.
- To **simulate traffic**, run a script that performs automatic slide navigation and interaction.
- The same Lambda could support additional endpoints for querying or for future demo expansion.


---

**In summary:**  
- You wire up a Next.js client-side logger that POSTs slide/interactions to an API Gateway endpoint.
- The API Gateway invokes a Lambda, which puts structured logs into CloudWatch.
- You demonstrate the events' appearance in CloudWatch and do live queries using the Log-Analyzer-with-MCP tool for AI-driven analysis.