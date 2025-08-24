# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Urine Detector Frontend

A modern React TypeScript application with Tailwind CSS for AI-powered urine analysis.

## Features

- **Modern UI**: Built with React 19, TypeScript, and Tailwind CSS
- **Image Upload**: Drag and drop or click to upload images
- **Color Picker**: Click on images to select color points for analysis
- **Real-time Analysis**: Get instant AI-powered analysis results
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Comprehensive error handling and user feedback

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Usage

1. **Upload an Image**: Click on the upload area or drag and drop an image file
2. **Select Color Point**: Click anywhere on the uploaded image to select a color point for analysis
3. **Analyze**: Click the "Analyze Image" button to get AI-powered results
4. **View Results**: See the prediction, confidence level, and RGB values

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ColorPickerDisplay.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorAlert.tsx
│   └── index.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── api.ts
├── App.tsx             # Main application component
├── App.css             # Custom styles
├── main.tsx            # Application entry point
└── index.css           # Global styles with Tailwind CSS
```

## Technologies Used

- **React 19**: Latest React with modern features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server
- **Axios**: HTTP client for API requests
- **Lucide React**: Beautiful icon library

## API Integration

The frontend communicates with a FastAPI backend running on `http://localhost:8000`. The main endpoint is:

- `POST /predict`: Upload image and RGB values for analysis

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Environment Configuration

The API configuration can be found in `src/types/index.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  ENDPOINTS: {
    PREDICT: '/predict',
    HEALTH: '/health'
  }
} as const;
```

## Building for Production

1. Build the application:
```bash
npm run build
```

2. The built files will be in the `dist` directory

3. Preview the production build:
```bash
npm run preview
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
