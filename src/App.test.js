import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import App from './App';

test('renders app without crashing', () => {
  render(
    <HeroUIProvider>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </HeroUIProvider>
  );
});
