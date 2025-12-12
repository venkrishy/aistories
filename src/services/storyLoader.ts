import { StoryPage } from '../types/story';

export interface StoryMetadata {
  title: string;
  author?: string;
  description?: string;
  coverImage?: string;
  pages: StoryPage[];
}

export interface StoryData {
  id: number;
  slug: string;
  title: string;
  author?: string;
  description?: string;
  pages: StoryPage[];
}

export interface StoryCardData {
  slug: string;
  title: string;
  description?: string;
  coverImage: string;
}

// List of available stories (JSON format only)
const AVAILABLE_STORIES = [
  { slug: 'asgard-wall', title: 'The Building of Asgard\'s Wall' },
  { slug: 'magical-sword-and-clever-sailor', title: 'The Magical Sword and the Clever Sailor' },
  // { slug: 'giant-cauldron', title: 'The Giant\'s Cauldron' }, // Skipping - invalid JSON
];

async function loadStoryMetadata(slug: string): Promise<StoryMetadata | null> {
  try {
    const response = await fetch(`/data/${slug}.json`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error(`Failed to load metadata for story "${slug}":`, error);
  }
  return null;
}

// Removed createFallbackStory - stories must have valid story.json with R2 URLs

export async function loadStories(): Promise<StoryData[]> {
  const stories: StoryData[] = [];

  for (let i = 0; i < AVAILABLE_STORIES.length; i++) {
    const storyInfo = AVAILABLE_STORIES[i];
    const metadata = await loadStoryMetadata(storyInfo.slug);

    if (metadata) {
      // Use R2 URLs directly from story.json
      stories.push({
        id: i,
        slug: storyInfo.slug,
        title: metadata.title,
        author: metadata.author,
        description: metadata.description,
        pages: metadata.pages, // Already contains full R2 URLs
      });
    } else {
      console.warn(`Story "${storyInfo.slug}" has no valid metadata, skipping...`);
    }
  }

  return stories;
}

export async function loadStory(slug: string): Promise<StoryData | null> {
  const storyInfo = AVAILABLE_STORIES.find(s => s.slug === slug);
  if (!storyInfo) return null;

  const metadata = await loadStoryMetadata(slug);

  if (metadata) {
    const id = AVAILABLE_STORIES.findIndex(s => s.slug === slug);
    return {
      id,
      slug,
      title: metadata.title,
      author: metadata.author,
      description: metadata.description,
      pages: metadata.pages, // Already contains full R2 URLs
    };
  }

  return null;
}

export async function getStoriesMetadata(): Promise<StoryCardData[]> {
  const storiesMetadata: StoryCardData[] = [];

  for (const storyInfo of AVAILABLE_STORIES) {
    const metadata = await loadStoryMetadata(storyInfo.slug);

    if (metadata) {
      // Use cover image from metadata (already full R2 URL)
      // If no coverImage, use first page image as fallback
      const coverImage = metadata.coverImage ||
        (metadata.pages.length > 0 ? metadata.pages[0].image : '/placeholder-cover.webp');

      storiesMetadata.push({
        slug: storyInfo.slug,
        title: metadata.title,
        description: metadata.description,
        coverImage,
      });
    } else {
      console.warn(`Story "${storyInfo.slug}" has no valid metadata, skipping...`);
    }
  }

  return storiesMetadata;
}
