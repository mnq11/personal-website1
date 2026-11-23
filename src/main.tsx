import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { cvStyleFromPath } from './lib/cv';
import { CvPage } from './pages/CvPage';
import { LanguageProvider } from './i18n/LanguageProvider';
import './styles/global.css';

// Scroll reveals need IntersectionObserver and are skipped for visitors who prefer reduced motion.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('reveal');
}

const isCv = /^\/cv(-[a-z]+)?\/?$/.test(window.location.pathname);

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element in index.html');

createRoot(root).render(
  <StrictMode>
    <LanguageProvider>{isCv ? <CvPage style={cvStyleFromPath(window.location.pathname)} /> : <App />}</LanguageProvider>
  </StrictMode>,
);
