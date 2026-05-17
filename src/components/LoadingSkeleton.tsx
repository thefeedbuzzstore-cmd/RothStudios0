import React from 'react';
import { cn } from '../lib/utils';

interface LoadingSkeletonProps {
  variant?: 'card' | 'hero' | 'row';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = 'card' }) => {
  if (variant === 'hero') {
    return (
      <div className="w-full h-[65vh] md:h-[85vh] bg-bg-offset animate-pulse flex flex-col justify-end p-12">
        <div className="max-w-2xl space-y-6">
          <div className="h-6 w-48 bg-zinc-800 rounded" />
          <div className="h-16 w-full bg-zinc-800 rounded" />
          <div className="h-24 w-3/4 bg-zinc-800 rounded" />
          <div className="flex gap-4 pt-4">
            <div className="h-14 w-40 bg-zinc-800 rounded" />
            <div className="h-14 w-40 bg-zinc-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div className="px-12 space-y-4 py-8">
        <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-none w-[240px] aspect-[2/3] bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-[2/3] w-full bg-bg-offset rounded-lg animate-pulse" />
  );
}
