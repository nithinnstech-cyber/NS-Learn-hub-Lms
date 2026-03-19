'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Lesson {
  id: string;
  title: string;
  youtubeId: string;
  youtubeUrl: string;
  duration: string | null;
  order: number;
  description?: string;
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
  sections: Section[];
}

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const allLessons = course?.sections.flatMap((s) => s.lessons) || [];
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [courseRes, progressRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/progress?courseId=${courseId}`),
      ]);

      const courseData = await courseRes.json();
      const progressData = await progressRes.json();

      if (!courseData.course || !courseData.isEnrolled) {
        router.push(`/courses/${courseId}`);
        return;
      }

      setCourse(courseData.course);
      setCompletedIds(new Set(progressData.completedLessonIds || []));
      setProgress(progressData.percentage || 0);
      setTotalLessons(progressData.totalLessons || 0);

      // Set first lesson or first uncompleted lesson
      const lessons = courseData.course.sections.flatMap((s: Section) => s.lessons);
      const firstUncompleted = lessons.find(
        (l: Lesson) => !(progressData.completedLessonIds || []).includes(l.id)
      );
      setCurrentLesson(firstUncompleted || lessons[0]);

      // Expand all sections initially
      const sectionIds = new Set<string>(courseData.course.sections.map((s: Section) => s.id));
      setExpandedSections(sectionIds);
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [courseId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markComplete = async () => {
    if (!currentLesson) return;
    setMarkingComplete(true);
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: currentLesson.id, courseId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCompletedIds((prev) => new Set([...prev, currentLesson.id]));
        setProgress(data.percentage);
        // Auto-advance to next lesson
        if (nextLesson) {
          setTimeout(() => setCurrentLesson(nextLesson), 500);
        }
      }
    } finally {
      setMarkingComplete(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div className="loading-spinner" style={{ width: 48, height: 48 }} />
      </div>
    );
  }

  if (!course || !currentLesson) return null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* Top Bar */}
      <div style={{
        height: 56,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.25rem',
        gap: '1rem',
        flexShrink: 0,
        zIndex: 50,
      }}>
        <Link href={`/courses/${courseId}`} style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          ← Back
        </Link>
        <div style={{ height: 20, width: 1, background: 'var(--border-subtle)' }} />
        <span style={{ fontWeight: 600, fontSize: '0.95rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {course.title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {completedIds.size}/{totalLessons} lessons
          </span>
          <div style={{ width: 100 }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 600 }}>{progress}%</span>
        </div>
      </div>

      {/* Main Learn Layout */}
      <div className="learn-layout" style={{ flex: 1, overflow: 'hidden' }}>
        {/* Main Content */}
        <div className="learn-main">
          {/* Video Player */}
          <div className="video-container">
            <iframe
              key={currentLesson.youtubeId}
              src={`https://www.youtube.com/embed/${currentLesson.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={currentLesson.title}
            />
          </div>

          {/* Lesson Info */}
          <div className="learn-content">
            <div className="lesson-title-bar">
              <div>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{currentLesson.title}</h2>
                {currentLesson.duration && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>⏱ {currentLesson.duration}</span>
                )}
              </div>

              <div className="lesson-nav-btns">
                {prevLesson && (
                  <button
                    id="prev-lesson-btn"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setCurrentLesson(prevLesson)}
                  >
                    ← Prev
                  </button>
                )}
                {completedIds.has(currentLesson.id) ? (
                  <span className="badge badge-success" style={{ padding: '0.5rem 1rem' }}>✓ Completed</span>
                ) : (
                  <button
                    id="mark-complete-btn"
                    className="btn btn-primary btn-sm"
                    onClick={markComplete}
                    disabled={markingComplete}
                  >
                    {markingComplete ? '...' : '✓ Mark Complete'}
                  </button>
                )}
                {nextLesson && (
                  <button
                    id="next-lesson-btn"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentLesson(nextLesson)}
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>

            {currentLesson.description && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
              }}>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>About this lesson</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {currentLesson.description.slice(0, 400)}
                  {currentLesson.description.length > 400 && '...'}
                </p>
              </div>
            )}

            {/* Completion state */}
            {completedIds.size === totalLessons && totalLessons > 0 && (
              <div className="alert alert-success" style={{ marginTop: '1.5rem', fontSize: '1rem' }}>
                🎉 <strong>Congratulations!</strong> You have completed this course!
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="learn-sidebar">
          <div className="sidebar-header">
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>Course Content</div>
            <div className="sidebar-progress-text">
              {completedIds.size} of {totalLessons} lessons completed
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="section-list">
            {course.sections.map((section) => (
              <div key={section.id} className="section-item">
                <button
                  className="section-title-btn"
                  onClick={() => toggleSection(section.id)}
                >
                  <span>📂 {section.title}</span>
                  <span>{expandedSections.has(section.id) ? '▼' : '▶'}</span>
                </button>

                {expandedSections.has(section.id) && (
                  <div>
                    {section.lessons.map((lesson) => {
                      const isCompleted = completedIds.has(lesson.id);
                      const isCurrent = lesson.id === currentLesson?.id;
                      return (
                        <div
                          key={lesson.id}
                          id={`lesson-${lesson.id}`}
                          className={`lesson-list-item ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                          onClick={() => setCurrentLesson(lesson)}
                        >
                          <div className={`lesson-check ${isCompleted ? 'done' : isCurrent ? 'current' : ''}`}>
                            {isCompleted ? '✓' : isCurrent ? '▶' : ''}
                          </div>
                          <span className={`lesson-item-title ${isCurrent ? 'active' : ''}`}>
                            {lesson.title}
                          </span>
                          {lesson.duration && (
                            <span className="lesson-duration">{lesson.duration}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
