import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FeaturedSoftwareBlock } from '@/blocks/FeaturedSoftware/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { VideoBlock } from '@/blocks/Video/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  featuredSoftware: FeaturedSoftwareBlock,
  mediaBlock: MediaBlock,
  videoBlock: VideoBlock,
}

export const RenderBlocks: React.FC<{
  blocks?: NonNullable<Page['layout']>
}> = (props) => {
  const { blocks = [] } = props

  if (blocks.length === 0) {
    return null
  }

  return (
    <Fragment>
      {blocks.map((block, index) => {
        const { blockType } = block

        if (blockType && blockType in blockComponents) {
          const Block = blockComponents[blockType as keyof typeof blockComponents]

          if (Block) {
            return (
              <div className="my-16" key={index}>
                {/* @ts-expect-error 类型可能不完全匹配，但运行时是安全的 */}
                <Block {...block} disableInnerContainer />
              </div>
            )
          }
        }
        return null
      })}
    </Fragment>
  )
}
