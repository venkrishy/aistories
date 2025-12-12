import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import LandingPage from './pages/LandingPage';
import StoryReaderPage from './pages/StoryReaderPage';

// Root route component
const RootComponent = () => {
  return <Outlet />;
};

// Create root route
const rootRoute = createRootRoute({
  component: RootComponent,
});

// Create index route (landing page)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

// Create story route with slug parameter
const storyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/story/$slug',
  component: StoryReaderPage,
});

// Create route tree
const routeTree = rootRoute.addChildren([indexRoute, storyRoute]);

// Create and export router
export const router = createRouter({ routeTree });

// Register router type for TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
