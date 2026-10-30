/**
 * Detailed vector illustration of a modern Indian hospital campus:
 * glass tower, entrance canopy, ambulance, trees and driveway.
 * Rendered inline so it needs no network/image assets and fades into the page.
 */
export function HospitalVisual({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 960 540"
      className={className}
      role="img"
      aria-label="Modern multispeciality hospital with an ambulance at the entrance"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EAF3FF" />
          <stop offset="0.65" stopColor="#F5FAFF" />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BFDBFE" />
          <stop offset="0.5" stopColor="#93C5FD" />
          <stop offset="1" stopColor="#60A5FA" />
        </linearGradient>
        <linearGradient id="glassSide" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#DBEAFE" />
          <stop offset="1" stopColor="#BFDBFE" />
        </linearGradient>
        <linearGradient id="towerTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EFF6FF" />
          <stop offset="1" stopColor="#DBEAFE" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF7E6" />
          <stop offset="1" stopColor="#FFF7E6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DCE4EE" />
          <stop offset="1" stopColor="#CBD5E1" />
        </linearGradient>
      </defs>

      {/* sky + atmosphere */}
      <rect width="960" height="540" fill="url(#sky)" />
      <circle cx="150" cy="90" r="130" fill="url(#sun)" />

      {/* decorative medical motifs */}
      <g stroke="#C7DCF8" strokeWidth="3" fill="none" opacity="0.55" strokeLinecap="round" strokeLinejoin="round">
        <path d="M60 210 h34 l10 -22 14 46 12 -24 h30" />
      </g>
      <g fill="#D9E9FC" opacity="0.65">
        <path d="M120 118h20v-20h18v20h20v18h-20v20h-18v-20h-20z" transform="scale(0.62) translate(70 40)" />
        <path d="M700 84h26v-26h24v26h26v24h-26v26h-24v-26h-26z" transform="scale(0.5) translate(700 80)" opacity="0.7" />
      </g>

      {/* ground */}
      <rect y="430" width="960" height="110" fill="#E7F0E4" />
      <path d="M0 430 h960 v10 H0 z" fill="#D8E6D4" />

      {/* ---- rear block ---- */}
      <rect x="600" y="240" width="250" height="190" rx="4" fill="#E2ECF9" />
      <g fill="#BFD7F3">
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2, 3, 4].map((c) => (
            <rect key={`${r}-${c}`} x={618 + c * 46} y={254 + r * 42} width="30" height="26" rx="2" />
          ))
        )}
      </g>

      {/* ---- main glass tower ---- */}
      <rect x="300" y="140" width="330" height="290" fill="url(#towerTop)" />
      <rect x="300" y="168" width="330" height="262" fill="url(#glass)" />
      {/* mullions */}
      <g stroke="#FFFFFF" strokeOpacity="0.75">
        {[355, 410, 465, 520, 575].map((x) => (
          <line key={x} x1={x} y1="168" x2={x} y2="430" strokeWidth="3" />
        ))}
        {[212, 256, 300, 344, 388].map((y) => (
          <line key={y} x1="300" y1={y} x2="630" y2={y} strokeWidth="2.5" />
        ))}
      </g>
      {/* reflections */}
      <path d="M300 168 L420 168 L340 430 L300 430 Z" fill="#FFFFFF" opacity="0.28" />
      <path d="M470 168 L520 168 L450 430 L415 430 Z" fill="#FFFFFF" opacity="0.16" />
      {/* roof crown */}
      <rect x="292" y="128" width="346" height="14" rx="4" fill="#062B73" opacity="0.9" />
      {/* rooftop sign */}
      <rect x="382" y="96" width="196" height="34" rx="6" fill="#FFFFFF" stroke="#D7E3F4" />
      <text x="480" y="119" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="15" fontWeight="800" fill="#062B73" letterSpacing="1.5">
        MULTISPECIALITY HOSPITAL
      </text>

      {/* side podium wing */}
      <rect x="216" y="308" width="86" height="122" fill="url(#glassSide)" />
      <g stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="2">
        <line x1="245" y1="308" x2="245" y2="430" />
        <line x1="274" y1="308" x2="274" y2="430" />
        <line x1="216" y1="350" x2="302" y2="350" />
        <line x1="216" y1="390" x2="302" y2="390" />
      </g>

      {/* ---- entrance ---- */}
      <rect x="392" y="352" width="146" height="78" rx="4" fill="#0B3D91" />
      <g stroke="#9FC3F5" strokeWidth="2">
        <line x1="441" y1="356" x2="441" y2="428" />
        <line x1="489" y1="356" x2="489" y2="428" />
      </g>
      <rect x="380" y="338" width="170" height="16" rx="4" fill="#123A7A" />
      <rect x="452" y="306" width="56" height="30" rx="4" fill="#FFFFFF" stroke="#D7E3F4" />
      <path d="M474 312h12v-8h8v8h12v8h-12v8h-8v-8h-12z" fill="#E23B3B" transform="translate(-6 0)" />
      {/* canopy posts */}
      <rect x="386" y="354" width="5" height="74" fill="#123A7A" />
      <rect x="539" y="354" width="5" height="74" fill="#123A7A" />

      {/* ---- ambulance ---- */}
      <g transform="translate(560 366)">
        <rect x="0" y="10" width="132" height="44" rx="8" fill="#FFFFFF" stroke="#C4CFDD" />
        <path d="M100 54 L112 32 q2 -4 7 -4 h13 v26 z" fill="#FFFFFF" stroke="#C4CFDD" />
        <rect x="104" y="36" width="18" height="12" rx="2" fill="#BFD9FA" />
        <rect x="8" y="16" width="88" height="12" rx="3" fill="#E23B3B" />
        <path d="M44 40h10v-10h8v10h10v8h-10v10h-8v-10h-10z" fill="#E23B3B" />
        <circle cx="26" cy="58" r="11" fill="#1E293B" />
        <circle cx="26" cy="58" r="5" fill="#94A3B8" />
        <circle cx="106" cy="58" r="11" fill="#1E293B" />
        <circle cx="106" cy="58" r="5" fill="#94A3B8" />
        <rect x="30" y="4" width="26" height="7" rx="2.5" fill="#E23B3B" />
        <rect x="60" y="4" width="14" height="7" rx="2.5" fill="#2563EB" />
      </g>

      {/* ---- trees ---- */}
      <g>
        {[70, 128, 186].map((x, i) => (
          <g key={x} transform={`translate(${x} ${318 - i * 8})`}>
            <rect x="-4" y="52" width="8" height="34" rx="3" fill="#8B6748" />
            <circle cx="0" cy="34" r="30" fill="#3AAA35" />
            <circle cx="-18" cy="48" r="20" fill="#57BC51" />
            <circle cx="18" cy="48" r="20" fill="#2E9429" />
            <circle cx="0" cy="52" r="18" fill="#43AF3D" />
          </g>
        ))}
        {[880, 934].map((x, i) => (
          <g key={x} transform={`translate(${x} ${326 - i * 6})`}>
            <rect x="-4" y="50" width="8" height="32" rx="3" fill="#8B6748" />
            <circle cx="0" cy="32" r="27" fill="#3AAA35" />
            <circle cx="-16" cy="46" r="18" fill="#57BC51" />
            <circle cx="16" cy="46" r="18" fill="#2E9429" />
          </g>
        ))}
        <ellipse cx="360" cy="446" rx="26" ry="10" fill="#57BC51" />
        <ellipse cx="640" cy="448" rx="30" ry="10" fill="#43AF3D" />
        <ellipse cx="180" cy="450" rx="34" ry="11" fill="#57BC51" />
        <ellipse cx="820" cy="452" rx="30" ry="11" fill="#43AF3D" />
      </g>

      {/* ---- road / driveway ---- */}
      <path d="M0 470 q480 -18 960 0 v70 H0 z" fill="url(#road)" />
      <g fill="#FFFFFF" opacity="0.85">
        {[40, 160, 280, 400, 520, 640, 760, 880].map((x) => (
          <rect key={x} x={x} y="500" width="46" height="6" rx="3" transform={`rotate(${x < 480 ? 1 : -1} ${x + 23} 503)`} />
        ))}
      </g>
      <path d="M470 470 L450 540 M490 470 L510 540" stroke="#F57C00" strokeWidth="4" opacity="0.35" strokeLinecap="round" />
    </svg>
  );
}
