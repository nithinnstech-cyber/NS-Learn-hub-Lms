'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signup } from '@/app/actions/auth';
import type { FormState } from '@/lib/definitions';

export default function RegisterPage() {
  const [state, action, pending] = useActionState(signup, undefined as FormState);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="navbar-logo-icon">🎓</div>
          <span>LearnHub</span>
        </div>

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Start your learning journey today</p>

        {state?.errors?.general && (
          <div className="alert alert-error mb-2">
            ⚠️ {state.errors.general[0]}
          </div>
        )}

        <form action={action} id="register-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="John Doe"
              required
            />
            {state?.errors?.name && (
              <span className="form-error">⚠ {state.errors.name[0]}</span>
            )}
          </div>

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
              placeholder="Min. 8 characters"
              required
            />
            {state?.errors?.password && (
              <span className="form-error">⚠ {state.errors.password[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">I am a...</label>
            <select id="role" name="role" className="form-select">
              <option value="STUDENT">👨‍🎓 Student – I want to learn</option>
              <option value="INSTRUCTOR">👨‍🏫 Instructor – I want to teach</option>
            </select>
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            disabled={pending}
            className="btn btn-primary btn-full"
            style={{ marginTop: '0.5rem', padding: '0.85rem' }}
          >
            {pending ? (
              <>
                <span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Creating account...
              </>
            ) : (
              '🚀 Create Free Account'
            )}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
