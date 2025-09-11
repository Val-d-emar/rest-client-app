'use client';

import { useAuth } from '@/context/AuthContext';
import { dbg } from '@/log';
import { toast } from 'react-hot-toast';

export default function TestPage() {
  const loadDuration = Number(process.env.NEXT_PUBLIC_TOAST_DURATION) || 10000;
  dbg('loadDuration=', loadDuration);
  const { user, signOut } = useAuth();

  const handleCheckProtectedData = async () => {
    const toastId = toast.loading('Checking session validity...');
    if (!user) {
      toast.error('User is not signed in.', { id: toastId });
      return;
    }

    try {
      await user.getIdToken(true);

      toast.success('Access granted! Your session is valid.', { id: toastId });
    } catch (error: any) {
      dbg('Session check failed:', error);
      toast.error('Access Denied! Your session has expired.', { id: toastId });

      await signOut();
    }
  };

  const showInlineCustomToast = () => {
    toast.custom(
      (t) => (
        <div
          className={`card ${t.visible ? 'animate-enter' : 'animate-leave'}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            minWidth: '300px',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>ℹ️</span>

          <div style={{ flexGrow: 1 }}>
            <h3 className='bold' style={{ margin: 0 }}>
              Custom Toast
            </h3>
            <p style={{ margin: 0 }}>Hello world!.</p>
          </div>

          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: '0.25rem',
              lineHeight: 1,
              background: 'transparent',
              color: 'var(--color)',
            }}
          >
            ✖
          </button>
        </div>
      ),
      {
        position: 'top-right',
        duration: loadDuration,
      },
    );
  };
  return (
    <div className='centered-container'>
      <h1>Test Page</h1>
      <button type='button' onClick={() => toast.success('Notifications are working!')}>
        Show Test 1
      </button>
      <button type='button' onClick={() => toast.error('Something went wrong!')}>
        Show Test 2
      </button>
      <button
        type='button'
        onClick={() =>
          toast.loading('Loading...', {
            duration: loadDuration,
          })
        }
      >
        Show Test 3
      </button>
      <button type='button' onClick={showInlineCustomToast}>
        Show Test 4
      </button>
      <button onClick={handleCheckProtectedData}>Check Access</button>
    </div>
  );
}
