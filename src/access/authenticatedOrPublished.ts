import type { Access } from 'payload'

/** Admins see drafts; everyone else (including logged-in members) only sees published docs. */
export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user?.role === 'admin') {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
