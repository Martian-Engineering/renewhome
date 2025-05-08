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
  const { slug } = params;
  const currentSlideId = slug.join('-');

  const allSlides: SlideMeta[] = getSortedSlidesData(); // Runs on server
  const slideData: SlideData | null = await getSlideData(currentSlideId); // Runs on server

  if (!slideData) {
    // If slideData is not found, render a 404 page or a custom message
    // For App Router, you can use the notFound() function
    notFound(); 
    // Or, return a custom component:
    // return (
    //   <main className="flex min-h-screen flex-col items-center justify-center p-24">
    //     <h1 className="text-4xl font-bold">Slide not found</h1>
    //     <p className="mt-4">Could not load content for {currentSlideId}.</p>
    //   </main>
    // );
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
