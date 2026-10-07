import React from 'react';

interface CloudProLogoProps {
  variant?: 'full' | 'icon' | 'compact';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  cloudTextColor?: string; // Khusus kustomisasi warna teks 'Cloud'
  brandPrefix?: string; // Opsional awalan merk (misal: 'Platform')
  brandSuffix?: string; // Opsional akhiran merk (misal: 'Enterprise')
  noTruncate?: boolean; // Mencegah judul terpotong / ellipsis
  textSizeClass?: string; // Kustomisasi kelas ukuran teks judul
}

export const CloudProLogo: React.FC<CloudProLogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
  showSubtitle = true,
  subtitleText,
  cloudTextColor,
  brandPrefix,
  brandSuffix,
  noTruncate = false,
  textSizeClass,
}) => {
  const gradId = React.useId().replace(/:/g, '');
  const iconPixelSizes = {
    sm: 'w-7 h-7 min-w-7 max-w-7 min-h-7 max-h-7',
    md: 'w-9 h-9 min-w-9 max-w-9 min-h-9 max-h-9',
    lg: 'w-11 h-11 min-w-11 max-w-11 min-h-11 max-h-11',
    xl: 'w-14 h-14 min-w-14 max-w-14 min-h-14 max-h-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const subSizes = {
    sm: 'text-[7.5px] sm:text-[8px] tracking-[0.08em] sm:tracking-[0.16em]',
    md: 'text-[8px] sm:text-[9.5px] tracking-[0.06em] sm:tracking-[0.18em]',
    lg: 'text-[9.5px] sm:text-[11px] tracking-[0.12em] sm:tracking-[0.22em]',
    xl: 'text-xs tracking-[0.25em]',
  };

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none min-w-0 max-w-full ${className}`}>
      {/* Cloud PRO Classy Modern Vector Emblem */}
      <div 
        className={`relative shrink-0 ${iconPixelSizes[size]} transition-all duration-300 group-hover:scale-105 group-hover:shadow-sky-500/30 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 via-blue-600/10 to-indigo-600/20 p-1 border border-sky-400/30 shadow-md shadow-sky-500/15 backdrop-blur-md`}
        style={{
          width: size === 'sm' ? 28 : size === 'md' ? 36 : size === 'lg' ? 46 : 58,
          height: size === 'sm' ? 28 : size === 'md' ? 36 : size === 'lg' ? 46 : 58,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            {/* Primary Cloud Body Metallic Gradient */}
            <linearGradient id={`cloudGrad_${gradId}`} x1="15%" y1="10%" x2="85%" y2="90%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="40%" stopColor="#0284c7" />
              <stop offset="85%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            {/* Volumetric Crest Highlight */}
            <linearGradient id={`cloudCrest_${gradId}`} x1="30%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#bae6fd" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
            {/* Lower Shadow Depth */}
            <linearGradient id={`cloudShade_${gradId}`} x1="50%" y1="50%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0" />
              <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.45" />
            </linearGradient>
            {/* PRO Golden Spark */}
            <linearGradient id={`goldSpark_${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Ambient Outer Cloud Aura */}
          <path
            d="M 28 78 C 16 78 8 70 8 59 C 8 49 16 41 26 39 C 29 25 41 16 55 16 C 68 16 78 23 82 34 C 91 36 98 44 98 55 C 98 67 89 77 78 78 Z"
            fill={`url(#cloudGrad_${gradId})`}
          />

          {/* Underbelly Depth */}
          <path
            d="M 28 78 C 16 78 8 70 8 59 C 8 55 10 52 13 49 C 18 68 33 76 56 76 C 72 76 86 68 93 54 C 95 56 96 58 96 61 C 96 71 88 78 78 78 Z"
            fill={`url(#cloudShade_${gradId})`}
          />

          {/* Inner Crest Reflection Curve */}
          <path
            d="M 32 37 C 35 27 44 20 55 20 C 65 20 73 25 77 33"
            stroke={`url(#cloudCrest_${gradId})`}
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Center Cloud Core Puff Highlight */}
          <ellipse
            cx="44"
            cy="46"
            rx="14"
            ry="9"
            fill="#ffffff"
            fillOpacity="0.18"
            transform="rotate(-15 44 46)"
          />

          {/* Sleek Enterprise Fiber Data Streamlines (Classy speed arcs) */}
          <path
            d="M 22 66 H 58"
            stroke="#ffffff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeOpacity="0.95"
          />
          <path
            d="M 64 66 H 76"
            stroke="#ffffff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeOpacity="0.95"
          />
          <path
            d="M 28 58 H 48"
            stroke="#bae6fd"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />
          <path
            d="M 54 58 H 68"
            stroke="#bae6fd"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />

          {/* Classy "PRO" Gold Spark Star (Top Right) */}
          <g transform="translate(73, 20) scale(0.9)">
            <path
              d="M 12 0 L 14.5 8.5 L 23 11 L 14.5 13.5 L 12 22 L 9.5 13.5 L 1 11 L 9.5 8.5 Z"
              fill={`url(#goldSpark_${gradId})`}
            />
            <circle cx="12" cy="11" r="1.8" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {variant !== 'icon' && (
        <div className={`flex flex-col leading-none ${noTruncate ? 'min-w-0' : 'min-w-0'}`}>
          <div
            className={`font-extrabold tracking-tight ${
              noTruncate ? 'whitespace-nowrap' : 'truncate'
            } ${textSizeClass || textSizes[size]}`}
          >
            {brandPrefix && (
              <>
                <span className={cloudTextColor ? cloudTextColor : "text-slate-900 dark:text-white"}>
                  {brandPrefix}
                </span>{' '}
              </>
            )}
            <span className={cloudTextColor ? cloudTextColor : "text-slate-900 dark:text-white"}>
              Karsa
            </span>{' '}
            <span className="text-[#005dbd] dark:text-[#38bdf8]">Cloud</span>{' '}
            <span className="text-amber-500 dark:text-amber-400 font-black tracking-tight">
              {brandSuffix || 'PRO'}
            </span>
          </div>
          {showSubtitle && (
            <div
              className={`font-bold uppercase text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 ${subSizes[size]} ${
                noTruncate ? 'whitespace-nowrap' : ''
              }`}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
              <span className={noTruncate ? 'whitespace-nowrap' : 'truncate'}>
                {subtitleText || (variant === 'compact' ? 'KARSA CLOUD PRO PANEL' : 'KARSA CLOUD PRO INFRASTRUCTURE')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
