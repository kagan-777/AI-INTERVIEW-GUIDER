import React, { useState } from 'react';
import Settings from './components/Settings';
import Interview from './components/Interview';
import Report from './components/Report';

export default function App() {
  const [step, setStep] = useState('settings'); // settings | interview | report
  const [settings, setSettings] = useState(null);
  const [history, setHistory] = useState([]);

  const handleStartInterview = (cfg) => {
    setSettings(cfg);
    setStep('interview');
  };

  const handleCompleteInterview = (hist) => {
    setHistory(hist);
    setStep('report');
  };

  const handleRestart = () => {
    setHistory([]);
    setSettings(null);
    setStep('settings');
  };

  return (
    <div className="app-container">
      {/* Dynamic Screen Routing */}
      {step === 'settings' && (
        <Settings onStart={handleStartInterview} />
      )}
      
      {step === 'interview' && (
        <Interview 
          settings={settings} 
          onComplete={handleCompleteInterview} 
          onExit={handleRestart}
        />
      )}
      
      {step === 'report' && (
        <Report 
          settings={settings} 
          history={history} 
          onRestart={handleRestart} 
        />
      )}
    </div>
  );
}
