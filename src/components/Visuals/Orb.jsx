import React from 'react';
import './Orb.css';

/**
 * States:
 * - 'sleeping': Idle state, slow breathing purple glow.
 * - 'speaking': Active interviewer speaking, pulsing violet rings, audio output.
 * - 'listening': Candidate speaking, rapid cyan pulses, active mic input.
 * - 'thinking': Processing evaluation, rotating multi-gradient color shift.
 */
export default function Orb({ state = 'sleeping' }) {
  return (
    <div className={`orb-wrapper ${state}`}>
      {/* Outer ripple rings for wave effect */}
      <div className="ripple-ring ring-1"></div>
      <div className="ripple-ring ring-2"></div>
      <div className="ripple-ring ring-3"></div>

      {/* Main Glowing Orb */}
      <div className="orb-body">
        {/* Core elements of the orb */}
        <div className="orb-core"></div>
        <div className="orb-mesh"></div>
        
        {/* Futuristic SVG scanner overlay */}
        <svg className="orb-scanner" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" fill="none" />
          <circle cx="50" cy="50" r="30" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" fill="none" strokeDasharray="5 15" />
          <path d="M 50 10 A 40 40 0 0 1 90 50" stroke="var(--orb-accent, #8b5cf6)" strokeWidth="1.5" fill="none" strokeLinecap="round" className="scanning-arc-1" />
          <path d="M 50 90 A 40 40 0 0 1 10 50" stroke="var(--orb-accent-secondary, #06b6d4)" strokeWidth="1.5" fill="none" strokeLinecap="round" className="scanning-arc-2" />
        </svg>
      </div>
      
      {/* Hologram base light */}
      <div className="orb-reflection"></div>
    </div>
  );
}
