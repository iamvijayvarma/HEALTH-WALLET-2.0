import React from 'react';

export const HealthcareIllustration = () => {
  return (
    <svg
      viewBox="0 0 460 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="hw-login-graphic-svg"
      aria-label="Healthcare Family and Protection Illustration"
    >
      <defs>
        {/* Soft Background Auras */}
        <linearGradient id="bgGrad1" x1="50" y1="20" x2="410" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EFF6FF" />
          <stop offset="0.6" stopColor="#F0FDFA" />
          <stop offset="1" stopColor="#EBF3FA" />
        </linearGradient>

        <linearGradient id="shieldGrad" x1="280" y1="40" x2="380" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F4C81" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>

        <linearGradient id="crossGrad" x1="315" y1="85" x2="345" y2="135" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#E2E8F0" />
        </linearGradient>

        {/* Character Skin & Hair Tones */}
        <linearGradient id="tealBody" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#0D9488" />
          <stop offset="1" stopColor="#0F766E" />
        </linearGradient>

        <linearGradient id="blueBody" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#1D4ED8" />
          <stop offset="1" stopColor="#0F4C81" />
        </linearGradient>

        <linearGradient id="warmAmber" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Decorative Organic Background Bubbles */}
      <circle cx="230" cy="130" r="110" fill="url(#bgGrad1)" opacity="0.8" />
      <circle cx="340" cy="100" r="70" fill="#E0F2FE" opacity="0.6" />
      <circle cx="120" cy="160" r="60" fill="#CCFBF1" opacity="0.5" />

      {/* Subtle Heartbeat Pulse Wave */}
      <path
        d="M 40 210 Q 90 210 120 210 L 132 195 L 140 225 L 152 175 L 164 235 L 176 200 L 186 210 Q 240 210 420 210"
        stroke="#93C5FD"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />

      {/* ---------- HEALTHCARE MEDICAL SHIELD IN BACKGROUND ---------- */}
      <g transform="translate(260, 40)">
        {/* Outer Shield with Drop Shadow */}
        <path
          d="M60 160 C110 140 120 90 120 30 L60 5 L0 30 C0 90 10 140 60 160 Z"
          fill="url(#shieldGrad)"
          filter="drop-shadow(0 6px 12px rgba(15, 76, 129, 0.18))"
        />
        {/* Inner Lighter Border */}
        <path
          d="M60 150 C102 132 110 88 110 36 L60 14 L10 36 C10 88 18 132 60 150 Z"
          fill="#1E40AF"
          opacity="0.25"
        />
        {/* Healthcare Cross */}
        <path
          d="M52 50 H68 V72 H90 V88 H68 V110 H52 V88 H30 V72 H52 Z"
          fill="url(#crossGrad)"
        />
      </g>

      {/* ---------- FAMILY & CITIZEN FIGURES (LEFT / FOREGROUND) ---------- */}
      {/* 1. Grandfather / Senior Figure (Left) */}
      <g transform="translate(70, 75)">
        {/* Head */}
        <circle cx="28" cy="24" r="16" fill="#FDE68A" />
        {/* Hair - Grey */}
        <path d="M12 24 C12 12 44 12 44 24 C44 20 40 10 28 10 C16 10 12 20 12 24 Z" fill="#94A3B8" />
        {/* Body - Soft Slate Blue Shirt */}
        <path d="M6 135 L6 70 C6 50 20 42 28 42 C36 42 50 50 50 70 L50 135 Z" fill="#64748B" />
        {/* Collar */}
        <path d="M22 42 L28 54 L34 42" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* 2. Mother / Female Figure */}
      <g transform="translate(125, 90)">
        {/* Hair - Long dark/teal */}
        <path d="M12 26 C12 6 48 6 48 26 C52 44 48 60 48 60 C40 52 38 40 38 40 C38 40 22 40 22 40 C22 40 20 52 12 60 C12 60 8 44 12 26 Z" fill="#1E293B" />
        {/* Head */}
        <circle cx="30" cy="26" r="15" fill="#FCD34D" />
        {/* Front Hair Fringe */}
        <path d="M17 22 C22 14 38 14 43 22 C37 18 23 18 17 22 Z" fill="#1E293B" />
        {/* Body - Warm Teal Attire */}
        <path d="M8 120 L8 68 C8 50 20 44 30 44 C40 44 52 50 52 68 L52 120 Z" fill="url(#tealBody)" />
      </g>

      {/* 3. Father / Male Professional Figure */}
      <g transform="translate(180, 60)">
        {/* Head */}
        <circle cx="30" cy="26" r="17" fill="#FDE68A" />
        {/* Hair - Modern Trim */}
        <path d="M13 22 C13 10 47 10 47 22 C47 16 42 8 30 8 C18 8 13 16 13 22 Z" fill="#0F172A" />
        {/* Body - Healthcare Trust Blue Coat */}
        <path d="M6 150 L6 70 C6 48 20 44 30 44 C40 44 54 48 54 70 L54 150 Z" fill="url(#blueBody)" />
        {/* Stethoscope Accent */}
        <path d="M22 62 C22 78 38 78 38 62" stroke="#93C5FD" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="30" cy="84" r="4" fill="#93C5FD" />
      </g>

      {/* 4. Child / Younger Generation (Front Center) */}
      <g transform="translate(155, 125)">
        {/* Head */}
        <circle cx="22" cy="20" r="13" fill="#FDE68A" />
        {/* Hair */}
        <path d="M10 18 C10 8 34 8 34 18 C34 12 30 7 22 7 C14 7 10 12 10 18 Z" fill="#78350F" />
        {/* Body - Warm Bright Amber/Orange Shirt */}
        <path d="M6 85 L6 50 C6 38 14 34 22 34 C30 34 38 38 38 50 L38 85 Z" fill="url(#warmAmber)" />
      </g>

      {/* Soft Ground Shadow Base */}
      <ellipse cx="230" cy="216" rx="180" ry="10" fill="#E2E8F0" opacity="0.6" />
    </svg>
  );
};
