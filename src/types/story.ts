export interface StoryPage {
  page: number;
  image: string;
  text: string;
  chapter?: string; // Custom chapter title, if not provided uses "Chapter X"
  timestamp?: number; // Seconds from audio start when page should flip
}

export interface StoryWithPages {
  id: number;
  slug: string;
  title: string;
  author?: string;
  description?: string;
  pages: StoryPage[];
  audioUrl?: string; // URL to audio narration file
}
