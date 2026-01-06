/**
 * @fileoverview Project Template Registry
 * @module lib/templates/template-registry
 * @governance S-042
 * @created 2026-01-06T14:45:00+07:00
 *
 * Registry of built-in project templates.
 * Provides template discovery, filtering, and retrieval.
 */

import type {
  ProjectTemplate,
  TemplateCategory,
  TemplateFilterOptions,
} from './template-types';

// Re-export types for convenience
export type { ProjectTemplate, TemplateCategory, TemplateFilterOptions };

// ============================================================================
// Base Template Configurations
// ============================================================================

const BASE_VITE_CONFIG = {
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
};

const BASE_TSCONFIG = {
  compilerOptions: {
    target: 'ES2020',
    useDefineForClassFields: true,
    lib: ['ES2020', 'DOM', 'DOM.Iterable'],
    module: 'ESNext',
    skipLibCheck: true,
    moduleResolution: 'bundler',
    allowImportingTsExtensions: true,
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    jsx: 'react-jsx',
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true,
  },
  include: ['src'],
  references: [{ path: './tsconfig.node.json' }],
};

const ESLINT_CONFIG = {
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    'react-refresh/only-export-components': 'warn',
  },
};

const PRETTIER_CONFIG = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
};

// ============================================================================
// Frontend Templates
// ============================================================================

