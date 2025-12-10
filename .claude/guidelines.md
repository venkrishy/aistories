# Development Guidelines
## Visual Storytelling UI

These guidelines ensure consistent, high-quality development across sessions.

---

## General Principles

### 1. Code Quality
- Write clean, readable code
- Follow established patterns in codebase
- Keep functions small and focused
- Use meaningful variable names
- Add comments for complex logic only

### 2. Component Structure
- One component per file
- Co-locate related components in same directory
- Use TypeScript interfaces for props
- Keep components small (< 250 lines)
- Extract reusable logic into hooks

### 3. File Organization
```
src/
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── LandingPage.tsx
│   ├── StoryBook.tsx
│   └── TextToSpeech.tsx
├── hooks/           # Custom React hooks
│   └── useTypewriter.ts
├── utils/           # Utility functions
│   └── storyLoader.ts
├── styles/          # Global styles
│   └── globals.css
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

### 4. Naming Conventions
- **Components**: PascalCase (`StoryBook.tsx`)
- **Hooks**: camelCase with `use` prefix (`useTypewriter.ts`)
- **Utils**: camelCase (`storyLoader.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_PAGES`)
- **Interfaces**: PascalCase with `I` prefix optional (`Story` or `IStory`)

---

## React Best Practices

### Hooks
```typescript
// ✅ Good: Hooks at top level
function Component() {
  const [state, setState] = useState(0);
  const data = useCustomHook();

  // ... component logic
}

// ❌ Bad: Conditional hooks
function Component() {
  if (condition) {
    const [state, setState] = useState(0); // Don't do this!
  }
}
```

### State Management
```typescript
// ✅ Good: Colocated state
function StoryViewer() {
  const [currentPage, setCurrentPage] = useState(0);
  const [story, setStory] = useState<Story | null>(null);

  // ... use state locally
}

// For now: No global state management needed
// Future: Consider Zustand or Context for complex state
```

### Performance
```typescript
// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Use useCallback for event handlers passed to children
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

---

## Styling Guidelines

### Tailwind CSS
- Use Tailwind utility classes primarily
- Keep utility classes in order: layout → display → spacing → colors → effects
- Use custom classes sparingly

```tsx
// ✅ Good: Organized utilities
<div className="flex items-center justify-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg shadow-xl">

// ❌ Bad: Random order, hard to read
<div className="rounded-lg shadow-xl from-amber-50 flex to-orange-50 p-4 bg-gradient-to-r items-center justify-center">
```

### Responsive Design
```tsx
// Mobile-first approach
<div className="flex flex-col md:flex-row md:grid-cols-2 lg:gap-8">
  {/* Content */}
</div>
```

### Color Palette
**Primary**: Amber/Orange tones
- `amber-50`, `amber-100`, `amber-600`, `amber-900`
- `orange-50`, `orange-100`, `orange-400`

**Neutral**: Grays
- `gray-50`, `gray-100`, `gray-700`, `gray-900`

**Accent**: Use sparingly
- `blue-500` for links
- `red-500` for errors
- `green-500` for success

---

## Animation Guidelines

### Framer Motion
```typescript
import { motion, AnimatePresence } from 'motion/react';

// ✅ Good: Smooth, purposeful animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>

// Animation principles:
// - Duration: 0.2-0.6s (0.3s is sweet spot)
// - Easing: easeOut for entrances, easeIn for exits
// - Keep it subtle: Don't overdo it
```

### Performance
- Animate transform and opacity only (GPU-accelerated)
- Avoid animating width, height, top, left (causes reflow)
- Use `will-change` sparingly

```tsx
// ✅ Good: GPU-accelerated
<motion.div
  animate={{ x: 100, opacity: 0.5 }}
/>

// ❌ Bad: Causes reflow
<motion.div
  animate={{ width: 100, marginTop: 20 }}
/>
```

---

## TypeScript Guidelines

### Interfaces
```typescript
// ✅ Good: Clear, descriptive interfaces
interface Story {
  meta: StoryMeta;
  cover: string;
  pages: StoryPage[];
}

interface StoryPage {
  pageNumber: number;
  text: string;
  image: string;
}

// Use interfaces for object shapes
// Use types for unions, intersections
type ViewMode = 'landing' | 'cover' | 'story';
```

### Type Safety
```typescript
// ✅ Good: Explicit types
function loadStory(storyId: string): Promise<Story> {
  // Implementation
}

// ❌ Bad: Implicit any
function loadStory(storyId) {
  // TypeScript won't catch errors
}
```

---

## Component Patterns

### Props Interface
```typescript
interface StoryBookProps {
  story: Story;
  currentPage: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export function StoryBook(props: StoryBookProps) {
  // Destructure in function signature for clarity
  const { story, currentPage, onNextPage, onPrevPage, canGoNext, canGoPrev } = props;

  // Or destructure in parameters
}

export function StoryBook({
  story,
  currentPage,
  onNextPage,
  onPrevPage,
  canGoNext,
  canGoPrev,
}: StoryBookProps) {
  // Component logic
}
```

### Event Handlers
```typescript
// ✅ Good: Descriptive names
const handleNextPage = () => {
  if (currentPage < maxPage) {
    setCurrentPage(currentPage + 1);
  }
};

// ❌ Bad: Generic names
const onClick = () => {
  // What does this do?
};
```

