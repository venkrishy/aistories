import { useState } from 'react';
import { StoryBook } from './components/StoryBook';
import { LandingPage } from './components/LandingPage';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

interface Story {
  id: number;
  title: string;
  content: string;
  image: string;
}

const stories: Story[] = [
  {
    id: 1,
    title: "The Mountain's Call",
    content: "High above the clouds, where eagles dare to fly, there stands a magnificent peak that has called to adventurers for generations. The journey begins at dawn, when the first rays of sunlight paint the rocky slopes in shades of gold and crimson. Each step forward is a step into the unknown, a dance with nature's raw power and beauty.",
    image: "https://images.unsplash.com/photo-1631684181713-e697596d2165?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMGFkdmVudHVyZXxlbnwxfHx8fDE3NjUyNzM3MjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 2,
    title: "Whispers of the Forest",
    content: "In the heart of the ancient woodland, time moves differently. The towering trees stand as silent sentinels, their branches weaving a canopy that filters the sunlight into dancing patterns on the forest floor. Here, among the moss-covered stones and babbling brooks, one can hear the whispers of countless stories carried on the gentle breeze.",
    image: "https://images.unsplash.com/photo-1760700755874-d3e9f6967a90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjBuYXR1cmUlMjBwZWFjZWZ1bHxlbnwxfHx8fDE3NjUzNzU5OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 3,
    title: "Ocean's Embrace",
    content: "As the sun descends toward the horizon, the ocean transforms into a canvas of breathtaking colors. Waves roll gently onto the shore, each one carrying tales from distant lands across the vast blue expanse. The rhythm of the tide is eternal, a heartbeat that has echoed through the ages, reminding us of nature's infinite wisdom and grace.",
    image: "https://images.unsplash.com/photo-1743570516511-2b897c98ad28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHN1bnNldCUyMGJlYXV0aWZ1bHxlbnwxfHx8fDE3NjUzODQ1Njh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 4,
    title: "City of Dreams",
    content: "When darkness falls, the city awakens with a million points of light. Skyscrapers reach toward the heavens, their windows glowing like stars brought down to earth. The streets pulse with energy, alive with the dreams and ambitions of countless souls who have come seeking their fortune in this urban constellation.",
    image: "https://images.unsplash.com/photo-1580895456895-cfdf02e4c23f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwbmlnaHQlMjBsaWdodHN8ZW58MXx8fHwxNzY1Mzc5MTI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 5,
    title: "Desert Nights",
    content: "Under the vast expanse of the star-filled sky, the desert reveals its true majesty. The silence is profound, broken only by the whisper of wind across ancient dunes. Here, beneath the cosmic tapestry above, one finds a connection to something greater—a reminder that we are all made of stardust, forever bound to the universe that gave us birth.",
    image: "https://images.unsplash.com/photo-1740382282199-7d70397381c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBzdGFycyUyMG5pZ2h0fGVufDF8fHx8MTc2NTM4NDU2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedStory, setSelectedStory] = useState<number | null>(null);

  const nextPage = () => {
    if (currentPage < stories.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSelectStory = (index: number) => {
    setCurrentPage(index);
    setSelectedStory(index);
  };

  const handleBackToHome = () => {
    setSelectedStory(null);
  };

  // Show landing page
  if (selectedStory === null) {
    return <LandingPage stories={stories} onSelectStory={handleSelectStory} />;
  }

  // Show story book
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      {/* Back to Home Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleBackToHome}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-amber-50 transition-all duration-300 group"
      >
        <ArrowLeft className="w-5 h-5 text-amber-600 group-hover:-translate-x-1 transition-transform" />
        <span className="text-amber-900">Back to Stories</span>
      </motion.button>

      <StoryBook
        story={stories[currentPage]}
        currentPage={currentPage}
        totalPages={stories.length}
        onNextPage={nextPage}
        onPrevPage={prevPage}
        canGoNext={currentPage < stories.length - 1}
        canGoPrev={currentPage > 0}
      />
    </div>
  );
}