const REACT_VITE_TEMPLATE: ProjectTemplate = {
  id: 'react-vite',
  name: 'React + Vite',
  description: 'Modern React application with Vite, TypeScript, and Tailwind CSS',
  category: 'frontend',
  tags: ['react', 'vite', 'typescript', 'tailwind', 'spa'],
  icon: 'Atom',
  version: '1.0.0',
  author: 'Community',
  config: {
    dependencies: {
      react: '^18.3.1',
      'react-dom': '^18.3.1',
    },
    devDependencies: {
      '@types/react': '^18.3.12',
      '@types/react-dom': '^18.3.1',
      '@vitejs/plugin-react': '^4.3.4',
      typescript: '^5.7.2',
      vite: '^6.0.5',
      'eslint-plugin-react-refresh': '^0.4.16',
    },
    files: [
      {
        path: 'index.html',
        content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
      },
      {
        path: 'src/main.tsx',
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
      },
      {
        path: 'src/App.tsx',
        content: `import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">Vite + React</h1>
        <div className="flex gap-8 items-center">
          <a href="https://vitejs.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <button
          className="px-4 py-2 mt-8 bg-primary text-primary-foreground rounded"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>
      </div>
    </div>
  )
}

export default App`,
      },
      {
        path: 'src/index.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  min-height: 100vh;
}`,
      },
      {
        path: 'package.json',
        content: `{
  "name": "{{projectName}}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.17.0",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.17.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.16",
    "globals": "^15.14.0",
    "typescript": "~5.6.2",
    "typescript-eslint": "^8.18.2",
    "vite": "^6.0.5"
  }
}`,
      },
    ],
    scripts: {
      dev: 'vite',
      build: 'tsc -b && vite build',
      lint: 'eslint .',
      test: 'vitest',
    },
    tsconfig: BASE_TSCONFIG,
    vite: BASE_VITE_CONFIG,
    eslint: ESLINT_CONFIG,
    prettier: PRETTIER_CONFIG,
  },
  customization: [
    {
      id: 'typescript',
      label: 'TypeScript',
      description: 'Enable TypeScript support',
      type: 'boolean',
      default: true,
      category: 'core',
    },
    {
      id: 'styling',
      label: 'Styling',
      description: 'CSS framework to use',
      type: 'select',
      default: 'tailwind',
      category: 'styling',
      choices: [
        { value: 'css', label: 'Plain CSS' },
        { value: 'scss', label: 'SCSS' },
        { value: 'tailwind', label: 'Tailwind CSS' },
        { value: 'styled-components', label: 'Styled Components' },
      ],
    },
    {
      id: 'testing',
      label: 'Testing Framework',
      type: 'select',
      default: 'vitest',
      category: 'testing',
      choices: [
        { value: 'none', label: 'None' },
        { value: 'vitest', label: 'Vitest' },
        { value: 'jest', label: 'Jest' },
        { value: 'cypress', label: 'Cypress' },
      ],
    },
  ],
  variables: [
    {
      name: 'projectName',
      default: 'my-react-app',
      description: 'Project name',
      required: true,
    },
  ],
  meta: {
    popularity: 95,
    complexity: 2,
    setupTime: 5,
    featured: true,
  },
};

const VUE3_TEMPLATE: ProjectTemplate = {
  id: 'vue3-vite',
  name: 'Vue 3 + Vite',
  description: 'Vue 3 with Composition API, Vite, Pinia, and TypeScript',
  category: 'frontend',
  tags: ['vue', 'vite', 'typescript', 'pinia', 'composition-api'],
  icon: 'Box',
  version: '1.0.0',
  author: 'Community',
  config: {
    dependencies: {
      vue: '^3.5.13',
      'vue-router': '^4.5.0',
      pinia: '^2.2.8',
    },
    devDependencies: {
      '@vitejs/plugin-vue': '^5.2.1',
      '@vue/tsconfig': '^0.7.0',
      typescript: '^5.7.2',
      vite: '^6.0.5',
      'vue-tsc': '^2.2.0',
    },
    files: [],
    scripts: {
      dev: 'vite',
      build: 'vue-tsc -b && vite build',
      test: 'vitest',
    },
    tsconfig: BASE_TSCONFIG,
    vite: BASE_VITE_CONFIG,
  },
  customization: [
    {
      id: 'typescript',
      label: 'TypeScript',
      type: 'boolean',
      default: true,
      category: 'core',
    },
    {
      id: 'router',
      label: 'Vue Router',
      type: 'boolean',
      default: true,
      category: 'core',
    },
    {
      id: 'styling',
      label: 'Styling',
      type: 'select',
      default: 'scss',
      category: 'styling',
      choices: [
        { value: 'css', label: 'Plain CSS' },
        { value: 'scss', label: 'SCSS' },
        { value: 'tailwind', label: 'Tailwind CSS' },
      ],
    },
  ],
  meta: {
    popularity: 85,
    complexity: 2,
    setupTime: 5,
  },
};

const NEXTJS_TEMPLATE: ProjectTemplate = {
  id: 'nextjs',
  name: 'Next.js',
  description: 'React framework with SSR, SSG, and App Router',
  category: 'frontend',
  tags: ['nextjs', 'react', 'ssr', 'typescript', 'app-router'],
  icon: 'Triangle',
  version: '1.0.0',
  author: 'Vercel',
  homepage: 'https://nextjs.org',
  config: {
    dependencies: {
      next: '^15.1.3',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    },
    devDependencies: {
      '@types/node': '^22.10.2',
      '@types/react': '^19.0.6',
      '@types/react-dom': '^19.0.2',
      typescript: '^5.7.2',
      eslint: '^9.17.0',
      'eslint-config-next': '^15.1.3',
    },
    files: [],
    scripts: {
      dev: 'next dev',
      build: 'next build',
      test: 'jest',
      lint: 'next lint',
    },
    tsconfig: {
      compilerOptions: {
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        incremental: true,
        module: 'esnext',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        plugins: [{ name: 'next' }],
        paths: {
          '@/*': ['./*'],
        },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    },
  },
  customization: [
    {
      id: 'typescript',
      label: 'TypeScript',
      type: 'boolean',
      default: true,
      category: 'core',
    },
    {
      id: 'styling',
      label: 'Styling',
      type: 'select',
      default: 'tailwind',
      category: 'styling',
      choices: [
        { value: 'css', label: 'CSS Modules' },
        { value: 'tailwind', label: 'Tailwind CSS' },
        { value: 'styled-components', label: 'Styled Components' },
      ],
    },
  ],
  meta: {
    popularity: 90,
    complexity: 3,
    setupTime: 8,
    featured: true,
  },
};

const SVELTEKIT_TEMPLATE: ProjectTemplate = {
  id: 'sveltekit',
  name: 'SvelteKit',
  description: 'Full-stack Svelte framework with SSR and file-based routing',
  category: 'frontend',
  tags: ['svelte', 'sveltekit', 'typescript', 'ssr'],
  icon: 'Layers',
  version: '1.0.0',
  author: 'Svelte',
  homepage: 'https://kit.svelte.dev',
  config: {
    dependencies: {
      '@sveltejs/kit': '^2.10.0',
      svelte: '^4.2.19',
    },
    devDependencies: {
      '@sveltejs/vite-plugin-svelte': '^4.0.0',
      '@tsconfig/svelte': '^5.0.4',
      sass: '^1.83.4',
      svelte: '^4.2.19',
      'svelte-check': '^4.0.10',
      typescript: '^5.7.2',
      vite: '^6.0.5',
    },
    files: [],
    scripts: {
      dev: 'vite dev',
      build: 'vite build',
      test: 'vitest',
      lint: 'eslint .',
    },
  },
  customization: [
    {
      id: 'typescript',
      label: 'TypeScript',
      type: 'boolean',
      default: true,
      category: 'core',
    },
    {
      id: 'styling',
      label: 'Styling',
      type: 'select',
      default: 'scss',
      category: 'styling',
      choices: [
        { value: 'css', label: 'Plain CSS' },
        { value: 'scss', label: 'SCSS' },
        { value: 'tailwind', label: 'Tailwind CSS' },
      ],
    },
  ],
  meta: {
    popularity: 75,
    complexity: 2,
    setupTime: 6,
  },
};

// ============================================================================
// Backend Templates
// ============================================================================

const NODE_EXPRESS_TEMPLATE: ProjectTemplate = {
  id: 'node-express',
  name: 'Node.js + Express',
  description: 'REST API with Express.js, TypeScript, and ESLint',
  category: 'backend',
  tags: ['nodejs', 'express', 'rest', 'api', 'typescript'],
  icon: 'Server',
  version: '1.0.0',
  author: 'Community',
  config: {
    dependencies: {
      express: '^4.21.2',
    },
    devDependencies: {
      '@types/express': '^5.0.0',
      '@types/node': '^22.10.2',
      typescript: '^5.7.2',
      tsx: '^4.19.2',
      nodemon: '^3.1.9',
    },
    files: [
      {
        path: 'src/index.ts',
        content: `import express, { type Request, Response } from 'express';
import { config } from './config';

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to {{projectName}} API' });
});

