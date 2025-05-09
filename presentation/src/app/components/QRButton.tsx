'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

export default function QRButton() {
  const [showQR, setShowQR] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set current URL
      setCurrentUrl(window.location.href);

      // Update URL when it changes
      const handleRouteChange = () => {
        setCurrentUrl(window.location.href);
      };

      // Listen for URL changes
      window.addEventListener('popstate', handleRouteChange);
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, []);

  const toggleQR = () => {
    setShowQR(!showQR);
    // Update URL when showing QR code
    if (!showQR && typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  };

  return (
    <>
      {showQR && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-md shadow-lg z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Scan to view this slide</h3>
            <button 
              onClick={toggleQR}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <QRCode value={currentUrl} size={200} />
          <p className="mt-2 text-xs text-gray-500 break-all">{currentUrl}</p>
        </div>
      )}
      <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-2 rounded-md z-40">
        <button 
          onClick={toggleQR}
          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm"
        >
          QR Code
        </button>
      </div>
    </>
  );
}