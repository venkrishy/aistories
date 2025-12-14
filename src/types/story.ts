export interface StoryPage {
  page: number;
  image: string;
  text: string;
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