app.listen(config.port, () => {
  console.log(\`Server running on port \${config.port}\`);
});`,
      },
      {
        path: 'src/config.ts',
        content: `export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
};`,
      },
    ],
    scripts: {
      dev: 'nodemon src/index.ts',
      build: 'tsc',
      start: 'node dist/index.js',
      test: 'jest',
    },
    tsconfig: {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        moduleResolution: 'node',
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    },
  },
  customization: [
    {
      id: 'typescript',
      label: 'TypeScript',
      type: 'boolean',
      default: true,
      category: 'core',
    },
    {
      id: 'testing',
      label: 'Testing Framework',
      type: 'select',
      default: 'jest',
      category: 'testing',
      choices: [
        { value: 'none', label: 'None' },
        { value: 'jest', label: 'Jest' },
        { value: 'vitest', label: 'Vitest' },
      ],
    },
  ],
  meta: {
    popularity: 80,
    complexity: 2,
    setupTime: 5,
  },
};

const NODE_FASTIFY_TEMPLATE: ProjectTemplate = {
  id: 'node-fastify',
  name: 'Node.js + Fastify',
  description: 'High-performance Node.js server with Fastify and TypeScript',
  category: 'backend',
  tags: ['nodejs', 'fastify', 'typescript', 'api', 'high-performance'],
  icon: 'Zap',
  version: '1.0.0',
  author: 'Community',
  config: {
    dependencies: {
      fastify: '^5.2.0',
      '@fastify/cors': '^9.0.1',
    },
    devDependencies: {
      '@types/node': '^22.10.2',
      typescript: '^5.7.2',
      tsx: '^4.19.2',
      nodemon: '^3.1.9',
    },
    files: [],
    scripts: {
      dev: 'nodemon src/index.ts',
      build: 'tsc',
      start: 'node dist/index.js',
      test: 'vitest',
    },
  },
  customization: [
    {
      id: 'typescript',
      label: 'TypeScript',
      type: 'boolean',
      default: true,
      category: 'core',
    },
  ],
  meta: {
    popularity: 70,
    complexity: 2,
    setupTime: 5,
  },
};

