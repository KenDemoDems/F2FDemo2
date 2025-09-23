# Implement Design (Copy) / FridgeToFork

This is a code bundle for FridgeToFork, an AI-powered fridge-to-recipe app. The original project is available at https://www.figma.com/design/TClU4vkLesCJJSscnAugCd/Implement-Design--Copy-.

## Running the code

1. Run `npm i` to install the dependencies.
2. Run `npm run dev` to start the development server.

## Building for Production

- Run `npm run build` to generate a production build.
- Run `npm run preview` to locally preview the production build.

## Deploying to Vercel

This app is fully ready for deployment to [Vercel](https://vercel.com/):

### 1. Prepare Environment Variables

- Copy `.env.example` to `.env.local` and fill in your API keys (Firebase, Google Vision, EmailJS, etc.).
- For demo mode, set `VITE_DEMO_MODE=true` in `.env.local` (all features work with mock data).

### 2. Push to GitHub (Recommended)

- Initialize a git repo if needed: `git init`
- Commit your code and push to GitHub.

### 3. Import to Vercel

- Go to [vercel.com/import](https://vercel.com/import) and select your GitHub repo.
- Set up environment variables in the Vercel dashboard (copy from `.env.example`).
- Vercel will auto-detect the build command (`vite build`) and output directory (`build`).

### 4. (Alternative) Deploy with Vercel CLI

- Install Vercel CLI: `npm i -g vercel`
- Run `vercel` in the project root and follow the prompts.
- Set environment variables as prompted or in the Vercel dashboard.

### 5. SPA Routing

- The included `vercel.json` ensures correct SPA routing for client-side navigation:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 6. Assets

- All images and assets are handled by Vite and included in the build.

### 7. Environment Variables

- See `.env.example` for all required variables. Add your API keys for Firebase, Google Vision, EmailJS, etc.

### 8. Troubleshooting

- If you see blank pages or 404s on refresh, ensure `vercel.json` is present and correct.
- For any API integration, ensure your keys are set in the Vercel dashboard.

## Project Structure

- `src/components/` - UI components (Button, Card, Navbar, etc.)
- `src/pages/` - Main app pages (Homepage, InventoryPage, MealPlanPage, AboutPage, RecipeDetail)
- `src/assets/` - Images and static assets
- `src/lib/` - API and integration logic (Firebase, Google Vision, Recipe Generator, Email Service)
- `src/context/` - (If needed) React context providers
- `src/utils/` - Utility functions

## Features

- User authentication (email/password + Google OAuth)
- Ingredient detection from photos (Google Vision API or mock)
- Recipe generation based on available ingredients (AI or mock)
- Inventory management with waste tracking
- Email notifications for spoiling ingredients
- Weekly meal planning
- Dark/light mode toggle
- Responsive design for all devices
- SDG 12 sustainability features

## Accessibility & Best Practices

- All interactive elements are keyboard accessible and use ARIA attributes where needed.
- Responsive, mobile-first layouts with Tailwind CSS.
- Animations via Framer Motion.
- Error boundaries and loading states included.

## Attributions

See `src/Attributions.md` for credits for components, icons, and photos.

---

## Quick Vercel Deployment Steps

1. Copy `.env.example` to `.env.local` and fill in your keys.
2. Push to GitHub and import to Vercel, or run `vercel` CLI.
3. Set environment variables in Vercel dashboard.
4. Deploy and enjoy your AI-powered fridge-to-recipe app!
  