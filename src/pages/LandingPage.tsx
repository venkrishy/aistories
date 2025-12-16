import { useState, useEffect } from 'react';
import { Hero } from '../components/Hero';
import { StoryGrid } from '../components/StoryGrid';
import { getStoriesMetadata, type StoryCardData } from '../services/storyLoader';

export default function LandingPage() {
  const [stories, setStories] = useState<StoryCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStories = async () => {
      try {
        console.log('Loading stories metadata...');
        const storiesData = await getStoriesMetadata();
        console.log(`Loaded ${storiesData.length} stories:`, storiesData);
        setStories(storiesData);
      } catch (error) {
        console.error('Failed to load stories:', error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadStories();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <Hero />

      {/* Stories Showcase Section */}
      <section
        id="story-showcase"
        className="py-8 md:py-12"
      >
        <div className="container mx-auto px-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          )}

          {/* Stories Grid */}
          {!isLoading && stories.length > 0 && (
            <StoryGrid stories={stories} />
          )}

          {/* Empty State */}
          {!isLoading && stories.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No stories available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
