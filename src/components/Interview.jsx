import React, { useState, useEffect, useRef } from 'react';
import Orb from './Visuals/Orb';
import Waveform from './Visuals/Waveform';
import { mockInterviews, generateMockEvaluation } from '../services/mockData';
import { getFirstQuestion, submitAnswerAndGetNext } from '../services/gemini';

export default function Interview({ settings, onComplete, onExit }) {
  // Navigation & Questions state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]); // [{question, answer, evaluation, jarvis}]
  const [currentQuestionText, setCurrentQuestionText] = useState('Initializing interview...');
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  // UI Tabs
  const [activeTab, setActiveTab] = useState('jarvis'); // jarvis, evaluation, history
  const [jarvisActivated, setJarvisActivated] = useState(false);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  
  // Orb & Waveform states
  const [orbState, setOrbState] = useState('thinking'); // sleeping, speaking, listening, thinking
  const [isListening, setIsListening] = useState(false);
  
  // loading states
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Web Speech references
  const recognitionRef = useRef(null);
  const synthesisUtteranceRef = useRef(null);
  const isMounted = useRef(true);

  const totalQuestionsCount = 4; // Let's conduct a 4-question mock interview

  // Speech Recognition Setup
  useEffect(() => {
    isMounted.current = true;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setCurrentAnswer((prev) => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
        setOrbState('sleeping');
      };

      rec.onend = () => {
        setIsListening(false);
        if (orbState === 'listening') {
          setOrbState('sleeping');
        }
      };

      recognitionRef.current = rec;
    }

    return () => {
      isMounted.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Initialize Interview (Get First Question)
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      setErrorMsg(null);
      setOrbState('thinking');

      try {
        if (settings.apiKey) {
          // Live Gemini mode
          const firstData = await getFirstQuestion(settings.apiKey, settings);
          setCurrentQuestionText(firstData.question);
          setQuestions([{ question: firstData.question, jarvis: firstData.jarvis }]);
          
          speakQuestion(firstData.question);
        } else {
          // Mock mode
          const track = mockInterviews[settings.interviewType] || mockInterviews.HR;
          const firstQ = track.questions[0];
          const intro = `Welcome to today's mock interview. I will be conducting your interview for the position of ${settings.jobRole}.\n\nQuestion 1: ${firstQ.question}`;
          
          setCurrentQuestionText(intro);
          setQuestions(track.questions); // cache the mock questions track
          speakQuestion(intro);
        }
      } catch (err) {
        setErrorMsg('Failed to initialize AI. Verify your API key or use Mock mode (leave API key blank).');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [settings]);

  // Handle Voice output for questions
  const speakQuestion = (text) => {
    window.speechSynthesis.cancel();
    if (!settings.voiceMode) {
      setOrbState('sleeping');
      return;
    }

    // Strip welcome markdown text for speech synthesis if necessary
    const cleanedText = text.replace(/\[\w+\s?\w*\]/g, '').replace(/[*#]/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.onstart = () => {
      if (isMounted.current) setOrbState('speaking');
    };
    utterance.onend = () => {
      if (isMounted.current) {
        setOrbState('sleeping');
        // Auto-trigger mic if voiceMode is on
        startVoiceCapture();
      }
    };
    utterance.onerror = () => {
      if (isMounted.current) setOrbState('sleeping');
    };

    // Try to get a high quality English voice
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || 
                        voices.find(v => v.lang.startsWith('en'));
    if (naturalVoice) utterance.voice = naturalVoice;

    synthesisUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Mic control
  const startVoiceCapture = () => {
    if (!recognitionRef.current) return;
    try {
      window.speechSynthesis.cancel(); // Mute interviewer speech when user answers
      recognitionRef.current.start();
      setIsListening(true);
      setOrbState('listening');
    } catch (e) {
      console.warn('Recognition already started:', e);
    }
  };

  const stopVoiceCapture = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
    setOrbState('sleeping');
  };

  const toggleMic = () => {
    if (isListening) {
      stopVoiceCapture();
    } else {
      startVoiceCapture();
    }
  };

  // Submit current answer and advance
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    
    stopVoiceCapture();
    setIsLoading(true);
    setOrbState('thinking');
    setErrorMsg(null);

    const questionObj = questions[currentQuestionIndex];
    let evaluationResult = null;
    let nextQuestionData = null;

    try {
      if (settings.apiKey) {
        // Live Gemini API evaluation + next question
        const currentHistory = [...history, { question: currentQuestionText, answer: currentAnswer }];
        nextQuestionData = await submitAnswerAndGetNext(
          settings.apiKey,
          settings,
          currentHistory,
          currentAnswer,
          currentQuestionIndex,
          totalQuestionsCount
        );

        evaluationResult = nextQuestionData.evaluation;
      } else {
        // Dynamic mock evaluation
        evaluationResult = generateMockEvaluation(currentQuestionText, currentAnswer);
      }

      // Add to interview history
      const updatedHistory = [
        ...history,
        {
          question: currentQuestionText,
          answer: currentAnswer,
          evaluation: evaluationResult,
          jarvis: settings.apiKey ? questions[currentQuestionIndex]?.jarvis : questions[currentQuestionIndex]
        }
      ];
      setHistory(updatedHistory);

      // Reset values for next step
      setCurrentAnswer('');
      setJarvisActivated(false);

      const nextIndex = currentQuestionIndex + 1;
      
      if (nextIndex >= totalQuestionsCount) {
        // End of interview! Submit history to compile final report
        onComplete(updatedHistory);
      } else {
        // Move to next question
        setCurrentQuestionIndex(nextIndex);
        
        let nextQText = '';
        if (settings.apiKey) {
          nextQText = nextQuestionData.nextQuestion;
          // Append new question to states
          setQuestions((prev) => {
            const copy = [...prev];
            copy[nextIndex] = { question: nextQText, jarvis: nextQuestionData.jarvis };
            return copy;
          });
        } else {
          // Pull next pre-defined mock question
          const track = mockInterviews[settings.interviewType] || mockInterviews.HR;
          const nextQ = track.questions[nextIndex];
          nextQText = `Question ${nextIndex + 1}: ${nextQ.question}`;
        }
        
        setCurrentQuestionText(nextQText);
        speakQuestion(nextQText);
        
        // Auto-switch to Evaluation tab to show feedback on previous answer
        setActiveTab('evaluation');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Communication failure. Please verify your connection or Gemini Key.');
      setOrbState('sleeping');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper trigger for typing JARVIS help
  const handleRequestJarvisHelp = () => {
    if (!jarvisActivated) {
      setJarvisActivated(true);
      setHintsUsedCount(prev => prev + 1);
    }
    setActiveTab('jarvis');
  };

  // Keyboard shortcut handlers
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmitAnswer();
    }
  };

  // Retrieve current active JARVIS content
  const currentJarvis = settings.apiKey 
    ? questions[currentQuestionIndex]?.jarvis 
    : questions[currentQuestionIndex];

  // Retrieve evaluation for previous question
  const lastEvaluation = history[history.length - 1]?.evaluation;
  const lastQuestionText = history[history.length - 1]?.question;

  return (
    <div className="container fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', minHeight: 'calc(100vh - 120px)', padding: '20px' }}>
      
      {/* LEFT: Interview Room Canvas & Orb */}
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* Header Indicator Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Mock Session</span>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Question {currentQuestionIndex + 1} of {totalQuestionsCount}
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: 'var(--radius-sm)', background: settings.apiKey ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: settings.apiKey ? 'var(--primary-purple)' : 'var(--text-secondary)', border: '1px solid var(--border-glass)' }}>
              {settings.apiKey ? '⚡ Live Gemini' : '📁 Simulation'}
            </span>
            {settings.voiceMode && (
              <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: 'var(--radius-sm)', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--primary-cyan)', border: '1px solid var(--border-glass)' }}>
                🎙️ Voice Mode Active
              </span>
            )}
          </div>
        </div>

        {/* AI Interviewer Display */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '15px 0' }}>
          <Orb state={orbState} />
          
          <div style={{ marginTop: '10px', textAlign: 'center', height: '24px' }}>
            {orbState === 'thinking' && <span style={{ color: 'var(--primary-purple)', fontSize: '0.85rem' }}>HR Interviewer is thinking...</span>}
            {orbState === 'speaking' && <span style={{ color: 'var(--primary-purple)', fontSize: '0.85rem' }}>HR Interviewer is speaking...</span>}
            {orbState === 'listening' && <span style={{ color: 'var(--primary-cyan)', fontSize: '0.85rem' }}>HR Interviewer is listening. Speak now...</span>}
            {orbState === 'sleeping' && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ready for answer.</span>}
          </div>
        </div>

        {/* Live Question Card */}
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '20px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-10px', left: '15px', background: 'var(--bg-dark)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--primary-purple)', border: '1px solid var(--border-glass)' }}>
            HR INTERVIEWER
          </div>
          <div style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {currentQuestionText}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              onClick={() => speakQuestion(currentQuestionText)}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', gap: '4px' }}
              title="Repeat question"
            >
              🔊 Play Voice
            </button>
          </div>
        </div>

        {/* Microphone Waveform Indicator */}
        {isListening && (
          <div style={{ marginBottom: '10px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: 'var(--radius-sm)', padding: '6px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--primary-cyan)', marginBottom: '4px' }}>
              <span>Recording Voice...</span>
              <button onClick={stopVoiceCapture} style={{ background: 'transparent', color: 'var(--accent-red)', fontSize: '0.75rem' }}>Stop Mic</button>
            </div>
            <Waveform isListening={isListening} />
          </div>
        )}

        {/* Error alert */}
        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--accent-red)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '15px', fontSize: '0.85rem' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Answer Text Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea
            className="form-textarea"
            rows="5"
            placeholder="Type your answer here... Or press Ctrl+Enter to submit."
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {recognitionRef.current && (
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'}`}
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  disabled={isLoading}
                >
                  {isListening ? '🎙️ Stop Mic' : '🎙️ Record Answer'}
                </button>
              )}
              <button
                type="button"
                onClick={handleRequestJarvisHelp}
                className="btn btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.85rem', color: 'var(--accent-amber)' }}
                disabled={isLoading}
              >
                💡 Ask JARVIS (Hint)
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={onExit}
                className="btn btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              >
                Exit
              </button>
              <button
                onClick={handleSubmitAnswer}
                className="btn btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                disabled={isLoading || !currentAnswer.trim()}
              >
                {isLoading ? 'Processing...' : (currentQuestionIndex === totalQuestionsCount - 1 ? 'Finish Interview' : 'Submit Answer')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Split Side Panels (JARVIS Coach & Evaluation Experts) */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-glass)' }}>
          <button
            onClick={() => setActiveTab('jarvis')}
            style={{
              flex: 1,
              padding: '15px 10px',
              background: activeTab === 'jarvis' ? 'rgba(255,255,255,0.05)' : 'transparent',
              color: activeTab === 'jarvis' ? 'var(--primary-cyan)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'jarvis' ? '2px solid var(--primary-cyan)' : 'none',
              fontWeight: '600',
              fontSize: '0.85rem',
              textAlign: 'center'
            }}
          >
            💡 JARVIS COACH {hintsUsedCount > 0 ? `(${hintsUsedCount})` : ''}
          </button>
          
          <button
            onClick={() => setActiveTab('evaluation')}
            style={{
              flex: 1,
              padding: '15px 10px',
              background: activeTab === 'evaluation' ? 'rgba(255,255,255,0.05)' : 'transparent',
              color: activeTab === 'evaluation' ? 'var(--accent-green)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'evaluation' ? '2px solid var(--accent-green)' : 'none',
              fontWeight: '600',
              fontSize: '0.85rem',
              textAlign: 'center'
            }}
          >
            📊 LIVE EVALUATION
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            style={{
              flex: 1,
              padding: '15px 10px',
              background: activeTab === 'history' ? 'rgba(255,255,255,0.05)' : 'transparent',
              color: activeTab === 'history' ? 'var(--primary-purple)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'history' ? '2px solid var(--primary-purple)' : 'none',
              fontWeight: '600',
              fontSize: '0.85rem',
              textAlign: 'center'
            }}
          >
            📜 SESSION TRANSCRIPT
          </button>
        </div>

        {/* Tab Contents */}
        <div style={{ flex: 1, padding: '25px', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
          
          {/* TAB 1: JARVIS COACH */}
          {activeTab === 'jarvis' && (
            <div className="fade-in">
              {!jarvisActivated ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                  <div style={{ fontSize: '3rem' }}>🧠</div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-cyan)' }}>[JARVIS ASSISTANT]</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    Need help structuring your answer? Deploy JARVIS to show key concepts, outline guides, and recommended structures.
                  </p>
                  <button
                    onClick={() => {
                      setJarvisActivated(true);
                      setHintsUsedCount(prev => prev + 1);
                    }}
                    className="btn btn-accent"
                    style={{ marginTop: '10px' }}
                  >
                    Unlock Assistant Coach
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ borderBottom: '1px solid rgba(6, 182, 212, 0.2)', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)', fontWeight: 'bold', textTransform: 'uppercase' }}>[JARVIS ACTIVE]</span>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Coaching & Guidance</h3>
                  </div>

                  {currentJarvis?.keyConcepts && (
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-cyan)', marginBottom: '6px' }}>Key concepts:</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {currentJarvis.keyConcepts.map((c, i) => (
                          <span key={i} style={{ fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', color: 'var(--primary-cyan)', padding: '2px 8px', borderRadius: '4px' }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentJarvis?.structure && (
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-cyan)', marginBottom: '6px' }}>Suggested Answer Structure:</h4>
                      <pre style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                        {currentJarvis.structure}
                      </pre>
                    </div>
                  )}

                  {currentJarvis?.points && (
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-cyan)', marginBottom: '4px' }}>Crucial points to cover:</h4>
                      <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {currentJarvis.points.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  )}

                  {currentJarvis?.example && (
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-cyan)', marginBottom: '6px' }}>Model approach reference:</h4>
                      <div style={{ fontStyle: 'italic', borderLeft: '3px solid var(--primary-cyan)', paddingLeft: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        "{currentJarvis.example}"
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE EVALUATION */}
          {activeTab === 'evaluation' && (
            <div className="fade-in">
              {!lastEvaluation ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📈</div>
                  <h3>No evaluations yet</h3>
                  <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                    Submit your answer to Question {currentQuestionIndex + 1} to get detailed feedback from the Evaluation Expert.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Score Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '15px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: lastEvaluation.score >= 7 ? 'rgba(16, 185, 129, 0.15)' : lastEvaluation.score >= 5 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: '2px solid',
                      borderColor: lastEvaluation.score >= 7 ? 'var(--accent-green)' : lastEvaluation.score >= 5 ? 'var(--accent-amber)' : 'var(--accent-red)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      color: lastEvaluation.score >= 7 ? 'var(--accent-green)' : lastEvaluation.score >= 5 ? 'var(--accent-amber)' : 'var(--accent-red)'
                    }}>
                      {lastEvaluation.score}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>[EVALUATION REPORT]</span>
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '2px' }}>Last Question Graded</h4>
                    </div>
                  </div>

                  {/* Context Question */}
                  <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '10px 15px', borderRadius: '6px', borderLeft: '2px solid var(--text-muted)', color: 'var(--text-secondary)' }}>
                    <strong>Q:</strong> {lastQuestionText.substring(0, 120)}...
                  </div>

                  {/* Strengths */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-green)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ✓ Strengths:
                    </h4>
                    <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {lastEvaluation.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-red)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ✗ Areas for Improvement:
                    </h4>
                    <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {lastEvaluation.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-amber)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      💡 Suggestions:
                    </h4>
                    <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {lastEvaluation.suggestions?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRANSCRIPT */}
          {activeTab === 'history' && (
            <div className="fade-in">
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📜</div>
                  <h3>No responses logged</h3>
                  <p style={{ fontSize: '0.85rem' }}>
                    As the interview progresses, your full transcripts will be displayed here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {history.map((h, i) => (
                    <div key={i} style={{ borderBottom: i === history.length - 1 ? 'none' : '1px solid var(--border-glass)', paddingBottom: '20px' }}>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px' }}>
                        Round {i + 1}
                      </span>
                      <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginTop: '8px', marginBottom: '4px' }}>
                        Q: {h.question}
                      </p>
                      <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                        "{h.answer}"
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Score:</span>
                        <strong style={{ color: h.evaluation.score >= 7 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>{h.evaluation.score}/10</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