const PYTHON_FLASK_TEMPLATE: ProjectTemplate = {
  id: 'python-flask',
  name: 'Python + Flask',
  description: 'Lightweight Python web framework with REST API',
  category: 'backend',
  tags: ['python', 'flask', 'rest', 'api'],
  icon: 'FileCode',
  version: '1.0.0',
  author: 'Community',
  config: {
    dependencies: {},
    devDependencies: {},
    files: [
      {
        path: 'app.py',
        content: `from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "Welcome to {{projectName}}"})

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True)`,
      },
      {
        path: 'requirements.txt',
        content: `Flask==3.1.0
python-dotenv==1.0.1`,
      },
    ],
    scripts: {
      dev: 'flask run',
      test: 'pytest',
    },
  },
  customization: [
    {
      id: 'testing',
      label: 'Testing Framework',
      type: 'select',
      default: 'pytest',
      category: 'testing',
      choices: [
        { value: 'none', label: 'None' },
        { value: 'pytest', label: 'Pytest' },
        { value: 'unittest', label: 'Unittest' },
      ],
    },
  ],
  meta: {
    popularity: 75,
    complexity: 2,
    setupTime: 5,
  },
};

const PYTHON_DJANGO_TEMPLATE: ProjectTemplate = {
  id: 'python-django',
  name: 'Python + Django',
  description: 'Full-featured Python web framework with ORM and admin',
  category: 'backend',
  tags: ['python', 'django', 'orm', 'admin', 'full-stack'],
  icon: 'Database',
  version: '1.0.0',
  author: 'Django',
  homepage: 'https://djangoproject.com',
  config: {
    dependencies: {},
    devDependencies: {},
    files: [
      {
        path: 'requirements.txt',
        content: `Django==5.1.4
djangorestframework==3.15.2
python-decouple==3.8`,
      },
    ],
    scripts: {
      dev: 'python manage.py runserver',
      build: 'python manage.py collectstatic',
      test: 'pytest',
    },
  },
  customization: [
    {
      id: 'rest',
      label: 'Django REST Framework',
      type: 'boolean',
      default: true,
      category: 'core',
    },
  ],
  meta: {
    popularity: 80,
    complexity: 4,
    setupTime: 10,
  },
};

const GO_TEMPLATE: ProjectTemplate = {
  id: 'go-server',
  name: 'Go + Chi Router',
  description: 'High-performance Go server with Chi router',
  category: 'backend',
  tags: ['go', 'golang', 'chi', 'api', 'high-performance'],
  icon: 'Cpu',
  version: '1.0.0',
  author: 'Community',
  config: {
    dependencies: {},
    devDependencies: {},
    files: [
      {
        path: 'main.go',
        content: `package main

import (
    "net/http"
    "github.com/go-chi/chi/v5"
)

func main() {
    r := chi.NewRouter()

    r.Get("/", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Welcome to {{projectName}}"))
    })

    http.ListenAndServe(":3000", r)
}`,
      },
      {
        path: 'go.mod',
        content: `module {{projectName}}

go 1.21

require github.com/go-chi/chi/v5 v5.0.0`,
      },
    ],
    scripts: {
      dev: 'go run main.go',
      build: 'go build -o bin/server',
      test: 'go test ./...',
    },
  },
  customization: [
    {
      id: 'testing',
      label: 'Testing Framework',
      type: 'select',
      default: 'none',
      category: 'testing',
      choices: [
        { value: 'none', label: 'None' },
        { value: 'testify', label: 'Testify' },
      ],
    },
  ],
  meta: {
    popularity: 65,
    complexity: 2,
    setupTime: 5,
  },
};

