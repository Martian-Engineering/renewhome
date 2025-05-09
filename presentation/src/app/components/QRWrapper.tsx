'use client';

import dynamic from 'next/dynamic';

// Dynamically import the QRButton component with no SSR
const QRButton = dynamic(() => import('./QRButton'), { ssr: false });

export default function QRWrapper() {
  return <QRButton />;
}