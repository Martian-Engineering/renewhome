const { CloudWatchLogsClient, CreateLogStreamCommand, DescribeLogStreamsCommand, PutLogEventsCommand } = require("@aws-sdk/client-cloudwatch-logs");

// Configure AWS SDK to use us-west-2 region
const LOG_GROUP_NAME = process.env.LOG_GROUP_NAME || "/presentation-demo/slide-events";
const LOG_STREAM_PREFIX = "slide-events-";

// Debug logs to help diagnose issues
console.log("Lambda cold start: Initializing with LOG_GROUP_NAME:", LOG_GROUP_NAME);

const logs = new CloudWatchLogsClient({ region: "us-west-2" });

/**
 * Helper: Get or create log stream for today
 */
async function getLogStreamName() {
  try {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const logStreamName = `${LOG_STREAM_PREFIX}${date}`;
    
    console.log(`Checking if log stream exists: ${logStreamName}`);
    
    // First, ensure the log group exists
    try {
      console.log(`Creating log group if it doesn't exist: ${LOG_GROUP_NAME}`);
      
      // This is a no-op if the group already exists
      await logs.send(new CreateLogStreamCommand({
        logGroupName: LOG_GROUP_NAME,
        logStreamName: `${LOG_STREAM_PREFIX}init`
      }));
    } catch (error) {
      // ResourceAlreadyExistsException is normal and expected
      if (error.name !== 'ResourceAlreadyExistsException') {
        console.error("Error creating log group:", error);
        // We'll continue anyway and try to create the stream
      }
    }
    
    // Describe if exists
    console.log(`Describing log streams for: ${logStreamName}`);
    const desc = await logs.send(new DescribeLogStreamsCommand({
      logGroupName: LOG_GROUP_NAME,
      logStreamNamePrefix: logStreamName,
      limit: 1
    }));
    
    console.log(`Log streams response:`, JSON.stringify(desc));
    
    if (!desc.logStreams || !desc.logStreams.length) {
      console.log(`Creating new log stream: ${logStreamName}`);
      try {
        await logs.send(new CreateLogStreamCommand({
          logGroupName: LOG_GROUP_NAME,
          logStreamName
        }));
        console.log(`Created log stream: ${logStreamName}`);
      } catch (error) {
        // If it already exists (race condition), that's fine
        if (error.name !== 'ResourceAlreadyExistsException') {
          console.error(`Error creating log stream: ${logStreamName}`, error);
          throw error;
        }
        console.log(`Log stream already exists (concurrent creation): ${logStreamName}`);
      }
    } else {
      console.log(`Log stream already exists: ${logStreamName}`);
    }
    
    return logStreamName;
  } catch (error) {
    console.error("Error in getLogStreamName:", error);
    console.error("Stack trace:", error.stack);
    throw error;
  }
}

// Lambda handler
exports.handler = async (event) => {
  try {
    console.log("Lambda invoked with event:", JSON.stringify(event));
    
    // Enable CORS
    const headers = {
      "Access-Control-Allow-Origin": "*", // Restrict this in production
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    };
    
    // Handle preflight OPTIONS request
    if (event.requestContext && event.requestContext.http && event.requestContext.http.method === "OPTIONS") {
      console.log("Handling OPTIONS request");
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "CORS enabled" })
      };
    }
    
    // Parse body for POST request - Handle both HTTP API and REST API Gateway formats
    let logEvent;
    try {
      if (typeof event.body === "string") {
        logEvent = JSON.parse(event.body);
      } else if (event.body) {
        logEvent = event.body;
      } else {
        logEvent = event; // Fallback for direct Lambda invocation
      }
      
      console.log("Parsed log event:", JSON.stringify(logEvent));
    } catch (error) {
      console.error("Error parsing request body:", error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid JSON in request body" })
      };
    }
    
    // Basic validation
    if (!logEvent || !logEvent.eventType) {
      console.error("Missing required fields in log event");
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required fields in log event" })
      };
    }
    
    const logStreamName = await getLogStreamName();
    
    // Get upload sequence token
    const streams = await logs.send(new DescribeLogStreamsCommand({
      logGroupName: LOG_GROUP_NAME,
      logStreamNamePrefix: logStreamName
    }));
    
    const token = streams.logStreams?.find(s => s.logStreamName === logStreamName)?.uploadSequenceToken;
    
    // Prepare log entry
    const message = JSON.stringify({
      ...logEvent,
      source: "next-js-presentation",
      recordedAt: new Date().toISOString()
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
      headers,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error("Error logging to CloudWatch:", error);
    console.error("Stack trace:", error.stack);
    
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ 
        error: "Failed to log event", 
        message: error.message,
        stack: error.stack 
      })
    };
  }
};