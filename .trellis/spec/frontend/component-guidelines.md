# Component Guidelines

> How components are built in this project.

---

## Overview

<!--
Document your project's component conventions here.

Questions to answer:
- What component patterns do you use?
- How are props defined?
- How do you handle composition?
- What accessibility standards apply?
-->

(To be filled by the team)

---

## Component Structure

<!-- Standard structure of a component file -->

(To be filled by the team)

---

## Props Conventions

<!-- How props should be defined and typed -->

(To be filled by the team)

---

## Styling Patterns

<!-- How styles are applied (CSS modules, styled-components, Tailwind, etc.) -->

(To be filled by the team)

---

## Accessibility

<!-- A11y requirements and patterns -->

(To be filled by the team)

---

## Common Mistakes

### Mistake: treating admin as the resource owner in UI

**Symptom**: On bounty detail, a non-author admin only sees “关闭悬赏并退款” and cannot submit a solution.

**Cause**: One boolean mixed identity (`isOwner = author || admin`) gated both owner tools and the submit branch.

**Fix**: Split identity:

| Flag | Meaning | UI |
|------|---------|----|
| `isAuthor` | logged-in user id === bounty.author id | owner copy, close for self, “收到的方案” |
| `canManage` | author **or** admin | accept / download / view deliverable content |
| `canSubmit` | status open **and** not author | `SubmitSolutionForm` |

Pass `isOwner={canManage}` into `SubmissionList` for action buttons only.

### Mistake: public author label from failed populate

**Symptom**: List/detail always shows 「匿名」 for guests.

**Cause**: `users.read = authenticated` + `depth: 1` without current user → author stays an id; UI falls back to “匿名”.

**Fix**: Server-resolve via `resolvePublicUserProfiles` / `formatPublicDisplayName`; card prop `authorDisplayName`; never email fallback.

### Mistake: owner-only participant list

**Symptom**: Visitors cannot see who joined, who was accepted, or rejection system labels.

**Cause**: Submissions block rendered only when `isOwner`.

**Fix**: Always render public participant DTO list; gate only management actions and private content.
