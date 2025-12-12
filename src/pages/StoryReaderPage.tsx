import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { StoryBook } from '../components/StoryBook';
import { loadStory } from '../services/storyLoader';
import { StoryWithPages } from '../types/story';

interface BookPage {
  id: number;
  title: string;
  content: string;
  image: string;
}

export default function StoryReaderPage() {
  const { slug } = useParams({ strict: false });
  const navigate = useNavigate();
  const [story, setStory] = useState<StoryWithPages | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStory = async () => {
      if (!slug) {
        setError('No story specified');
        setIsLoading(false);
        return;
      }

      try {
        const loadedStory = await loadStory(slug);
        if (loadedStory) {
          setStory(loadedStory);
          setCurrentPage(0);
        } else {
          setError('Story not found');
        }
      } catch (err) {
        console.error('Failed to load story:', err);
        setError('Failed to load story');
      } finally {
        setIsLoading(false);
      }
    };

    initializeStory();
  }, [slug]);

  const nextPage = () => {
    if (story && currentPage < story.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToHome = () => {
    navigate({ to: '/' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-900">Loading story...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-amber-900 mb-4">{error || 'Story not found'}</p>
          <button
            onClick={goToHome}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const currentPageData = story.pages[currentPage];
  const bookPage: BookPage = {
    id: story.id,
    title: story.title,
    content: currentPageData.text,
    image: currentPageData.image,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <StoryBook
        story={bookPage}
        currentPage={currentPage}
        totalPages={story.pages.length}
        onNextPage={nextPage}
        onPrevPage={prevPage}
        onGoToFirstPage={goToHome}
        canGoNext={currentPage < story.pages.length - 1}
        canGoPrev={currentPage > 0}
      />
    </div>
  );
}
