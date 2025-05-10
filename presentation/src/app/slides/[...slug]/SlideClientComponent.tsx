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
      if (currentIndex === -1) return;

      let nextSlideId: string | null = null;

      if (event.key === 'ArrowRight') {
        const nextIndex = (currentIndex + 1) % slides.length;
        nextSlideId = slides[nextIndex].id;
      } else if (event.key === 'ArrowLeft') {
        const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
        nextSlideId = slides[prevIndex].id;
      }

      if (nextSlideId) {
        // Log slide navigation before changing routes
        logSlideNavigation(slideData.id, nextSlideId);
        router.push(`/slides/${nextSlideId}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, slideData, slides]);

  return (
    <main className="flex min-h-screen flex-col items-start justify-start p-12 md:p-24 relative">
      <div className="absolute top-4 left-4 md:top-8 md:left-8 p-4">
        <Image
          src="/martian-logo.jpg"
          alt="Martian Engineering Logo"
          width={120}
          height={120}
          className="rounded-full"
        />
      </div>
      <div className="w-full max-w-4xl mx-auto mt-24 md:mt-32">
        <h1 className="text-4xl md:text-6xl font-bold mb-10 text-left">{slideData.title}</h1>
        <div
          className="prose prose-lg lg:prose-2xl prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-ul:list-disc prose-ol:list-decimal max-w-none"
          dangerouslySetInnerHTML={{ __html: slideData.contentHtml }}
          onClick={() => logUserInteraction(slideData.id, 'content', 'click')}
        />
      </div>
    </main>
  );
}
