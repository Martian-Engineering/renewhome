'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  id?: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, id }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const uniqueId = id || `mermaid-${Math.random().toString(36).substring(2, 11)}`;

  useEffect(() => {
    if (!chart || !containerRef.current) {
      return;
    }
    
    // Log the chart content for debugging
    console.log('Mermaid chart content:', chart);
    
    // Initialize mermaid with simpler config to ensure compatibility
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose'
    });

    // Clear container and error state before rendering
    setError(null);
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    const renderChart = async () => {
      try {
        // Replace ⁠ arrows with proper ones, just in case
        const cleanedChart = chart
          .replace(/-->/g, '-->') // normalize any weird arrow characters
          .trim();
        
        // For debugging only - render to DOM with pre
        console.log('Attempting to render chart:', cleanedChart);
        
        // Parse and render the diagram
        const { svg } = await mermaid.render(uniqueId, cleanedChart);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          
          // Make diagram responsive
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.setAttribute('width', '100%');
            svgElement.setAttribute('height', 'auto');
            svgElement.style.maxWidth = '100%';
            svgElement.style.borderRadius = '8px';
          }
        }
      } catch (error) {
        console.error('Failed to render mermaid diagram:', error);
        console.error('Chart content that failed:', chart);
        setError(`Error rendering diagram: ${error}`);
        
        // Attempt to display diagram as code
        if (containerRef.current) {
          containerRef.current.innerHTML = `<pre class="p-4 bg-gray-50 rounded-md">${chart.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
        }
      }
    };

    // Add short delay to ensure the component is fully mounted
    setTimeout(() => {
      renderChart();
    }, 100);
  }, [chart, uniqueId]);

  if (error) {
    return (
      <div className="flex justify-center my-8 p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="text-red-600 font-mono text-sm whitespace-pre-wrap">
          {error}
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
            {chart}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center my-8 p-4">
      <div 
        ref={containerRef} 
        className="mermaid-diagram max-w-full w-full overflow-x-auto bg-gray-50 p-2 rounded-md" 
      />
    </div>
  );
};

export default MermaidDiagram;