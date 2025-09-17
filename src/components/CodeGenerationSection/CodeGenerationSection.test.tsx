import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CodeGenerationSection from './CodeGenerationSection';
import type { Language } from 'postman-code-generators';

vi.mock('react-hot-toast');
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const mockLanguages: Language[] = [
  {
    key: 'curl',
    label: 'cURL',
    syntax_mode: 'shell',
    variants: [{ key: 'curl', label: 'cURL' }],
  },
  {
    key: 'javascript',
    label: 'JavaScript',
    syntax_mode: 'javascript',
    variants: [
      { key: 'fetch', label: 'fetch' },
      { key: 'xhr', label: 'XHR' },
    ],
  },
];

describe('CodeGenerationSection Component', () => {
  const user = userEvent.setup();
  const mockSetSelectedLanguage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the title and default placeholder when no code is provided', () => {
    render(
      <CodeGenerationSection
        languages={mockLanguages}
        selectedLanguage='curl,curl'
        setSelectedLanguage={mockSetSelectedLanguage}
        generatedCode=''
      />,
    );

    expect(screen.getByRole('heading', { name: /codeGenerationTitle/i })).toBeInTheDocument();
    expect(screen.getByText('SelectLanguage')).toBeInTheDocument();
  });

  it('should render the select with all language options', () => {
    render(
      <CodeGenerationSection
        languages={mockLanguages}
        selectedLanguage='curl,curl'
        setSelectedLanguage={mockSetSelectedLanguage}
        generatedCode=''
      />,
    );

    expect(screen.getAllByRole('option')).toHaveLength(3);

    expect(screen.getByRole('option', { name: 'JavaScript - fetch' })).toBeInTheDocument();
  });

  it('should call setSelectedLanguage when a new language is selected', async () => {
    render(
      <CodeGenerationSection
        languages={mockLanguages}
        selectedLanguage='curl,curl'
        setSelectedLanguage={mockSetSelectedLanguage}
        generatedCode=''
      />,
    );

    const select = screen.getByRole('combobox');

    await user.selectOptions(select, 'javascript,fetch');

    expect(mockSetSelectedLanguage).toHaveBeenCalledWith('javascript,fetch');
  });

  it('should display the generated code and enable the copy button', () => {
    const code = "console.log('hello world');";
    render(
      <CodeGenerationSection
        languages={mockLanguages}
        selectedLanguage='javascript,fetch'
        setSelectedLanguage={mockSetSelectedLanguage}
        generatedCode={code}
      />,
    );

    expect(screen.getByText(code)).toBeInTheDocument();

    expect(screen.queryByText('SelectLanguage')).not.toBeInTheDocument();

    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('should call clipboard.writeText when copy button is clicked', async () => {
    const clipboardSpy = vi.spyOn(navigator, 'clipboard', 'get');

    const writeTextMock = vi.fn().mockResolvedValue(undefined);

    const mockClipboard = {
      writeText: writeTextMock,
      readText: vi.fn().mockResolvedValue(''),
      write: vi.fn().mockResolvedValue(undefined),
      read: vi.fn().mockResolvedValue([]),
    };

    clipboardSpy.mockReturnValue(mockClipboard as unknown as Clipboard);

    const code = "console.log('hello');";
    render(
      <CodeGenerationSection
        languages={mockLanguages}
        selectedLanguage='javascript,fetch'
        setSelectedLanguage={mockSetSelectedLanguage}
        generatedCode={code}
      />,
    );

    const copyButton = screen.getByRole('button', { name: /copyButton/i });
    await user.click(copyButton);

    expect(writeTextMock).toHaveBeenCalledWith(code);

    clipboardSpy.mockRestore();
  });
});
