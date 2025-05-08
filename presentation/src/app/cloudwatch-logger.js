/**
 * CloudWatch Logger for presentation slides
 * This module provides functionality to log slide navigation and user interactions
 * to AWS CloudWatch via Lambda and API Gateway
 */

// Session ID will be generated once per page load
const SESSION_ID = generateSessionId();

/**
 * Generate a unique session ID for this presentation instance
 * @returns {string} Session ID
 */
function generateSessionId() {
  return 'session_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Log an event to CloudWatch
 * @param {string} eventType - Type of event (slide_navigation, user_interaction, etc.)
 * @param {Object} data - Additional data to log
 */
export async function logToCloudWatch(eventType, data = {}) {
  const apiEndpoint = process.env.NEXT_PUBLIC_CLOUDWATCH_API;
  
  // Don't attempt to log if API endpoint is not configured
  if (!apiEndpoint) {
    console.log('CloudWatch logging disabled (no API endpoint configured)');
    return;
  }
  
  try {
    const response = await fetch(`${apiEndpoint}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType,
        sessionId: SESSION_ID,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ...data
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to log to CloudWatch:', await response.text());
    }
  } catch (error) {
    console.error('Error logging to CloudWatch:', error);
  }
}

/**
 * Log slide navigation
 * @param {string} fromSlideId - Previous slide ID
 * @param {string} toSlideId - Current slide ID
 */
export function logSlideNavigation(fromSlideId, toSlideId) {
  return logToCloudWatch('slide_navigation', {
    fromSlide: fromSlideId,
    toSlide: toSlideId
  });
}

/**
 * Log user interaction with a slide element
 * @param {string} slideId - Current slide ID
 * @param {string} elementId - ID of the element interacted with
 * @param {string} action - Type of interaction (click, hover, etc.)
 */
export function logUserInteraction(slideId, elementId, action) {
  return logToCloudWatch('user_interaction', {
    slideId,
    elementId,
    action
  });
}

/**
 * Hook to integrate with slide component
 * @param {string} currentSlideId - Current slide ID
 * @param {string} previousSlideId - Previous slide ID
 */
export function useCloudWatchLogger(currentSlideId, previousSlideId) {
  if (currentSlideId && previousSlideId && currentSlideId !== previousSlideId) {
    logSlideNavigation(previousSlideId, currentSlideId);
  }
}