// ============================================================================
// Full-Stack Templates
// ============================================================================

const MERN_TEMPLATE: ProjectTemplate = {
  id: 'mern',
  name: 'MERN Stack',
  description: 'MongoDB, Express, React, Node.js full-stack application',
  category: 'fullstack',
  tags: ['mongodb', 'express', 'react', 'nodejs', 'fullstack', 'mern'],
  icon: 'Layers',
  version: '1.0.0',
  author: 'Community',
  config: {
    dependencies: {
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      'react-router-dom': '^7.1.1',
      axios: '^1.7.9',
    },
    devDependencies: {
      '@types/react': '^18.3.12',
      '@types/react-dom': '^18.3.1',
      typescript: '^5.7.2',
      vite: '^6.0.5',
    },
    files: [],
    scripts: {
      dev: 'concurrently "npm run client" "npm run server"',
      'client': 'vite',
      'server': 'nodemon server/index.js',
      build: 'vite build',
      test: 'vitest',
    },
  },
  customization: [
    {
      id: 'typescript',
      label: 'TypeScript',
      type: 'boolean',
      default: true,
      category: 'core',
    },
    {
      id: 'styling',
      label: 'Styling',
      type: 'select',
      default: 'tailwind',
      category: 'styling',
      choices: [
        { value: 'css', label: 'Plain CSS' },
        { value: 'scss', label: 'SCSS' },
        { value: 'tailwind', label: 'Tailwind CSS' },
      ],
    },
  ],
  meta: {
    popularity: 85,
    complexity: 4,
    setupTime: 15,
    featured: true,
  },
};

const MEAN_TEMPLATE: ProjectTemplate = {
  id: 'mean',
  name: 'MEAN Stack',
  description: 'MongoDB, Express, Angular, Node.js full-stack application',
  category: 'fullstack',
  tags: ['mongodb', 'express', 'angular', 'nodejs', 'fullstack', 'mean'],
  icon: 'Layers',
  version: '1.0.0',
  author: 'Community',
  config: {
    dependencies: {
      '@angular/core': '^19.1.2',
      '@angular/common': '^19.1.2',
      '@angular/router': '^19.1.2',
    },
    devDependencies: {
      '@angular/cli': '^19.1.2',
      typescript: '^5.7.2',
    },
    files: [],
    scripts: {
      dev: 'ng serve',
      build: 'ng build',
      test: 'ng test',
    },
  },
  customization: [
    {
      id: 'typescript',
      label: 'TypeScript',
      type: 'boolean',
      default: true,
      category: 'core',
    },
  ],
  meta: {
    popularity: 70,
    complexity: 4,
    setupTime: 15,
  },
};

const PERN_TEMPLATE: ProjectTemplate = {
  id: 'pern',
  name: 'PERN Stack',
  description: 'PostgreSQL, Express, React, Node.js full-stack application',
  category: 'fullstack',
  tags: ['postgresql', 'express', 'react', 'nodejs', 'fullstack', 'pern'],
  icon: 'Database',
  version: '1.0.0',
  author: 'Community',
  config: {
    dependencies: {
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      'react-router-dom': '^7.1.1',
      pg: '^8.13.1',
    },
    devDependencies: {
      '@types/react': '^18.3.12',
      '@types/node': '^22.10.2',
      '@types/pg': '^8.11.10',
      typescript: '^5.7.2',
      vite: '^6.0.5',
    },
    files: [],
    scripts: {
      dev: 'concurrently "npm run client" "npm run server"',
      'client': 'vite',
      'server': 'nodemon server/index.js',
      build: 'vite build',
      test: 'vitest',
    },
  },
  meta: {
    popularity: 75,
    complexity: 4,
    setupTime: 15,
  },
};

