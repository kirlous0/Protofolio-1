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
  fetchPriority?: 'high' | 'low' | 'auto';
  aspectRatio?: string;
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
  fetchPriority,
  aspectRatio = 'aspect-video',
  sizes: customSizes,
  onError,
  onLoad,
  ...restProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Sync state if src prop changes & attach fast fallback timer
  React.useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoaded(false);

    // Fast fallback timer: if screenshot service or slow image takes > 2.2s, switch immediately to instant Unsplash HD UI fallback
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted && !isLoaded) {
        if (src.includes('image.thum.io') || src.includes('microlink.io') || !src) {
          const fallback = getFallbackScreenshot(fallbackCategory, fallbackTitle, fallbackTechStack);
          setImgSrc(fallback);
        }
      }
    }, 2200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [src, fallbackCategory, fallbackTitle, fallbackTechStack, isLoaded]);

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
  const effectiveFetchPriority = fetchPriority || (eager ? 'high' : 'auto');

  return (
    <div className={`relative overflow-hidden bg-stone-900/90 ${aspectRatio} ${containerClassName}`}>
      {/* Skeleton Shimmer Overlay & Low-Res Blur Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-stone-900">
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-800/80 to-stone-900 animate-shimmer bg-[length:200%_100%]" />
          <div className="relative z-20 flex flex-col items-center gap-2">
            <div className="w-7 h-7 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
            <span className="text-[10px] font-mono text-amber-500/70 tracking-widest uppercase animate-pulse">Loading HD Media</span>
          </div>
        </div>
      )}

      {/* Main High-Performance Image with Blur-Up Transition */}
      <img
        src={imgSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        data-status={isLoaded ? 'loaded' : 'loading'}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={effectiveFetchPriority}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full transform-gpu transition-all duration-700 ease-out ${fitClass} ${
          isLoaded 
            ? 'opacity-100 blur-0 scale-100 filter-none' 
            : 'opacity-0 blur-md scale-105'
        } ${className}`}
        {...restProps}
      />
    </div>
  );
};
