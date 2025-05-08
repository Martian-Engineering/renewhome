# CloudWatch Logging Demo

## This slide demonstrates AI-assisted CloudWatch log analysis using MCP

Every action on this presentation is being logged to AWS CloudWatch:

- **Slide Navigation**: Each time you change slides, a log entry is created
- **User Interactions**: When you click on slide content, it's logged

---

### How It Works

1. **Frontend (Next.js)**: Sends events via API Gateway
2. **Lambda Function**: Processes and forwards to CloudWatch
3. **CloudWatch Logs**: Stores all presentation activity
4. **MCP Server**: Connects Claude to the CloudWatch logs

---

### Try It Out

Click this button to generate a custom log entry: <button id="demo-button" style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Create Log Event</button>

Use left/right arrows to navigate and see slide navigation events.

---

### AI-Assisted Log Analysis

Imagine asking questions like:
- "What slides got the most interaction?"
- "Show me all navigation events in the last 5 minutes"
- "When did users spend the most time on a single slide?"

**Demo**: Let's query these logs using Log-Analyzer-with-MCP...

<script>
document.getElementById('demo-button')?.addEventListener('click', function() {
  window.logUserInteraction?.(window.location.pathname.split('/').pop(), 'demo-button', 'click');
  alert('Log event created! Check CloudWatch logs.');
});
</script>