import { slugField } from 'payload'

import { slugify } from '@/utilities/slugify'

type SlugFieldArgs = Parameters<typeof slugField>[0]

/** 内置 slugField 的中文友好版本，全站统一用它替代 `slugField()`。 */
export const slugFieldZh = (args?: SlugFieldArgs) =>
  slugField({
    ...args,
    slugify: ({ valueToSlugify }) => slugify(valueToSlugify),
  })
