// FridgeToFork Project Export Utility
// Run this in your browser console to download individual files

const exportProject = {
  // Download a single file
  downloadFile: (filename, content) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  },

  // Copy content to clipboard
  copyToClipboard: (content) => {
    navigator.clipboard.writeText(content).then(() => {
      console.log('✅ Content copied to clipboard!');
    }).catch(err => {
      console.error('❌ Failed to copy:', err);
    });
  },

  // Export all project files (if you can access them programmatically)
  exportAll: () => {
    console.log('🚀 Starting FridgeToFork project export...');
    
    // List of essential files
    const files = [
      'App.tsx',
      '.env',
      'lib/firebase.ts',
      'lib/googleVision.ts',
      'lib/emailService.ts',
      'lib/recipeGenerator.ts',
      'lib/env.ts',
      'styles/globals.css'
    ];

    console.log('📋 Essential files to copy:');
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file}`);
    });

    console.log('\n📖 Manual copy instructions:');
    console.log('1. Open each file in the file explorer');
    console.log('2. Select all content (Ctrl+A)');
    console.log('3. Copy (Ctrl+C)');
    console.log('4. Create new file locally and paste');
    
    return files;
  },

  // Generate package.json
  generatePackageJson: () => {
    const packageJson = {
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
    };

    exportProject.downloadFile('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json downloaded!');
  },

  // Generate Vite config
  generateViteConfig: () => {
    const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})`;

    exportProject.downloadFile('vite.config.ts', viteConfig);
    console.log('✅ vite.config.ts downloaded!');
  },

  // Generate TypeScript config
  generateTsConfig: () => {
    const tsConfig = {
      "compilerOptions": {
        "target": "ES2020",
        "useDefineForClassFields": true,
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "module": "ESNext",
        "skipLibCheck": true,
        "moduleResolution": "bundler",
        "allowImportingTsExtensions": true,
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "jsx": "react-jsx",
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true
      },
      "include": ["src"],
      "references": [{ "path": "./tsconfig.node.json" }]
    };

    exportProject.downloadFile('tsconfig.json', JSON.stringify(tsConfig, null, 2));
    console.log('✅ tsconfig.json downloaded!');
  }
};

// Auto-run export info
console.log('🍽️ FridgeToFork Export Utility Loaded!');
console.log('📋 Available commands:');
console.log('• exportProject.exportAll() - Show files to copy');
console.log('• exportProject.generatePackageJson() - Download package.json');
console.log('• exportProject.generateViteConfig() - Download vite.config.ts');
console.log('• exportProject.generateTsConfig() - Download tsconfig.json');
console.log('• exportProject.copyToClipboard(content) - Copy text to clipboard');

// Make it globally available
window.exportProject = exportProject;