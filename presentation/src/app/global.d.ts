// Global type definitions for the presentation
interface Window {
  logSlideNavigation?: (fromSlideId: string, toSlideId: string) => void;
  logUserInteraction?: (slideId: string, elementId: string, action: string) => void;
}