---

## Critical Implementation Notes

### Fixed Button Positioning
**This is the #1 priority for the StoryBook component.**

```tsx
// Container must have fixed dimensions
<div className="relative w-full max-w-6xl h-[700px]">
  {/* Book content */}
  <div className="grid md:grid-cols-2 h-full">
    {/* Left: Image */}
    <div className="relative overflow-hidden">
      <img
        src={image}
        className="w-full h-full object-cover"
        // object-cover ensures image fits without changing container size
      />
    </div>

    {/* Right: Text */}
    <div className="p-12 overflow-y-auto">
      {text}
    </div>
  </div>

  {/* Navigation - absolutely positioned */}
  <div className="absolute bottom-0 left-0 right-0 p-6">
    <div className="flex justify-between">
      <button onClick={onPrevPage}>Previous</button>
      <button onClick={onNextPage}>Next</button>
    </div>
  </div>
</div>
```

**Key Points**:
1. Container has fixed height (`h-[700px]`)
2. Images use `object-cover` to fit within container
3. Navigation buttons are absolutely positioned
4. Container never resizes = buttons never move

---

## Testing Checklist

### Before Committing
- [ ] Code runs without errors
- [ ] TypeScript compiles cleanly (no ts-ignore unless necessary)
- [ ] No console errors in browser
- [ ] Component renders correctly
- [ ] Animations are smooth
- [ ] Responsive on different screen sizes
- [ ] Tested in Chrome and at least one other browser

### Feature Testing
- [ ] Happy path works
- [ ] Edge cases handled (empty state, error state)
- [ ] Loading states implemented
- [ ] Error messages are clear and helpful
- [ ] Accessibility: keyboard navigation works
- [ ] Mobile: touch interactions work

---

## Git Workflow

### Commit Messages
Follow conventional commits:

```
feat: add landing page with typewriter animation
fix: correct page flip animation direction
refactor: extract story loader into separate utility
docs: update README with setup instructions
chore: update dependencies
```

**Format**: `<type>: <description>`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructure without behavior change
- `docs`: Documentation only
- `style`: Formatting, whitespace
- `test`: Adding or fixing tests
- `chore`: Maintenance, dependencies

### Commit Frequency
- Commit after each completed feature
- Commit before starting major refactoring
- Commit at end of session

### Branch Strategy (Phase 3)
For now: Work on `main` branch
Future:
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature branches

---

## Performance Optimization

### Image Optimization
- Use WebP format when possible
- Lazy load images not in viewport
- Provide width/height to prevent layout shift

```tsx
<img
  src={image}
  width={600}
  height={800}
  loading="lazy"
  alt="Story illustration"
/>
```

### Code Splitting (Future)
```typescript
// Lazy load components not needed immediately
const AdminPanel = lazy(() => import('./components/AdminPanel'));
```

### Bundle Size
- Keep total bundle < 500KB gzipped
- Analyze with `npm run build` and check dist size
- Use dynamic imports for large libraries

---

## Accessibility (a11y)

### Keyboard Navigation
```tsx
// Ensure focusable elements
<button
  onClick={handleClick}
  className="focus:outline-none focus:ring-2 focus:ring-amber-500"
>
  Click me
</button>

// Support keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNextPage();
    if (e.key === 'ArrowLeft') handlePrevPage();
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleNextPage, handlePrevPage]);
```

### ARIA Labels
```tsx
<button aria-label="Next page" onClick={handleNextPage}>
  <ChevronRight />
</button>
```

### Color Contrast
- Ensure 4.5:1 ratio for normal text
- 3:1 for large text (18pt+)
- Test with browser DevTools or contrast checker

---

## Error Handling

### Try-Catch for Async Operations
```typescript
async function loadStory(storyId: string): Promise<Story> {
  try {
    const response = await fetch(`/stories/${storyId}/meta.json`);

    if (!response.ok) {
      throw new Error(`Failed to load story: ${response.statusText}`);
    }

    const meta = await response.json();
    return meta;

  } catch (error) {
    console.error('Error loading story:', error);
    // Show user-friendly error message
    throw new Error('Unable to load story. Please try again.');
  }
}
```

### User-Facing Errors
```tsx
{error && (
  <div className="p-4 bg-red-50 border border-red-200 rounded">
    <p className="text-red-800">{error}</p>
  </div>
)}
```

---

## Resources

### Documentation
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [shadcn/ui](https://ui.shadcn.com)

### Tools
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind Play](https://play.tailwindcss.com)
- [Can I Use](https://caniuse.com) - Browser compatibility
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## Session Workflow Summary

### Starting a Session
1. `git pull` (if working with others)
2. Read `claude-progress.txt`
3. Review `features.json`
4. `npm run dev`
5. Pick ONE feature to work on

### During Session
1. Implement feature
2. Test thoroughly
3. Update `features.json` status
4. Commit: `git commit -m "feat: [feature-id] description"`
5. Move to next feature

### Ending Session
1. Update `claude-progress.txt` with progress
2. Ensure code is in working state
3. Commit progress: `git commit -m "chore: update progress"`
4. `git push` (if applicable)

---

**Remember**: Quality over speed. One well-tested feature is better than three broken ones.
