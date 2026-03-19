'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EnrolledCourse {
  id: string;
  enrolledAt: string;
  progress: number;
  completedLessons: number;
  course: {
    id: string;
    title: string;
    thumbnail: string | null;
    category: string;
    totalLessons: number;
    instructor: { name: string };
  };
}

interface Props {
  session: { name: string; role: string };
}

export default function DashboardClient({ session }: Props) {
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetch('/api/enrollments');
        const data = await res.json();
        setEnrollments(data.enrollments || []);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const completedCourses = enrollments.filter((e) => e.progress === 100).length;
  const inProgress = enrollments.filter((e) => e.progress > 0 && e.progress < 100).length;
  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((a, e) => a + e.progress, 0) / enrollments.length)
    : 0;

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-base)', padding: '2rem 0' }}>
      <div className="container">
        {/* Welcome Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>
            Welcome back, <span className="text-gradient">{session.name.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Here's your learning progress at a glance.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.15)' }}>📚</div>
            <div className="stat-num text-gradient">{enrollments.length}</div>
            <div className="stat-label">Enrolled Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>✅</div>
            <div className="stat-num" style={{ color: 'var(--success)' }}>{completedCourses}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.15)' }}>⚡</div>
            <div className="stat-num" style={{ color: 'var(--secondary)' }}>{inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>📈</div>
            <div className="stat-num" style={{ color: 'var(--accent)' }}>{avgProgress}%</div>
            <div className="stat-label">Avg Progress</div>
          </div>
        </div>

        {/* Instructor CTA */}
        {session.role === 'INSTRUCTOR' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.1) 100%)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginBottom: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <div>
              <h3 style={{ marginBottom: '0.25rem' }}>🏫 Instructor Panel</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your courses, sections, and lessons.</p>
            </div>
            <Link href="/instructor" className="btn btn-primary">
              Go to Instructor Panel →
            </Link>
          </div>
        )}

        {/* My Courses */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem' }}>My Courses</h2>
            <Link href="/courses" className="btn btn-ghost btn-sm">Browse More →</Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📚</div>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>No courses yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Enroll in a course to start your learning journey!</p>
              <Link href="/courses" className="btn btn-primary">
                🚀 Explore Courses
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="enrolled-card">
                  {enrollment.course.thumbnail ? (
                    <img
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                      className="enrolled-thumb"
                    />
                  ) : (
                    <div className="enrolled-thumb" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '2rem', background: 'var(--bg-elevated)',
                    }}>📚</div>
                  )}

                  <div className="enrolled-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.4rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.3 }}>
                        {enrollment.course.title}
                      </h3>
                      <span className="badge badge-secondary" style={{ flexShrink: 0 }}>
                        {enrollment.course.category}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      👨‍🏫 {enrollment.course.instructor.name} · {enrollment.completedLessons}/{enrollment.course.totalLessons} lessons
                    </div>

                    <div style={{ marginBottom: '0.5rem' }}>
                      <div className="progress-bar" style={{ height: 5 }}>
                        <div className="progress-fill" style={{ width: `${enrollment.progress}%` }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {enrollment.progress}% complete
                        {enrollment.progress === 100 && ' 🎉'}
                      </span>
                      <Link
                        href={`/learn/${enrollment.course.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        {enrollment.progress === 0 ? '▶ Start' : enrollment.progress === 100 ? '↺ Review' : '▶ Continue'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
