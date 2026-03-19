'use client';

import { useState, useEffect } from 'react';

interface Course {
  id: string;
  title: string;
  category: string;
  level: string;
  isPublished: boolean;
  totalLessons: number;
  thumbnail: string | null;
  _count?: { enrollments: number };
  enrolledCount?: number;
  sections: { _count: { lessons: number } }[];
}

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  channelTitle: string;
}

type Tab = 'courses' | 'create' | 'add-lessons';

const CATEGORIES = ['JavaScript', 'Python', 'React', 'Java', 'Machine Learning', 'Data Science', 'CSS', 'Node.js', 'TypeScript', 'Other'];
const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export default function InstructorClient() {
  const [tab, setTab] = useState<Tab>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Create course form
  const [formData, setFormData] = useState({ title: '', description: '', category: 'JavaScript', level: 'BEGINNER', thumbnail: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // YouTube search
  const [ytSearch, setYtSearch] = useState('');
  const [ytVideos, setYtVideos] = useState<YouTubeVideo[]>([]);
  const [ytLoading, setYtLoading] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<YouTubeVideo[]>([]);
  const [sectionTitle, setSectionTitle] = useState('');
  const [addingSection, setAddingSection] = useState(false);
  const [playlistId, setPlaylistId] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      setCourses(data.courses || []);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({ title: '', description: '', category: 'JavaScript', level: 'BEGINNER', thumbnail: '' });
        await fetchCourses();
        setTab('courses');
      } else {
        setCreateError(data.error || 'Failed to create course');
      }
    } catch {
      setCreateError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleYtSearch = async () => {
    if (!ytSearch.trim()) return;
    setYtLoading(true);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(ytSearch)}&maxResults=12`);
      const data = await res.json();
      setYtVideos(data.videos || []);
    } finally {
      setYtLoading(false);
    }
  };

  const toggleVideo = (video: YouTubeVideo) => {
    setSelectedVideos((prev) => {
      const exists = prev.find((v) => v.id === video.id);
      if (exists) return prev.filter((v) => v.id !== video.id);
      return [...prev, video];
    });
  };

  const addLessons = async () => {
    if (!selectedCourse || !sectionTitle || selectedVideos.length === 0) return;
    setAddingSection(true);
    try {
      const lessons = selectedVideos.map((v, idx) => ({
        title: v.title,
        youtubeUrl: `https://www.youtube.com/watch?v=${v.id}`,
        youtubeId: v.id,
        thumbnail: v.thumbnail,
        duration: v.duration,
        order: idx + 1,
        description: '',
      }));

      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: selectedCourse.id, title: sectionTitle, order: 1, lessons }),
      });

      if (res.ok) {
        setSectionTitle('');
        setSelectedVideos([]);
        setYtVideos([]);
        setYtSearch('');
        await fetchCourses();
        setTab('courses');
      }
    } finally {
      setAddingSection(false);
    }
  };

  const addFromPlaylist = async () => {
    if (!selectedCourse || !sectionTitle || !playlistId) return;
    setAddingSection(true);
    try {
      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: selectedCourse.id, title: sectionTitle, order: 1, playlistId }),
      });
      if (res.ok) {
        setSectionTitle('');
        setPlaylistId('');
        await fetchCourses();
        setTab('courses');
      }
    } finally {
      setAddingSection(false);
    }
  };

  const publishCourse = async (course: Course) => {
    await fetch(`/api/courses/${course.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !course.isPublished }),
    });
    fetchCourses();
  };

  const deleteCourse = async (id: string) => {
    if (!confirm('Delete this course? This action cannot be undone.')) return;
    await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    fetchCourses();
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-base)' }}>
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>🏫 Instructor Panel</h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage your courses and content</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className={`btn ${tab === 'courses' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTab('courses')}
              id="tab-courses"
            >
              📚 My Courses
            </button>
            <button
              className={`btn ${tab === 'create' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTab('create')}
              id="tab-create"
            >
              + New Course
            </button>
          </div>
        </div>

        {/* Tab: My Courses */}
        {tab === 'courses' && (
          <div>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                <h3 style={{ marginBottom: '0.5rem' }}>No courses yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Create your first course to get started.</p>
                <button className="btn btn-primary" onClick={() => setTab('create')}>+ Create First Course</button>
              </div>
            ) : (
              <div className="grid-courses">
                {courses.map((course) => (
                  <div key={course.id} style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                  }}>
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ aspectRatio: '16/9', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>📚</div>
                    )}
                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <span className={`badge ${course.isPublished ? 'badge-success' : 'badge-warning'}`}>
                          {course.isPublished ? '🟢 Published' : '🟡 Draft'}
                        </span>
                        <span className="badge badge-secondary">{course.category}</span>
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem', lineHeight: 1.4 }}>{course.title}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        📚 {course.sections.reduce((a, s) => a + s._count.lessons, 0)} lessons · 👥 {course.enrolledCount || 0} students
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => { setSelectedCourse(course); setTab('add-lessons'); }}
                          id={`manage-${course.id}`}
                        >
                          + Add Lessons
                        </button>
                        <button
                          className={`btn btn-sm ${course.isPublished ? 'btn-ghost' : 'btn-primary'}`}
                          onClick={() => publishCourse(course)}
                        >
                          {course.isPublished ? 'Unpublish' : '🚀 Publish'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteCourse(course.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Create Course */}
        {tab === 'create' && (
          <div style={{ maxWidth: 600 }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Course</h2>
            {createError && <div className="alert alert-error mb-2">⚠ {createError}</div>}
            <form onSubmit={handleCreate} id="create-course-form">
              <div className="form-group">
                <label className="form-label">Course Title *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Complete JavaScript Masterclass"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  id="course-title-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  placeholder="What will students learn in this course?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  id="course-desc-input"
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Level</label>
                  <select
                    className="form-select"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Thumbnail URL (optional)</label>
                <input
                  className="form-input"
                  placeholder="https://example.com/thumbnail.jpg"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  id="course-thumb-input"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={creating} id="create-course-submit">
                {creating ? 'Creating...' : '🚀 Create Course'}
              </button>
            </form>
          </div>
        )}

        {/* Tab: Add Lessons */}
        {tab === 'add-lessons' && selectedCourse && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setTab('courses')}>← Back</button>
              <h2 style={{ fontSize: '1.3rem' }}>Add Lessons to: <span className="text-gradient">{selectedCourse.title}</span></h2>
            </div>

            <div className="form-group">
              <label className="form-label">Section Title *</label>
              <input
                className="form-input"
                placeholder="e.g. Module 1: Fundamentals"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                style={{ maxWidth: 400 }}
                id="section-title-input"
              />
            </div>

            {/* Import from YouTube Playlist */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>🎵 Import from YouTube Playlist</h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  className="form-input"
                  placeholder="Paste YouTube Playlist ID (e.g. PLxxxxxx)"
                  value={playlistId}
                  onChange={(e) => setPlaylistId(e.target.value)}
                  id="playlist-id-input"
                />
                <button
                  className="btn btn-primary"
                  disabled={!sectionTitle || !playlistId || addingSection}
                  onClick={addFromPlaylist}
                  id="import-playlist-btn"
                >
                  {addingSection ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>

            {/* Search & Select Videos */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>🔍 Search & Select YouTube Videos</h3>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <input
                  className="form-input"
                  placeholder="e.g. JavaScript arrays tutorial"
                  value={ytSearch}
                  onChange={(e) => setYtSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleYtSearch()}
                  id="yt-search-input"
                />
                <button
                  className="btn btn-secondary"
                  onClick={handleYtSearch}
                  disabled={ytLoading}
                  id="yt-search-btn"
                >
                  {ytLoading ? '...' : '🔍 Search'}
                </button>
              </div>

              {ytVideos.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {ytVideos.map((video) => {
                    const isSelected = selectedVideos.some((v) => v.id === video.id);
                    return (
                      <div
                        key={video.id}
                        onClick={() => toggleVideo(video)}
                        style={{
                          cursor: 'pointer',
                          border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          background: isSelected ? 'rgba(124,58,237,0.1)' : 'var(--bg-elevated)',
                          transition: 'var(--transition)',
                        }}
                      >
                        <img src={video.thumbnail} alt={video.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
                        <div style={{ padding: '0.75rem' }}>
                          <p style={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.4, marginBottom: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {video.title}
                          </p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>⏱ {video.duration}</p>
                          {isSelected && <div style={{ marginTop: '0.5rem', color: 'var(--primary-light)', fontSize: '0.78rem', fontWeight: 600 }}>✓ Selected</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedVideos.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(124,58,237,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {selectedVideos.length} video{selectedVideos.length > 1 ? 's' : ''} selected
                  </span>
                  <button
                    className="btn btn-primary"
                    disabled={!sectionTitle || addingSection}
                    onClick={addLessons}
                    id="add-lessons-btn"
                  >
                    {addingSection ? 'Adding...' : `+ Add ${selectedVideos.length} Lessons`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
