import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '@fontsource-variable/rethink-sans';
import './styles.css';
import './refinements.css';
import './scale.css';
import './brand.css';
import './audit-fixes.css';
import './direction.css';
import './projects.css';
import './desktop-theme.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
