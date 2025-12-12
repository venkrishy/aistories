import { motion } from 'motion/react';
import { BookOpen, ArrowRight } from 'lucide-react';

interface Story {
  id: number;
  title: string;
  content: string;
  image: string;
}

interface LandingPageProps {
  stories: Story[];
  onSelectStory: (index: number) => void;
}

export function LandingPage({ stories, onSelectStory }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-12 h-12 text-amber-600" />
            <h1 className="text-[144px] text-amber-900">Visual Stories</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Immerse yourself in captivating tales from around the world. Choose a story and begin your journey.
          </p>
        </motion.div>

        {/* Story Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => onSelectStory(index)}
            >
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                {/* Card Image */}
                <div className="relative h-64 overflow-hidden">
                  <motion.img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  
                  {/* Chapter Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm text-amber-900">Chapter {index + 1}</span>
                  </div>

                  {/* Read Button - appears on hover */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <div className="bg-amber-600 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-xl">
                      <span>Read Story</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </motion.div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h2 className="text-2xl text-amber-900 mb-3 group-hover:text-amber-600 transition-colors">
                    {story.title}
                  </h2>
                  <p className="text-gray-600 line-clamp-3 leading-relaxed">
                    {story.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-gray-500">
            Select any story to begin your immersive reading experience
          </p>
        </motion.div>
      </div>
    </div>
  );
}