const JAMSTACK_TEMPLATE: ProjectTemplate = {
  id: 'jamstack',
  name: 'JAMstack',
  description: 'Static site with serverless functions and edge deployment',
  category: 'fullstack',
  tags: ['jamstack', 'static', 'serverless', 'edge', 'cdn'],
  icon: 'Globe',
  version: '1.0.0',
  author: 'Community',
  config: {
    dependencies: {
      react: '^18.3.1',
      'react-dom': '^18.3.1',
    },
    devDependencies: {
      '@astrojs/react': '^4.0.0',
      '@astrojs/node': '^9.0.0',
      astro: '^5.1.9',
      typescript: '^5.7.2',
    },
    files: [],
    scripts: {
      dev: 'astro dev',
      build: 'astro build',
      preview: 'astro preview',
      test: 'vitest',
    },
  },
  meta: {
    popularity: 70,
    complexity: 3,
    setupTime: 8,
  },
};

// ============================================================================
// Specialized Templates
// ============================================================================

const ELECTRON_TEMPLATE: ProjectTemplate = {
  id: 'electron',
  name: 'Electron Desktop',
  description: 'Cross-platform desktop application with Electron',
  category: 'specialized',
  tags: ['electron', 'desktop', 'cross-platform', 'typescript'],
  icon: 'Monitor',
  version: '1.0.0',
  author: 'Electron',
  homepage: 'https://electronjs.org',
  config: {
    dependencies: {},
    devDependencies: {},
    files: [],
    scripts: {
      dev: 'electron-vite dev',
      build: 'electron-vite build',
      test: 'vitest',
    },
  },
  customization: [
    {
      id: 'typescript',
      label: 'TypeScript',
      type: 'boolean',
      default: true,
      category: 'core',
    },
  ],
  meta: {
    popularity: 60,
    complexity: 4,
    setupTime: 10,
  },
};

const REACT_NATIVE_TEMPLATE: ProjectTemplate = {
  id: 'react-native',
  name: 'React Native',
  description: 'Mobile app template for iOS and Android',
  category: 'specialized',
  tags: ['react-native', 'mobile', 'ios', 'android', 'expo'],
  icon: 'Smartphone',
  version: '1.0.0',
  author: 'Expo',
  homepage: 'https://expo.dev',
  config: {
    dependencies: {
      react: '^18.3.1',
      'react-native': '^0.76.5',
      expo: '^52.0.23',
    },
    devDependencies: {
      '@types/react': '^18.3.12',
      typescript: '^5.7.2',
    },
    files: [],
    scripts: {
      dev: 'expo start',
      android: 'expo run:android',
      ios: 'expo run:ios',
      test: 'jest',
    },
  },
  customization: [
    {
      id: 'typescript',
      label: 'TypeScript',
      type: 'boolean',
      default: true,
      category: 'core',
    },
  ],
  meta: {
    popularity: 75,
    complexity: 4,
    setupTime: 15,
  },
};

const MONOREPO_TEMPLATE: ProjectTemplate = {
  id: 'monorepo',
  name: 'Monorepo',
  description: 'Multi-package workspace with pnpm workspaces',
  category: 'specialized',
  tags: ['monorepo', 'workspace', 'turborepo', 'pnpm'],
  icon: 'GitBranch',
  version: '1.0.0',
  author: 'Community',
  config: {
    dependencies: {},
    devDependencies: {
      turbo: '^2.3.3',
    },
    files: [
      {
        path: 'pnpm-workspace.yaml',
        content: `packages:
  - 'packages/*'`,
      },
    ],
    scripts: {
      dev: 'turbo dev',
      build: 'turbo build',
      test: 'turbo test',
    },
  },
  customization: [],
  meta: {
    popularity: 60,
    complexity: 5,
    setupTime: 10,
  },
};

