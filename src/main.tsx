import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '@fontsource-variable/rethink-sans';
import './styles.css';
import './refinements.css';
import './scale.css';
import './brand.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
