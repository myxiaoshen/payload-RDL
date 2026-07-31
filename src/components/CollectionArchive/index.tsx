import { cn } from '@/utilities/ui'
import React from 'react'

import { Card, CardPostData } from '@/components/Card'

type ArchiveItem = CardPostData & {
  doc?: { relationTo?: string } | null
}

export type Props = {
  posts: ArchiveItem[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              const relationTo = result.doc?.relationTo === 'software' ? 'software' : 'posts'

              return (
                <div className="col-span-4 animate-fade-in-up xl:col-span-3" key={index}>
                  <Card className="h-full" doc={result} relationTo={relationTo} showCategories />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
