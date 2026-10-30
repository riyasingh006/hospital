"use client";

import * as React from "react";
import { motion } from "framer-motion";

const MARKERS = [
  { x: 172, y: 96, label: "Delhi NCR", primary: true },
  { x: 106, y: 268, label: "Mumbai" },
  { x: 293, y: 232, label: "Kolkata" },
  { x: 214, y: 288, label: "Hyderabad" },
  { x: 196, y: 338, label: "Bengaluru" },
  { x: 208, y: 372, label: "Chennai" },
];

/**
 * Stylised, India-inspired map used in the hero visualisation.
 * Decorative only — real geospatial views use the map components.
 */
export function IndiaMapViz() {
  return (
    <svg
      viewBox="0 0 380 440"
      className="h-full w-full"
      role="img"
      aria-label="Stylised map of India with partner hospitals"
    >
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#DCE6F5" strokeWidth="0.5" />
        </pattern>
        <linearGradient id="landGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EEF3FB" />
          <stop offset="100%" stopColor="#E2EBF7" />
        </linearGradient>
      </defs>

      <rect width="380" height="440" fill="url(#grid)" opacity="0.5" />

      <path
        d="M172 16 C186 12,198 22,202 34 C212 42,222 46,226 56 C218 66,210 72,212 82
           C220 92,214 102,204 104 C196 112,184 112,176 118 C156 122,140 116,126 126
           C112 132,100 130,88 142 C74 148,60 154,52 168 C46 184,54 198,68 202
           C80 206,90 204,96 216 C92 236,86 256,92 278 C98 306,108 334,122 360
           C132 384,142 406,158 424 C164 430,172 432,174 422 C176 404,182 388,190 372
           C200 350,212 332,226 318 C240 304,254 296,266 286 C276 272,282 256,292 244
           C300 232,306 220,304 206 C312 196,322 190,334 184 C348 176,360 166,366 152
           C356 146,344 148,334 144 C320 140,308 134,300 124 C292 114,284 106,272 104
           C260 100,252 92,246 82 C240 70,232 62,222 56 C216 44,208 34,196 28
           C188 18,178 14,172 16 Z"
        fill="url(#landGrad)"
        stroke="#8AAAD9"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* route arcs from Delhi to partner cities */}
      {MARKERS.slice(1).map((m) => {
        const mx = (172 + m.x) / 2 + (m.y - 96) * 0.18;
        const my = (96 + m.y) / 2 - Math.abs(m.x - 172) * 0.12;
        return (
          <motion.path
            key={m.label}
            d={`M172 96 Q ${mx} ${my} ${m.x} ${m.y}`}
            fill="none"
            stroke="#5482C2"
            strokeWidth="1"
            strokeDasharray="3 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.55 }}
            transition={{ duration: 1.6, delay: 0.4, ease: "easeOut" }}
          />
        );
      })}

      {MARKERS.map((m, i) => (
        <g key={m.label}>
          <motion.circle
            cx={m.x}
            cy={m.y}
            r={m.primary ? 14 : 10}
            fill={m.primary ? "#EA7A12" : "#12813B"}
            animate={{ opacity: [0.25, 0.05, 0.25] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.35 }}
          />
          <circle
            cx={m.x}
            cy={m.y}
            r={m.primary ? 5 : 4}
            fill={m.primary ? "#C25E0B" : "#12813B"}
            stroke="#fff"
            strokeWidth="1.5"
          />
          <text
            x={m.x + 9}
            y={m.y - 7}
            className="fill-primary-800"
            fontSize="9.5"
            fontWeight="600"
          >
            {m.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
