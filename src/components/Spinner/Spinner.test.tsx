import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Spinner from './Spinner';

describe('Spinner Component', () => {
  it('should render correctly', () => {
    render(<Spinner />);

    const spinnerElement = screen.getByTestId('spinner');

    expect(spinnerElement).toBeInTheDocument();
  });
});
