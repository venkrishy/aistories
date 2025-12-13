#!/usr/bin/env node
/*
These need to be set in the .env.local file

CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-public-url.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key

*/


import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from project root
dotenv.config({ path: join(__dirname, '..', '..', '.env.local') });

// Configuration
const config = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  bucketName: process.env.R2_BUCKET_NAME,
  publicUrl: process.env.R2_PUBLIC_URL,
};

// Validate configuration
function validateConfig() {
  const missing = [];
  if (!config.accountId) missing.push('CLOUDFLARE_ACCOUNT_ID');
  if (!config.accessKeyId) missing.push('CLOUDFLARE_R2_ACCESS_KEY_ID');
  if (!config.secretAccessKey) missing.push('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
  if (!config.bucketName) missing.push('R2_BUCKET_NAME');
  if (!config.publicUrl) missing.push('R2_PUBLIC_URL');

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease create .env.local with all required variables.');
    process.exit(1);
  }
}

// Initialize S3 client (R2 is S3-compatible)
function createR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

// Check if file exists in R2
async function fileExistsInR2(client, key) {
  try {
    await client.send(new HeadObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    }));
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

// Upload file to R2
async function uploadToR2(client, filePath, key) {
  const fileContent = readFileSync(filePath);
  const contentType = key.endsWith('.webp') ? 'image/webp' :
                      key.endsWith('.jpg') || key.endsWith('.jpeg') ? 'image/jpeg' :
                      key.endsWith('.png') ? 'image/png' :
                      'application/octet-stream';

  await client.send(new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
  }));
}

// Get all image files from a directory
function getImageFiles(dir, extensions = ['.webp', '.jpg', '.jpeg', '.png']) {
  const files = [];
  try {
    const items = readdirSync(dir);
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      if (stat.isFile() && extensions.some(ext => item.toLowerCase().endsWith(ext))) {
        files.push({ name: item, path: fullPath });
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  return files;
}

// Get all story directories
function getStoryDirectories(storiesDir) {
  const stories = [];
  try {
    const items = readdirSync(storiesDir);
    for (const item of items) {
      const fullPath = join(storiesDir, item);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        // Check if has story.json or images
        const hasJson = readdirSync(fullPath).some(f => f.endsWith('.json'));
        const hasImages = getImageFiles(fullPath).length > 0;
        if (hasJson || hasImages) {
          stories.push({ slug: item, path: fullPath });
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error reading stories directory: ${error.message}`);
    process.exit(1);
  }
  return stories;
}

// Update story.json with R2 URLs
function updateStoryJson(storyDir, slug) {
  const jsonFiles = readdirSync(storyDir).filter(f => f.endsWith('.json'));
  if (jsonFiles.length === 0) {
    console.log(`   ⚠️  No story.json found in ${slug}, skipping...`);
    return false;
  }

  const jsonFile = join(storyDir, jsonFiles[0]);
  const backupFile = `${jsonFile}.backup`;

  try {
    const content = readFileSync(jsonFile, 'utf8');
    const story = JSON.parse(content);

    // Create backup
    writeFileSync(backupFile, content, 'utf8');

    // Update coverImage if exists
    if (story.coverImage && !story.coverImage.startsWith('http')) {
      story.coverImage = `${config.publicUrl}/${slug}/${story.coverImage}`;
    }

    // Update page images
    if (story.pages && Array.isArray(story.pages)) {
      story.pages = story.pages.map(page => {
        if (page.image && !page.image.startsWith('http')) {
          return {
            ...page,
            image: `${config.publicUrl}/${slug}/${page.image}`,
          };
        }
        return page;
      });
    }

    // Write updated JSON
    writeFileSync(jsonFile, JSON.stringify(story, null, 2), 'utf8');
    console.log(`   ✓ Updated ${jsonFiles[0]}`);
    console.log(`   ✓ Backup saved: ${backupFile}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error updating ${jsonFiles[0]}: ${error.message}`);
    return false;
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {
    force: false,
    story: null,
  };

  for (const arg of args) {
    if (arg === '--force') {
      flags.force = true;
    } else if (arg.startsWith('--story=')) {
      flags.story = arg.split('=')[1];
    }
  }

  return flags;
}

// Main function
async function main() {
  console.log('🚀 R2 Upload Script');
  console.log('==================\n');

  validateConfig();
  const flags = parseArgs();

  console.log('📋 Configuration:');
  console.log(`   Bucket: ${config.bucketName}`);
  console.log(`   Public URL: ${config.publicUrl}`);
  console.log(`   Account ID: ${config.accountId}`);
  if (flags.force) console.log('   Mode: FORCE (re-upload all)');
  if (flags.story) console.log(`   Story filter: ${flags.story}`);
  console.log();

  // Initialize R2 client
  const client = createR2Client();

  // Get project root and stories directory
  const projectRoot = join(__dirname, '..', '..');
  const storiesDir = join(projectRoot, 'scripts', 'stories');

  // Get story directories
  let stories = getStoryDirectories(storiesDir);

  if (flags.story) {
    stories = stories.filter(s => s.slug === flags.story);
    if (stories.length === 0) {
      console.error(`❌ Story "${flags.story}" not found`);
      process.exit(1);
    }
  }

  console.log(`📂 Found ${stories.length} story director${stories.length === 1 ? 'y' : 'ies'}\n`);

  let totalImages = 0;
  let uploadedCount = 0;
  let skippedCount = 0;
  let updatedJsonCount = 0;

  // Process each story
  for (const story of stories) {
    console.log(`📖 Processing: ${story.slug}`);

    const images = getImageFiles(story.path);
    totalImages += images.length;

    if (images.length === 0) {
      console.log('   ⚠️  No images found, skipping...\n');
      continue;
    }

    console.log(`   Found ${images.length} image${images.length === 1 ? '' : 's'}`);

    // Upload each image
    for (const image of images) {
      const key = `${story.slug}/${image.name}`;

      try {
        // Check if exists (unless force mode)
        if (!flags.force && await fileExistsInR2(client, key)) {
          console.log(`   ⏭  ${key} (already exists, skipping)`);
          skippedCount++;
        } else {
          await uploadToR2(client, image.path, key);
          console.log(`   ↑  ${key} (uploaded)`);
          uploadedCount++;
        }
      } catch (error) {
        console.error(`   ❌ Failed to upload ${key}: ${error.message}`);
      }
    }

    // Update story.json
    if (updateStoryJson(story.path, story.slug)) {
      updatedJsonCount++;
    }

    console.log();
  }

  // Summary
  console.log('✅ Upload Complete!');
  console.log('==================');
  console.log(`   Total images: ${totalImages}`);
  console.log(`   Uploaded: ${uploadedCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log(`   JSON files updated: ${updatedJsonCount}`);
  console.log();
  console.log(`🌐 Images are now available at: ${config.publicUrl}/{slug}/{image}`);
}

// Run main function
main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  if (error.stack) {
    console.error('\nStack trace:');
    console.error(error.stack);
  }
  process.exit(1);
});
