import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import VariablesPage from './variables-page';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/context/AuthContext';

vi.mock('@/hooks/useLocalStorage');
vi.mock('@/context/AuthContext');
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('VariablesPage Component', () => {
  const mockSetVariables = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as Mock).mockReturnValue({
      user: { uid: 'test-user-123' },
    });
  });

  it('should display existing variables and allow adding a new one', async () => {
    const initialVariables = [{ id: '1', key: 'baseUrl', value: 'https://api.example.com' }];
    (useLocalStorage as Mock).mockReturnValue([initialVariables, mockSetVariables]);

    render(<VariablesPage />);

    expect(screen.getByDisplayValue('baseUrl')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://api.example.com')).toBeInTheDocument();

    const addButton = screen.getByRole('button', { name: /addButton/i });
    await user.click(addButton);

    expect(mockSetVariables).toHaveBeenCalledTimes(1);

    const lastCall = mockSetVariables.mock.calls[0][0];
    expect(lastCall).toHaveLength(2);

    expect(lastCall[1].key).toBe('');
    expect(lastCall[1].value).toBe('');
  });

  it('should allow editing a variable', async () => {
    const initialVariables = [{ id: '1', key: 'baseUrl', value: 'https://api.example.com' }];
    (useLocalStorage as Mock).mockReturnValue([initialVariables, mockSetVariables]);

    render(<VariablesPage />);

    const keyInput = screen.getByDisplayValue('baseUrl');

    fireEvent.change(keyInput, { target: { value: 'newBaseUrl' } });

    expect(mockSetVariables).toHaveBeenCalled();

    const lastCallArguments = mockSetVariables.mock.calls[mockSetVariables.mock.calls.length - 1];
    const newVariablesState = lastCallArguments[0];

    expect(newVariablesState[0].key).toBe('newBaseUrl');
  });

  it('should allow removing a variable', async () => {
    const initialVariables = [
      { id: '1', key: 'baseUrl', value: 'https://api.example.com' },
      { id: '2', key: 'apiKey', value: 'secret' },
    ];
    (useLocalStorage as Mock).mockReturnValue([initialVariables, mockSetVariables]);

    render(<VariablesPage />);

    const deleteButtons = screen.getAllByRole('button', { name: /deleteButton/i });
    await user.click(deleteButtons[0]);

    expect(mockSetVariables).toHaveBeenCalledTimes(1);
    const lastCall = mockSetVariables.mock.calls[0][0];
    expect(lastCall).toHaveLength(1);
    expect(lastCall[0].key).toBe('apiKey');
  });
});
