# Section Timer Countdown

Goal: Allow presenters to define time allocations for sections of their presentation within the slide Markdown files. The global timer should then display a countdown for the current section, helping the presenter stay on track.

Here's a proposed implementation plan:

Phase 1: Metadata Definition and Parsing

Define Metadata Format:

We'll use an HTML comment in the Markdown files to specify the section duration.
Format: <!-- section-time: 5m --> or <!-- section-time: 300s --> (we should decide on a consistent unit or parse both minutes 'm' and seconds 's'). For simplicity, let's aim to parse and convert to seconds internally.
This comment should ideally be placed at the beginning of the Markdown file that starts a new timed section.
Update Slide Library (/presentation/lib/slides.ts):

Modify getSlideData (and by extension, getSortedSlidesData) to parse this new metadata.

When reading the Markdown file content:

Use a regular expression to find <!-- section-time: (\d+)([ms]?) -->.
Extract the value and unit. Convert minutes to seconds.
Store this value (e.g., sectionDurationSeconds?: number) in the SlideData and SlideMeta types.
If a slide doesn't have this comment, sectionDurationSeconds will be undefined.
SlideMeta and SlideData Type Updates:

export interface SlideMeta {
  id: string;
  title: string;
  slug: string[];
  order: number;
  hasContent?: boolean;
  sectionDurationSeconds?: number; // New field
}

export interface SlideData extends SlideMeta {
  contentHtml: string;
  // sectionDurationSeconds?: number; // Already in SlideMeta, inherited
}

Copy


Phase 2: Propagating Section Time to the Client

Server Component (/presentation/src/app/slides/[...slug]/page.tsx):

No major changes needed here, as getSlideData will now return slideData including sectionDurationSeconds. This will be passed to SlideClientComponent.
Client Component (/presentation/src/app/slides/[...slug]/SlideClientComponent.tsx):

The initialSlideData and allSlides props will now contain sectionDurationSeconds.
We need a way to communicate the current section's duration to the global Timer component. Since Timer is in the root layout, we'll likely need a React Context.
Phase 3: Timer Context for Communication

Create Timer Context (/presentation/src/app/contexts/TimerContext.tsx - new file):

'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface TimerContextType {
  sectionDuration: number | null; // Duration in seconds
  setSectionDuration: (duration: number | null) => void;
  currentSectionElapsedTime: number; // Elapsed time for the current section
  setCurrentSectionElapsedTime: (time: number) => void;
  isSectionTimingActive: boolean;
  setIsSectionTimingActive: (isActive: boolean) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [sectionDuration, setSectionDurationState] = useState<number | null>(null);
  const [currentSectionElapsedTime, setCurrentSectionElapsedTimeState] = useState<number>(0);
  const [isSectionTimingActive, setIsSectionTimingActiveState] = useState<boolean>(false);

  const setSectionDuration = (duration: number | null) => {
    setSectionDurationState(duration);
    setCurrentSectionElapsedTimeState(0); // Reset elapsed time when section changes
    setIsSectionTimingActiveState(duration !== null);
  };

  const setCurrentSectionElapsedTime = (time: number) => {
    setCurrentSectionElapsedTimeState(time);
  };
  
  const setIsSectionTimingActive = (isActive: boolean) => {
    setIsSectionTimingActiveState(isActive);
  }

  return (
    <TimerContext.Provider value={{ sectionDuration, setSectionDuration, currentSectionElapsedTime, setCurrentSectionElapsedTime, isSectionTimingActive, setIsSectionTimingActive }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
};

Copy


TimerContext.tsx
Wrap Application in TimerProvider (/presentation/src/app/layout.tsx):

import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import TimerWrapper from './components/TimerWrapper';
import QRWrapper from './components/QRWrapper';
import { TimerProvider } from './contexts/TimerContext'; // Import TimerProvider

// ... (font setup)

export const metadata: Metadata = {
  title: "Renew Home Presentation",
  description: "Slides for Renew Home presentation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${martianMono.variable} antialiased`}
      >
        <TimerProvider> {/* Wrap with TimerProvider */}
          {children}
          <TimerWrapper />
          <QRWrapper />
        </TimerProvider>
      </body>
    </html>
  );
}

Copy


layout.tsx
Phase 4: Updating SlideClientComponent to Set Section Time

Modify /presentation/src/app/slides/[...slug]/SlideClientComponent.tsx:

Import and use useTimerContext.
When the slide changes (in the useEffect hook that handles navigation or on initial load), check slideData.sectionDurationSeconds.
If slideData.sectionDurationSeconds is defined, call setSectionDuration from the context.
We need to determine the "current" section. A slide with sectionDurationSeconds defines the start of a new section. This duration applies to this slide and subsequent slides until another slide defines a new duration.
We might need to iterate through allSlides up to the current slide to find the most recent sectionDurationSeconds if the current slide itself doesn't define one.
// ... other imports
import { useTimerContext } from '../../contexts/TimerContext'; // Import

export default function SlideClientComponent({
  initialSlideData,
  allSlides,
}: SlideClientComponentProps) {
  // ... existing state and hooks
  const { setSectionDuration, setCurrentSectionElapsedTime } = useTimerContext(); // Use context

  // Effect to update section duration when slide changes
  useEffect(() => {
    let currentSectionTime: number | null = null;
    // Find the active section duration by looking at the current slide
    // or iterating backwards from the current slide in allSlides
    // until a slide with sectionDurationSeconds is found.

    const currentSlideId = slideData.id;
    let activeDuration: number | undefined = undefined;

    // Check current slide first
    if (slideData.sectionDurationSeconds !== undefined) {
      activeDuration = slideData.sectionDurationSeconds;
    } else {
      // If current slide has no duration, find the last one set by a previous slide
      // This assumes allSlides is sorted
      const currentSlideIndex = allSlides.findIndex(s => s.id === currentSlideId);
      for (let i = currentSlideIndex; i >= 0; i--) {
        if (allSlides[i].sectionDurationSeconds !== undefined) {
          activeDuration = allSlides[i].sectionDurationSeconds;
          break;
        }
      }
    }

    if (activeDuration !== undefined) {
      // Check if this is a *new* section start or continuation
      // If the slideData.id corresponds to a slide that DEFINES the activeDuration,
      // then it's a new section start, so reset elapsed time.
      // Otherwise, it's a continuation.
      const isNewSectionStart = slideData.sectionDurationSeconds === activeDuration;
      
      setSectionDuration(activeDuration);
      if (isNewSectionStart) {
        setCurrentSectionElapsedTime(0); // Reset for new section
      }
      // If not a new section start, currentSectionElapsedTime will persist from context
    } else {
      setSectionDuration(null); // No active section timing
    }

  }, [slideData, allSlides, setSectionDuration, setCurrentSectionElapsedTime]);

  // ... rest of the component
}

Copy


SlideClientComponent.tsx
Phase 5: Modifying the Timer Component (/presentation/src/app/components/Timer.tsx)

Update Timer.tsx:
Import and use useTimerContext.
State:
Keep existing time for the overall presentation timer (stopwatch).
isRunning will still control the overall timer.
Logic:
Access sectionDuration, currentSectionElapsedTime, setCurrentSectionElapsedTime, isSectionTimingActive from context.
If isSectionTimingActive is true and sectionDuration is not null:
The main timer interval should now increment currentSectionElapsedTime (via setCurrentSectionElapsedTime(prev => prev + 1)).
The display should show sectionDuration - currentSectionElapsedTime (countdown).
Persist currentSectionElapsedTime to localStorage (e.g., presentation-section-elapsed-time) so it resumes correctly if the page is refreshed within the same