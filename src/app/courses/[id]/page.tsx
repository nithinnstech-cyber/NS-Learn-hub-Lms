'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Lesson {
  id: string;
  title: string;
  youtubeId: string;
  youtubeUrl: string;
  duration: string | null;
  order: number;
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  category: string;
  level: string;
  totalLessons: number;
  instructor: { id: string; name: string; avatar: string | null; bio: string | null };
  sections: Section[];
  _count: { enrollments: number };
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        const data = await res.json();
        setCourse(data.course);
        setIsEnrolled(data.isEnrolled);
        if (data.course?.sections?.[0]) {
          setExpandedSection(data.course.sections[0].id);
        }
      } catch {
        router.push('/courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, router]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        setIsEnrolled(true);
        router.push(`/learn/${courseId}`);
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch {
      //
    } finally {
      setEnrolling(false);
    }
  };

  const totalLessons = course?.sections.reduce((acc, s) => acc + s.lessons.length, 0) || 0;

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div style={{ minHeight: '100vh' }}>
        {/* Hero Banner */}
        <div style={{
          background: 'linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-base) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '3rem 0',
        }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-secondary">{course.category}</span>
                  <span className="badge badge-primary">{course.level}</span>
                </div>

                <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem', lineHeight: 1.2 }}>{course.title}</h1>

                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                  {course.description}
                </p>

                <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span>📚 {totalLessons} lessons</span>
                  <span>📂 {course.sections.length} sections</span>
                  <span>👥 {course._count.enrollments} enrolled</span>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--bg-elevated)',
                    border: '2px solid var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, color: 'var(--primary-light)',
                  }}>
                    {course.instructor.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{course.instructor.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Instructor</div>
                  </div>
                </div>
              </div>

              {/* Enroll Card */}
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                position: 'sticky',
                top: '80px',
                boxShadow: 'var(--shadow-primary)',
              }}>
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    style={{ width: '100%', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', aspectRatio: '16/9', objectFit: 'cover' }}
                  />
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>This course includes:</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <span>🎥 {totalLessons} YouTube video lessons</span>
                    <span>📂 {course.sections.length} structured sections</span>
                    <span>✅ Progress tracking</span>
                    <span>♾️ Lifetime access</span>
                  </div>
                </div>

                {isEnrolled ? (
                  <Link href={`/learn/${courseId}`} className="btn btn-primary btn-full btn-lg">
                    ▶️ Continue Learning
                  </Link>
                ) : (
                  <button
                    id="enroll-btn"
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="btn btn-primary btn-full btn-lg"
                  >
                    {enrolling ? 'Enrolling...' : '🎓 Enroll Now – Free'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum */}
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Course Curriculum</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {course.sections.map((section) => (
              <div key={section.id} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textAlign: 'left',
                  }}
                >
                  <span>📂 {section.title}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <span>{section.lessons.length} lessons</span>
                    <span>{expandedSection === section.id ? '▼' : '▶'}</span>
                  </span>
                </button>

                {expandedSection === section.id && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    {section.lessons.map((lesson, idx) => (
                      <div key={lesson.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1.25rem',
                        borderBottom: idx < section.lessons.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        fontSize: '0.88rem',
                        color: 'var(--text-secondary)',
                      }}>
                        <span style={{ color: 'var(--text-muted)', width: 20, textAlign: 'center', flexShrink: 0 }}>
                          {idx + 1}
                        </span>
                        <span>🎥</span>
                        <span style={{ flex: 1 }}>{lesson.title}</span>
                        {lesson.duration && (
                          <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{lesson.duration}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
