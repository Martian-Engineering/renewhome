import 'server-only';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
// @ts-ignore - Assuming types are installed and will be resolved by the build system
import { marked, Token, Tokens } from 'marked';

const slidesDirectory = path.join(process.cwd(), 'slides-md');

export interface SlideData {
  id: string; // e.g., "1-introduction"
  slug: string; // The full slug, same as id for now.
  slugParts: string[]; // e.g., ["1", "introduction"]
  number: number;
  title: string;
  contentHtml: string;
  [key: string]: any; // For additional frontmatter
}

// Metadata for a slide, excluding the full content (for list views)
export type SlideMeta = Omit<SlideData, 'contentHtml'>;

export function getSortedSlidesData(): SlideMeta[] {
  let fileNames: string[];
  try {
    fileNames = fs.readdirSync(slidesDirectory);
  } catch (error) {
    console.warn("Could not read slides directory. Ensure 'slides-md' exists in the project root.", error);
    return [];
  }

  const allSlidesData = fileNames
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

      let title = frontmatter.title as string | undefined;

      if (!title) {
        // @ts-ignore
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
          title = `Slide ${number}`;
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
        ...frontmatter, // Spread all frontmatter here
      } as SlideMeta;
    })
    .filter(Boolean) as SlideMeta[]; // Filter out nulls from invalid filenames

  return allSlidesData.sort((a, b) => a.number - b.number);
}

export async function getSlideData(slug: string): Promise<SlideData | null> {
  const slidesMetadata = getSortedSlidesData();
  // Find by full slug (id)
  const slideMeta = slidesMetadata.find((s) => s.id === slug);

  if (!slideMeta) {
    // Fallback: if slug is just a number string, try to find by number
    const num = parseInt(slug, 10);
    if (!isNaN(num)) {
        const slideByNum = slidesMetadata.find(s => s.number === num);
        if (slideByNum) {
            // If found by number, recall with its proper full slug (id)
            return getSlideData(slideByNum.id);
        }
    }
    return null; // Not found by id or number
  }

  const fullPath = path.join(slidesDirectory, `${slideMeta.id}.md`);
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data: frontmatter, content } = matter(fileContents);
    // Process markdown to remove the first heading since we'll show it in the title
    // @ts-ignore
    const tokens = marked.lexer(content);
    const firstHeadingIndex = tokens.findIndex(token => token.type === 'heading' && token.depth === 1);
    
    if (firstHeadingIndex !== -1) {
      tokens.splice(firstHeadingIndex, 1);
    }
    
    // @ts-ignore
    const contentHtml = marked.parser(tokens) as string;

    // Construct the final SlideData object
    const slideData: SlideData = {
      id: slideMeta.id,
      slug: slideMeta.slug,
      slugParts: slideMeta.slugParts,
      number: slideMeta.number,
      title: slideMeta.title, // Title is already resolved in slideMeta
      contentHtml,
      ...frontmatter, // Add all frontmatter from the file
      // Ensure slideMeta's specific frontmatter (if any beyond id, slug, etc.) is also included
      // and takes precedence if there were any overlaps during its own creation.
      // However, frontmatter from the direct file read (matterResult.data) should be more specific here.
    };
     // Merge slideMeta properties that might have been from its own frontmatter processing,
     // ensuring they are not overwritten by the re-parsed frontmatter unless intended.
     // The current structure should be fine as slideMeta.title is already resolved.
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
        slug: slide.slugParts, // For [...slug].tsx (e.g. /slides/1/introduction)
        // slug: slide.id, // For [slug].tsx (e.g. /slides/1-introduction)
      },
    };
  });
}

// Helper to generate a slug from a title
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\\s+/g, '-')           // Replace spaces with -
    .replace(/[^\\w-]+/g, '')       // Remove all non-word chars
    .replace(/--+/g, '-');        // Replace multiple - with single -
}
