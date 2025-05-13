import 'server-only';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked, Token, Tokens } from 'marked';

// Configure marked to keep mermaid code blocks intact
marked.use({
  renderer: {
    // @ts-expect-error - Marked typing issue with renderer
    code: function(code, language) {
      if (language === 'mermaid') {
        return `\`\`\`mermaid\n${code}\`\`\``;
      }
      return false; // Use default renderer for other languages
    },
  },
});

const slidesDirectory = path.join(process.cwd(), 'slides-md');

export interface SectionData {
  id: string; // e.g., "1-introduction"
  slug: string; // The full slug, same as id for now.
  slugParts: string[]; // e.g., ["1", "introduction"]
  number: number;
  title: string; // From H1
  slides: SlideData[]; // Individual slides within this section
  sectionDurationSeconds?: number; // New field for section timer
  [key: string]: unknown; // For additional frontmatter
}

export interface SlideData {
  id: string; // e.g., "1-introduction-about-us"
  sectionId: string; // e.g., "1-introduction"
  slug: string; // The full slug
  slugParts: string[]; // e.g., ["1", "introduction", "about-us"]
  number: number; // Overall slide number
  sectionNumber: number; // Section number
  slideNumber: number; // Slide number within section
  title: string; // From H2
  sectionTitle: string; // From H1 in the section markdown file
  sectionDurationSeconds?: number; // Duration of the parent section in seconds
  contentHtml: string;
  hasImageAndText?: boolean; // Flag to indicate if a slide has both image and text content
  styleOptions: {
    hideTitle?: boolean;
    isLead?: boolean;
    imageColumns?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown; // For additional frontmatter
}

// Metadata for a slide, excluding the full content (for list views)
export type SlideMeta = Omit<SlideData, 'contentHtml'>;

// Metadata for a section, excluding the slides (for list views)
export type SectionMeta = Omit<SectionData, 'slides'>;

export function getSortedSectionsData(): SectionMeta[] {
  let fileNames: string[];
  try {
    fileNames = fs.readdirSync(slidesDirectory);
  } catch (error) {
    console.warn("Could not read slides directory. Ensure 'slides-md' exists in the project root.", error);
    return [];
  }

  const allSectionsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, ''); // e.g., "1-introduction"
      const match = id.match(/^(\d+)(?:-(.*))?$/);

      if (!match) {
        console.warn(`Invalid filename format: ${fileName}. Must start with a number (e.g., "1-sometitle.md"). Skipping.`);
        return null;
      }

      const number = parseInt(match[1], 10);
      const titleSlug = match[2] || ''; // e.g., "introduction" or "" if "1.md"
      
      const slugParts = [String(number)];
      if (titleSlug) {
        slugParts.push(titleSlug);
      }
      const slug = slugParts.join('-');

      const fullPath = path.join(slidesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data: frontmatter, content } = matter(fileContents);

      // Extract sectionDurationSeconds from the raw file content
      let sectionDurationSeconds: number | undefined = undefined;
      const timeRegex = /<!--\s*section-time:\s*(\d+)([ms]?)\s*-->/;
      const timeMatch = fileContents.match(timeRegex); // Match against raw fileContents

      if (timeMatch) {
        const value = parseInt(timeMatch[1], 10);
        const unit = timeMatch[2]?.toLowerCase();
        if (unit === 'm') {
          sectionDurationSeconds = value * 60;
        } else { // 's' or unit is absent, treat as seconds
          sectionDurationSeconds = value;
        }
      }

      let title = frontmatter.title as string | undefined;

      if (!title) {
        const tokens = marked.lexer(content);
        const firstHeading = tokens.find(
          (token: Token): token is Tokens.Heading => // Use Tokens.Heading
            token.type === 'heading' && token.depth === 1
        );
        if (firstHeading) {
          title = firstHeading.text;
        }
      }

      if (!title) {
        title = titleSlug.replace(/-/g, ' ').trim();
        if (!title) {
          title = `Section ${number}`;
        }
      }
      
      title = String(title); // Ensure title is a string
      title = title.charAt(0).toUpperCase() + title.slice(1);

      return {
        id,
        slug,
        slugParts,
        number,
        title,
        sectionDurationSeconds, // Add the parsed duration here
        ...frontmatter, // Spread all frontmatter here
      } as SectionMeta;
    })
    .filter(Boolean) as SectionMeta[]; // Filter out nulls from invalid filenames

  return allSectionsData.sort((a, b) => (a.number as number) - (b.number as number));
}

// Get all slides from all sections
export function getSortedSlidesData(): SlideMeta[] {
  const sections = getSortedSectionsData();
  
  const allSlides: SlideMeta[] = [];
  let slideNumber = 1;
  
  sections.forEach((section) => {
    const sectionSlides = getSectionSlides(section.id as string);
    
    sectionSlides.forEach((slide) => {
      slide.number = slideNumber++;
      allSlides.push(slide);
    });
  });
  
  return allSlides;
}

