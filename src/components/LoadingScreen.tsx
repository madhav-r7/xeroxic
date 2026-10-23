import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete?: () => void;
  durationMs?: number; // default ~3200ms
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onComplete,
  durationMs = 3200,
}) => {
  // Animation timeline state:
  // 'white-initial' -> 'transitioning' -> 'revealed' -> 'fading-out' -> 'finished'
  const [stage, setStage] = useState<'white-initial' | 'transitioning' | 'revealed' | 'fading-out' | 'finished'>('white-initial');

  useEffect(() => {
    // 1. Initial pause on white screen with black "X" (0 to 650ms)
    const t1 = setTimeout(() => {
      setStage('transitioning');
    }, 650);

    // 2. Full name revealed, subtle glow & tagline entrance (after 1850ms)
    const t2 = setTimeout(() => {
      setStage('revealed');
    }, 1850);

    // 3. Begin smooth fade-out into the main application (at ~2850ms)
    const t3 = setTimeout(() => {
      setStage('fading-out');
    }, Math.max(durationMs - 450, 2600));

    // 4. Complete and unmount (at durationMs ~3200ms)
    const t4 = setTimeout(() => {
      setStage('finished');
      if (onComplete) onComplete();
    }, durationMs);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [durationMs, onComplete]);

  // Allow clicking anywhere to skip
  const handleSkip = () => {
    setStage('fading-out');
    setTimeout(() => {
      setStage('finished');
      if (onComplete) onComplete();
    }, 300);
  };

  if (stage === 'finished') {
    return null;
  }

  const isTransitioned = stage === 'transitioning' || stage === 'revealed' || stage === 'fading-out';
  const isRevealed = stage === 'revealed' || stage === 'fading-out';
  const isFadingOut = stage === 'fading-out';

  return (
    <div
      onClick={handleSkip}
      role="dialog"
      aria-label="Xeroxic Splash Screen"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer transition-all duration-1000 ease-in-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        // Slow fluid background transition from white to deep nocturnal black
        backgroundColor: isTransitioned ? '#0a0b0e' : '#FFFFFF',
        transitionProperty: 'background-color, opacity, transform',
        transitionDuration: isFadingOut ? '500ms' : '1200ms',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Ambient background particle / glow layer */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
          isRevealed ? 'opacity-40' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 0%, rgba(10, 11, 14, 0) 70%)',
        }}
      />

      {/* Main Center Brand Logo & Text Container */}
      {/* 15% of laptop screen height (15vh) */}
      <div className="relative flex flex-col items-center justify-center">
        <div
          className="flex items-center justify-center leading-none tracking-normal font-algerian"
          style={{
            // 15% of screen height on laptop with responsive clamps
            fontSize: 'clamp(56px, 15vh, 150px)',
            height: 'clamp(56px, 15vh, 150px)',
            fontFamily: "'Algerian', 'Cinzel Decorative', 'Cinzel', 'Times New Roman', serif",
          }}
        >
          {/* Logo "X" in Algerian */}
          {/* Starts black, transitions smoothly to pure white, glides slightly left as EROXIC expands */}
          <span
            className="inline-block transition-all duration-1000 font-bold select-none transform-gpu"
            style={{
              color: isTransitioned ? '#FFFFFF' : '#000000',
              textShadow: isRevealed
                ? '0 0 24px rgba(255, 255, 255, 0.4), 0 0 60px rgba(255, 255, 255, 0.15)'
                : 'none',
              transitionProperty: 'color, text-shadow, transform',
              transitionDuration: '1100ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            X
          </span>

          {/* Rest of Company Name: "EROXIC" */}
          {/* Slides out to the right with a fade from inside the X */}
          <div
            className="overflow-hidden transition-all duration-1000 ease-out"
            style={{
              maxWidth: isTransitioned ? '800px' : '0px',
              opacity: isTransitioned ? 1 : 0,
              transitionDuration: '1200ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span
              className="inline-block text-white whitespace-nowrap pl-0.5 select-none font-bold transform-gpu"
              style={{
                transform: isTransitioned ? 'translateX(0px)' : 'translateX(-50px)',
                opacity: isTransitioned ? 1 : 0,
                transitionProperty: 'transform, opacity, text-shadow',
                transitionDuration: '1200ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                textShadow: isRevealed
                  ? '0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.1)'
                  : 'none',
              }}
            >
              EROXIC
            </span>
          </div>
        </div>

        {/* Elegant Subtitle / Campus Tagline that gently fades in below */}
        <div
          className="mt-4 sm:mt-6 flex flex-col items-center gap-1.5 transition-all duration-700"
          style={{
            opacity: isRevealed ? 0.75 : 0,
            transform: isRevealed ? 'translateY(0px)' : 'translateY(12px)',
            transitionDuration: '800ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent mb-1" />
          <p className="text-[10px] sm:text-xs tracking-[0.35em] text-white/80 uppercase font-sans font-medium">
            Campus Print Station • Shopping Complex
          </p>
        </div>
      </div>

      {/* Subtle Bottom Skip Hint */}
      <div
        className="absolute bottom-6 text-[10px] text-white/30 tracking-widest uppercase transition-opacity duration-700 hover:text-white/60"
        style={{
          opacity: isRevealed ? 0.5 : 0,
        }}
      >
        Click to skip
      </div>
    </div>
  );
};
