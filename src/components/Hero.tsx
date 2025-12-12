import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

export function Hero() {
  const fullText = 'Immerse yourself in captivating tales from around the world. Choose a story and begin your journey.';
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(fullText.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 50); // Typing speed: 50ms per character

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  return (
    <section 
      id="hero-section"
      className="py-12 md:py-16"
      aria-label="Hero section"
    >
      <div 
        id="hero-container"
        className="container mx-auto px-4"
      >
        <div 
          id="hero-content"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Icon */}
          <div 
            id="hero-icon-container"
            className="flex justify-center mb-3"
            aria-hidden="true"
          >
            <BookOpen 
              id="hero-icon"
              className="w-8 h-8 text-amber-600"
              aria-hidden="true"
            />
          </div>

          {/* Heading */}
          <div className="flex justify-center w-full mb-3">
            <h1 
              id="hero-title"
              className="text-[72px] font-semibold text-amber-900 text-center"
            >
              Visual Stories
            </h1>
          </div>

          {/* Subtitle */}
          <div className="flex justify-center w-full">
            <p 
              id="hero-subtitle"
              className="text-sm text-gray-600 max-w-2xl text-center"
            >
              {displayText}
              <span className="animate-pulse">|</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