// Get all slides from a specific section
export function getSectionSlides(sectionId: string): SlideMeta[] {
  const sections = getSortedSectionsData();
  const section = sections.find(s => s.id === sectionId);
  
  if (!section) {
    return [];
  }
  
  // Read the file and parse the markdown
  const fullPath = path.join(slidesDirectory, `${section.id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data: frontmatter, content } = matter(fileContents);
  
  const tokens = marked.lexer(content);
  
  // Find all H2 headings - each represents a slide
  const h2Indices: number[] = [];
  tokens.forEach((token, index) => {
    if (token.type === 'heading' && token.depth === 2) {
      h2Indices.push(index);
    }
  });
  
  // If no H2 headings, treat the entire content as one slide
  if (h2Indices.length === 0) {
    // Remove the H1 heading as we'll use the section title
    const firstHeadingIndex = tokens.findIndex(token => token.type === 'heading' && token.depth === 1);
    if (firstHeadingIndex !== -1) {
      tokens.splice(firstHeadingIndex, 1);
    }
    
    const slug = `${section.slug}-main`;
    const slideId = `${section.id}-main`;
    const slideTitle = section.title;
    
    return [{
      id: slideId,
      sectionId: section.id,
      slug,
      slugParts: [...(section.slugParts as string[]), 'main'],
      number: 0, // Will be updated later
      sectionNumber: section.number,
      slideNumber: 1,
      title: slideTitle,
      sectionTitle: section.title, // Add section title
      sectionDurationSeconds: section.sectionDurationSeconds, // Add section duration
      ...frontmatter
    }];
  }
  
  // Process each slide based on H2 headings
  const slides: SlideMeta[] = [];
  
  // Track duplicate slide titles to deduplicate slugs
  const titleCounts: Record<string, number> = {};
  
  h2Indices.forEach((startIndex, idx) => {
    const endIndex = h2Indices[idx + 1] || tokens.length;
    
    // Extract this slide's content (from this H2 to the next H2 or end)
    const slideTokens = tokens.slice(startIndex, endIndex);
    
    // Get the H2 heading token which contains the slide title
    const h2Token = slideTokens[0] as Tokens.Heading;
    const slideTitle = h2Token.text;
    
    // Parse styling directives (HTML comments after the H2)
    const styleOptions: { hideTitle?: boolean; isLead?: boolean; [key: string]: unknown } = {};
    
    // Look for HTML comments that might contain style directives
    if (slideTokens.length > 1 && slideTokens[1].type === 'html') {
      const htmlContent = (slideTokens[1] as unknown as { text: string }).text;
      
      // Check for hide-title directive
      if (htmlContent.includes('<!-- hide-title -->')) {
        styleOptions.hideTitle = true;
        
        // Remove this directive from the tokens
        slideTokens.splice(1, 1);
      }
      // Check for hide-title, lead combo directive
      else if (htmlContent.includes('<!-- hide-title, lead -->')) {
        styleOptions.hideTitle = true;
        styleOptions.isLead = true;
        
        // Remove this directive from the tokens
        slideTokens.splice(1, 1);
      }
      // Check for lead directive
      else if (htmlContent.includes('<!-- lead -->')) {
        styleOptions.isLead = true;
        
        // Remove this directive from the tokens
        slideTokens.splice(1, 1);
      }
      // Check for image-columns directive
      else if (htmlContent.includes('<!-- image-columns -->')) {
        styleOptions.imageColumns = true;
        
        // Remove this directive from the tokens
        slideTokens.splice(1, 1);
      }
    }
    
    // Track title occurrences for deduplication
    titleCounts[slideTitle] = (titleCounts[slideTitle] || 0) + 1;
    
    // Create a slug from the title
    let slideSlug = slugify(slideTitle);
    
    // If this is a duplicate title, append a counter
    if (titleCounts[slideTitle] > 1) {
      slideSlug = `${slideSlug}-${titleCounts[slideTitle]}`;
    }
    
    // Create slide metadata with properly formed ID
    const fullSlideId = `${section.id}-${slideSlug}`;
    
    slides.push({
      id: fullSlideId, // Use the full ID that includes section ID
      sectionId: section.id,
      slug: `${section.slug}-${slideSlug}`,
      slugParts: [...(section.slugParts as string[]), slideSlug],
      number: 0, // Will be updated later
      sectionNumber: section.number,
      slideNumber: idx + 1,
      title: slideTitle, // Keep the original title without the counter
      sectionTitle: section.title, // Add section title
      sectionDurationSeconds: section.sectionDurationSeconds, // Add section duration
      styleOptions, // Add the parsed style options
      ...frontmatter
    });
  });
  
  return slides;
}

export async function getSlideData(slideId: string): Promise<SlideData | null> {
  const allSlides = getSortedSlidesData();
  
  // Try to find by ID first
  let slideMeta = allSlides.find(s => s.id === slideId);
  
  // If not found, try to find by slug (ignoring case)
  if (!slideMeta) {
    slideMeta = allSlides.find(s => (s.slug as string).toLowerCase() === slideId.toLowerCase());
  }
  
  // If not found and it's a number, try to find by slide number
  if (!slideMeta) {
    const num = parseInt(slideId, 10);
    if (!isNaN(num)) {
      slideMeta = allSlides.find(s => s.number === num);
      if (slideMeta) {
        // Redirect to the proper ID
        return getSlideData(slideMeta.id as string);
      }
    }
  }
  
  if (!slideMeta) {
    return null; // Not found
  }
  
  try {
    // Get the section data
    const sectionId = slideMeta.sectionId;
    const fullPath = path.join(slidesDirectory, `${sectionId}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data: frontmatter, content } = matter(fileContents);
    
    // Parse the markdown
    const tokens = marked.lexer(content);
    
    // Find all H2 headings - each represents a slide
    const h2Indices: number[] = [];
    tokens.forEach((token, index) => {
      if (token.type === 'heading' && token.depth === 2) {
        h2Indices.push(index);
      }
    });
    
    // If no H2 headings, treat the entire content as one slide
    if (h2Indices.length === 0) {
      // Remove the H1 heading as we'll show it in the title
      const firstHeadingIndex = tokens.findIndex(token => token.type === 'heading' && token.depth === 1);
      if (firstHeadingIndex !== -1) {
        tokens.splice(firstHeadingIndex, 1);
      }
      
      const contentHtml = marked.parser(tokens) as string;
      
      // Check if the slide has both images and text - we need more robust detection
      const hasImage = contentHtml.includes('<img');
      // Check for text that's not just within the image paragraph
      const contentWithoutImages = contentHtml.replace(/<p>\s*<img[^>]*>\s*<\/p>/g, '');
      const hasText = contentWithoutImages.trim().length > 0;
      // Only set it to true if we have a balance of text and image content
      const hasImageAndText = hasImage && hasText;
      
      return {
        ...slideMeta,
        contentHtml,
        hasImageAndText,
        styleOptions: slideMeta.styleOptions || {},
        ...frontmatter
      } as SlideData;
    }
    
    // Find which H2 corresponds to this slide
    const slideIndex = (slideMeta.slideNumber as number) - 1;
    if (slideIndex < 0 || slideIndex >= h2Indices.length) {
      return null; // Invalid slide number
    }
    
    const startIndex = h2Indices[slideIndex];
    const endIndex = h2Indices[slideIndex + 1] || tokens.length;
    
    // Extract this slide's content (from this H2 to the next H2 or end)
    const slideTokens = tokens.slice(startIndex, endIndex);
    
    // Remove the H2 heading as we'll show it in the title
    slideTokens.shift();
    
    const contentHtml = marked.parser(slideTokens) as string;
    
    // Check if the slide has both images and text - we need more robust detection
    const hasImage = contentHtml.includes('<img');
    // Check for text that's not just within the image paragraph
    const contentWithoutImages = contentHtml.replace(/<p>\s*<img[^>]*>\s*<\/p>/g, '');
    const hasText = contentWithoutImages.trim().length > 0;
    // Only set it to true if we have a balance of text and image content
    const hasImageAndText = hasImage && hasText;
    
    // Construct the final SlideData object
    const slideData: SlideData = {
      ...slideMeta,
      contentHtml,
      hasImageAndText,
      styleOptions: slideMeta.styleOptions || {},
      ...frontmatter
    } as SlideData;
    
    // Ensure slideMeta properties take precedence
    Object.keys(slideMeta).forEach(key => {
      if (!(key in slideData) || slideData[key] === undefined) {
        slideData[key] = slideMeta[key];
      }
    });
    
    return slideData;
  } catch (error) {
    console.error(`Error reading or parsing slide ${slideMeta.id}:`, error);
    return null;
  }
}

