import React, { useEffect, useRef } from 'react';

export default function Waveform({ isListening }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.clientWidth || 300);
    let height = (canvas.height = 60);

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = canvas.width = entry.contentRect.width || 300;
        height = canvas.height = 60;
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const targetAmplitude = isListening ? 20 : 2;
      // Smooth amplitude transition
      phaseRef.current += 0.08;

      // Draw 3 layers of waves
      const waves = [
        { opacity: 0.15, frequency: 0.015, speed: 0.08, amplitudeMult: 1, color: '#06b6d4' },
        { opacity: 0.25, frequency: 0.025, speed: -0.05, amplitudeMult: 0.7, color: '#10b981' },
        { opacity: 0.4, frequency: 0.035, speed: 0.1, amplitudeMult: 0.4, color: '#0891b2' }
      ];

      waves.forEach((w) => {
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = w.opacity;

        for (let x = 0; x < width; x++) {
          const y =
            height / 2 +
            Math.sin(x * w.frequency + phaseRef.current * w.speed) *
              targetAmplitude *
              w.amplitudeMult *
              // Fade out at edges using a bell curve
              Math.pow(Math.sin((x / width) * Math.PI), 1.5);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      resizeObserver.disconnect();
    };
  }, [isListening]);

  return (
    <div style={{ width: '100%', height: '60px', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
