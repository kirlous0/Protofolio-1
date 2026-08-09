import React, { useEffect } from 'react';
import { Project, PersonalInfo } from '../types';

interface SEOHeadProps {
  personalInfo: PersonalInfo;
  activeSection: string;
  selectedProject?: Project | null;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  personalInfo,
  activeSection,
  selectedProject,
}) => {
  useEffect(() => {
    // Determine dynamic title and description
    let pageTitle = `${personalInfo.name || 'Kirlous Wael'} — ${personalInfo.title || 'Full Stack & Android Developer'}`;
    let pageDescription = personalInfo.aboutBio || 'Full Stack & Native Android Mobile Engineer crafting high-performance web applications, Kotlin apps, and AI platforms.';
    let pageImage = personalInfo.avatarUrl || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80';

    if (selectedProject) {
      pageTitle = `${selectedProject.title} | Portfolio Project by ${personalInfo.name || 'Kirlous Wael'}`;
      pageDescription = selectedProject.description || pageDescription;
      pageImage = selectedProject.imageUrl || selectedProject.images?.[0] || pageImage;
    } else if (activeSection && activeSection !== 'hero') {
      const formattedSection = activeSection.charAt(0).toUpperCase() + activeSection.slice(1);
      pageTitle = `${formattedSection} — ${personalInfo.name || 'Kirlous Wael'} Portfolio`;
    }

    // Update document.title
    document.title = pageTitle;

    // Helper to create or set meta tag
    const setMetaTag = (selector: string, attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Description
    setMetaTag('meta[name="description"]', 'name', 'description', pageDescription);

    // OpenGraph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', pageTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', pageDescription);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', pageImage);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', selectedProject ? 'article' : 'website');
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', window.location.href);

    // Twitter Card Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', pageTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', pageDescription);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', pageImage);

  }, [personalInfo, activeSection, selectedProject]);

  return null;
};
