import { React } from 'react';
import { Link } from '@tanstack/react-router';
import type { StoryCardData } from '../services/storyLoader';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface StoryGridProps {
  stories: StoryCardData[];
}

export function StoryGrid({ stories }: StoryGridProps) {
  return (
    <div 
      id="story-grid"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
      role="list"
      aria-label="Story cards grid"
    >
      {stories.map((story) => (
        <Link
          key={story.slug}
          id={`story-card-link-${story.slug}`}
          to="/story/$slug"
          params={{ slug: story.slug }}
          className="group block"
          aria-label={`Read story: ${story.title}`}
        >
          <div
            id={`story-card-${story.slug}`}
            data-story-slug={story.slug}
            className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl"
            role="article"
            aria-labelledby={`story-card-title-${story.slug}`}
          >
            {/* Card Image - Fixed heights for responsive breakpoints */}
            <div 
              id={`story-card-image-container-${story.slug}`}
              className="relative w-full h-[280px] md:h-[320px] lg:h-[340px] overflow-hidden"
            >
              <ImageWithFallback
                id={`story-card-cover-image-${story.slug}`}
                src={story.coverImage}
                alt={story.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error(`Failed to load cover image for "${story.slug}":`, story.coverImage);
                }}
              />
              <div 
                id={`story-card-gradient-overlay-${story.slug}`}
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
                aria-hidden="true"
              />

              {/* Category Badge */}
              {story.category && (
                <div 
                  id={`story-card-category-badge-${story.slug}`}
                  className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full"
                >
                  <span 
                    id={`story-card-category-${story.slug}`}
                    className="text-xs text-gray-700 font-medium"
                  >
                    {story.category}
                  </span>
                </div>
              )}
            </div>

            {/* Card Content */}
            <div 
              id={`story-card-content-${story.slug}`}
              className="p-4"
            >
              <h2 
                id={`story-card-title-${story.slug}`}
                className="text-lg text-amber-600 font-bold mb-2 leading-tight text-center"
              >
                {story.title}
              </h2>
              <p 
                id={`story-card-description-${story.slug}`}
                className="text-gray-600 text-sm line-clamp-2 leading-relaxed"
              >
                {story.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
