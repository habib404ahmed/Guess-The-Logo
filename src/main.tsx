import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GameProvider } from '@/contexts/GameContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppRouter } from '@/components/layout/AppRouter';
import '@/styles/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root element not found in index.html');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <GameProvider>
          <AppRouter />
        </GameProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
