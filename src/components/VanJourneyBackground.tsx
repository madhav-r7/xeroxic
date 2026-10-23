import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface VanJourneyBackgroundProps {
  className?: string;
  hideControls?: boolean;
}

export const VanJourneyBackground: React.FC<VanJourneyBackgroundProps> = ({
  className = '',
  hideControls = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsPlaying(false);
    }
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setIsPlaying(false);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const speeds = [
    { label: '0.6x', value: 0.6 },
    { label: '1x', value: 1.0 },
    { label: '1.5x', value: 1.5 },
  ];

  // Base animation durations in seconds for 1600px width (scaled by speedMultiplier)
  const roadDuration = (4.4 / speedMultiplier).toFixed(2);
  const wheelDuration = (0.55 / speedMultiplier).toFixed(2);
  const foregroundDuration = (15 / speedMultiplier).toFixed(2);
  const midgroundDuration = (36 / speedMultiplier).toFixed(2);
  const hillsDuration = (90 / speedMultiplier).toFixed(2);
  const suspensionDuration = (1.1 / Math.min(speedMultiplier, 1.2)).toFixed(2);

  const playState = isPlaying ? 'running' : 'paused';

  return (
    <>
      {/* ========================================================================= */}
      {/* FULL-SCREEN HORIZONTALLY, VERTICALLY CENTERED BACKGROUND ANIMATION LAYER  */}
      {/* Completely non-intrusive: pointer-events-none, z-0, fixed top-1/2         */}
      {/* ========================================================================= */}
      <div
        data-van-journey="true"
        className={`van-journey-layer dark:invert fixed top-1/2 -translate-y-1/2 left-0 right-0 w-full pointer-events-none z-0 overflow-hidden select-none transition-all duration-700 ${className}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1600 450"
          className="w-full h-auto min-h-[220px] sm:min-h-[280px] md:min-h-[360px] lg:min-h-[420px] block"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Soft Top and Bottom Gradient Mask so the landscape melts into the linen page background */}
            <mask id="vanCenterFadeMask">
              <linearGradient id="centerFadeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="12%" stopColor="#FFFFFF" stopOpacity="0.5" />
                <stop offset="25%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="85%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="96%" stopColor="#FFFFFF" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
              <rect width="1600" height="450" fill="url(#centerFadeGrad)" />
            </mask>

            {/* Headlight beam fade gradient */}
            <linearGradient id="headlightBeam1600" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Distant hill shading */}
            <linearGradient id="hillGrad1600A" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E6E6E6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#D5D5D5" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="hillGrad1600B" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DCDCDC" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#C9C9C9" stopOpacity="0.9" />
            </linearGradient>

            {/* Bigger, richer road gradients */}
            <linearGradient id="roadGrad1600" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#303030" />
              <stop offset="20%" stopColor="#222222" />
              <stop offset="75%" stopColor="#181818" />
              <stop offset="100%" stopColor="#0E0E0E" />
            </linearGradient>

            <linearGradient id="vergeGrad1600" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ECECEC" />
              <stop offset="100%" stopColor="#D4D4D4" />
            </linearGradient>

            {/* ----------------- REUSABLE SCENERY SYMBOLS ----------------- */}

            {/* Symbol 1: Reference Image 2 Style Tree (Cloud Canopy with Branching Trunk) */}
            <g id="tree-reference-cloud">
              <line x1="-30" y1="0" x2="35" y2="0" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
              <path
                d="M -7 0 L -4 -42 C -4 -58 -14 -72 -22 -86 M -3 -48 C -1 -62 10 -76 18 -90 M 1 -64 L 6 -82"
                stroke="#1A1A1A"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M 5 0 L 2 -42"
                stroke="#1A1A1A"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M -24 -46 
                   C -38 -46 -52 -56 -54 -70 
                   C -62 -75 -66 -88 -62 -100 
                   C -68 -112 -60 -128 -48 -134 
                   C -46 -148 -32 -160 -16 -162 
                   C -2 -174 18 -174 32 -164 
                   C 46 -165 60 -152 64 -138 
                   C 76 -130 80 -115 76 -102 
                   C 82 -92 78 -78 68 -70 
                   C 64 -56 50 -46 36 -46 
                   C 26 -46 16 -54 10 -62 
                   C 0 -52 -14 -46 -24 -46 Z"
                fill="#FFFFFF"
                stroke="#1A1A1A"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M -44 -105 C -30 -115 -12 -110 -6 -96"
                stroke="#1A1A1A"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 12 -98 C 22 -112 44 -108 54 -94"
                stroke="#1A1A1A"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M -16 -134 C 0 -146 22 -140 32 -126"
                stroke="#1A1A1A"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M -36 -76 C -24 -84 -10 -80 -4 -70"
                stroke="#1A1A1A"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 24 -70 C 34 -80 48 -78 54 -68"
                stroke="#1A1A1A"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* Symbol 2: Tall Slender Poplar Tree */}
            <g id="tree-tall-slender">
              <line x1="-15" y1="0" x2="20" y2="0" stroke="#1A1A1A" strokeWidth="2" />
              <path d="M 0 0 L 0 -185" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
              <path
                d="M 0 -45
                   C -22 -55 -24 -75 -18 -90
                   C -26 -105 -24 -125 -14 -140
                   C -20 -155 -15 -175 0 -195
                   C 15 -175 20 -155 14 -140
                   C 24 -125 26 -105 18 -90
                   C 24 -75 22 -55 0 -45 Z"
                fill="#FFFFFF"
                stroke="#1A1A1A"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path d="M -8 -135 C 0 -145 10 -140 10 -130" stroke="#1A1A1A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M -10 -90 C 0 -100 12 -95 10 -85" stroke="#1A1A1A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </g>

            {/* Symbol 3: Broad Dense Tree */}
            <g id="tree-dense-broad">
              <line x1="-25" y1="0" x2="30" y2="0" stroke="#1A1A1A" strokeWidth="2" />
              <path d="M -6 0 L -3 -35 M 4 0 L 2 -35 M -3 -35 L -16 -65 M 2 -35 L 14 -65" stroke="#1A1A1A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path
                d="M -20 -35
                   C -36 -35 -48 -48 -45 -62
                   C -56 -68 -60 -82 -54 -95
                   C -60 -108 -50 -124 -36 -128
                   C -35 -142 -18 -154 0 -154
                   C 18 -154 35 -142 36 -128
                   C 50 -124 60 -108 54 -95
                   C 60 -82 56 -68 45 -62
                   C 48 -48 36 -35 20 -35 Z"
                fill="#FFFFFF"
                stroke="#1A1A1A"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path d="M -30 -90 C -18 -98 0 -92 6 -82" stroke="#1A1A1A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M 5 -82 C 16 -95 35 -90 40 -78" stroke="#1A1A1A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </g>

            {/* Symbol 4: Roadside Bush / Shrub Cluster */}
            <g id="bush-cluster">
              <path
                d="M -35 0
                   C -42 -12 -38 -24 -26 -28
                   C -30 -38 -18 -48 -4 -46
                   C 4 -54 20 -52 26 -42
                   C 38 -44 46 -32 40 -20
                   C 48 -12 42 0 32 0 Z"
                fill="#FFFFFF"
                stroke="#1A1A1A"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d="M -16 -22 C -8 -28 4 -26 8 -18" stroke="#1A1A1A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M 12 -22 C 20 -28 30 -24 32 -16" stroke="#1A1A1A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </g>

            {/* Symbol 5: Large Faceted Roadside Boulders & Rocks */}
            <g id="rock-boulder">
              <polygon
                points="-32,0 -26,-18 -8,-30 18,-26 30,-10 24,0"
                fill="#F2F2F2"
                stroke="#1A1A1A"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <line x1="-8" y1="-30" x2="3" y2="-8" stroke="#1A1A1A" strokeWidth="1.8" />
              <line x1="3" y1="-8" x2="-26" y2="-18" stroke="#1A1A1A" strokeWidth="1.8" />
              <line x1="3" y1="-8" x2="30" y2="-10" stroke="#1A1A1A" strokeWidth="1.8" />
              <line x1="3" y1="-8" x2="8" y2="0" stroke="#1A1A1A" strokeWidth="1.8" />
              <polygon
                points="34,0 38,-10 52,-8 54,0"
                fill="#FFFFFF"
                stroke="#1A1A1A"
                strokeWidth="1.8"
              />
              <polygon
                points="-46,0 -42,-7 -34,-6 -32,0"
                fill="#FFFFFF"
                stroke="#1A1A1A"
                strokeWidth="1.6"
              />
            </g>

            {/* Symbol 6: Smaller Roadside Pebble Cluster */}
            <g id="rock-small-cluster">
              <polygon points="-14,0 -12,-8 -2,-12 8,-8 12,0" fill="#E8E8E8" stroke="#1A1A1A" strokeWidth="1.8" />
              <line x1="-2" y1="-12" x2="0" y2="-3" stroke="#1A1A1A" strokeWidth="1.2" />
              <polygon points="16,0 18,-6 26,-5 28,0" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="1.5" />
            </g>

            {/* Symbol 7: Grass Tufts */}
            <g id="grass-tuft">
              <path d="M 0 0 C -4 -10 -12 -16 -18 -18" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <path d="M 0 0 C -2 -14 -4 -22 -5 -24" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 0 0 C 4 -12 8 -20 12 -22" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 0 0 C 8 -8 16 -12 22 -14" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>

            {/* Symbol 8: Rustic Roadside Wooden Fence */}
            <g id="rustic-fence">
              <rect x="-42" y="-28" width="5" height="28" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="1.8" />
              <rect x="0" y="-30" width="5" height="30" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="1.8" />
              <rect x="42" y="-28" width="5" height="28" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="1.8" />
              <line x1="-50" y1="-22" x2="52" y2="-22" stroke="#1A1A1A" strokeWidth="2" />
              <line x1="-50" y1="-10" x2="52" y2="-10" stroke="#1A1A1A" strokeWidth="2" />
            </g>
          </defs>

          {/* Group masked with soft top/bottom fade so it melts seamlessly into the background */}
          <g mask="url(#vanCenterFadeMask)">
            {/* Subtle Minimalist Birds in Sky */}
            <g opacity="0.45">
              <path d="M 220 50 Q 226 43 232 50 Q 238 43 244 50" stroke="#1A1A1A" strokeWidth="1.4" fill="none" strokeLinecap="round" />
              <path d="M 248 59 Q 253 53 258 59 Q 263 53 268 59" stroke="#1A1A1A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <path d="M 1140 65 Q 1146 58 1152 65 Q 1158 58 1164 65" stroke="#1A1A1A" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              <path d="M 1170 74 Q 1175 68 1180 74 Q 1185 68 1190 74" stroke="#1A1A1A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </g>

            {/* ========================================================================= */}
            {/* PARALLAX LAYER 1: Distant Rolling Hills (Full 1600px Repeat, 90s)        */}
            {/* ========================================================================= */}
            <g
              style={{
                animation: `vanParallaxScroll1600 ${hillsDuration}s linear infinite`,
                animationPlayState: playState,
              }}
            >
              {/* Segment A (0 to 1600) */}
              <g>
                <path
                  d="M 0 250 Q 220 140 480 230 T 960 170 T 1380 235 T 1600 240 L 1600 290 L 0 290 Z"
                  fill="url(#hillGrad1600A)"
                  opacity="0.65"
                />
                <path
                  d="M 0 265 Q 180 180 380 245 T 820 195 T 1280 250 T 1600 260 L 1600 290 L 0 290 Z"
                  fill="url(#hillGrad1600B)"
                  opacity="0.8"
                />
              </g>

              {/* Segment B (1600 to 3200 - Exact Duplicate for Seamless Infinite Looping) */}
              <g transform="translate(1600, 0)">
                <path
                  d="M 0 250 Q 220 140 480 230 T 960 170 T 1380 235 T 1600 240 L 1600 290 L 0 290 Z"
                  fill="url(#hillGrad1600A)"
                  opacity="0.65"
                />
                <path
                  d="M 0 265 Q 180 180 380 245 T 820 195 T 1280 250 T 1600 260 L 1600 290 L 0 290 Z"
                  fill="url(#hillGrad1600B)"
                  opacity="0.8"
                />
              </g>
            </g>

            {/* ========================================================================= */}
            {/* PARALLAX LAYER 2: Midground Tree Line & Groves (36s)                     */}
            {/* ========================================================================= */}
            <g
              style={{
                animation: `vanParallaxScroll1600 ${midgroundDuration}s linear infinite`,
                animationPlayState: playState,
              }}
              opacity="0.6"
            >
              {/* Segment A (0 to 1600) */}
              <g>
                <use href="#tree-dense-broad" x="70" y="285" transform="scale(0.72) translate(0, 75)" />
                <use href="#tree-reference-cloud" x="220" y="285" transform="scale(0.68) translate(80, 80)" />
                <use href="#tree-tall-slender" x="380" y="285" transform="scale(0.7) translate(140, 70)" />
                <use href="#tree-dense-broad" x="540" y="285" transform="scale(0.65) translate(250, 90)" />
                <use href="#tree-reference-cloud" x="700" y="285" transform="scale(0.72) translate(240, 70)" />
                <use href="#tree-tall-slender" x="880" y="285" transform="scale(0.68) translate(300, 80)" />
                <use href="#tree-dense-broad" x="1050" y="285" transform="scale(0.7) translate(360, 75)" />
                <use href="#tree-reference-cloud" x="1220" y="285" transform="scale(0.68) translate(420, 80)" />
                <use href="#tree-tall-slender" x="1400" y="285" transform="scale(0.72) translate(460, 70)" />
                <use href="#tree-dense-broad" x="1540" y="285" transform="scale(0.65) translate(520, 90)" />
              </g>

              {/* Segment B (1600 to 3200) */}
              <g transform="translate(1600, 0)">
                <use href="#tree-dense-broad" x="70" y="285" transform="scale(0.72) translate(0, 75)" />
                <use href="#tree-reference-cloud" x="220" y="285" transform="scale(0.68) translate(80, 80)" />
                <use href="#tree-tall-slender" x="380" y="285" transform="scale(0.7) translate(140, 70)" />
                <use href="#tree-dense-broad" x="540" y="285" transform="scale(0.65) translate(250, 90)" />
                <use href="#tree-reference-cloud" x="700" y="285" transform="scale(0.72) translate(240, 70)" />
                <use href="#tree-tall-slender" x="880" y="285" transform="scale(0.68) translate(300, 80)" />
                <use href="#tree-dense-broad" x="1050" y="285" transform="scale(0.7) translate(360, 75)" />
                <use href="#tree-reference-cloud" x="1220" y="285" transform="scale(0.68) translate(420, 80)" />
                <use href="#tree-tall-slender" x="1400" y="285" transform="scale(0.72) translate(460, 70)" />
                <use href="#tree-dense-broad" x="1540" y="285" transform="scale(0.65) translate(520, 90)" />
              </g>
            </g>

            {/* ========================================================================= */}
            {/* PARALLAX LAYER 3: Foreground Roadside Trees & Rocks (Expanded, 15s)      */}
            {/* Full 1600px width filled with rich variety of trees, boulders & bushes   */}
            {/* ========================================================================= */}
            <g
              style={{
                animation: `vanParallaxScroll1600 ${foregroundDuration}s linear infinite`,
                animationPlayState: playState,
              }}
            >
              {/* Segment A (0 to 1600) */}
              <g>
                {/* Cluster 1: Cloud Tree + Boulders + Grass */}
                <use href="#tree-reference-cloud" x="40" y="287" transform="scale(1.05) translate(-10, -10)" />
                <use href="#grass-tuft" x="15" y="287" />
                <use href="#rock-boulder" x="95" y="287" />
                <use href="#bush-cluster" x="135" y="287" />

                {/* Cluster 2: Slender Poplar + Rock formation */}
                <use href="#tree-tall-slender" x="220" y="287" />
                <use href="#rock-small-cluster" x="270" y="287" />
                <use href="#grass-tuft" x="300" y="287" />

                {/* Cluster 3: Reference Cloud Tree (Image 2 style) + Bush */}
                <use href="#tree-reference-cloud" x="370" y="287" transform="scale(0.95) translate(15, 10)" />
                <use href="#bush-cluster" x="425" y="287" transform="scale(0.85) translate(40, 30)" />
                <use href="#rock-boulder" x="475" y="287" />

                {/* Cluster 4: Rustic Fence + Broad Oak Tree + Grass */}
                <use href="#rustic-fence" x="560" y="287" />
                <use href="#tree-dense-broad" x="650" y="287" />
                <use href="#grass-tuft" x="710" y="287" />
                <use href="#rock-small-cluster" x="735" y="287" />

                {/* Cluster 5: Big Boulders & Rocks + Cloud Tree */}
                <use href="#rock-boulder" x="810" y="287" transform="scale(1.1) translate(-20, -15)" />
                <use href="#bush-cluster" x="865" y="287" />
                <use href="#tree-reference-cloud" x="940" y="287" transform="scale(1.1) translate(-30, -15)" />
                <use href="#grass-tuft" x="1005" y="287" />

                {/* Cluster 6: Poplar + Rocks + Fence */}
                <use href="#tree-tall-slender" x="1080" y="287" />
                <use href="#rock-boulder" x="1135" y="287" />
                <use href="#rustic-fence" x="1210" y="287" />
                <use href="#grass-tuft" x="1265" y="287" />

                {/* Cluster 7: Broad Tree + Bush + Large Rock formation */}
                <use href="#tree-dense-broad" x="1330" y="287" />
                <use href="#rock-boulder" x="1405" y="287" transform="scale(1.15) translate(-40, -25)" />
                <use href="#tree-reference-cloud" x="1490" y="287" transform="scale(0.92) translate(20, 15)" />
                <use href="#bush-cluster" x="1545" y="287" />
                <use href="#grass-tuft" x="1580" y="287" />
              </g>

              {/* Segment B (1600 to 3200 - Exact Duplicate for Seamless Infinite Loop) */}
              <g transform="translate(1600, 0)">
                <use href="#tree-reference-cloud" x="40" y="287" transform="scale(1.05) translate(-10, -10)" />
                <use href="#grass-tuft" x="15" y="287" />
                <use href="#rock-boulder" x="95" y="287" />
                <use href="#bush-cluster" x="135" y="287" />

                <use href="#tree-tall-slender" x="220" y="287" />
                <use href="#rock-small-cluster" x="270" y="287" />
                <use href="#grass-tuft" x="300" y="287" />

                <use href="#tree-reference-cloud" x="370" y="287" transform="scale(0.95) translate(15, 10)" />
                <use href="#bush-cluster" x="425" y="287" transform="scale(0.85) translate(40, 30)" />
                <use href="#rock-boulder" x="475" y="287" />

                <use href="#rustic-fence" x="560" y="287" />
                <use href="#tree-dense-broad" x="650" y="287" />
                <use href="#grass-tuft" x="710" y="287" />
                <use href="#rock-small-cluster" x="735" y="287" />

                <use href="#rock-boulder" x="810" y="287" transform="scale(1.1) translate(-20, -15)" />
                <use href="#bush-cluster" x="865" y="287" />
                <use href="#tree-reference-cloud" x="940" y="287" transform="scale(1.1) translate(-30, -15)" />
                <use href="#grass-tuft" x="1005" y="287" />

                <use href="#tree-tall-slender" x="1080" y="287" />
                <use href="#rock-boulder" x="1135" y="287" />
                <use href="#rustic-fence" x="1210" y="287" />
                <use href="#grass-tuft" x="1265" y="287" />

                <use href="#tree-dense-broad" x="1330" y="287" />
                <use href="#rock-boulder" x="1405" y="287" transform="scale(1.15) translate(-40, -25)" />
                <use href="#tree-reference-cloud" x="1490" y="287" transform="scale(0.92) translate(20, 15)" />
                <use href="#bush-cluster" x="1545" y="287" />
                <use href="#grass-tuft" x="1580" y="287" />
              </g>
            </g>
          </g>

          {/* ========================================================================= */}
          {/* BIGGER, PROMINENT ROAD SURFACE & DASHED MARKINGS (4.4s Loop)             */}
          {/* ========================================================================= */}
          {/* Upper Road Verge / Shoulder */}
          <rect x="0" y="287" width="1600" height="15" fill="url(#vergeGrad1600)" />
          <line x1="0" y1="287" x2="1600" y2="287" stroke="#1A1A1A" strokeWidth="3" />

          {/* Substantial, Thick Asphalt Road Surface (Height: 110px) */}
          <rect x="0" y="302" width="1600" height="110" fill="url(#roadGrad1600)" />
          <line x1="0" y1="302" x2="1600" y2="302" stroke="#4A4A4A" strokeWidth="2" />

          {/* Bold Dashed Center Line (Animated Right to Left) */}
          <g
            style={{
              animation: `vanParallaxScroll1600 ${roadDuration}s linear infinite`,
              animationPlayState: playState,
            }}
          >
            {/* Segment A (0 to 1600) */}
            <line
              x1="0"
              y1="357"
              x2="1600"
              y2="357"
              stroke="#FFFFFF"
              strokeWidth="5.5"
              strokeDasharray="60, 45"
              opacity="0.9"
            />
            {/* Segment B (1600 to 3200) */}
            <line
              x1="1600"
              y1="357"
              x2="3200"
              y2="357"
              stroke="#FFFFFF"
              strokeWidth="5.5"
              strokeDasharray="60, 45"
              opacity="0.9"
            />
          </g>

          {/* Road Lower Curb & Ground */}
          <rect x="0" y="412" width="1600" height="10" fill="#141414" />
          <line x1="0" y1="412" x2="1600" y2="412" stroke="#000000" strokeWidth="2" />

          {/* ========================================================================= */}
          {/* THE MONOCHROME 2D CAMPER VAN (Matches Reference Image 1)                 */}
          {/* Positioned horizontally in open left viewport area for full visibility    */}
          {/* Shifted via translate(100, 35) to sit firmly on the road at y = 287      */}
          {/* ========================================================================= */}
          <g
            id="van-container"
            transform="translate(100, 35)"
            style={{
              animation: `vanSuspensionBounce ${suspensionDuration}s ease-in-out infinite`,
              animationPlayState: playState,
              transformOrigin: '400px 250px',
            }}
          >
            {/* Headlight Beam Cone (Spreading forward onto the road ahead) */}
            <polygon
              points="582,210 950,165 950,330 582,218"
              fill="url(#headlightBeam1600)"
              pointerEvents="none"
            />

            {/* Exhaust Smoke Trail (drifting backward from exhaust tip) */}
            <g
              style={{
                animation: `vanExhaustSmoke ${suspensionDuration}s ease-out infinite`,
                animationPlayState: playState,
              }}
            >
              <circle cx="210" cy="254" r="3.5" fill="#BBB" opacity="0.6" />
              <circle cx="195" cy="251" r="5" fill="#CCC" opacity="0.4" />
              <circle cx="178" cy="247" r="7.5" fill="#DDD" opacity="0.25" />
            </g>

            {/* Exhaust Pipe Tip */}
            <rect x="212" y="251" width="12" height="5" rx="2" fill="#1A1A1A" />

            {/* Front and Rear Wheel Arch Shadow Cutouts */}
            <path d="M 250 252 A 38 38 0 0 1 330 252 Z" fill="#141414" />
            <path d="M 470 252 A 38 38 0 0 1 550 252 Z" fill="#141414" />

            {/* ----------------- ROOF RACK & LUGGAGE (Image 1) ----------------- */}
            <g
              style={{
                animation: `vanLuggageJiggle ${suspensionDuration}s ease-in-out infinite`,
                animationPlayState: playState,
              }}
            >
              {/* Roof Rack Railing */}
              <path
                d="M 252 102 
                   L 468 102 
                   C 472 102 475 99 475 96 
                   C 475 93 472 90 468 90 
                   L 252 90 
                   C 248 90 245 93 245 96 
                   C 245 99 248 102 252 102 Z"
                fill="none"
                stroke="#1A1A1A"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <line x1="262" y1="102" x2="262" y2="114" stroke="#1A1A1A" strokeWidth="2.5" />
              <line x1="312" y1="102" x2="312" y2="112" stroke="#1A1A1A" strokeWidth="2.5" />
              <line x1="362" y1="102" x2="362" y2="112" stroke="#1A1A1A" strokeWidth="2.5" />
              <line x1="412" y1="102" x2="412" y2="112" stroke="#1A1A1A" strokeWidth="2.5" />
              <line x1="458" y1="102" x2="458" y2="114" stroke="#1A1A1A" strokeWidth="2.5" />

              {/* Luggage 1: Dark Vintage Trunk with White Straps */}
              <rect
                x="266"
                y="72"
                width="72"
                height="26"
                rx="4"
                fill="#2A2A2A"
                stroke="#1A1A1A"
                strokeWidth="2"
              />
              <rect x="282" y="72" width="4" height="26" fill="#FFFFFF" />
              <rect x="320" y="72" width="4" height="26" fill="#FFFFFF" />
              <path d="M 297 72 L 297 68 L 305 68 L 305 72" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />

              {/* Luggage 2: Travel Duffel / Bedroll */}
              <rect
                x="344"
                y="76"
                width="58"
                height="22"
                rx="10"
                fill="#DEDEDE"
                stroke="#1A1A1A"
                strokeWidth="2"
              />
              <line x1="360" y1="76" x2="360" y2="98" stroke="#1A1A1A" strokeWidth="1.8" />
              <line x1="386" y1="76" x2="386" y2="98" stroke="#1A1A1A" strokeWidth="1.8" />

              {/* Luggage 3: Cargo Box Case */}
              <rect
                x="408"
                y="72"
                width="50"
                height="26"
                rx="3"
                fill="#8A8A8A"
                stroke="#1A1A1A"
                strokeWidth="2"
              />
              <path d="M 408 80 L 416 72 M 450 72 L 458 80" stroke="#FFFFFF" strokeWidth="1.5" />

              {/* Roof Pop-up Vent (Image 1) */}
              <polygon
                points="495,110 535,110 533,101 497,101"
                fill="#F5F5F5"
                stroke="#1A1A1A"
                strokeWidth="2"
              />
            </g>

            {/* ----------------- VAN MAIN BODY PROFILE ----------------- */}
            <path
              d="M 226 130 
                 C 226 116 236 112 250 112 
                 L 535 112 
                 C 550 112 560 118 565 128 
                 L 582 186 
                 C 586 200 587 218 584 246 
                 L 568 252 
                 L 550 252 
                 C 550 226 470 226 470 252 
                 L 330 252 
                 C 330 226 250 226 250 252 
                 L 226 250 
                 C 220 224 220 160 226 130 Z"
              fill="#FFFFFF"
              stroke="#1A1A1A"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />

            {/* ----------------- BELTLINE / WAISTLINE STRIPE ----------------- */}
            <path
              d="M 221 184 
                 L 535 184 
                 C 555 184 574 198 585 212 
                 L 583 226 
                 C 572 214 552 200 535 200 
                 L 221 200 Z"
              fill="#222222"
              stroke="#1A1A1A"
              strokeWidth="2"
            />

            {/* ----------------- WINDOWS & FRAMES (Image 1) ----------------- */}
            <polygon
              points="536,128 558,128 576,178 536,178"
              fill="#E8EEF5"
              stroke="#1A1A1A"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <polygon points="545,130 554,130 542,176 538,176" fill="#FFFFFF" opacity="0.55" />

            <rect
              x="472"
              y="128"
              width="56"
              height="50"
              rx="4"
              fill="#E8EEF5"
              stroke="#1A1A1A"
              strokeWidth="2.2"
            />
            <polygon points="492,130 500,130 480,176 474,176" fill="#FFFFFF" opacity="0.55" />

            <rect
              x="368"
              y="128"
              width="96"
              height="50"
              rx="4"
              fill="#E8EEF5"
              stroke="#1A1A1A"
              strokeWidth="2.2"
            />
            <polygon points="412,130 422,130 382,176 372,176" fill="#FFFFFF" opacity="0.55" />

            <rect
              x="250"
              y="128"
              width="110"
              height="50"
              rx="4"
              fill="#E8EEF5"
              stroke="#1A1A1A"
              strokeWidth="2.2"
            />
            <polygon points="304,130 314,130 268,176 258,176" fill="#FFFFFF" opacity="0.55" />

            {/* Side View Mirror */}
            <line x1="570" y1="172" x2="578" y2="172" stroke="#1A1A1A" strokeWidth="2.5" />
            <rect
              x="576"
              y="160"
              width="8"
              height="16"
              rx="2"
              fill="#FFFFFF"
              stroke="#1A1A1A"
              strokeWidth="1.8"
            />

            {/* Door Seams & Handles */}
            <line x1="466" y1="126" x2="466" y2="252" stroke="#1A1A1A" strokeWidth="1.8" />
            <line x1="362" y1="126" x2="362" y2="252" stroke="#1A1A1A" strokeWidth="1.8" />

            <rect
              x="474"
              y="192"
              width="14"
              height="4"
              rx="2"
              fill="#FFFFFF"
              stroke="#1A1A1A"
              strokeWidth="1.5"
            />
            <rect
              x="370"
              y="192"
              width="14"
              height="4"
              rx="2"
              fill="#FFFFFF"
              stroke="#1A1A1A"
              strokeWidth="1.5"
            />

            {/* Rear Engine Cooling Louvers */}
            <line x1="230" y1="192" x2="244" y2="192" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="230" y1="199" x2="244" y2="199" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="230" y1="206" x2="244" y2="206" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="230" y1="213" x2="244" y2="213" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="230" y1="220" x2="244" y2="220" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />

            {/* Lights & Bumpers */}
            <circle
              cx="582"
              cy="212"
              r="9.5"
              fill="#FFFFFF"
              stroke="#1A1A1A"
              strokeWidth="2.2"
            />
            <circle cx="582" cy="212" r="5.5" fill="#F5F5F5" stroke="#1A1A1A" strokeWidth="0.8" strokeDasharray="1.5,1.5" />

            <rect
              x="580"
              y="228"
              width="7"
              height="11"
              rx="3.5"
              fill="#CCCCCC"
              stroke="#1A1A1A"
              strokeWidth="1.5"
            />

            <rect
              x="218"
              y="212"
              width="6"
              height="18"
              rx="2"
              fill="#555555"
              stroke="#1A1A1A"
              strokeWidth="1.5"
            />

            <rect
              x="578"
              y="242"
              width="16"
              height="14"
              rx="4"
              fill="#FFFFFF"
              stroke="#1A1A1A"
              strokeWidth="2.2"
            />
            <rect
              x="208"
              y="242"
              width="16"
              height="14"
              rx="4"
              fill="#FFFFFF"
              stroke="#1A1A1A"
              strokeWidth="2.2"
            />

            {/* ----------------- ROTATING WHEELS (Front & Rear) ----------------- */}
            {/* Rear Wheel (Center: 290, 252) */}
            <g
              id="van-rear-wheel"
              style={{
                transformOrigin: '290px 252px',
                animation: `vanWheelSpin ${wheelDuration}s linear infinite`,
                animationPlayState: playState,
              }}
            >
              <circle cx="290" cy="252" r="30" fill="#1A1A1A" stroke="#000" strokeWidth="1.5" />
              <circle cx="290" cy="252" r="21" fill="#E8E8E8" stroke="#1A1A1A" strokeWidth="2" />
              <circle cx="290" cy="237" r="2.2" fill="#1A1A1A" />
              <circle cx="303" cy="244.5" r="2.2" fill="#1A1A1A" />
              <circle cx="303" cy="259.5" r="2.2" fill="#1A1A1A" />
              <circle cx="290" cy="267" r="2.2" fill="#1A1A1A" />
              <circle cx="277" cy="259.5" r="2.2" fill="#1A1A1A" />
              <circle cx="277" cy="244.5" r="2.2" fill="#1A1A1A" />
              <circle cx="290" cy="252" r="13" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="1.8" />
              <circle cx="290" cy="252" r="5" fill="#1A1A1A" />
            </g>

            {/* Front Wheel (Center: 510, 252) */}
            <g
              id="van-front-wheel"
              style={{
                transformOrigin: '510px 252px',
                animation: `vanWheelSpin ${wheelDuration}s linear infinite`,
                animationPlayState: playState,
              }}
            >
              <circle cx="510" cy="252" r="30" fill="#1A1A1A" stroke="#000" strokeWidth="1.5" />
              <circle cx="510" cy="252" r="21" fill="#E8E8E8" stroke="#1A1A1A" strokeWidth="2" />
              <circle cx="510" cy="237" r="2.2" fill="#1A1A1A" />
              <circle cx="523" cy="244.5" r="2.2" fill="#1A1A1A" />
              <circle cx="523" cy="259.5" r="2.2" fill="#1A1A1A" />
              <circle cx="510" cy="267" r="2.2" fill="#1A1A1A" />
              <circle cx="497" cy="259.5" r="2.2" fill="#1A1A1A" />
              <circle cx="497" cy="244.5" r="2.2" fill="#1A1A1A" />
              <circle cx="510" cy="252" r="13" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="1.8" />
              <circle cx="510" cy="252" r="5" fill="#1A1A1A" />
            </g>
          </g>
        </svg>
      </div>

      {/* Discrete Floating Control Pill (Bottom Right Corner) */}
      {!hideControls && (
        <div className="fixed bottom-3 right-4 z-40 pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-paper-white/85 backdrop-blur-md border border-bone/80 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-xs select-none transition-opacity opacity-70 hover:opacity-100">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            title={isPlaying ? 'Pause Background Animation' : 'Resume Background Animation'}
            className="flex items-center gap-1 text-[11px] font-medium text-espresso hover:underline"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Drive'}</span>
          </button>

          <span className="text-bone">|</span>

          {speeds.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setSpeedMultiplier(s.value)}
              className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                speedMultiplier === s.value
                  ? 'bg-espresso text-paper-white font-bold'
                  : 'text-warm-ash hover:text-espresso'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};
