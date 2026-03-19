'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/app/actions/auth';

interface NavbarProps {
  user?: { name: string; email: string; role: string } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <div className="navbar-logo-icon">🎓</div>
          <span>NS LEARN HUB</span>
        </Link>

        {/* Links */}
        {user && (
          <ul className="navbar-links">
            <li>
              <Link href="/courses" className={pathname.startsWith('/courses') ? 'active' : ''}>
                Courses
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className={pathname === '/dashboard' ? 'active' : ''}>
                Dashboard
              </Link>
            </li>
            {(user.role === 'INSTRUCTOR' || user.role === 'ADMIN') && (
              <li>
                <Link href="/instructor" className={pathname.startsWith('/instructor') ? 'active' : ''}>
                  Instructor
                </Link>
              </li>
            )}
          </ul>
        )}

        {/* Actions */}
        <div className="navbar-actions">
          {!user ? (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          ) : (
            <div className="dropdown">
              <button
                className="avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                id="user-menu-btn"
                aria-expanded={dropdownOpen}
              >
                {initials}
              </button>

              {dropdownOpen && (
                <>
                  <div
                    style={{
                      position: 'fixed', inset: 0, zIndex: 100,
                    }}
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="dropdown-menu" style={{ zIndex: 200 }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      <div style={{ marginTop: '0.25rem' }}>
                        <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <Link href="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      📊 Dashboard
                    </Link>
                    {(user.role === 'INSTRUCTOR' || user.role === 'ADMIN') && (
                      <Link href="/instructor" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        🏫 Instructor Panel
                      </Link>
                    )}
                    <div className="dropdown-divider" />
                    <button className="dropdown-item" onClick={handleLogout} id="logout-btn">
                      🚪 Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
