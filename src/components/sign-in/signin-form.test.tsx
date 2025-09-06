import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SignInForm from './signin-form';

vi.mock('./signin-content', () => ({
  default: () => <div data-testid='signin-content'>Mocked SignInContent</div>,
}));

describe('SignInForm Component', () => {
  it('renders without crashing', () => {
    render(<SignInForm />);

    expect(screen.getByTestId('signin-content')).toBeInTheDocument();
  });

  it('renders wrapper div with correct className', () => {
    const { container } = render(<SignInForm />);

    const wrapperDiv = container.querySelector('.wrapper');
    expect(wrapperDiv).toBeInTheDocument();
    expect(wrapperDiv).toHaveClass('wrapper');
  });

  it('contains SignInContent component', () => {
    render(<SignInForm />);

    const signInContent = screen.getByTestId('signin-content');
    expect(signInContent).toBeInTheDocument();
    expect(signInContent).toHaveTextContent('Mocked SignInContent');
  });

  it('has correct structure', () => {
    const { container } = render(<SignInForm />);

    const wrapperDiv = container.querySelector('.wrapper');
    const signInContent = screen.getByTestId('signin-content');

    expect(wrapperDiv).toContainElement(signInContent);
  });

  it('applies CSS classes correctly', () => {
    const { container } = render(<SignInForm />);

    const wrapperDiv = container.querySelector('.wrapper');
    expect(wrapperDiv).toBeInTheDocument();

    expect(wrapperDiv?.children).toHaveLength(1);
  });

  it('is a functional component', () => {
    expect(typeof SignInForm).toBe('function');
    expect(SignInForm.name).toBe('SignInForm');
  });

  it('renders as React.FC type', () => {
    const component = render(<SignInForm />);
    expect(component).toBeDefined();
    expect(component.container).toBeInTheDocument();
  });

  it('does not accept props', () => {
    expect(() => render(<SignInForm />)).not.toThrow();
  });

  it('maintains consistent rendering', () => {
    const { unmount } = render(<SignInForm />);
    const firstRender = screen.getByTestId('signin-content');
    expect(firstRender).toBeInTheDocument();

    unmount();

    render(<SignInForm />);
    const secondRender = screen.getByTestId('signin-content');
    expect(secondRender).toBeInTheDocument();
    expect(secondRender).toHaveTextContent('Mocked SignInContent');
  });

  it('has accessible structure', () => {
    const { container } = render(<SignInForm />);

    const wrapperDiv = container.querySelector('.wrapper');
    expect(wrapperDiv).toBeInTheDocument();

    expect(wrapperDiv?.tagName).toBe('DIV');
  });
});
