import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API endpoints (if any) go here first
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Dynamic Sitemap.xml route supporting custom domains
  app.get('/sitemap.xml', (req, res) => {
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      const content = fs.readFileSync(sitemapPath, 'utf8');
      const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
      const host = req.get('host') || 'ais-pre-av6tbs67kfpt7lqmpofhq2-780663003234.europe-west2.run.app';
      const dynamicOrigin = `${proto}://${host}`;

      const updatedContent = content.replace(
        /https:\/\/ais-pre-av6tbs67kfpt7lqmpofhq2-780663003234\.europe-west2\.run.app/g,
        dynamicOrigin
      );

      res.header('Content-Type', 'application/xml');
      res.send(updatedContent);
    } else {
      res.status(404).send('Sitemap not found');
    }
  });

  // Dynamic Robots.txt route supporting custom domains
  app.get('/robots.txt', (req, res) => {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    if (fs.existsSync(robotsPath)) {
      const content = fs.readFileSync(robotsPath, 'utf8');
      const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
      const host = req.get('host') || 'ais-pre-av6tbs67kfpt7lqmpofhq2-780663003234.europe-west2.run.app';
      const dynamicOrigin = `${proto}://${host}`;

      let updatedContent = content.replace(
        /https:\/\/ais-pre-av6tbs67kfpt7lqmpofhq2-780663003234\.europe-west2\.run.app/g,
        dynamicOrigin
      );
      updatedContent = updatedContent.replace(
        /Host: ais-pre-av6tbs67kfpt7lqmpofhq2-780663003234\.europe-west2\.run.app/g,
        `Host: ${host}`
      );

      res.header('Content-Type', 'text/plain');
      res.send(updatedContent);
    } else {
      res.status(404).send('Robots.txt not found');
    }
  });

  // Vite middleware for development fallback routing
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
