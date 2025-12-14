import React, { useEffect, useState } from 'react';
import { TimeOfDay } from '../types';
import { LOCATIONS } from '../constants';

interface SailingAnimationProps {
  timeOfDay: TimeOfDay;
  fromId: string;
  toId: string;
}

// Normalized map coordinates (0-100) suitable for the layout
const COORDS: Record<string, { x: number, y: number }> = {
  turkey: { x: 75, y: 20 },
  israel: { x: 85, y: 65 },
  egypt: { x: 65, y: 85 },
  italy: { x: 20, y: 35 },
};

const SailingAnimation: React.FC<SailingAnimationProps> = ({ timeOfDay, fromId, toId }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress smoothly from 0 to 1 over 2.5 seconds
    const duration = 2500; 
    const startTime = Date.now();
    let animationFrameId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);

      if (p < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const start = COORDS[fromId] || { x: 50, y: 50 };
  const end = COORDS[toId] || { x: 50, y: 50 };

  // Interpolate position based on progress
  const currentX = start.x + (end.x - start.x) * progress;
  const currentY = start.y + (end.y - start.y) * progress;

  // Determine direction for simple flip
  const dx = end.x - start.x;
  const isGoingWest = dx < 0;

  // Dynamic Background based on Time of Day
  const getBackground = () => {
    switch(timeOfDay) {
      case 'Morning': return 'bg-gradient-to-b from-sky-300 via-sky-400 to-blue-500';
      case 'Noon': return 'bg-gradient-to-b from-blue-400 via-blue-500 to-blue-700';
      case 'Evening': return 'bg-gradient-to-b from-slate-900 via-indigo-900 to-purple-900';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className={`absolute inset-0 z-50 flex flex-col overflow-hidden ${getBackground()}`}>
      
      {/* --- SKY ELEMENTS --- */}
      <div className="absolute inset-0 pointer-events-none">
        {timeOfDay === 'Evening' ? (
             <div className="absolute top-10 right-10 text-6xl opacity-80 animate-pulse drop-shadow-lg">🌙</div>
        ) : (
             <div className="absolute top-8 right-8 text-7xl opacity-90 text-yellow-300 animate-[spin_10s_linear_infinite] drop-shadow-lg" style={{ animationDuration: '20s' }}>☀️</div>
        )}
        
        {/* Animated Clouds */}
        <div className="absolute top-20 text-6xl opacity-40 animate-[sail-across_25s_linear_infinite]" style={{ right: '-20%' }}>☁️</div>
        <div className="absolute top-40 text-4xl opacity-30 animate-[sail-across_35s_linear_infinite_reverse]" style={{ right: '120%' }}>☁️</div>
      </div>

      {/* --- MAP LAYER --- */}
      <div className="absolute inset-0 w-full h-full p-4">
         <svg className="w-full h-full overflow-visible drop-shadow-md">
            {/* Dashed Route Line */}
            <path 
                d={`M ${start.x}% ${start.y}% L ${end.x}% ${end.y}%`}
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeDasharray="8 6"
                strokeLinecap="round"
                className="opacity-40"
            />
            {/* Solid Progress Line */}
             <path 
                d={`M ${start.x}% ${start.y}% L ${currentX}% ${currentY}%`}
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                className="opacity-80 drop-shadow-sm"
            />
         </svg>

         {/* Location Markers */}
         {Object.entries(COORDS).map(([id, pos]) => {
             const locData = LOCATIONS.find(l => l.id === id);
             const isStart = id === fromId;
             const isEnd = id === toId;
             const isActive = isStart || isEnd;
             
             return (
                 <div 
                    key={id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-700
                        ${isActive ? 'scale-100 z-10' : 'scale-75 opacity-50 grayscale z-0'}
                    `}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                 >
                     <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-xl border-4 transition-colors
                         ${isActive ? 'bg-white border-blue-500' : 'bg-white/80 border-gray-300'}
                     `}>
                         {locData?.imageEmoji}
                     </div>
                     <span className={`mt-2 font-bold text-sm px-3 py-1 rounded-full backdrop-blur-md shadow-sm transition-colors whitespace-nowrap
                         ${isActive ? 'bg-white/95 text-blue-900' : 'bg-black/20 text-white/80'}
                     `}>
                         {locData?.name}
                     </span>
                 </div>
             )
         })}

         {/* --- THE SHIP --- */}
         <div 
            className="absolute w-16 h-16 flex items-center justify-center text-5xl transition-transform duration-75 filter drop-shadow-2xl z-20"
            style={{ 
                left: `${currentX}%`, 
                top: `${currentY}%`,
                transform: `translate(-50%, -50%) ${isGoingWest ? 'scaleX(-1)' : ''}`
            }}
         >
             {/* Bobbing Animation */}
             <div className="animate-[float-ship_2s_ease-in-out_infinite]">
                 ⛵
             </div>
             
             {/* Wake / Particles Effect */}
             <div className="absolute top-3/4 left-1/2 -translate-x-1/2 w-20 h-10 pointer-events-none">
                  <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75" style={{ animationDuration: '1s', animationDelay: '0ms' }}></div>
                  <div className="absolute bottom-1 left-1/3 w-1 h-1 bg-white rounded-full animate-ping opacity-60" style={{ animationDuration: '1.2s', animationDelay: '200ms' }}></div>
                  <div className="absolute bottom-0 left-2/3 w-1 h-1 bg-white rounded-full animate-ping opacity-60" style={{ animationDuration: '0.8s', animationDelay: '400ms' }}></div>
             </div>
         </div>
      </div>

      {/* Decorative Ocean Overlay */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
      
      {/* Route Status Text */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
          <div className="inline-block bg-black/30 backdrop-blur-md text-white px-4 py-2 rounded-xl font-bold text-sm border border-white/10 shadow-lg">
              מפליג מ{LOCATIONS.find(l => l.id === fromId)?.name} ל{LOCATIONS.find(l => l.id === toId)?.name}...
          </div>
      </div>
    </div>
  );
};

export default SailingAnimation;