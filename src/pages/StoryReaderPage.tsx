import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { StoryBook } from '../components/StoryBook';
import { loadStory } from '../services/storyLoader';
import { createCDNConfig } from '../services/cdnConfig';
import { StoryWithPages } from '../types/story';

interface BookPage {
  id: number;
  title: string;
  content: string;
  image: string;
  chapter?: string;
}

export default function StoryReaderPage() {
  const { slug } = useParams({ strict: false });
  const navigate = useNavigate();
  const [story, setStory] = useState<StoryWithPages | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const initializeStory = async () => {
      if (!slug) {
        setError('No story specified');
        setIsLoading(false);
        return;
      }

      try {
        const config = createCDNConfig();
        const loadedStory = await loadStory(slug, config);
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
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      
      // If audio is playing, seek to new page's timestamp
      if (isPlaying && audioRef.current && story.pages[newPage]?.timestamp !== undefined) {
        audioRef.current.currentTime = story.pages[newPage].timestamp!;
      }
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      
      // If audio is playing, seek to previous page's timestamp
      if (isPlaying && audioRef.current && story.pages[newPage]?.timestamp !== undefined) {
        audioRef.current.currentTime = story.pages[newPage].timestamp!;
      }
    }
  };

  const handleTogglePlay = () => {
    if (!audioRef.current || !story?.audioUrl) return;

    if (isPlaying) {
      // Pause audio
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Start playing from current page's timestamp
      const currentPageData = story.pages[currentPage];
      const startTime = currentPageData?.timestamp ?? 0;
      audioRef.current.currentTime = startTime;
      
      // Check if we need to advance to the correct page based on current audio time
      // This handles the case where audio was already playing and user paused/resumed
      const checkAndUpdatePage = () => {
        const audioTime = audioRef.current?.currentTime ?? startTime;
        // Find the correct page for the current audio time
        for (let i = story.pages.length - 1; i >= 0; i--) {
          const pageTimestamp = story.pages[i]?.timestamp;
          if (pageTimestamp !== undefined && audioTime >= pageTimestamp) {
            if (i !== currentPage) {
              setCurrentPage(i);
            }
            break;
          }
        }
      };
      
      // Small delay to ensure audio time is set
      setTimeout(checkAndUpdatePage, 50);
      
      audioRef.current.play().catch((err) => {
        console.error('Failed to play audio:', err);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const time = audioRef.current.currentTime;
    setCurrentTime(time);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Auto-flip logic based on timestamps
  useEffect(() => {
    if (!isPlaying || !story || !audioRef.current) return;

    const checkAutoFlip = () => {
      const audioTime = audioRef.current?.currentTime ?? 0;
      
      // Check if we should flip to the next page
      if (currentPage < story.pages.length - 1) {
        const nextPageData = story.pages[currentPage + 1];
        const currentPageData = story.pages[currentPage];
        
        // Only flip if:
        // 1. Next page has a timestamp
        // 2. Audio time is at or past next page's timestamp
        // 3. Audio time is past current page's timestamp (to avoid flipping too early)
        if (
          nextPageData?.timestamp !== undefined &&
          audioTime >= nextPageData.timestamp &&
          (currentPageData?.timestamp === undefined || audioTime >= currentPageData.timestamp)
        ) {
          setCurrentPage((prev) => {
            // Make sure we don't go beyond the last page
            const newPage = Math.min(prev + 1, story.pages.length - 1);
            return newPage;
          });
        }
      }
    };

    // Check periodically (every 100ms)
    const interval = setInterval(checkAutoFlip, 100);
    return () => clearInterval(interval);
  }, [isPlaying, story, currentPage]);

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
    chapter: currentPageData.chapter,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      {/* Hidden audio element */}
      {story?.audioUrl && (
        <audio
          ref={audioRef}
          src={story.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleAudioEnded}
          onLoadedMetadata={() => {
            // Audio loaded, ready to play
          }}
          onError={(e) => {
            console.error('Audio error:', e);
            setIsPlaying(false);
          }}
        />
      )}

      <StoryBook
        story={bookPage}
        currentPage={currentPage}
        totalPages={story.pages.length}
        onNextPage={nextPage}
        onPrevPage={prevPage}
        onGoToFirstPage={goToHome}
        canGoNext={currentPage < story.pages.length - 1}
        canGoPrev={currentPage > 0}
        onTogglePlay={story?.audioUrl ? handleTogglePlay : undefined}
        isPlaying={isPlaying}
        audioUrl={story?.audioUrl}
      />
    </div>
  );
}
