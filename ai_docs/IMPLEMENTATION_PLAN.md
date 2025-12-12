# Visual Storytelling UI - Implementation Plan

## Current Status
- ✅ Project directory created: `/Users/venky/git/visual-storytelling-ui/`
- 🔄 Ready to begin implementation

---

## Phase 1: Beautiful UI (Static MVP)

### Milestone 1: Harness Framework Setup
**Goal**: Create structure for long-running development

- [ ] Create `init.sh` - Environment setup script
- [ ] Create `docs/prd.md` - Complete Product Requirements Document
- [ ] Create `features.json` - Feature tracking with all phases
- [ ] Create `claude-progress.txt` - Session progress tracker
- [ ] Create `.claude/guidelines.md` - Development guidelines

### Milestone 2: Project Foundation
**Goal**: Set up base React + Vite project from Figma codebase

- [ ] Copy Figma codebase from `/tmp/visual-storytelling-ui/`
- [ ] Install dependencies (`npm install`)
- [ ] Verify project runs (`npm run dev`)
- [ ] Initialize git repository
- [ ] Create initial commit

### Milestone 3: Story Data Structure
**Goal**: Create file structure for "The Last Time I Saw Her" story

- [ ] Create `public/stories/the-last-time-i-saw-her/` directory
- [ ] Create `meta.json` with story metadata
- [ ] Create `text_1.txt` through `text_10.txt` with story content
- [ ] Wait for user to add `cover.png` and `image_1.png` through `image_10.png`

### Milestone 4: Core Components - Story Loader
**Goal**: Load story data from public directory

- [ ] Create `src/utils/storyLoader.ts`
- [ ] Implement `loadStory()` function
- [ ] Add interfaces: StoryMeta, StoryPage, Story
- [ ] Test loading story metadata and text files

### Milestone 5: Core Components - StoryBook Viewer
**Goal**: Modify Figma component to match requirements

- [ ] **CRITICAL FIX**: Add fixed dimensions to book container
  - Set fixed width/height (e.g., `max-w-6xl w-full h-[700px]`)
  - Ensure navigation buttons stay in same position
  - Use `object-cover` for images within fixed dimensions
- [ ] Swap layout: Image LEFT, Text RIGHT (currently reversed)
- [ ] Update 3D flip animations for new layout
- [ ] Add `isCover` prop for cover page mode
- [ ] Position navigation buttons absolutely at bottom
- [ ] Test with different image aspect ratios

### Milestone 6: Landing Page
**Goal**: Create animated landing page

- [ ] Create `src/components/LandingPage.tsx`
- [ ] Create `src/hooks/useTypewriter.ts` for animation
- [ ] Implement typewriter effect with word rotation
  - "Experience **Amazing** Stories"
  - "Experience **Beautiful** Stories"
  - "Experience **Magical** Stories"
- [ ] Add CTA button: "View Story" / "Explore Story"
- [ ] Dark gradient background
- [ ] Smooth fade-in animations with Framer Motion

### Milestone 7: Text-to-Speech
**Goal**: Add voice narration feature

- [ ] Create `src/components/TextToSpeech.tsx`
- [ ] Implement Web Speech API integration
- [ ] Add Listen button with dropdown
- [ ] Voice options: higher/lower pitch
- [ ] Add "Start from beginning" option
- [ ] Add play/pause controls
- [ ] Position in viewer (top-right corner)

### Milestone 8: Share Functionality
**Goal**: Allow users to share stories

- [ ] Create `src/components/ShareButton.tsx`
- [ ] Implement clipboard copy functionality
- [ ] Add toast notification using shadcn/ui Toast
- [ ] Show "Link copied!" message
- [ ] Position share button in viewer

### Milestone 9: App Routing & Integration
**Goal**: Connect all components with routing

- [ ] Update `src/App.tsx`
- [ ] Add view mode state: 'landing' | 'cover' | 'story'
- [ ] Implement story loading with storyLoader
- [ ] Add navigation flow:
  - Landing → Cover → Story pages
- [ ] Manage current page state
- [ ] Add keyboard navigation (arrow keys)

### Milestone 10: Cover Page View
**Goal**: Create special cover page layout

- [ ] Update StoryBook component for cover mode
- [ ] Single page layout (not two-page spread)
- [ ] Center cover image
- [ ] Display title and author
- [ ] Add "Start Reading" button
- [ ] Smooth transition to first page

### Milestone 11: Responsive Design
**Goal**: Make app work on all devices

- [ ] Desktop: Full two-page spread
- [ ] Tablet: Single page view
- [ ] Mobile: Single page view, vertical layout
- [ ] Add touch gestures for page navigation
- [ ] Test on multiple screen sizes
- [ ] Ensure fixed button positions work on all sizes

### Milestone 12: Polish & Testing
**Goal**: Final testing and bug fixes

- [ ] Run through full user flow
- [ ] Test all animations are smooth (60fps)
- [ ] Verify fixed button positioning
- [ ] Test text-to-speech on different browsers
- [ ] Test responsive design on actual devices
- [ ] Fix any console errors
- [ ] Performance optimization if needed

### Milestone 13: Deployment
**Goal**: Deploy to AWS Amplify

- [ ] Build production bundle: `npm run build`
- [ ] Test production build locally
- [ ] Install AWS Amplify CLI (if needed)
- [ ] Run `amplify init`
- [ ] Run `amplify add hosting`
- [ ] Deploy: `amplify publish`
- [ ] Test deployed app
- [ ] Get public URL

---

## Success Criteria Checklist

Before marking Phase 1 complete, verify:

- [ ] Landing page loads with animated text
- [ ] Can click through to cover page
- [ ] Can view cover page with title/author
- [ ] Can click "Start Reading" to begin story
- [ ] Can flip through all 10 story pages
- [ ] Page flip animation is smooth (60fps)
- [ ] **Book container stays fixed size (buttons don't move)**
- [ ] Navigation buttons are always in same position
- [ ] Text-to-speech works and reads current page
- [ ] Can change voice pitch (higher/lower)
- [ ] Share button copies URL to clipboard
- [ ] Toast notification appears on share
- [ ] Responsive on desktop (1920x1080, 1366x768)
- [ ] Responsive on tablet (iPad, 768x1024)
- [ ] Responsive on mobile (iPhone, 375x667)
- [ ] Works on Chrome
- [ ] Works on Firefox
- [ ] Works on Safari
- [ ] Works on Edge
- [ ] Keyboard navigation works (arrow keys)
- [ ] No console errors
- [ ] Deployed to AWS Amplify
- [ ] Public URL is accessible

---

## Implementation Notes

### Critical Requirements
1. **Fixed Button Positioning**: This is the #1 priority - buttons must never move
2. **Layout Swap**: Image LEFT, Text RIGHT (opposite of Figma version)
3. **Story Content**: Use "The Last Time I Saw Her" story (10 pages provided)
4. **User Images**: Wait for user to provide 11 images (1 cover + 10 pages)

### Technical Decisions
- React 18 + Vite (from Figma)
- Tailwind CSS for styling
- Framer Motion for animations
- shadcn/ui for UI components
- Web Speech API for TTS (no external service)
- No backend/database (pure frontend)

### Development Workflow
1. Work on ONE milestone at a time
2. Test thoroughly before moving to next
3. Commit after each milestone: `feat: [milestone-name]`
4. Update `claude-progress.txt` after each session
5. Update `features.json` status as features complete

---

## Next Steps

1. ✅ Implementation plan created
2. ⏭️ Begin Milestone 1: Create Harness Framework files
3. ⏭️ Continue through milestones sequentially
4. ⏭️ Update this plan as needed during development
