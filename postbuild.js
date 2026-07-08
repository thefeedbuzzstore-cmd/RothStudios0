import fs from 'fs';
import path from 'path';

// Support multiple possible names for the production URL
const SITE_URL = process.env.VITE_SITE_URL || process.env.APP_URL || process.env.SITE_URL;

if (SITE_URL) {
  // Normalize SITE_URL to remove trailing slash
  const normalizedUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
  
  const filesToUpdate = [
    path.join('dist', 'sitemap.xml'),
    path.join('dist', 'robots.txt')
  ];

  console.log(`[postbuild] Starting sitemap/robots.txt domain update... Target: ${normalizedUrl}`);

  let updatedCount = 0;
  for (const file of filesToUpdate) {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Replace the hardcoded preview domain with the dynamic environment variable value
      const updatedContent = content.replace(/https:\/\/ais-pre-av6tbs67kfpt7lqmpofhq2-780663003234\.europe-west2\.run.app/g, normalizedUrl);
      
      fs.writeFileSync(file, updatedContent, 'utf8');
      console.log(`[postbuild] Successfully updated domains in ${file}`);
      updatedCount++;
    } else {
      console.log(`[postbuild] File not found: ${file}`);
    }
  }
} else {
  console.log('[postbuild] No VITE_SITE_URL, APP_URL, or SITE_URL environment variable found. Keeping default sitemap domain.');
}
