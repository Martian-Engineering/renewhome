// Test script for CloudWatch API
const API_ENDPOINT = 'https://8yjaa747xl.execute-api.us-west-2.amazonaws.com/prod/log';

async function testApi() {
  console.log(`Testing CloudWatch API endpoint: ${API_ENDPOINT}`);
  
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType: 'test',
        slideId: 'test-slide',
        timestamp: new Date().toISOString(),
        userAgent: 'test-script'
      }),
    });
    
    console.log(`Response status: ${response.status}`);
    
    const data = await response.text();
    console.log(`Response body: ${data}`);
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testApi();