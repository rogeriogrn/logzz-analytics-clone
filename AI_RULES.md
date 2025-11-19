# AI Rules & Guidelines

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Backend/Database:** Supabase
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Charts:** Recharts (primary), React Google Charts (maps)
- **Utilities:** `clsx` and `tailwind-merge` for class management

## Development Rules

### 1. Styling & UI
- **Tailwind CSS:** ALWAYS use Tailwind CSS for styling. Avoid writing custom CSS in `.css` files unless absolutely necessary for complex animations or resets.
- **Class Management:** Use `clsx` and `tailwind-merge` (via the `cn` utility if available, or directly) when conditionally applying classes.
- **Design System:**
  - Follow the "Glassmorphism" aesthetic used throughout the app.
  - Use the `GlassCard` component for content containers.
  - Primary color: Emerald (`bg-emerald-500`, `text-emerald-600`).
  - Background: Slate (`bg-slate-50`).
  - Text: Slate (`text-slate-800`, `text-slate-500`).
- **Responsiveness:** All layouts must be fully responsive (Mobile first approach).

### 2. Components
- **Icons:** Use `lucide-react` for all icons.
- **Modals:** Use the pattern established in `FilterModal.tsx` or `OrderModal.tsx` (fixed overlay with centered content).
- **Transitions:** Wrap page views in the `PageTransition` component to ensure smooth navigation animations using Framer Motion.
- **Toasts:** Use the custom `Toast` component for user feedback.

### 3. Data & State
- **Supabase:** Use the `supabase` client exported from `lib/supabaseClient.ts` for all database interactions.
- **Type Safety:** Always define interfaces for data structures in `types.ts` and import them. Avoid `any`.
- **Date Handling:** Use standard `Date` objects or ISO strings. Format dates using `utils/formatters.ts`.
- **Currency:** Use `formatCurrency` helper from `utils/formatters.ts` for displaying monetary values.

### 4. File Structure
- **Views:** Main page views go in `src/views/`.
- **Components:** Reusable UI elements go in `src/components/`.
- **Types:** Shared TypeScript interfaces go in `src/types.ts`.
- **Utils:** Helper functions go in `src/utils/`.