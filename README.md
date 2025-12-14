# AIStories.online
  This is a web application for sharing stories generated using AI tools like Gemini StoryBook among others.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  

# Github
  Github URL: https://github.com/venkrishy/aistories

# Github Actions 
  This app is deployed to Cloudflare using Github Actions.  
  The environment variables needed for this deployment must be set in Github (Settings -> General -> Secrets and Variables -> Actions.  
  Secrets Needed in Github Settings:
  - CLOUDFLARE_ACCOUNT_ID
  - CLOUDFLARE_PAGES_API_TOKEN
  - CLOUDFLARE_ZONE_ID (purges cache to prevent stale assets.  Review the scripts/deploy_frontend/deploy_app_to_cloudflare.sh)

# Cloudflare
  The following features of cloudflare are used: 
  - R2
  - Zone (subdomains cdn.aistories.online)
  - Pages 

# Scripts
  - scripts/deploy_frontend/deploy_app_to_cloudflare.sh
  - scripts/cloudflare/upload-to-r2.js

# DEV CONTAINERS
  Running in a container is very advantageous.  I use the Microsoft approved Playwright Docker container which allows me to execute tests within the container, otherwise you will run into chrome problems.
  To get claude to work, you will need to run "claude mcp add playwright npx '@playwright/mcp@latest'" comment.
  To be able to access the cdn.aistories.online, i had to fix the .devcontainers/init-firewall script adding this url to the firewall.

# Instructions for claude.

