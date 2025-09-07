import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SignInForm from './signin-form';
import { useAuth } from '@/context/AuthContext';

vi.mock('@/context/AuthContext');

vi.mock('./form-content', () => ({
  default: ({ onSignIn }: { onSignIn?: (userData: any) => void }) => (
    <div data-testid='form-content'>
      Mocked FormContent
      {onSignIn && <span data-testid='signin-prop'>onSignIn prop received</span>}
    </div>
  ),
}));

describe.skip('SignInForm Component', () => {
  it('renders without crashing', () => {
    render(<SignInForm />);

    expect(screen.getByTestId('form-content')).toBeInTheDocument();
  });

  it('renders wrapper div with correct className', () => {
    const { container } = render(<SignInForm />);

    const wrapperDiv = container.querySelector('.wrapper');
    expect(wrapperDiv).toBeInTheDocument();
    expect(wrapperDiv).toHaveClass('wrapper');
  });

  it('contains FormContent component', () => {
    render(<SignInForm />);

    const formContent = screen.getByTestId('form-content');
    expect(formContent).toBeInTheDocument();
    expect(formContent).toHaveTextContent('Mocked FormContent');
  });

  it('has correct structure', () => {
    const { container } = render(<SignInForm />);

    const wrapperDiv = container.querySelector('.wrapper');
    const formContent = screen.getByTestId('form-content');

    expect(wrapperDiv).toContainElement(formContent);
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
    const firstRender = screen.getByTestId('form-content');
    expect(firstRender).toBeInTheDocument();

    unmount();

    render(<SignInForm />);
    const secondRender = screen.getByTestId('form-content');
    expect(secondRender).toBeInTheDocument();
    expect(secondRender).toHaveTextContent('Mocked FormContent');
  });

  it('has accessible structure', () => {
    const { container } = render(<SignInForm />);

    const wrapperDiv = container.querySelector('.wrapper');
    expect(wrapperDiv).toBeInTheDocument();

    expect(wrapperDiv?.tagName).toBe('DIV');
  });

  it('passes onSignIn prop to FormContent', () => {
    render(<SignInForm />);

    expect(screen.getByTestId('signin-prop')).toBeInTheDocument();
    expect(screen.getByText('onSignIn prop received')).toBeInTheDocument();
  });
});
