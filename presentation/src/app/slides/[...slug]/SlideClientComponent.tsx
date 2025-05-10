'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { SlideData, SlideMeta } from '../../../../lib/slides';
import { logSlideNavigation, logUserInteraction } from '../../cloudwatch-logger';

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

  useEffect(() => {
    setSlideData(initialSlideData);
    setSlides(allSlides);
  }, [initialSlideData, allSlides]);
  
  // Log slide view when slide changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      logSlideNavigation('initial', slideData.id);
      
      // Make logging functions available globally for demo slide
      window.logSlideNavigation = logSlideNavigation;
      window.logUserInteraction = logUserInteraction;
    }
  }, [slideData.id]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const currentIndex = slides.findIndex(s => s.id === slideData.id);
      
      if (currentIndex === -1) {
        return;
      }

      let nextSlideId: string | null = null;
      let nextSlide = null;

      if (event.key === 'ArrowRight') {
        // Move to the next slide (or first slide if at the end)
        const nextIndex = (currentIndex + 1) % slides.length;
        nextSlide = slides[nextIndex];
        nextSlideId = nextSlide.id;
      } else if (event.key === 'ArrowLeft') {
        // Move to the previous slide (or last slide if at the beginning)
        const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
        nextSlide = slides[prevIndex];
        nextSlideId = nextSlide.id;
      }

      if (nextSlideId && nextSlide) {
        // Log slide navigation before changing routes
        logSlideNavigation(slideData.id, nextSlideId);
        
        // Use the slugParts to construct the URL properly
        const slidePath = nextSlide.slugParts.join('/');
        const newUrl = `/slides/${slidePath}`;
        
        // Force a hard navigation to ensure proper loading
        window.location.href = newUrl;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, slideData, slides]);

  // Get section title from the slide data
  const sectionTitle = slideData.sectionTitle || "Welcome";

  

  return (
    <>
      {/* Section title in top right */}
      <div className="fixed top-8 right-8 z-50">
        <span className="font-mono text-2xl text-gray-500 font-light">
          {sectionTitle}
        </span>
      </div>
      
      <main className="flex min-h-screen flex-col items-center justify-start p-12 relative">
        <div className="absolute top-4 left-4 md:top-8 md:left-8 p-4">
          <Image
            src="/martian-logo.jpg"
            alt="Martian Engineering Logo"
            width={120}
            height={120}
            className="rounded-full"
          />
        </div>
      <div className="w-full max-w-4xl mx-auto mt-24 md:mt-32 px-8">
        {/* For legacy slides with just section title */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-left">{slideData.title}</h1>
        
        <div
          className="prose prose-lg lg:prose-2xl prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-ul:list-disc prose-ol:list-decimal max-w-none"
          dangerouslySetInnerHTML={{ __html: slideData.contentHtml }}
          onClick={() => logUserInteraction(slideData.id, 'content', 'click')}
        />
      </div>
      
      {/* Show slide counter only */}
      <div className="fixed bottom-8 left-0 right-0 text-center text-base text-gray-500 z-10">
        {slideData.slideNumber && slideData.slideNumber > 0 && (
          <div>Slide {slideData.number} of {slides.length} | Section {slideData.slideNumber} of {slides.filter(s => s.sectionId === slideData.sectionId).length}</div>
        )}
      </div>
    </main>
    </>
  );
}
