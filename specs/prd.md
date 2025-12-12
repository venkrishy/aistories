# Product Requirements Document
## AI Stories Beautifully Rendered
Web: aistories.online

**Version**: 1.0
**Date**: 2025-12-10
**Status**: Phase 1 - In Development

---

## 1. Executive Summary

### Product Vision
Create a beautiful, intuitive visual storytelling platform that allows users to create, share, and experience illustrated stories with stunning page-flipping animations and immersive features.

### Target Users
- **Primary**: Content creators, writers, and storytellers who want to share illustrated narratives
- **Secondary**: Educators creating educational content, parents creating children's stories
- **Tertiary**: Readers who want to experience visual stories in an engaging format

### Success Metrics
- **Phase 1**: Story view time > 2 minutes, animation smoothness (60fps), < 2s page load time
- **Phase 2**: User story creation completion rate > 70%, average time to create story < 15 minutes
- **Phase 3**: Monthly active users, story shares, viral coefficient

### Product Goals
1. Deliver the most beautiful storybook experience on the web
2. Make story creation accessible to everyone
3. Build a community around visual storytelling

---

## 2. Phase 1: Beautiful UI (Static MVP)

### 2.1 Overview
**Goal**: Create a stunning storybook viewer with one complete demo story
**Timeline**: Current phase (in development)
**Deliverable**: Working app deployed with a couple of stories

### 2.2 Features

#### F1.1: Landing Page with Animated Text
**Priority**: High
**User Story**: As a visitor, I want to see an engaging landing page so I'm excited to explore stories.

**Requirements**:
- Animated typewriter effect cycling through words:
  - "Experience **Amazing** Stories"
  - "Experience **Beautiful** Stories"
  - "Experience **Magical** Stories"
- CTA button: "View Story" or "Explore Story"
- Smooth fade-in animations on page load
- Responsive design

**Acceptance Criteria**:
- [ ] Typewriter animation runs smoothly at 60fps
- [ ] Words cycle automatically every 3 seconds
- [ ] CTA button navigates to cover page
- [ ] Page loads in < 1 second
- [ ] Mobile responsive

---

#### F1.2: Story Viewer with Two-Page Spread
**Priority**: Critical
**User Story**: As a reader, I want to see the story like a real book with images and text side by side.

**Requirements**:
- Grid layout: 2 columns on desktop (image left, text right)
- Image side: Full-bleed image with subtle gradient overlay
- Text side: Clean typography with generous padding
- Warm color scheme (amber/orange tones)

**Acceptance Criteria**:
- [ ] Two-page layout displays correctly
- [ ] Image is on LEFT side
- [ ] Text is on RIGHT side
- [ ] Layout matches Gemini screenshots
- [ ] Typography is readable and beautiful

---

#### F1.3: 3D Page Flip Animation
**Priority**: High
**User Story**: As a reader, I want smooth page transitions that feel like turning a real book.

**Requirements**:
- 3D rotateY transform animation
- 0.6 second duration
- easeInOut timing function
- Both pages animate simultaneously
- Framer Motion (motion) library

**Acceptance Criteria**:
- [ ] Animation runs at 60fps
- [ ] No jank or stuttering
- [ ] Smooth on all devices
- [ ] Direction correct for new layout (image left, text right)

---

#### F1.4: Fixed-Dimension Book Container **[CRITICAL]**
**Priority**: Critical
**User Story**: As a reader, I want navigation buttons to stay in the same place so I don't have to hunt for them.

**Requirements**:
- Book container has fixed width and height
- Example: `max-w-6xl w-full h-[700px]`
- Images use `object-cover` to fit within bounds
- Container NEVER resizes based on image dimensions
- Navigation buttons positioned absolutely at bottom

**Acceptance Criteria**:
- [ ] Container dimensions are fixed
- [ ] Images with different aspect ratios don't change container size
- [ ] Navigation buttons stay in exact same position
- [ ] Works with portrait and landscape images
- [ ] No layout shift when pages change

---

#### F1.5: Navigation Controls (Prev/Next)
**Priority**: High
**User Story**: As a reader, I want intuitive buttons to navigate through the story.

**Requirements**:
- Previous and Next buttons
- Rounded pill shape with icons
- Hover effects (scale, shadow)
- Disabled state at boundaries
- Absolutely positioned at bottom of book
- Keyboard support (arrow keys)

