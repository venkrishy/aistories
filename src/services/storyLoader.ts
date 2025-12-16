import { StoryPage } from '../types/story';

// Use proxy in development to avoid CORS issues, direct CDN URL in production
// Check if we're in development by checking the hostname
const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const CDN_BASE_URL = isDevelopment
  ? '/api/cdn'
  : 'https://cdn.aistories.online';

// Always use full CDN URL for images (not proxy) since img tags don't use fetch
const CDN_IMAGE_BASE_URL = 'https://cdn.aistories.online';

// Interface for meta.json structure
export interface StoryMeta {
  title: string;
  description?: string;
  coverImage?: string;
  audioUrl?: string;
  tags?: string[];
  series?: string;
  protagonist?: string;
  antagonist?: string;
  narrator?: {
    name?: string;
    voice_type?: string;
    narration_style?: string;
  };
  'ai-url'?: string;
}

// Interface for en.json structure
interface StoryLanguageData {
  en: {
    pages: Array<{
      page: number;
      image: string;
      text: string;
      chapter?: string;
      timestamp?: number;
    }>;
  };
}

export interface StoryMetadata {
  title: string;
  author?: string;
  description?: string;
  coverImage?: string;
  audioUrl?: string;
  pages: StoryPage[];
}

export interface StoryData {
  id: number;
  slug: string;
  title: string;
  author?: string;
  description?: string;
  pages: StoryPage[];
  audioUrl?: string;
}

export interface StoryCardData {
  slug: string;
  title: string;
  description?: string;
  coverImage: string;
}

