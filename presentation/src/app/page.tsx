import { redirect } from 'next/navigation';
import { getSortedSlidesData } from '../../lib/slides'; // Adjusted path

export default function HomePage() {
  // This logic now runs on the server.
  const slides = getSortedSlidesData();

  if (slides && slides.length > 0) {
    // Redirect to the first slide based on its ID (which includes number and slug)
    // e.g., /slides/1-introduction
    redirect(`/slides/${slides[0].id}`);
  } else {
    // If there are no slides, render a message.
    // You could also redirect to a specific "no slides" page or setup page.
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold">No Slides Available</h1>
        <p className="mt-4">Please add Markdown files to the 'slides-md' directory.</p>
      </main>
    );
  }
  // Note: redirect() will stop further execution, so no explicit return is needed after it.
}
