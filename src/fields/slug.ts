import { slugField, type CheckboxField, type TextField } from 'payload'

import { generateRandomSlug } from '@/utilities/generateRandomSlug'
import { slugify } from '@/utilities/slugify'

type SlugFieldArgs = Parameters<typeof slugField>[0]

/** 内置 slugField 的中文友好版本，全站统一用它替代 `slugField()`。 */
export const slugFieldZh = (args?: SlugFieldArgs) =>
  slugField({
    ...args,
    slugify: () => generateRandomSlug(),
    overrides: (field) => {
      const checkboxField = field.fields[0] as CheckboxField
      const slugTextField = field.fields[1] as TextField

      checkboxField.defaultValue = false

      slugTextField.hooks = {
        ...slugTextField.hooks,
        beforeValidate: [
          ...(slugTextField.hooks?.beforeValidate ?? []),
          ({ value }: { value?: unknown }) => {
            if (typeof value === 'string' && value.trim()) {
              return slugify(value)
            }

            return generateRandomSlug()
          },
        ],
      }

      return args?.overrides ? args.overrides(field) : field
    },
  })