**Acceptance Criteria**:
- [ ] Previous button goes to prior page
- [ ] Next button advances page
- [ ] Buttons disabled at first/last page
- [ ] Hover animations work
- [ ] Arrow keys work (left/right)
- [ ] Buttons never move position

---

#### F1.6: Page Indicator Dots
**Priority**: Medium
**User Story**: As a reader, I want to see my progress through the story.

**Requirements**:
- Dot for each page
- Current page highlighted (wider, brighter)
- Smooth transitions
- Centered below book
- Staggered animation on load

**Acceptance Criteria**:
- [ ] Correct number of dots (10 for demo story)
- [ ] Current page clearly indicated
- [ ] Smooth transitions between pages
- [ ] Visible but not distracting

---

#### F1.7: Cover Page View
**Priority**: High
**User Story**: As a reader, I want to see a beautiful cover before starting the story.

**Requirements**:
- Single page layout (not two-page spread)
- Cover image centered and prominent
- Title overlay or positioned elegantly
- Author name displayed
- "Start Reading" button
- Smooth transition to first page

**Acceptance Criteria**:
- [ ] Cover displays beautifully
- [ ] Title and author clearly visible
- [ ] Start Reading button works
- [ ] Transitions smoothly to page 1
- [ ] Matches reference screenshot #1

---

#### F1.8: Text-to-Speech (Web Speech API)
**Priority**: Medium
**User Story**: As a reader, I want to listen to the story being read aloud.

**Requirements**:
- "Listen" button in viewer (top-right corner)
- Dropdown menu with options:
  - Higher pitched voice
  - Lower pitched voice
  - Start from beginning
- Play/pause controls
- Uses browser's Web Speech API (window.speechSynthesis)
- Reads current page text

**Acceptance Criteria**:
- [ ] Listen button visible and accessible
- [ ] Reads current page text accurately
- [ ] Voice pitch can be changed
- [ ] "Start from beginning" works
- [ ] Works in Chrome, Safari, Edge
- [ ] Graceful fallback if unsupported

---

#### F1.9: Share Button (Copy URL)
**Priority**: Medium
**User Story**: As a reader, I want to easily share this story with friends.

**Requirements**:
- Share button (share icon from lucide-react)
- Copies current URL to clipboard
- Toast notification: "Link copied!"
- Uses shadcn/ui Toast component
- Positioned in viewer toolbar

**Acceptance Criteria**:
- [ ] Share button visible
- [ ] Clicking copies URL successfully
- [ ] Toast appears with success message
- [ ] Works on all modern browsers
- [ ] Handles clipboard permissions

---

#### F1.10: Load Story from public/stories/
**Priority**: Critical
**User Story**: As a developer, I want stories loaded from a consistent file structure.

**Requirements**:
- Story loader utility (`src/utils/storyLoader.ts`)
- Loads from `public/stories/<story-id>/`
- Fetches `meta.json` for metadata
- Loads `text_1.txt` through `text_N.txt`
- Loads `image_1.png` through `image_N.png`
- Loads `cover.png`
- Returns formatted Story object

#### F1.11: Responsive Design (Mobile-Friendly)
**Priority**: High
**User Story**: As a mobile reader, I want the story to look great on my phone.

**Requirements**:
- **Desktop (≥1024px)**: Full two-page spread
- **Tablet (768px-1023px)**: Single page view, swipe gestures
- **Mobile (<768px)**: Single page, vertical layout, touch-friendly
- All text remains readable
- Images scale appropriately
- Navigation accessible on all sizes

**Acceptance Criteria**:
- [ ] Works on desktop (1920x1080, 1366x768)
- [ ] Works on tablet (iPad 768x1024)
- [ ] Works on mobile (iPhone 375x667, Android various)
- [ ] Touch gestures work (swipe left/right)
- [ ] Text is readable without zooming
- [ ] Fixed button positioning maintained

---
### 2.4 Technical Requirements

**Framework & Tools**:
- React 18.3.1
- Vite 6.3.5
- TypeScript
- Tailwind CSS
- Framer Motion (as "motion")
- shadcn/ui component library
- lucide-react icons

