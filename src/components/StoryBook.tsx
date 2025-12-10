import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Story {
  id: number;
  title: string;
  content: string;
  image: string;
}

interface StoryBookProps {
  story: Story;
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export function StoryBook({
  story,
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
  canGoNext,
  canGoPrev,
}: StoryBookProps) {
  return (
    <div className="relative w-full max-w-7xl">
      {/* Book Container */}
      <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden" style={{ perspective: '2000px' }}>
        <div className="grid md:grid-cols-2 min-h-[600px]">
          {/* Left Page - Text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${story.id}`}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="p-12 flex flex-col justify-center bg-gradient-to-br from-amber-50 to-orange-50 border-r-2 border-amber-200"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-sm text-amber-600 tracking-widest uppercase">
                    Chapter {currentPage + 1}
                  </div>
                  <h1 className="text-4xl text-amber-900">
                    {story.title}
                  </h1>
                </div>
                <div className="h-1 w-20 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {story.content}
                </p>
                <div className="pt-4 text-sm text-amber-600">
                  Page {currentPage + 1} of {totalPages}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right Page - Image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`image-${story.id}`}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="relative overflow-hidden bg-gray-900"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.img
                src={story.image}
                alt={story.title}
                className="w-full h-full object-cover"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/20 to-transparent pointer-events-none">
          <div className="flex justify-between items-center pointer-events-auto">
            <button
              onClick={onPrevPage}
              disabled={!canGoPrev}
              className={`group flex items-center gap-2 px-6 py-3 rounded-full bg-white shadow-lg transition-all duration-300 ${
                canGoPrev
                  ? 'hover:bg-amber-50 hover:shadow-xl hover:scale-105'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className={`w-5 h-5 ${canGoPrev ? 'text-amber-600 group-hover:-translate-x-1 transition-transform' : 'text-gray-400'}`} />
              <span className={`${canGoPrev ? 'text-amber-900' : 'text-gray-400'}`}>Previous</span>
            </button>

            <button
              onClick={onNextPage}
              disabled={!canGoNext}
              className={`group flex items-center gap-2 px-6 py-3 rounded-full bg-white shadow-lg transition-all duration-300 ${
                canGoNext
                  ? 'hover:bg-amber-50 hover:shadow-xl hover:scale-105'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <span className={`${canGoNext ? 'text-amber-900' : 'text-gray-400'}`}>Next</span>
              <ChevronRight className={`w-5 h-5 ${canGoNext ? 'text-amber-600 group-hover:translate-x-1 transition-transform' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Page Indicator Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalPages }).map((_, index) => (
          <motion.div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentPage
                ? 'w-8 bg-amber-600'
                : 'w-2 bg-amber-300'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
}
