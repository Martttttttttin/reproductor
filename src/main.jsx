import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import App from './App.jsx';
import './styles.css';

config.autoAddCss = false; // el CSS de Font Awesome ya se importa arriba

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
