// Server Component - no 'use client' directive needed
import { getSlideData, getSortedSlidesData, SlideMeta, SlideData } from '../../../../lib/slides';
import SlideClientComponent from './SlideClientComponent';
import { notFound } from 'next/navigation';
import React from 'react';

interface SlidePageProps {
  params: {
    slug: string[]; // e.g., ["1", "introduction"]
  };
}

// This is a Server Component
export default async function SlidePage({ params }: SlidePageProps) {
  // Properly await params before using properties
  const paramsResolved = await Promise.resolve(params);
  const slug = paramsResolved.slug;
  
  // Determine how to parse the slug based on its structure
  let slideId: string;
  
  if (slug.length === 1) {
    // Single segment might be a legacy ID like "1-introduction" 
    // or a direct slide ID like "1-introduction-about-us"
    slideId = slug[0];
  } else if (slug.length >= 2) {
    // Handle multi-part slugs from the new structure
    // e.g., ["1", "introduction", "about-us"]
    slideId = slug.join('-');
  } else {
    // Empty slug
    notFound();
    return;
  }

  const allSlides: SlideMeta[] = getSortedSlidesData(); // Runs on server
  let slideData: SlideData | null = await getSlideData(slideId); // Runs on server

  // If not found directly, try to find by slugParts
  if (!slideData) {
    // Try to find by matching against slugParts
    const matchingSlide = allSlides.find(s => 
      s.slugParts.join('-') === slideId || 
      s.slugParts.join('/') === slug.join('/')
    );
    
    if (matchingSlide) {
      slideData = await getSlideData(matchingSlide.id);
    }
  }

  if (!slideData) {
    // If slideData is not found, render a 404 page
    notFound();
    return;
  }

  return (
    <SlideClientComponent
      initialSlideData={slideData}
      allSlides={allSlides}
    />
  );
}

// Optional: If you want to pre-render these pages at build time (Static Site Generation - SSG)
// export async function generateStaticParams() {
//   const slides = getSortedSlidesData();
//   return slides.map((slide) => ({
//     slug: slide.slugParts,
//   }));
// }

// Optional: Add metadata for each slide page
// export async function generateMetadata({ params }: SlidePageProps) {
//   const { slug } = params;
//   const currentSlideId = slug.join('-');
//   const slideData = await getSlideData(currentSlideId);

//   if (!slideData) {
//     return {
//       title: 'Slide Not Found',
//     };
//   }

//   return {
//     title: slideData.title,
//     // You can add description or other metadata here
//   };
// }
