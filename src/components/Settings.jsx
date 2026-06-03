import React, { useState, useEffect } from 'react';

const SAMPLE_RESUMES = {
  technical: `John Doe - Senior React Engineer
- 4 years of experience building modern frontend applications with React, Redux, and TypeScript.
- Led the migration of a legacy dashboard to Vite and React 18, reducing bundle size by 35% and improving lighthouse scores to 95+.
- Implemented responsive styles, code splitting, and custom hooks to streamline API data integration.
- Skills: React.js, JavaScript (ES6+), TypeScript, CSS Grid/Flexbox, Webpack, Git.`,
  behavioral: `Jane Smith - Project Manager
- Experienced Agile Project Manager with 5+ years of leading software development squads.
- Spearheaded the delivery of a major mobile app, resolving team scheduling conflicts and coordinating across 3 cross-functional departments.
- Facilitated daily standups, sprint planning, and retrospectives to foster transparency.
- Core strengths: Leadership, conflict resolution, Scrum, active communication.`,
  hr: `Alex Lee - Graduate Software Engineer
- Bachelor of Science in Computer Science.
- Self-motivated developer with strong foundational knowledge in web applications.
- Completed a 3-month internship building full-stack web portals.
- Eager to apply learning, collaborate in teams, and grow technical skills.`
};

export default function Settings({ onStart }) {
  const [jobRole, setJobRole] = useState('Frontend Engineer');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level');
  const [interviewType, setInterviewType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Medium');
  const [resumeContent, setResumeContent] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);

  // Load API Key from localStorage if exists
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);
    
    const savedVoice = localStorage.getItem('voice_mode') === 'true';
    setVoiceMode(savedVoice);
  }, []);

  const handleLoadSample = (type) => {
    setResumeContent(SAMPLE_RESUMES[type] || '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save API key and voice preferences
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    localStorage.setItem('voice_mode', voiceMode.toString());

    onStart({
      jobRole,
      experienceLevel,
      interviewType,
      difficulty,
      resumeContent,
      apiKey: apiKey.trim(),
      voiceMode
    });
  };

  return (
    <div className="container fade-in" style={{ maxWidth: '750px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '10px' }} className="gradient-text-purple">
          PrepForge AI
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Interactive AI Interview Preparation Room
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '35px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', color: 'var(--text-primary)' }}>
          Configure Interview Settings
        </h2>

        {/* API Key configuration */}
        <div className="form-group" style={{ background: 'rgba(139, 92, 246, 0.04)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px dashed rgba(139, 92, 246, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" style={{ color: 'var(--primary-purple)', fontWeight: '600' }}>
              Gemini API Key (Optional)
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Uses local simulation if empty
            </span>
          </div>
          <div style={{ position: 'relative', display: 'flex', gap: '8px', marginTop: '6px' }}>
            <input
              type={showKey ? 'text' : 'password'}
              className="form-input"
              style={{ flex: 1 }}
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '10px' }}
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? '🔒 Hide' : '👁️ Show'}
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.3' }}>
            We save keys safely client-side in your local storage. Get a free API key in Google AI Studio.
          </p>
        </div>

        {/* Grid for parameters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Target Job Role</label>
            <input
              type="text"
              className="form-input"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Experience Level</label>
            <select
              className="form-select"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
            >
              <option value="Junior (0-2 yrs)">Junior (0-2 yrs)</option>
              <option value="Mid-Level (2-5 yrs)">Mid-Level (2-5 yrs)</option>
              <option value="Senior (5+ yrs)">Senior (5+ yrs)</option>
              <option value="Lead / Manager">Lead / Manager</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Interview Type</label>
            <select
              className="form-select"
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
            >
              <option value="Technical">Technical (Coding & System Design)</option>
              <option value="Behavioral">Behavioral (STAR Method)</option>
              <option value="HR">HR & Cultural Fit</option>
              <option value="Managerial">Managerial & Leadership</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Difficulty Level</label>
            <select
              className="form-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="Easy">Easy (Constructive & Guided)</option>
              <option value="Medium">Medium (Standard Industry Practice)</option>
              <option value="Hard">Hard (Stress / High Standards)</option>
            </select>
          </div>
        </div>

        {/* Resume upload/paste */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">Resume / Experience Data</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 8px' }} onClick={() => handleLoadSample('technical')}>React Dev</button>
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 8px' }} onClick={() => handleLoadSample('behavioral')}>PM Profile</button>
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 8px' }} onClick={() => handleLoadSample('hr')}>Grad Dev</button>
            </div>
          </div>
          <textarea
            className="form-textarea"
            rows="5"
            placeholder="Paste your resume summary, projects, or list of skills here to generate highly personalized questions..."
            value={resumeContent}
            onChange={(e) => setResumeContent(e.target.value)}
          />
        </div>

        {/* Voice Mode switch */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
          <div>
            <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔊 Interactive Voice Mode
              <span style={{ fontSize: '0.7rem', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--primary-cyan)', padding: '2px 6px', borderRadius: '4px' }}>Web Speech API</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              The interviewer will speak, and you can dictate answers using your microphone.
            </p>
          </div>
          <div className="switch-container" onClick={() => setVoiceMode(!voiceMode)}>
            <div className={`switch ${voiceMode ? 'switch-active' : ''}`} />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '15px', fontSize: '1.05rem', marginTop: '10px' }}>
          Enter Interview Room →
        </button>
      </form>
    </div>
  );
}
