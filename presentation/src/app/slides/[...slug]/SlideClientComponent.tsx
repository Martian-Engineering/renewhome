'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { SlideData, SlideMeta } from '../../../../lib/slides';
import dynamic from 'next/dynamic';

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

  // Process slide content to extract and render Mermaid diagrams
  const processSlideContent = (content: string) => {
    // Regular expression to find Mermaid code blocks in HTML
    const mermaidRegex = /<pre>\s*<code[^>]*class="[^"]*language-mermaid[^"]*"[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/g;
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let foundMermaid = false;
    
    // Find all mermaid code blocks
    while ((match = mermaidRegex.exec(content)) !== null) {
      foundMermaid = true;
      
      // Add the HTML content before this Mermaid block
      if (match.index > lastIndex) {
        parts.push(
          <div 
            key={`html-${lastIndex}`} 
            dangerouslySetInnerHTML={{ 
              __html: content.substring(lastIndex, match.index) 
            }} 
          />
        );
      }
      
      // Extract and decode HTML entities in the Mermaid code
      let mermaidCode = match[1].trim();
      mermaidCode = mermaidCode.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
      
      console.log("Using new MermaidWrapper with code:", mermaidCode);
      
      // Add the simplified Mermaid wrapper component
      parts.push(
        <MermaidWrapper 
          key={`mermaid-${match.index}`} 
          chart={mermaidCode} 
        />
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining HTML content after the last Mermaid block
    if (lastIndex < content.length) {
      parts.push(
        <div 
          key={`html-${lastIndex}`} 
          dangerouslySetInnerHTML={{ 
            __html: content.substring(lastIndex) 
          }} 
        />
      );
    }
    
    // If no Mermaid diagrams were found using the HTML pattern,
    // return the original content to avoid an empty slide
    if (!foundMermaid) {
      return [
        <div 
          key="original-content" 
          dangerouslySetInnerHTML={{ 
            __html: content 
          }} 
        />
      ];
    }
    
    return parts;
  };

  useEffect(() => {
    setSlideData(initialSlideData);
    setSlides(allSlides);
    
    // Process the slide content to handle Mermaid diagrams
    if (initialSlideData.contentHtml) {
      console.log('Processing HTML content:', initialSlideData.contentHtml);
      // Check for mermaid code block
      if (initialSlideData.contentHtml.includes('language-mermaid')) {
        console.log('Found mermaid code block in HTML');
      } else {
        console.log('No mermaid code blocks found in HTML');
      }
      
      const processed = processSlideContent(initialSlideData.contentHtml);
      console.log('Processed content length:', processed.length);
      setProcessedContent(processed);
    }
  }, [initialSlideData, allSlides]);
  
  // Track slide information when slide changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Debug: Log section information
      console.log('Current slide:', {
        id: slideData.id,
        sectionId: slideData.sectionId,
        sectionNumber: slideData.sectionNumber,
        slideNumber: slideData.slideNumber,
      });
      
      // Debug: Count slides per section
      const sectionsCount = {};
      slides.forEach(s => {
        if (!sectionsCount[s.sectionId]) {
          sectionsCount[s.sectionId] = 0;
        }
        sectionsCount[s.sectionId]++;
      });
      console.log('Slides per section:', sectionsCount);
      console.log('Filter result:', slides.filter(s => s.sectionId === slideData.sectionId));
    }
  }, [slideData.id, slides]);


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
      {/* Section title in top right, aligned with logo */}
      <div className="fixed top-2 right-2 md:top-4 md:right-4 p-2 z-50">
        <span className="font-mono text-2xl text-gray-500 font-light">
          {sectionTitle}
        </span>
      </div>
      
      <main className="flex min-h-screen flex-col items-center justify-start p-12 relative">
        <div className="absolute top-2 left-2 md:top-4 md:left-4 p-2">
          <Image
            src="/martian-logo.jpg"
            alt="Martian Engineering Logo"
            width={100}
            height={100}
            className="rounded-full"
          />
        </div>
      <div className="w-full max-w-5xl mx-auto mt-6 md:mt-12 px-8">
        {/* Show the title unless hide-title directive is found */}
        {(!slideData.styleOptions?.hideTitle) && (
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-left">{slideData.title}</h1>
        )}
        
        <div
          className="prose prose-lg lg:prose-2xl prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-ul:list-disc prose-ol:list-decimal max-w-none"
        >
          {processedContent.length > 0 ? (
            processedContent
          ) : (
            <div dangerouslySetInnerHTML={{ __html: slideData.contentHtml }} />
          )}
        </div>
      </div>
      
      {/* Show slide counter only */}
      <div className="fixed bottom-8 left-0 right-0 text-center text-base text-gray-500 z-10">
        <div>
          Slide {slideData.number} of {slides.length} | 
          Section {slideData.sectionNumber} of 5 | 
          Slide {slideData.slideNumber} in section
        </div>
      </div>
    </main>
    </>
  );
}
