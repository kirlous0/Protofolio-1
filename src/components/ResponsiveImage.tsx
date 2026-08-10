import React, { useState, useEffect } from 'react';
import { Code2 } from 'lucide-react';
import { generateSrcSet } from '../utils/screenshot';

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
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    let cleanSrc = src;
    if (cleanSrc && cleanSrc.includes('image.thum.io') && cleanSrc.includes('noanimate')) {
      cleanSrc = cleanSrc.replace('noanimate', 'wait/4/refresh');
    }
    setImgSrc(cleanSrc);
    setHasError(false);
    setIsLoaded(false);
    setRetryAttempt(0);
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
    if (retryAttempt === 0 && imgSrc) {
      setRetryAttempt(1);
      // If thum.io failed, attempt fallback screenshot service (WordPress mshots)
      if (imgSrc.includes('image.thum.io')) {
        const urlMatch = imgSrc.match(/https?:\/\/(?!image\.thum\.io)[^\s]+/);
        if (urlMatch) {
          const targetUrl = urlMatch[0];
          setImgSrc(`https://s0.wp.com/mshots/v1/${encodeURIComponent(targetUrl)}?w=1200&h=800`);
          return;
        }
      }
    }
    setHasError(true);
    if (onError) onError(e);
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  // If no image or both screenshot services failed, show a clean UI frame placeholder (NO default stock photos)
  if (hasError || !imgSrc) {
    return (
      <div className={`relative overflow-hidden bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center p-6 text-center select-none ${aspectRatio} ${containerClassName}`}>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2">
          <Code2 className="w-5 h-5 text-amber-400" />
        </div>
        <span className="text-xs font-mono font-bold text-slate-200 max-w-[200px] truncate">{alt || fallbackTitle || 'Project Preview'}</span>
        {fallbackCategory && (
          <span className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-wider">{fallbackCategory}</span>
        )}
      </div>
    );
  }

  const fitClass = fitMode === 'contain' ? 'object-contain p-1 bg-slate-950' : 'object-cover';
  const effectiveFetchPriority = fetchPriority || (eager ? 'high' : 'auto');

  return (
    <div className={`relative overflow-hidden bg-slate-900/90 ${aspectRatio} ${containerClassName}`}>
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 animate-shimmer bg-[length:200%_100%]" />
          <div className="relative z-20 flex flex-col items-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
            <span className="text-[10px] font-mono text-amber-500/70 tracking-widest uppercase">Capturing Screenshot</span>
          </div>
        </div>
      )}

      {/* Main Image */}
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
        className={`w-full h-full transform-gpu transition-all duration-500 ease-out ${fitClass} ${
          isLoaded 
            ? 'opacity-100 blur-0 scale-100 filter-none' 
            : 'opacity-0 blur-sm scale-102'
        } ${className}`}
        {...restProps}
      />
    </div>
  );
};