const MICROSERVICES_TEMPLATE: ProjectTemplate = {
  id: 'microservices',
  name: 'Microservices',
  description: 'Dockerized microservices setup with Docker Compose',
  category: 'specialized',
  tags: ['microservices', 'docker', 'docker-compose', 'kubernetes'],
  icon: 'Container',
  version: '1.0.0',
  author: 'Community',
  config: {
    dependencies: {},
    devDependencies: {},
    files: [
      {
        path: 'docker-compose.yml',
        content: `version: '3.8'

services:
  api:
    build: ./services/api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development

  worker:
    build: ./services/worker
    depends_on:
      - api`,
      },
    ],
    scripts: {
      dev: 'docker-compose up',
      build: 'docker-compose build',
      test: 'docker-compose run test',
    },
  },
  customization: [],
  meta: {
    popularity: 55,
    complexity: 5,
    setupTime: 20,
  },
};

// ============================================================================
// Template Registry
// ============================================================================

const TEMPLATES: ProjectTemplate[] = [
  // Frontend (4)
  REACT_VITE_TEMPLATE,
  VUE3_TEMPLATE,
  NEXTJS_TEMPLATE,
  SVELTEKIT_TEMPLATE,
  // Backend (5)
  NODE_EXPRESS_TEMPLATE,
  NODE_FASTIFY_TEMPLATE,
  PYTHON_FLASK_TEMPLATE,
  PYTHON_DJANGO_TEMPLATE,
  GO_TEMPLATE,
  // Full-Stack (4)
  MERN_TEMPLATE,
  MEAN_TEMPLATE,
  PERN_TEMPLATE,
  JAMSTACK_TEMPLATE,
  // Specialized (4)
  ELECTRON_TEMPLATE,
  REACT_NATIVE_TEMPLATE,
  MONOREPO_TEMPLATE,
  MICROSERVICES_TEMPLATE,
];

// ============================================================================
// Template Registry API
// ============================================================================

/**
 * Get all templates
 */
export function getAllTemplates(): ProjectTemplate[] {
  return TEMPLATES;
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ProjectTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): ProjectTemplate[] {
  return TEMPLATES.filter((t) => t.category === category);
}

/**
 * Get featured templates
 */
export function getFeaturedTemplates(): ProjectTemplate[] {
  return TEMPLATES.filter((t) => t.meta?.featured);
}

/**
 * Search templates by query
 */
export function searchTemplates(query: string): ProjectTemplate[] {
  const lowerQuery = query.toLowerCase();
  return TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Filter templates by options
 */
export function filterTemplates(options: TemplateFilterOptions): ProjectTemplate[] {
  let filtered = TEMPLATES;

  // Category filter
  if (options.category && options.category !== 'all') {
    filtered = filtered.filter((t) => t.category === options.category);
  }

  // Search filter
  if (options.search) {
    const lowerQuery = options.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Tag filter
  if (options.tags && options.tags.length > 0) {
    filtered = filtered.filter((t) =>
      options.tags!.some((tag) => t.tags.includes(tag))
    );
  }

  // Popularity filter
  if (options.minPopularity) {
    filtered = filtered.filter(
      (t) => (t.meta?.popularity || 0) >= options.minPopularity!
    );
  }

  // Complexity filter
  if (options.maxComplexity) {
    filtered = filtered.filter(
      (t) => (t.meta?.complexity || 5) <= options.maxComplexity!
    );
  }

  // Featured only
  if (options.featuredOnly) {
    filtered = filtered.filter((t) => t.meta?.featured);
  }

  // Include beta
  if (!options.includeBeta) {
    filtered = filtered.filter((t) => !t.meta?.beta);
  }

  return filtered;
}

/**
 * Get template statistics
 */
export function getTemplateStatistics() {
  return {
    total: TEMPLATES.length,
    byCategory: {
      frontend: TEMPLATES.filter((t) => t.category === 'frontend').length,
      backend: TEMPLATES.filter((t) => t.category === 'backend').length,
      fullstack: TEMPLATES.filter((t) => t.category === 'fullstack').length,
      specialized: TEMPLATES.filter((t) => t.category === 'specialized').length,
    },
  };
}

// Export templates array for direct access if needed
export { TEMPLATES };
