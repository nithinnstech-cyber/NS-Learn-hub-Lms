'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { login } from '@/app/actions/auth';
import type { FormState } from '@/lib/definitions';

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined as FormState);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="navbar-logo-icon">🎓</div>
          <span>LearnHub</span>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Log in to continue your learning journey</p>

        {state?.errors?.general && (
          <div className="alert alert-error mb-2">
            ⚠️ {state.errors.general[0]}
          </div>
        )}

        <form action={action} id="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              required
            />
            {state?.errors?.email && (
              <span className="form-error">⚠ {state.errors.email[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              required
            />
            {state?.errors?.password && (
              <span className="form-error">⚠ {state.errors.password[0]}</span>
            )}
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={pending}
            className="btn btn-primary btn-full"
            style={{ marginTop: '0.5rem', padding: '0.85rem' }}
          >
            {pending ? (
              <>
                <span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Logging in...
              </>
            ) : (
              '🔑 Log In'
            )}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