// Load story slugs from stories.json
async function loadStorySlugs(): Promise<string[]> {
  try {
    const response = await fetch('/stories.json');
    if (response.ok) {
      const slugs = await response.json();
      if (Array.isArray(slugs)) {
        console.log(`Loaded ${slugs.length} story slugs from stories.json:`, slugs);
        return slugs;
      } else {
        console.error('stories.json is not an array:', slugs);
      }
    } else {
      console.error(`Failed to load stories.json: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to load stories.json:', error);
  }
  return [];
}

// Verify CDN availability by checking if meta.json exists
async function verifyStoryAvailability(slug: string): Promise<boolean> {
  const url = `${CDN_BASE_URL}/${slug}/meta.json`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store', // Force fresh fetch, bypass cache
    });
    const isAvailable = response.ok;
    if (!isAvailable) {
      console.warn(`Story "${slug}" not available at ${url}: ${response.status} ${response.statusText}`);
    } else {
      console.log(`✓ Story "${slug}" is available on CDN`);
    }
    return isAvailable;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`✗ Failed to verify story "${slug}" at ${url}:`, errorMessage);
    if (errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch')) {
      console.error('  This might be a CORS issue. Check if the CDN allows cross-origin requests.');
    }
    return false;
  }
}

// Load meta.json from CDN
async function loadStoryMeta(slug: string): Promise<StoryMeta | null> {
  const url = `${CDN_BASE_URL}/${slug}/meta.json`;
  try {
    const response = await fetch(url, { 
      mode: 'cors',
      cache: 'no-store', // Force fresh fetch, bypass cache
    });
    if (response.ok) {
      const data = await response.json();
      console.log(`✓ Loaded meta.json for "${slug}"`);
      return data;
    } else {
      console.error(`Failed to load meta.json for "${slug}": ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to load meta.json for story "${slug}" at ${url}:`, errorMessage);
  }
  return null;
}

// Load en.json from CDN
async function loadStoryLanguageData(slug: string): Promise<StoryLanguageData | null> {
  const url = `${CDN_BASE_URL}/${slug}/en.json`;
  try {
    const response = await fetch(url, { 
      mode: 'cors',
      cache: 'no-store', // Force fresh fetch, bypass cache
    });
    if (response.ok) {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        console.log(`✓ Loaded en.json for "${slug}"`);
        return data;
      } catch (parseError) {
        const parseErrorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        console.error(`Failed to parse en.json for "${slug}":`, parseErrorMessage);
        console.error(`This is likely a malformed JSON file on the CDN. Please check: ${url}`);
        // Try to find the problematic line
        const lines = text.split('\n');
        if (parseError instanceof SyntaxError && parseError.message.includes('position')) {
          const match = parseError.message.match(/position (\d+)/);
          if (match) {
            const position = parseInt(match[1]);
            let charCount = 0;
            for (let i = 0; i < lines.length; i++) {
              if (charCount + lines[i].length >= position) {
                console.error(`Error likely around line ${i + 1}:`, lines[i].substring(0, 100));
                break;
              }
              charCount += lines[i].length + 1; // +1 for newline
            }
          }
        }
        return null;
      }
    } else {
      console.error(`Failed to load en.json for "${slug}": ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to load en.json for story "${slug}" at ${url}:`, errorMessage);
  }
  return null;
}

// Construct full CDN URL for image
// Always use full CDN URL (not proxy) since images are loaded via <img> tags, not fetch
function constructImageUrl(slug: string, imagePath: string): string {
  // If already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log(`Image path is already a full URL for "${slug}":`, imagePath);
    return imagePath;
  }
  // Construct full CDN URL (always use direct CDN, not proxy)
  const fullUrl = `${CDN_IMAGE_BASE_URL}/${slug}/${imagePath}`;
  console.log(`Constructed image URL for "${slug}": ${imagePath} -> ${fullUrl}`);
  return fullUrl;
}

// Construct full CDN URL for audio if needed
function constructAudioUrl(slug: string, audioPath: string | undefined): string | undefined {
  if (!audioPath) return undefined;
  // If already a full URL, return as-is
  if (audioPath.startsWith('http://') || audioPath.startsWith('https://')) {
    return audioPath;
  }
  // Construct full CDN URL
  return `${CDN_BASE_URL}/${slug}/${audioPath}`;
}

// Load and combine meta.json and en.json
async function loadStoryMetadata(slug: string): Promise<StoryMetadata | null> {
  try {
    // Load meta.json and en.json in parallel
    const [meta, languageData] = await Promise.all([
      loadStoryMeta(slug),
      loadStoryLanguageData(slug),
    ]);

    if (!meta || !languageData || !languageData.en) {
      return null;
    }

    // Extract pages from en.json and construct full image URLs
    const pages: StoryPage[] = languageData.en.pages.map((page) => ({
      page: page.page,
      image: constructImageUrl(slug, page.image),
      text: page.text,
      chapter: page.chapter,
      timestamp: page.timestamp,
    }));

    // Always use cover.webp for landing cards (author wants a fixed cover filename)
    const coverImage = constructImageUrl(slug, 'cover.webp');

    // Construct audioUrl if present
    const audioUrl = constructAudioUrl(slug, meta.audioUrl);

    return {
      title: meta.title,
      description: meta.description,
      coverImage,
      audioUrl,
      pages,
    };
  } catch (error) {
    console.error(`Failed to load story metadata for "${slug}":`, error);
    return null;
  }
}

export async function loadStories(): Promise<StoryData[]> {
  const stories: StoryData[] = [];
  const slugs = await loadStorySlugs();

  if (slugs.length === 0) {
    console.warn('No story slugs found in stories.json');
    return stories;
  }

  console.log(`Verifying availability for ${slugs.length} stories on CDN...`);

  // Verify availability and load stories
  const verificationPromises = slugs.map(async (slug) => {
    const isAvailable = await verifyStoryAvailability(slug);
    if (isAvailable) {
      return slug;
    }
    console.warn(`Story "${slug}" is not available on CDN, skipping...`);
    return null;
  });

  const availableSlugs = (await Promise.all(verificationPromises)).filter(
    (slug): slug is string => slug !== null
  );

  console.log(`${availableSlugs.length} of ${slugs.length} stories are available on CDN`);

  // Load metadata for available stories
  for (let i = 0; i < availableSlugs.length; i++) {
    const slug = availableSlugs[i];
    const metadata = await loadStoryMetadata(slug);

    if (metadata) {
      stories.push({
        id: i,
        slug,
        title: metadata.title,
        description: metadata.description,
        pages: metadata.pages,
        audioUrl: metadata.audioUrl,
      });
    } else {
      console.warn(`Story "${slug}" has no valid metadata, skipping...`);
    }
  }

  return stories;
}

export async function loadStory(slug: string): Promise<StoryData | null> {
  // Verify availability first
  const isAvailable = await verifyStoryAvailability(slug);
  if (!isAvailable) {
    console.warn(`Story "${slug}" is not available on CDN`);
    return null;
  }

  const metadata = await loadStoryMetadata(slug);
  if (!metadata) {
    return null;
  }

  // Get the index from available stories (use cached verification if possible)
  // For simplicity, we'll use index 0 if we can't determine it
  // The id is mainly used for ordering, so this is acceptable
  const slugs = await loadStorySlugs();
  const id = slugs.indexOf(slug);

  return {
    id: id >= 0 ? id : 0,
    slug,
    title: metadata.title,
    description: metadata.description,
    pages: metadata.pages,
    audioUrl: metadata.audioUrl,
  };
}

export async function getStoriesMetadata(): Promise<StoryCardData[]> {
  const storiesMetadata: StoryCardData[] = [];
  const slugs = await loadStorySlugs();

  if (slugs.length === 0) {
    console.warn('No story slugs found in stories.json');
    return storiesMetadata;
  }

  console.log(`Getting metadata for ${slugs.length} stories from CDN...`);

  // Verify availability and load metadata
  const verificationPromises = slugs.map(async (slug) => {
    const isAvailable = await verifyStoryAvailability(slug);
    if (isAvailable) {
      return slug;
    }
    console.warn(`Story "${slug}" is not available on CDN, skipping...`);
    return null;
  });

  const availableSlugs = (await Promise.all(verificationPromises)).filter(
    (slug): slug is string => slug !== null
  );

  console.log(`${availableSlugs.length} of ${slugs.length} stories are available on CDN`);

  for (const slug of availableSlugs) {
    const metadata = await loadStoryMetadata(slug);

    if (metadata) {
      // Use cover image from metadata, or fallback to first page image
      const coverImage =
        metadata.coverImage ||
        (metadata.pages.length > 0 ? metadata.pages[0].image : '/placeholder-cover.webp');

      storiesMetadata.push({
        slug,
        title: metadata.title,
        description: metadata.description,
        coverImage,
      });
    } else {
      console.warn(`Story "${slug}" has no valid metadata, skipping...`);
    }
  }

  return storiesMetadata;
}
