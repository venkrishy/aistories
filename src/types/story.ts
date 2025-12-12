export interface StoryPage {
  page: number;
  image: string;
  text: string;
}

export interface StoryWithPages {
  id: number;
  slug: string;
  title: string;
  author?: string;
  description?: string;
  pages: StoryPage[];
}
