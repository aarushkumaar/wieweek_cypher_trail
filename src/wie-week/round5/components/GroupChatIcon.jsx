import AmongUsIcon from './AmongUsIcon';

export default function GroupChatIcon({ size = '100%', style, className }) {
  return (
    <div 
      className={className} 
      style={{ 
        position: 'relative', 
        width: size, 
        height: size, 
        ...style 
      }}
    >
      {/* Background center character (Yellow) */}
      <div style={{ position: 'absolute', top: '0%', left: '15%', width: '70%', height: '70%', zIndex: 1 }}>
        <AmongUsIcon color="#eab308" />
      </div>
      {/* Foreground left character (Blue) */}
      <div style={{ position: 'absolute', bottom: '0%', left: '0%', width: '55%', height: '55%', zIndex: 2 }}>
        <AmongUsIcon color="#2563eb" />
      </div>
      {/* Foreground right character (Red) */}
      <div style={{ position: 'absolute', bottom: '0%', right: '0%', width: '55%', height: '55%', zIndex: 2 }}>
        <AmongUsIcon color="#ef4444" />
      </div>
    </div>
  );
}
