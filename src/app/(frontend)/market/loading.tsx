import { Skeleton, SkeletonCardGrid } from '@/components/ui/skeleton'
import React from 'react'

export default function Loading() {
  return (
    <div className="container py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="mb-10 flex flex-col gap-5">
        <Skeleton className="h-11 w-full max-w-md" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
      </div>
      <SkeletonCardGrid count={12} />
    </div>
  )
}
