export default function AmongUsIcon({ color = '#44d62c', className, style }) {
  // We use rgba(0,0,0,0.2) for shadows and rgba(255,255,255,0.4) for highlights 
  // to make it look 3D and match the specific reference image provided.
  return (
    <svg 
      className={className} 
      style={{ width: '100%', height: '100%', ...style }} 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. Ground Shadow */}
      <ellipse cx="105" cy="185" rx="80" ry="12" fill="rgba(0,0,0,0.4)" />
      
      {/* 2. Backpack Base */}
      <path 
        d="M 50 65 C 20 65 10 75 10 100 L 10 145 C 10 165 20 175 50 175 Z" 
        fill={color} 
      />
      {/* Backpack Highlight */}
      <path 
        d="M 50 65 C 20 65 10 75 10 100 C 15 80 30 75 50 75 Z" 
        fill="rgba(255,255,255,0.4)" 
      />
      {/* Backpack Shade */}
      <path 
        d="M 10 120 L 10 145 C 10 165 20 175 50 175 L 50 150 C 30 150 20 140 20 120 Z" 
        fill="rgba(0,0,0,0.2)" 
      />
      {/* Backpack Stroke */}
      <path 
        d="M 50 65 C 20 65 10 75 10 100 L 10 145 C 10 165 20 175 50 175 Z" 
        fill="none" 
        stroke="#000" 
        strokeWidth="14" 
        strokeLinejoin="round" 
      />
      
      {/* 3. Main Body Base */}
      <path 
        d="M 125 20 C 70 20 50 45 50 90 L 50 165 C 50 185 75 190 85 190 C 100 190 105 175 105 160 L 105 140 C 105 135 125 135 125 140 L 125 160 C 125 175 135 190 150 190 C 165 190 175 180 175 160 L 175 80 C 175 40 160 20 125 20 Z" 
        fill={color} 
      />
      {/* Body Shade */}
      <path 
        d="M 50 165 C 50 185 75 190 85 190 C 100 190 105 175 105 160 L 105 140 C 105 135 125 135 125 140 L 125 160 C 125 175 135 190 150 190 C 165 190 175 180 175 160 L 175 110 C 175 130 140 140 105 140 C 75 140 60 150 50 165 Z" 
        fill="rgba(0,0,0,0.2)" 
      />
      {/* Body Stroke */}
      <path 
        d="M 125 20 C 70 20 50 45 50 90 L 50 165 C 50 185 75 190 85 190 C 100 190 105 175 105 160 L 105 140 C 105 135 125 135 125 140 L 125 160 C 125 175 135 190 150 190 C 165 190 175 180 175 160 L 175 80 C 175 40 160 20 125 20 Z" 
        fill="none" 
        stroke="#000" 
        strokeWidth="14" 
        strokeLinejoin="round" 
      />
      
      {/* 4. Visor Base */}
      <path 
        d="M 165 55 C 185 55 190 65 190 80 C 190 95 175 105 155 105 L 110 105 C 90 105 80 95 80 80 C 80 65 90 55 110 55 Z" 
        fill="#9EBDC8" 
      />
      {/* Visor Highlight */}
      <path 
        d="M 155 62 C 165 62 175 65 175 70 C 175 75 165 78 155 78 L 125 78 C 115 78 105 75 105 70 C 105 65 115 62 125 62 Z" 
        fill="#FFFFFF" 
      />
      {/* Visor Stroke */}
      <path 
        d="M 165 55 C 185 55 190 65 190 80 C 190 95 175 105 155 105 L 110 105 C 90 105 80 95 80 80 C 80 65 90 55 110 55 Z" 
        fill="none" 
        stroke="#000" 
        strokeWidth="14" 
      />
    </svg>
  );
}
