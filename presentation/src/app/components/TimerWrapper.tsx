'use client';

import dynamic from 'next/dynamic';

// Dynamically import the Timer component with no SSR
const Timer = dynamic(() => import('./Timer'), { ssr: false });

export default function TimerWrapper() {
  return <Timer />;
}