**Browser Support**:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Performance Targets**:
- Initial page load: < 2 seconds
- Page flip animation: 60fps (16.67ms per frame)
- Time to Interactive (TTI): < 3 seconds
- Lighthouse Performance Score: > 90

**Accessibility**:
- Keyboard navigation (arrow keys, tab, enter)
- Semantic HTML
- ARIA labels where needed
- Color contrast ratio: 4.5:1 minimum

---

### 2.5 Deployment

**Hosting**: AWS Amplify (static hosting)
**Build Command**: `npm run build`
**Output Directory**: `dist/`
**Environment**: Production

**Deployment Steps**:
1. Build production bundle
2. Initialize Amplify CLI: `amplify init`
3. Add hosting: `amplify add hosting`
4. Publish: `amplify publish`
5. Verify deployed URL

---

## 3. Phase 2: Upload & Create

### 3.1 Overview
**Goal**: Allow users to create custom storybooks
**Timeline**: After Phase 1 completion
**Deliverable**: Story creation and management interface with local storage

### 3.2 Features Summary

#### F2.1: Upload Flow UI
Create intuitive upload interface with steps:
1. Upload images
2. Add text
3. Preview
4. Publish

#### F2.2: Multiple Image Upload (Drag & Drop)
- Drag and drop zone
- Support for multiple files
- Image preview thumbnails
- Reorder images
- File validation (size, type)

#### F2.3: Text Input (Plain Text File)
- Upload .txt files
- Automatic page break detection (e.g., `---` delimiter)
- Text preview

#### F2.4: Text Input (Manual Entry)
- Page-by-page text editor
- Rich text formatting (optional)
- Character/word count
- Auto-save

#### F2.5: PDF Text Extraction
- Upload PDF file
- Extract text using pdf.js library
- Page mapping
- Text preview and edit

#### F2.6: Auto-Generate Cover Page
- Use first image as cover
- Add title and author overlay
- Canvas API for image manipulation
- Download cover option

#### F2.7: Story Preview
- Preview full story before saving
- Navigate through pages
- Edit if needed
- Confirm and save

#### F2.8: Browser localStorage
- Save stories locally
- Persist across sessions
- Storage quota management
- Clear storage option

#### F2.9: Story Gallery
- Grid view of created stories
- Cover thumbnails
- Story metadata (title, author, date)
- Sort and filter options

#### F2.10: Edit Existing Stories
- Load story from storage
- Modify text and images
- Save changes
- Version history (optional)

#### F2.11: Delete Stories
- Delete story from storage
- Confirmation dialog
- Undo option (optional)

### 3.3 Technical Requirements
- File upload handling
- pdf.js for PDF parsing
- localStorage API (5-10MB limit)
- Canvas API for image processing
- IndexedDB for larger files (if needed)

---

## 4. Phase 3: AWS Backend & Sharing

### 4.1 Overview
**Goal**: Full production app with cloud storage and sharing
**Timeline**: After Phase 2 completion
**Deliverable**: Scalable app with user accounts, cloud storage, and social sharing

### 4.2 Features Summary

#### F3.1: User Authentication (Cognito)
- AWS Cognito integration
- Google OAuth
- GitHub OAuth
- Email/password signup
- Password reset flow

#### F3.2: Upload Images to S3
- Direct upload to S3
- Pre-signed URLs
- Image optimization
- CDN integration

#### F3.3: Store Metadata in DynamoDB
- User table
- Story table
- Story_Page table
- Indexes for queries

#### F3.4: Shareable Public Links
- Unique story URLs
- Short URL generation
- Analytics tracking
- Expiration options

#### F3.5: Public Story Gallery
- Browse all public stories
- Search functionality
- Filtering (genre, author, date)
- Pagination

#### F3.6: Social Media Sharing
- Share to LinkedIn
- Share to Facebook
- Share to X (Twitter)
- Share to Reddit
- Open Graph meta tags

#### F3.7: AWS Polly Integration
- Premium text-to-speech
- Multiple voice options
- Language support
- Pronunciation controls

#### F3.8: CloudFront CDN
- Fast global content delivery
- Image optimization
- Caching strategy
- Edge locations

#### F3.9: Analytics
- Story view counts
- Share tracking
- User engagement metrics
- Heatmaps (optional)

#### F3.10: User Dashboard
- Manage all user stories
- Analytics dashboard
- Account settings
- Billing (future)

