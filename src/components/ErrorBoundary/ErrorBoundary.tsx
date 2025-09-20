'use client';

import { err } from '@/log';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (
      error.message.includes('auth/invalid-api-key') ||
      error.message.includes('Firebase: Error') ||
      error.message.includes('onIdTokenChanged is not a function') ||
      error.message.includes('getModularInstance')
    ) {
      return;
    }
    err('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className='centered-container'>
          <h2>Something went wrong!</h2>
          <p>An unexpected error occurred. Please try to reload the page.</p>
          <button onClick={() => window.location.reload()} className='error-button'>
            Reload the page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
