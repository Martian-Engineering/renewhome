'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { SlideData, SlideMeta } from '../../../../lib/slides';
import dynamic from 'next/dynamic';
import { useTimer } from '../../contexts/TimerContext'; // Import the useTimer hook

// Dynamic import to avoid SSR issues with mermaid
const MermaidWrapper = dynamic(() => import('../../components/MermaidWrapper'), {
  ssr: false,
  loading: () => <div className="flex justify-center p-8 text-gray-500">Loading diagram...</div>
});

interface SlideClientComponentProps {
  initialSlideData: SlideData;
  allSlides: SlideMeta[];
}

export default function SlideClientComponent({
  initialSlideData,
  allSlides,
}: SlideClientComponentProps) {
  const router = useRouter();
  const [slideData, setSlideData] = useState<SlideData>(initialSlideData);
  const [slides, setSlides] = useState<SlideMeta[]>(allSlides);
  const [processedContent, setProcessedContent] = useState<React.ReactNode[]>([]);
  const [hasImages, setHasImages] = useState<boolean>(false);
  const [hasList, setHasList] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const timerContext = useTimer();

  // Process slide content to extract and render Mermaid diagrams
  const processSlideContent = (content: string) => {
    const mermaidRegex = /<pre>\s*<code[^>]*class="[^"]*language-mermaid[^"]*"[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let foundMermaid = false;
    while ((match = mermaidRegex.exec(content)) !== null) {
      foundMermaid = true;
      if (match.index > lastIndex) {
        parts.push(<div key={`html-${lastIndex}`} dangerouslySetInnerHTML={{ __html: content.substring(lastIndex, match.index) }} />);
      }
      let mermaidCode = match[1].trim();
      mermaidCode = mermaidCode.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
      parts.push(<MermaidWrapper key={`mermaid-${match.index}`} chart={mermaidCode} />);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push(<div key={`html-${lastIndex}`} dangerouslySetInnerHTML={{ __html: content.substring(lastIndex) }} />);
    }
    if (!foundMermaid) {
      return [<div key="original-content" dangerouslySetInnerHTML={{ __html: content }} />];
    }
    return parts;
  };

  useEffect(() => {
    const currentSlide = initialSlideData;

    if (currentSlide.sectionId !== timerContext.lastNavigatedSectionId) {
      // New section or first load
      timerContext.setLastNavigatedSectionId(currentSlide.sectionId);

      if (currentSlide.sectionDurationSeconds !== undefined) {
        timerContext.setSectionDuration(currentSlide.sectionDurationSeconds);
        timerContext.resetSectionTimer();
        timerContext.setIsSectionTimingActive(true);
      } else {
        timerContext.setSectionDuration(null);
        timerContext.setIsSectionTimingActive(false);
      }
    } else {
      // Same section, timer should not reset.
      // Update duration if it changed (e.g. hot reload) and ensure timing state.
      if (currentSlide.sectionDurationSeconds !== undefined) {
        if (timerContext.sectionDuration !== currentSlide.sectionDurationSeconds) {
          timerContext.setSectionDuration(currentSlide.sectionDurationSeconds);
        }
        // We're no longer automatically resuming paused timers
        // This allows the user's manual pause to persist when navigating within the same section
      } else {
        // Section definition changed to no longer have a duration.
        if (timerContext.sectionDuration !== null) {
          timerContext.setSectionDuration(null);
        }
        if (timerContext.isSectionTimingActive) {
          timerContext.setIsSectionTimingActive(false);
        }
      }
    }

    // Update local component state for rendering this slide
    setSlideData(currentSlide);
    setSlides(allSlides); // allSlides prop might also change if new slides are added/removed dynamically
    
    if (currentSlide.contentHtml) {
      const processed = processSlideContent(currentSlide.contentHtml);
      setProcessedContent(processed);
      setHasImages(currentSlide.contentHtml.includes('<img'));
      setHasList(
        currentSlide.contentHtml.includes('<ul') || 
        currentSlide.contentHtml.includes('<li>')
      );
    }
  }, [initialSlideData, allSlides, timerContext]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Debug: Log section information
      console.log('Current slide:', {
        id: slideData.id,
        sectionId: slideData.sectionId,
        sectionNumber: slideData.sectionNumber,
        slideNumber: slideData.slideNumber,
        sectionDurationSeconds: slideData.sectionDurationSeconds, // Log duration
        timerContextLastSection: timerContext.lastNavigatedSectionId // Log context section
      });
    }
  }, [slideData, timerContext.lastNavigatedSectionId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const currentIndex = slides.findIndex(s => s.id === slideData.id);
      
      if (currentIndex === -1) return;

      let nextSlide: SlideMeta | null = null;

      if (event.key === 'ArrowRight') {
        const nextIndex = (currentIndex + 1) % slides.length;
        nextSlide = slides[nextIndex];
      } else if (event.key === 'ArrowLeft') {
        const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
        nextSlide = slides[prevIndex];
      }

      if (nextSlide) {
        const slidePath = (nextSlide.slugParts as string[]).join('/');
        const newUrl = `/slides/${slidePath}`;
        router.push(newUrl);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, slideData.id, slides]);

  // Get section title from the slide data
  const sectionTitle = slideData.sectionTitle || "Welcome";

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center py-8 px-6 relative">
        {/* Logo in top left */}
        <div className="absolute top-6 left-6 md:top-8 md:left-8 p-2">
          <Image
            src="/martian-logo.jpg"
            alt="Martian Engineering Logo"
            width={100}
            height={100}
            className="rounded-full"
          />
        </div>
        
        {/* Section title in top right, matched with logo position */}
        <div className="absolute top-6 right-6 md:top-8 md:right-8 p-2 flex items-center">
          <span className="font-mono text-2xl text-gray-500 font-light">
            {sectionTitle}
          </span>
        </div>
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10 flex flex-col items-center justify-center">
        {/* Combined container for title and content with no gap */}
        <div className="flex flex-col w-full">
          {/* Show the title unless hide-title directive is found */}
          {(!slideData.styleOptions?.hideTitle) && (
            <h1 className="text-3xl md:text-5xl font-bold mb-0 text-left">{slideData.title}</h1>
          )}
          <div
            className={`prose prose-xl lg:prose-2xl prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-ul:list-disc prose-ol:list-decimal max-w-none mt-1 ${slideData.styleOptions?.isLead ? 'lead' : ''} ${slideData.styleOptions?.imageColumns ? 'image-columns' : ''}`}
          >
          {/* Debug: {slideData.id} */}
          {processedContent.length > 0 ? (
            processedContent
          ) : (
            <div>
              {/* Simple standard rendering - our client-side useEffect will handle the layout */}
              <div 
                ref={contentRef}
                dangerouslySetInnerHTML={{ __html: slideData.contentHtml }} 
              />
            </div>
          )}
          </div>
        </div>
      </div>
      
      {/* Show slide counter only */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-base text-gray-500 z-10">
        <div>
          Slide {slideData.number} of {slides.length} | 
          Section {slideData.sectionNumber} of 5 
        </div>
      </div>
    </main>
    </>
  );
}
