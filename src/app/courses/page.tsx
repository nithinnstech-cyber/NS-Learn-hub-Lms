'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  category: string;
  level: string;
  totalLessons: number;
  enrolledCount: number;
  instructor: { name: string; avatar: string | null };
}

const CATEGORIES = ['all', 'JavaScript', 'Python', 'React', 'Java', 'Machine Learning', 'Data Science', 'CSS', 'Node.js', 'TypeScript'];
const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: 'badge-success',
  INTERMEDIATE: 'badge-warning',
  ADVANCED: 'badge-primary',
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await fetch(`/api/courses?${params}`);
      const data = await res.json();
      setCourses(data.courses || []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [category, debouncedSearch]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
      <div style={{ padding: '0', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '2.5rem 0 1.5rem',
        }}>
          <div className="container">
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
              Explore <span className="text-gradient">Courses</span>
            </h1>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 480, marginBottom: '1.5rem' }}>
              <span style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', fontSize: '1rem',
              }}>🔍</span>
              <input
                id="course-search"
                type="text"
                className="form-input"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>

            {/* Category Tabs */}
            <div className="category-tabs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  id={`cat-${cat}`}
                  className={`category-tab ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat === 'all' ? 'All Courses' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="container" style={{ padding: '2rem 1.5rem' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div className="skeleton" style={{ aspectRatio: '16/9' }} />
                  <div style={{ padding: '1.25rem', background: 'var(--bg-card)' }}>
                    <div className="skeleton" style={{ height: 12, borderRadius: 99, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 18, borderRadius: 99, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 18, width: '70%', borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No courses found</h3>
              <p>Try a different search term or category</p>
            </div>
          ) : (
            <div className="grid-courses">
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
                  <div className="course-card">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="course-thumbnail"
                      />
                    ) : (
                      <div className="course-thumbnail-placeholder">
                        📚
                      </div>
                    )}

                    <div className="course-body">
                      <div className="course-meta">
                        <span className={`badge ${LEVEL_COLORS[course.level] || 'badge-primary'}`}>
                          {course.level}
                        </span>
                        <span className="badge badge-secondary">{course.category}</span>
                      </div>

                      <h3 className="course-title">{course.title}</h3>

                      <div className="course-instructor">
                        <span>👨‍🏫</span>
                        <span>{course.instructor.name}</span>
                      </div>

                      <div className="course-stats">
                        <span className="course-stat">
                          <span>📚</span>
                          <span>{course.totalLessons} lessons</span>
                        </span>
                        <span className="course-stat">
                          <span>👥</span>
                          <span>{course.enrolledCount} students</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && courses.length > 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2rem' }}>
              Showing {courses.length} course{courses.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
    </div>
  );
}
