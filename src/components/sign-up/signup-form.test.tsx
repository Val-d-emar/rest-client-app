import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SignUpForm from './signup-form';

vi.mock('@/context/AuthContext');
vi.mock('../sign-in/form-content', () => ({
  default: ({ onSignUp }: { onSignUp?: (userData: any) => void }) => (
    <div data-testid='form-content'>
      Mocked FormContent
      {onSignUp && <span data-testid='signup-prop'>onSignUp prop received</span>}
    </div>
  ),
}));

describe.skip('SignUpForm Component', () => {
  it('renders without crashing', () => {
    render(<SignUpForm />);

    expect(screen.getByTestId('form-content')).toBeInTheDocument();
  });

  it('renders wrapper div with correct className', () => {
    const { container } = render(<SignUpForm />);

    const wrapperDiv = container.querySelector('.wrapper');
    expect(wrapperDiv).toBeInTheDocument();
    expect(wrapperDiv).toHaveClass('wrapper');
  });

  it('contains FormContent component', () => {
    render(<SignUpForm />);

    const formContent = screen.getByTestId('form-content');
    expect(formContent).toBeInTheDocument();
    expect(formContent).toHaveTextContent('Mocked FormContent');
  });

  it('passes onSignUp prop to FormContent', () => {
    render(<SignUpForm />);

    expect(screen.getByTestId('signup-prop')).toBeInTheDocument();
    expect(screen.getByText('onSignUp prop received')).toBeInTheDocument();
  });

  it('has correct structure', () => {
    const { container } = render(<SignUpForm />);

    const wrapperDiv = container.querySelector('.wrapper');
    const formContent = screen.getByTestId('form-content');

    expect(wrapperDiv).toContainElement(formContent);
  });

  it('applies CSS classes correctly', () => {
    const { container } = render(<SignUpForm />);

    const wrapperDiv = container.querySelector('.wrapper');
    expect(wrapperDiv).toBeInTheDocument();
    expect(wrapperDiv?.children).toHaveLength(1);
  });

  it('is a functional component', () => {
    expect(typeof SignUpForm).toBe('function');
    expect(SignUpForm.name).toBe('SignUpForm');
  });

  it('renders as React.FC type', () => {
    const component = render(<SignUpForm />);
    expect(component).toBeDefined();
    expect(component.container).toBeInTheDocument();
  });
});
