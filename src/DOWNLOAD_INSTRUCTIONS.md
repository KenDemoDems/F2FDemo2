# How to Download Your FridgeToFork Code

## Method 1: Manual File Download (Recommended)

Since the Download button isn't working, you can manually copy each file:

### Essential Files to Copy:

1. **Main Application**
   - `App.tsx` (Main application component)

2. **Environment Configuration**
   - `.env` (Environment variables template)

3. **Backend Services** (lib folder)
   - `lib/firebase.ts` (Firebase integration)
   - `lib/googleVision.ts` (Google Vision API)
   - `lib/emailService.ts` (Email notifications)
   - `lib/recipeGenerator.ts` (Recipe generation logic)
   - `lib/env.ts` (Environment utilities)

4. **Styling**
   - `styles/globals.css` (Tailwind CSS configuration)

5. **UI Components** (components/ui folder)
   - All files in `components/ui/` (ShadCN components)
   - `components/figma/ImageWithFallback.tsx`

6. **Documentation**
   - `ENVIRONMENT_SETUP.md`
   - `INTEGRATION_SETUP.md`
   - `Attributions.md`

### Package.json Dependencies

Create a `package.json` file with these dependencies:

```json
{
  "name": "fridgetofork",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "latest",
    "motion": "latest",
    "firebase": "^10.7.1",
    "emailjs-com": "^3.2.0",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "react-hook-form": "^7.55.0",
    "sonner": "^2.0.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

## Method 2: Browser Developer Tools

1. Open browser Developer Tools (F12)
2. Go to Sources tab
3. Navigate through the file tree
4. Right-click on files and "Save as"

## Method 3: Copy-Paste Method

1. Right-click on each file in the file explorer
2. Select "View Source" or similar option
3. Copy the entire content
4. Paste into your local editor

## Method 4: Alternative Download Options

If available in the interface:
- Look for "Export" or "Save" options in the menu
- Try right-clicking on the project name
- Check if there's a "..." menu with download options

## Setting Up Locally

After downloading the files:

1. Create a new folder for your project
2. Copy all files maintaining the folder structure
3. Run `npm install` to install dependencies
4. Copy `.env` to `.env.local` and add your API keys
5. Run `npm run dev` to start development server

## Troubleshooting Download Issues

- **Refresh the page** and try the download button again
- **Clear browser cache** and cookies
- **Try a different browser** (Chrome, Firefox, Safari)
- **Disable browser extensions** that might interfere
- **Check if popup blockers** are preventing the download

## Project Structure After Download

```
fridgetofork/
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── ui/
│   │   └── figma/
│   ├── lib/
│   └── styles/
├── public/
├── .env.local
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Important Notes

- **Keep your API keys secure** - never commit .env.local to version control
- **Test all functionality** after setting up locally
- **The app is production-ready** with all integrations complete
- **Follow the setup guide** in .env for API configuration

## Need Help?

If you continue having issues downloading:
1. Take a screenshot of any error messages
2. Try the manual copy-paste method for essential files
3. The core functionality is all in App.tsx and the lib/ folder