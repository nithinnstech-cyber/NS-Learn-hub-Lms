import Link from 'next/link';
import { getSession } from '@/lib/session';
import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NS LEARN HUB – Modern Learning Management System',
  description: 'Master new skills with YouTube-powered courses. Structured learning, progress tracking, and a beautiful interface.',
};

export default async function HomePage() {
  const session = await getSession();

  const features = [
    { icon: '🎥', title: 'YouTube-Powered', desc: 'Curated video lessons from YouTube embedded directly in your learning flow.' },
    { icon: '📊', title: 'Progress Tracking', desc: 'Track your completion percentage and resume exactly where you left off.' },
    { icon: '🏆', title: 'Structured Paths', desc: 'Courses organized into sections and lessons for a logical learning journey.' },
    { icon: '🔐', title: 'Role-Based Access', desc: 'Students learn, instructors teach. Each role has a tailored experience.' },
    { icon: '⚡', title: 'Instant Enrollment', desc: 'One click to enroll. Start learning immediately with no barriers.' },
    { icon: '🌐', title: 'Learn Anywhere', desc: 'Fully responsive design that works perfectly on any device.' },
  ];

  const categories = ['JavaScript', 'Python', 'Machine Learning', 'React', 'Java', 'Data Science'];

  return (
    <>
      <Navbar user={session ? { name: session.name, email: session.email, role: session.role } : null} />

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>✨</span>
              <span>YouTube-Powered Learning Platform</span>
            </div>

            <h1 className="hero-title">
              Learn Anything.<br />
              <span className="gradient-text">Master Everything.</span>
            </h1>

            <p className="hero-desc">
              Access structured courses powered by YouTube videos. Track your progress,
              complete lessons in order, and build real skills at your own pace.
            </p>

            <div className="hero-actions">
              {!session && (
                <>
                  <Link href="/register" className="btn btn-primary btn-lg">
                    🚀 Create Free Account
                  </Link>
                  <Link href="/login" className="btn btn-secondary btn-lg">
                    Log in →
                  </Link>
                </>
              )}
              {session && (
                <>
                  <Link href="/courses" className="btn btn-primary btn-lg">
                    🚀 Explore Courses
                  </Link>
                  <Link href="/dashboard" className="btn btn-secondary btn-lg">
                    My Dashboard →
                  </Link>
                </>
              )}
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-num">500+</div>
                <div className="hero-stat-label">Courses</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">10K+</div>
                <div className="hero-stat-label">Students</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">100%</div>
                <div className="hero-stat-label">Free to Start</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Why NS LEARN HUB?</h2>
            <p>Everything you need for a world-class learning experience in one platform.</p>
          </div>

          <div className="grid-3" style={{ '--grid-cols': '3' } as React.CSSProperties}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ animation: `fadeInUp 0.5s ease ${i * 0.1}s both` }}>
                <div className="card-inner">
                  <div style={{
                    width: 52, height: 52, borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', marginBottom: '1rem',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="section-header">
            <h2>Popular Categories</h2>
            <p>Dive into the most in-demand topics in tech and beyond.</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {categories.map((cat, i) => (
              <Link
                key={i}
                href={`/courses?category=${cat}`}
                className="category-tab"
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!session && (
        <section style={{
          padding: '5rem 0',
          background: 'var(--bg-surface)',
          textAlign: 'center',
        }}>
          <div className="container">
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              Ready to Start Learning?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
              Join thousands of learners. Create your free account today.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link href="/register" className="btn btn-primary btn-lg">
                🎓 Get Started Free
              </Link>
              <Link href="/login" className="btn btn-ghost btn-lg">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        borderTop: '1px solid var(--border-subtle)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span>🎓</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>NS LEARN HUB</span>
        </div>
        <p>© 2024 NS LEARN HUB. Built with Next.js, Prisma & YouTube API.</p>
      </footer>
    </>
  );
}
