/**
 * Auto-generates high-definition, domain-specific UI screenshots
 * and live website previews from Vercel deployments and web platforms.
 */

/**
 * Generates a responsive srcSet string for Unsplash URLs
 */
export function generateSrcSet(url: string, widths: number[] = [400, 800, 1200, 1600]): string | undefined {
  if (!url || typeof url !== 'string') return undefined;

  if (url.includes('images.unsplash.com')) {
    try {
      return widths
        .map((w) => {
          const urlObj = new URL(url);
          urlObj.searchParams.set('w', w.toString());
          if (!urlObj.searchParams.has('q')) urlObj.searchParams.set('q', '80');
          if (!urlObj.searchParams.has('auto')) urlObj.searchParams.set('auto', 'format');
          return `${urlObj.toString()} ${w}w`;
        })
        .join(', ');
    } catch {
      return widths.map((w) => `${url.replace(/w=\d+/, `w=${w}`)} ${w}w`).join(', ');
    }
  }

  return undefined;
}

/**
 * Auto-generates multiple live website screenshots from deployment URLs or project images.
 */
export function getProjectScreenshots(options: {
  liveUrl?: string;
  githubUrl?: string;
  category?: 'Web' | 'Android' | 'Full Stack';
  title?: string;
  techStack?: string[];
  imageUrl?: string;
  existingImages?: string[];
}): string[] {
  const { liveUrl, imageUrl, existingImages } = options;
  const list: string[] = [];

  // 1. Primary custom imageUrl or screenshot
  if (imageUrl && imageUrl.trim()) {
    if (!list.includes(imageUrl.trim())) {
      list.push(imageUrl.trim());
    }
  }

  // 2. Preserve existing array of user/project images
  if (Array.isArray(existingImages)) {
    existingImages.forEach((img) => {
      if (img && img.trim() && !list.includes(img.trim())) {
        list.push(img.trim());
      }
    });
  }

  // 3. Live Deployment Screenshot from liveUrl
  if (liveUrl && liveUrl.trim()) {
    let cleanUrl = liveUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const thumLive = `https://image.thum.io/get/width/1200/crop/800/wait/4/refresh/${cleanUrl}`;
    if (!list.includes(thumLive)) {
      list.push(thumLive);
    }
  }

  return list;
}

/**
 * Auto-generates a fast, high-definition website screenshot URL.
 */
export function getWebsiteScreenshotUrl(options: {
  liveUrl?: string;
  imageUrl?: string;
  githubUrl?: string;
  category?: 'Web' | 'Android' | 'Full Stack' | string;
  title?: string;
  techStack?: string[];
}): string {
  const { liveUrl, imageUrl } = options;
  if (imageUrl && imageUrl.trim()) {
    return imageUrl.trim();
  }
  if (liveUrl && liveUrl.trim()) {
    let cleanUrl = liveUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    return `https://image.thum.io/get/width/1200/crop/800/wait/4/refresh/${cleanUrl}`;
  }
  return '';
}