#### F3.11: Story Privacy Settings
- Public: visible to everyone
- Unlisted: only with link
- Private: only owner can see

### 4.3 Technical Requirements

**AWS Services**:
- S3: Image/file storage
- DynamoDB: Metadata storage
- Lambda: Serverless backend functions
- API Gateway: REST API
- Cognito: Authentication
- CloudFront: CDN
- Polly: Text-to-speech
- CloudWatch: Monitoring

**Backend Stack**:
- Node.js runtime
- AWS SDK for JavaScript v3
- Serverless Framework or SAM
- API Gateway + Lambda integration

**Security**:
- Input sanitization
- XSS prevention
- CSRF protection
- SQL injection prevention (N/A - using DynamoDB)
- Rate limiting
- File upload validation

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Page load time: < 2 seconds
- Time to Interactive: < 3 seconds
- Animation frame rate: 60fps
- API response time: < 500ms
- Image optimization: WebP format

### 5.2 Scalability
- Support 10,000 concurrent users
- Handle 1M stories
- 99.9% uptime SLA
- Auto-scaling enabled

### 5.3 Security
- HTTPS only
- Secure authentication
- Data encryption at rest and in transit
- Regular security audits
- GDPR compliance

### 5.4 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus indicators

### 5.5 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

---

## 6. Out of Scope (v1)

The following features are explicitly out of scope for v1:

- Multi-language support (i18n)
- Video/audio in stories
- Collaborative editing (real-time)
- Story templates marketplace
- AI-generated images or text
- Monetization/payments
- Mobile native apps
- Comments/reactions
- Story remix/forking
- Advanced analytics (beyond basic metrics)

These may be considered for future versions based on user feedback and business needs.

---

## 7. Success Criteria

### Phase 1 Complete When:
- [ ] All 11 Phase 1 features implemented and tested
- [ ] Deployed to AWS Amplify with public URL
- [ ] Demo story fully functional
- [ ] No critical bugs
- [ ] Performance targets met
- [ ] Responsive on all target devices
- [ ] User testing feedback incorporated

### Phase 2 Complete When:
- [ ] Users can upload and create stories
- [ ] Stories saved in localStorage
- [ ] Gallery view working
- [ ] Edit/delete functionality working
- [ ] User testing shows 70%+ completion rate

### Phase 3 Complete When:
- [ ] AWS backend fully operational
- [ ] User authentication working
- [ ] Stories stored in cloud
- [ ] Sharing functionality complete
- [ ] Analytics tracking active
- [ ] Production monitoring set up

---

## 8. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Browser compatibility issues | High | Medium | Extensive testing, polyfills |
| Performance on mobile | High | Medium | Optimization, lazy loading |
| Image loading slow | Medium | High | Image optimization, CDN |
| localStorage quota exceeded | Medium | Medium | IndexedDB fallback |
| AWS costs higher than expected | Medium | Low | Cost monitoring, budget alerts |
| TTS not supported in browser | Low | Low | Graceful degradation |

---

## 9. Timeline & Milestones

### Phase 1: 2-3 weeks
- Week 1: Core viewer, animations, story loading
- Week 2: Landing page, TTS, share, responsive
- Week 3: Testing, polish, deployment

### Phase 2: 2-3 weeks
- Week 1: Upload UI, file handling
- Week 2: localStorage, gallery, edit/delete
- Week 3: Testing, refinement

### Phase 3: 3-4 weeks
- Week 1: AWS setup, authentication
- Week 2: S3/DynamoDB integration
- Week 3: Sharing, analytics
- Week 4: Testing, production launch

**Total Estimated Time**: 7-10 weeks

---

## 10. Appendix

### Demo Story Details
See plan file for complete story breakdown:
- 10 pages of "The Last Time I Saw Her"
- Full text provided
- User will provide 11 images (cover + 10 pages)

### Reference Screenshots
1. Cover page (screenshot #1)
2. Two-page spread (screenshot #2)
3. Listen dropdown (screenshot #3)
4. Share dialog (screenshot #4)

### Related Documents
- IMPLEMENTATION_PLAN.md
- features.json
- claude-progress.txt
- .claude/guidelines.md

---

**Document Control**:
- Created: 2025-12-10
- Last Updated: 2025-12-10
- Next Review: After Phase 1 completion
- Owner: Development Team