// For Next.js dynamic routing (e.g., for getStaticPaths if you were using SSG)
export function getAllSlideSlugs() {
  const slides = getSortedSlidesData();
  return slides.map((slide) => {
    return {
      // The params object should match the dynamic route segments
      // If your route is /slides/[...slug].tsx, then params.slug should be string[]
      // If your route is /slides/[slug].tsx, then params.slug should be string
      params: {
        slug: slide.slugParts, // For [...slug].tsx (e.g. /slides/1/introduction/about-us)
        // slug: slide.id, // For [slug].tsx (e.g. /slides/1-introduction-about-us)
      },
    };
  });
}

// Get the next slide in sequence
export function getNextSlide(currentSlideId: string): SlideMeta | null {
  const allSlides = getSortedSlidesData();
  const currentIndex = allSlides.findIndex(slide => slide.id === currentSlideId);
  
  if (currentIndex === -1 || currentIndex === allSlides.length - 1) {
    return null; // Not found or last slide
  }
  
  return allSlides[currentIndex + 1];
}

// Get the previous slide in sequence
export function getPrevSlide(currentSlideId: string): SlideMeta | null {
  const allSlides = getSortedSlidesData();
  const currentIndex = allSlides.findIndex(slide => slide.id === currentSlideId);
  
  if (currentIndex <= 0) {
    return null; // Not found or first slide
  }
  
  return allSlides[currentIndex - 1];
}

// Helper to generate a slug from a title
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '')       // Remove all non-word chars
    .replace(/--+/g, '-');        // Replace multiple - with single -
}
