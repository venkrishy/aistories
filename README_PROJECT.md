Technology Stack

  - Frontend: React with Vite, TypeScript
  - UI Components: Custom UI component library (shadcn-style components)
  - Deployment: Cloudflare Pages via GitHub Actions
  - Storage: Cloudflare R2 for assets
  - CDN: cdn.aistories.online subdomain

  Project Structure

  - Components: Landing page, story grid, story book reader, hero section
  - Stories: Stored in /stories/ directory with JSON metadata
  - Services: Story loader service for fetching and processing stories
  - Tests: Playwright tests for carousel and landing page
  - Scripts: Deployment automation and R2 upload utilities

  Key Features

  - Story browsing and reading interface
  - Responsive design with UI component library
  - Automated deployment pipeline
  - CDN asset delivery with cache purging
  - Story metadata and content management

  Development

  - Run npm i to install dependencies
  - Run npm run dev for local development
  - GitHub Actions handles CI/CD to Cloudflare