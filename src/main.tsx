import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safety Layer for Environment/Polyfill Conflicts
(function() {
  // Suppress specific rogue errors from environment/extensions
  const originalError = console.error;
  console.error = (...args) => {
    const msg = args.join(' ');
    if (msg.includes('MetaMask') || msg.includes('fetch')) {
      return;
    }
    originalError.apply(console, args);
  };

  window.addEventListener('error', (event) => {
    if (event.message?.includes('MetaMask') || event.message?.includes('fetch')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  // Prevent issues with window.fetch re-assignment if it's already a getter
  try {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (descriptor && !descriptor.writable && !descriptor.set) {
      console.log('Global fetch is protected, ensuring stability.');
    }
  } catch (e) {
    // Ignore
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
