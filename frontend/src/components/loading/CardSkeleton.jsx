import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

/**
 * Beautiful shimmer loading skeleton for resource cards
 * Used in Papers, Notes, and Syllabus pages
 */
const CardSkeleton = ({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="overflow-hidden relative dark:bg-gray-800 dark:border-gray-700"
        >
          {/* Shimmer overlay effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {/* Title skeleton */}
                <Skeleton className="h-6 w-3/4" />
                {/* Branch badge skeleton */}
                <Skeleton className="h-5 w-24" />
              </div>
              {/* Icon skeleton */}
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Description skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Tags skeleton */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-14" />
            </div>

            {/* Action buttons skeleton */}
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default CardSkeleton;
