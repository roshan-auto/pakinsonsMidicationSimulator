import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the medication simulator', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1, name: /medication simulator/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /current medications/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /estimated effects/i })).toBeInTheDocument();
});
