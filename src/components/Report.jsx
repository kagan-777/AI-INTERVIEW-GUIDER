import React, { useState, useEffect } from 'react';
import { getFinalReport } from '../services/gemini';

export default function Report({ settings, history, onRestart }) {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function compileReport() {
      setIsLoading(true);
      setErrorMsg(null);

      if (settings.apiKey) {
        // Live Gemini API Report Generation
        try {
          const data = await getFinalReport(settings.apiKey, settings, history);
          setReport(data);
        } catch (err) {
          console.error(err);
          setErrorMsg('Failed to generate AI performance report. Defaulting to local report compilers.');
          compileLocalReport();
        } finally {
          setIsLoading(false);
        }
      } else {
        // Mock compilation
        compileLocalReport();
        setIsLoading(false);
      }
    }
    
    compileReport();
  }, [settings, history]);

  // Compute local report metrics dynamically based on answers
  const compileLocalReport = () => {
    const totalQuestions = history.length;
    const totalScore = history.reduce((sum, h) => sum + (h.evaluation?.score || 0), 0);
    const averageScore = totalQuestions > 0 ? (totalScore / totalQuestions) : 7;
    
    // Check answer quality parameters
    const totalWords = history.reduce((sum, h) => sum + h.answer.trim().split(/\s+/).length, 0);
    const avgWords = totalQuestions > 0 ? (totalWords / totalQuestions) : 50;
    
    // Communication score (capped at 10)
    let commScore = 6;
    if (avgWords > 80) commScore = 9;
    else if (avgWords > 50) commScore = 8;
    else if (avgWords > 30) commScore = 7;

    // Confidence score based on Voice Mode and length
    let confScore = settings.voiceMode ? 8 : 7;
    if (avgWords > 70) confScore += 1;
    confScore = Math.min(confScore, 10);

    // Problem solving score based on question answers
    let probScore = Math.round(averageScore + 0.5);

    // Behavioral score based on STAR words
    let behScore = 7;
    const starCount = history.filter(h => 
      ["situation", "task", "action", "result", "for example", "specifically", "resulted"].some(kw => 
        h.answer.toLowerCase().includes(kw)
      )
    ).length;
    if (starCount >= 3) behScore = 9;
    else if (starCount >= 1) behScore = 8;

    const finalPercent = Math.round(
      ((averageScore + commScore + confScore + probScore + behScore) / 46) * 100
    );

    // Determine recommendation
    let rec = 'Borderline';
    if (finalPercent >= 85) rec = 'Strong Hire';
    else if (finalPercent >= 70) rec = 'Hire';
    else if (finalPercent >= 55) rec = 'Borderline';
    else rec = 'Needs Improvement';

    // Build mock responses
    setReport({
      overallScore: Math.min(finalPercent, 100),
      categories: {
        technicalKnowledge: Math.round(averageScore),
        communication: commScore,
        confidence: confScore,
        problemSolving: probScore,
        behavioralSkills: behScore
      },
      strengths: [
        "Structured delivery of concepts with good paragraph flow.",
        "Demonstrated clear technical awareness regarding the core role requirements.",
        settings.voiceMode ? "Leveraged oral articulation which simulated natural interview pacing." : "Capable written presentation of technical logic."
      ],
      weaknesses: [
        avgWords < 50 ? "Answers were somewhat brief, missing room for deep engineering trade-offs." : "Minor depth inconsistencies in detailing system failures.",
        "Could strengthen direct metrics-based impact inside the behavioral replies (e.g. STAR results)."
      ],
      recommendedLearning: [
        `Advanced ${settings.jobRole} Design patterns & Architectural Scaling models.`,
        "Behavioral STAR framing focusing on Quantifiable Impact and Business Performance metrics.",
        "Mock drills with extreme/hard stress settings to streamline fast explanation delivery."
      ],
      hiringRecommendation: rec,
      improvementRoadmap: [
        {
          phase: "Immediate Goals (Week 1)",
          steps: [
            "Review key concepts where evaluations identified minor gaps (e.g. system bottlenecks).",
            "Practice writing responses explicitly using the STAR model (Situation, Task, Action, Result)."
          ]
        },
        {
          phase: "Medium Term (Week 2-4)",
          steps: [
            "Conduct timed mock interviews to build fluency and reduce structural pause times.",
            "Integrate direct metrics (e.g. 'reduced latency by 15%') into all project summaries."
          ]
        }
      ]
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="container fade-in flex-center" style={{ minHeight: 'calc(100vh - 150px)', flexDirection: 'column', gap: '20px' }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          border: '3px solid rgba(139, 92, 246, 0.1)',
          borderTopColor: 'var(--primary-purple)',
          animation: 'spinSlow 1.5s infinite linear'
        }} />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-purple)', marginBottom: '8px' }}>
            Compiling Performance Report
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Analyzing communication speed, technical vocabulary, and behavioral structures...
          </p>
        </div>
      </div>
    );
  }

  const getRecommendationBadgeColor = (rec) => {
    switch (rec) {
      case 'Strong Hire': return { bg: 'rgba(16, 185, 129, 0.15)', text: 'var(--accent-green)', border: '1px solid var(--accent-green)' };
      case 'Hire': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: '1px solid #3b82f6' };
      case 'Borderline': return { bg: 'rgba(245, 158, 11, 0.15)', text: 'var(--accent-amber)', border: '1px solid var(--accent-amber)' };
      default: return { bg: 'rgba(239, 68, 68, 0.15)', text: 'var(--accent-red)', border: '1px solid var(--accent-red)' };
    }
  };

  const badgeStyle = getRecommendationBadgeColor(report.hiringRecommendation);

  return (
    <div className="container fade-in" style={{ maxWidth: '950px' }}>
      
      {/* Top action header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }} className="no-print">
        <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>Interview Complete</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} className="btn btn-secondary">
            🖨️ Export PDF / Print
          </button>
          <button onClick={onRestart} className="btn btn-primary">
            🔄 New Session
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="no-print" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main Print Layout */}
      <div className="glass-panel" id="printable-area" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Report Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-glass)', paddingBottom: '25px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem' }}>Performance Report</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              Target: <strong>{settings.jobRole}</strong> ({settings.experienceLevel})
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
              Interview Track: {settings.interviewType} | Date: {new Date().toLocaleDateString()}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              ...badgeStyle
            }}>
              {report.hiringRecommendation}
            </span>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Hiring Decision
            </div>
          </div>
        </div>

        {/* Dashboard Grid - Score & Categories */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px', alignItems: 'center' }}>
          
          {/* Large Ring Indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="var(--primary-purple)"
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - report.overallScore / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  {report.overallScore}%
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Overall Score
                </span>
              </div>
            </div>
          </div>

          {/* Bar Chart Categories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {Object.entries(report.categories).map(([name, score]) => {
              const formattedName = name
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
              
              return (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{formattedName}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{score}/10</strong>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                    <div style={{
                      height: '100%',
                      width: `${score * 10}%`,
                      background: score >= 8 ? 'var(--accent-green)' : score >= 6 ? 'var(--accent-amber)' : 'var(--accent-red)',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths & Weaknesses Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', borderTop: '1px solid var(--border-glass)', paddingTop: '30px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-green)', marginBottom: '12px', borderBottom: '1px solid rgba(16, 185, 129, 0.1)', paddingBottom: '6px' }}>
              Key Strengths
            </h3>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {report.strengths.map((str, i) => <li key={i}>{str}</li>)}
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-red)', marginBottom: '12px', borderBottom: '1px solid rgba(239, 68, 68, 0.1)', paddingBottom: '6px' }}>
              Identified Gaps
            </h3>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {report.weaknesses.map((weak, i) => <li key={i}>{weak}</li>)}
            </ul>
          </div>
        </div>

        {/* Recommended learning list */}
        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '30px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-cyan)', marginBottom: '12px' }}>
            Recommended Learning Topics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            {report.recommendedLearning.map((topic, i) => (
              <div key={i} style={{ background: 'rgba(6, 182, 212, 0.03)', border: '1px solid rgba(6, 182, 212, 0.12)', padding: '15px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <strong style={{ color: 'var(--primary-cyan)', display: 'block', marginBottom: '4px' }}>Topic #{i+1}</strong>
                {topic}
              </div>
            ))}
          </div>
        </div>

        {/* Action roadmap */}
        {report.improvementRoadmap && (
          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '30px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-purple)', marginBottom: '12px' }}>
              Development Roadmap
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {report.improvementRoadmap.map((phase, i) => (
                <div key={i} style={{ display: 'flex', gap: '15px' }}>
                  <div style={{
                    minWidth: '150px',
                    color: 'var(--primary-purple)',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    borderRight: '2px solid var(--primary-purple-glow)',
                    paddingRight: '15px'
                  }}>
                    {phase.phase}
                  </div>
                  <ul style={{ paddingLeft: '15px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {phase.steps.map((step, idx) => <li key={idx}>{step}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transcript Log (Print details) */}
        <div className="only-print" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '30px', marginTop: '30px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>Full Interview Transcript</h2>
          {history.map((h, i) => (
            <div key={i} style={{ marginBottom: '20px', pageBreakInside: 'avoid' }}>
              <strong style={{ fontSize: '0.9rem' }}>Q{i+1}: {h.question}</strong>
              <p style={{ fontStyle: 'italic', color: '#888', fontSize: '0.85rem', margin: '6px 0 10px 0', paddingLeft: '10px', borderLeft: '2px solid #555' }}>
                " {h.answer} "
              </p>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                Grade Score: {h.evaluation.score}/10
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
