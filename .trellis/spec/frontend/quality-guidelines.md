# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

Project-backed frontend quality rules. Prefer concrete contracts over abstract ideals.

---

## Forbidden Patterns

### Public user identity via REST / populate

- **Do not** open `users.access.read = anyone` just to fix “anonymous author” on public pages.
- **Do not** fall back to email (or email local-part) for public display names.
- **Do not** rely on `depth: 1` relation populate for `author` / `submitter` when the page may be unauthenticated — populate will fail under `users.read = authenticated`.

### Leaking private deliverables in public RSC props

- **Do not** pass `downloadFile`, raw file URLs, email, balance, or role into client props for public bounty/market cards.
- Public participant DTOs may include: `id`, `displayName`, `avatarUrl`, submission `status` + fixed system `statusDetail`.
- Deliverable `content` / `note` only for bounty author, admin reviewer, or the submitter themselves.

### Collapsing admin into “owner” for UX

- **Do not** set `isOwner = isAuthor || isAdmin` for **submit / sidebar identity** UI.
  - Admin who is **not** the bounty author must still see the submit form when the bounty is open.
  - Admin may still **manage** (accept / download / close) via a separate `canManage` flag.
- **Wrong**:
  ```ts
  const isOwner = Boolean(user) && (authorId === user.id || user.role === 'admin')
  // sidebar: isOwner ? CloseButton : SubmitForm  → admin non-author only sees Close
  ```
- **Correct**:
  ```ts
  const isAuthor = Boolean(user) && authorId != null && String(authorId) === String(user.id)
  const canManage = isAuthor || user?.role === 'admin'
  const canSubmit = bounty.status === 'open' && !isAuthor
  // sidebar: isAuthor ? owner tools : SubmitForm (+ optional admin Close)
  // list actions: isOwner={canManage}
  ```

---

## Required Patterns

### Public user profile resolution

Use `src/utilities/publicUserProfile.ts`:

- `formatPublicDisplayName(id, name)` → trimmed `name` else `用户{id}` (never email).
- `resolvePublicUserProfiles(payload, refs)` → batch `overrideAccess` find on `users` with `select: { id, name, avatar }` only; map avatar via `externalUrl` / `getMediaUrl`.
- Always provide a stable placeholder profile for missing ids so UI never falls back to fixed “匿名”.

### Mutation → public list/detail cache

Bounty endpoints that change public list/detail state (`accept` / `close` / `submit`) must call:

```ts
try {
  revalidatePath('/bounty')
  if (bounty.slug) revalidatePath(`/bounty/${bounty.slug}`)
} catch {
  // revalidate failure must not fail the business mutation
}
```

Client actions should still `router.refresh()` after success.

### Bounty public submission DTO (RSC)

1. Load submissions with `overrideAccess: true` for public `open|fulfilled|closed` bounties.
2. Map safe DTO for everyone; attach `content`/`note` only when `canManage || isSelf`.
3. Never put `downloadFile` on the DTO — downloads stay behind `/api/bounty/submission-download`.

---

## Testing Requirements

- Prefer typecheck (`pnpm exec tsc --noEmit`) after bounty/frontend identity changes.
- Manual AC (when changing bounty display):
  1. Guest: author displayName not “匿名”; participants visible; no download link.
  2. Author: accept → fulfilled; close → closed; no further accept.
  3. Non-author (incl. admin non-author): open bounty shows submit form, not only close.
  4. Rejected submissions show fixed system copy (e.g. 「已选择其他方案」), not free-text reasons.

---

## Code Review Checklist

- [ ] Public pages use `resolvePublicUserProfiles`, not email or open `users.read`
- [ ] `isAuthor` vs `canManage` / `canSubmit` not collapsed into one flag for sidebar UX
- [ ] Public submission props exclude `downloadFile` / email
- [ ] accept/close/submit revalidate `/bounty` and `/bounty/[slug]`
- [ ] Status labels cover `open` / `fulfilled` / `closed` on list + detail
