'use client';

import React, { useEffect, useRef } from 'react';

// Simple component to load mermaid and render a diagram
export default function MermaidWrapper({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Only run this on the client side
    if (typeof window === 'undefined' || !containerRef.current) return;
    
    const renderDiagram = async () => {
      try {
        // Dynamically import mermaid
        const mermaid = (await import('mermaid')).default;
        
        // Initialize with minimal config
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default'
        });
        
        // Clean container
        containerRef.current.innerHTML = '';
        
        // Create a unique ID for this render
        const id = `mermaid-${Math.random().toString(36).substring(2, 10)}`;
        
        // Render the diagram
        const { svg } = await mermaid.render(id, chart);
        
        // Insert the SVG
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('Failed to render mermaid diagram:', error);
        
        // Show error and fallback to code display
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-4 border border-red-200 rounded-md bg-red-50 mb-4">
              <p class="text-red-500 mb-2">Failed to render diagram</p>
              <pre class="bg-gray-100 p-4 rounded-md overflow-auto text-sm">${chart}</pre>
            </div>
          `;
        }
      }
    };
    
    renderDiagram();
  }, [chart]);
  
  return (
    <div className="my-8 mx-auto max-w-full text-center">
      <div ref={containerRef} className="inline-block text-left">
        {/* Mermaid diagram will be rendered here */}
        Loading diagram...
      </div>
    </div>
  );
}