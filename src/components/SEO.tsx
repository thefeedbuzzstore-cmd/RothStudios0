/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string; // Relative path, e.g. "/movie/john-wick"
  ogType?: 'website' | 'video.movie' | 'video.tv_show';
  ogImage?: string;
  schemas?: any[]; // Array of structured JSON-LD data
  noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalPath = '',
  ogType = 'website',
  ogImage,
  schemas = [],
  noindex = false
}) => {
  useEffect(() => {
    // 1. Dynamic Page Title
    document.title = title;

    // Helper to safely set or update a meta tag by name
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Generate Unique Meta Descriptions
    setMetaTag('name', 'description', description);

    // 3. Add Robots Meta (Index / Noindex for Admin Pages)
    if (noindex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      setMetaTag('name', 'robots', 'index, follow');
    }

    // 4. Open Graph Metadata
    const currentOrigin = window.location.origin;
    const currentUrl = `${currentOrigin}${canonicalPath}`;
    
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', currentUrl);
    
    const defaultOgImage = `${currentOrigin}/og-default.jpg`;
    setMetaTag('property', 'og:image', ogImage || defaultOgImage);
    setMetaTag('property', 'og:site_name', 'RothStudios');

    // 5. Twitter Card Metadata
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage || defaultOgImage);

    // 6. Add Canonical URLs
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // 7. Dynamic JSON-LD Structured Data
    // Remove existing schema scripts managed by this component
    const existingScripts = document.querySelectorAll('script[data-seo-schema="true"]');
    existingScripts.forEach(script => script.remove());

    // Inject new scripts
    schemas.forEach((schema, index) => {
      if (!schema) return;
      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo-schema', 'true');
      script.setAttribute('id', `ld-json-schema-${index}`);
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    // Cleanup on unmount
    return () => {
      const cleanupScripts = document.querySelectorAll('script[data-seo-schema="true"]');
      cleanupScripts.forEach(script => script.remove());
    };
  }, [title, description, canonicalPath, ogType, ogImage, schemas, noindex]);

  return null; // Side-effect only component
};
