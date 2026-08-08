import React, { useState } from 'react';
import { generateSrcSet, getFallbackScreenshot, ensureLiveScreenshotDelay } from '../utils/screenshot';

export interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackCategory?: 'Web' | 'Android' | 'Full Stack' | string;
  fallbackTitle?: string;
  fallbackTechStack?: string[];
  type?: 'card' | 'modal' | 'thumb' | 'full';
  fitMode?: 'contain' | 'cover';
  containerClassName?: string;
  eager?: boolean;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  fallbackCategory,
  fallbackTitle,
  fallbackTechStack,
  type = 'card',
  fitMode = 'cover',
  containerClassName = '',
  className = '',
  eager = false,
  sizes: customSizes,
  onError,
  onLoad,
  ...restProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => ensureLiveScreenshotDelay(src, 4));
  const [hasError, setHasError] = useState(false);

  // Sync state if src prop changes
  React.useEffect(() => {
    setImgSrc(ensureLiveScreenshotDelay(src, 4));
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  // Determine optimal sizes attribute based on context type
  let defaultSizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  if (type === 'modal') {
    defaultSizes = '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px';
  } else if (type === 'thumb') {
    defaultSizes = '(max-width: 640px) 25vw, 120px';
  } else if (type === 'full') {
    defaultSizes = '100vw';
  }

  const sizes = customSizes || defaultSizes;
  const srcSet = generateSrcSet(imgSrc);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      // Try Microlink with 4s delay if thum.io fails
      if (imgSrc.includes('image.thum.io')) {
        const urlMatch = imgSrc.match(/https?:\/\/(?!image\.thum\.io)[^\s]+/);
        if (urlMatch) {
          const targetUrl = urlMatch[0];
          const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}&screenshot=true&embed=screenshot.url&waitForTimeout=4000&force=true`;
          setImgSrc(microlinkUrl);
          return;
        }
      }
      const fallback = getFallbackScreenshot(fallbackCategory, fallbackTitle, fallbackTechStack);
      setImgSrc(fallback);
    } else {
      const fallback = getFallbackScreenshot(fallbackCategory, fallbackTitle, fallbackTechStack);
      setImgSrc(fallback);
    }
    if (onError) onError(e);
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const fitClass = fitMode === 'contain' ? 'object-contain p-1 bg-stone-950' : 'object-cover';

  return (
    <div className={`relative overflow-hidden bg-stone-900/80 ${containerClassName}`}>
      {/* Loading Skeleton Placeholder to prevent Layout Shift */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 animate-pulse z-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
        </div>
      )}

      {/* Main Responsive Image */}
      <img
        src={imgSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        data-status={isLoaded ? 'loaded' : 'loading'}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full transition-opacity duration-500 ${fitClass} ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...restProps}
      />
    </div>
  );
};
