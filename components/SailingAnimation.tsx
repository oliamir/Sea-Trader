import React from 'react';
import { TimeOfDay } from '../types';

interface SailingAnimationProps {
  timeOfDay: TimeOfDay;
  destinationName: string;
}

const SailingAnimation: React.FC<SailingAnimationProps> = ({ timeOfDay, destinationName }) => {
  
  // Determine sky background based on time
  const getSkyClass = () => {
    switch(timeOfDay) {
      case 'Morning': return 'bg-gradient-to-b from-sky-300 to-blue-200';
      case 'Noon': return 'bg-gradient-to-b from-blue-400 to-blue-300';
      case 'Evening': return 'bg-gradient-to-b from-indigo-900 via-purple-900 to-blue-900';
      default: return 'bg-blue-300';
    }
  };

  const isNight = timeOfDay === 'Evening';

  return (
    <div className={`absolute inset-0 z-50 overflow-hidden flex flex-col items-center justify-center ${getSkyClass()}`}>
       {/* Sun/Moon */}
       <div className={`absolute top-10 left-10 text-6xl opacity-80 ${isNight ? '' : 'animate-pulse'}`}>
          {isNight ? '🌙' : '☀️'}
       </div>

       {/* Clouds */}
       <div className="absolute top-20 right-0 animate-[sail-across_20s_linear_infinite] opacity-60">☁️</div>
       <div className="absolute top-32 right-1/4 animate-[sail-across_25s_linear_infinite] opacity-40 text-4xl">☁️</div>
       
       {/* Message */}
       <div className={`z-10 text-center mb-20 ${isNight ? 'text-white' : 'text-blue-900'}`}>
          <h2 className="text-4xl font-black mb-2 drop-shadow-md">מפליגים אל {destinationName}...</h2>
          <p className="text-xl opacity-80">המסע בעיצומו</p>
       </div>

       {/* The Sea */}
       <div className="absolute bottom-0 w-full h-1/3 bg-blue-600 overflow-hidden">
          {/* Wave 1 */}
          <div className="absolute bottom-0 w-[200%] h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNDQwIDMyMCI+PHBhdGggZmlsbD0iIzQyOTlFMSIgZmlsbC1vcGFjaXR5PSIxIiBkPSJNMCA5Nkw0OCAxMTJDOTYgMTI4IDE5MiAxNjAgMjg4IDE2MEMzODQgMTYwIDQ4MCAxMjggNTc2IDExMkM2NzIgOTYgNzY4IDk2IDg2NCAxMTJDOTYwIDEyOCAxMDU2IDE2MCAxMTUyIDE2MEMxMjQ4IDE2MCAxMzQ0IDEyOCAxMzk4IDExMkwxNDQwIDk2TDE0NDAgMzIwTDEzOTggMzIwQzEzNDQgMzIwIDEyNDggMzIwIDExNTIgMzIwQzEwNTYgMzIwIDk2MCAzMjAgODY0IDMyMEM3NjggMzIwIDY3MiAzMjAgNTc2IDMyMEM0ODAgMzIwIDM4NCAzMjAgMjg4IDMyMEMxOTIgMzIwIDk2IDMyMCA0OCAzMjBMMCAzMjBaIj48L3BhdGg+PC9zdmc+')] bg-repeat-x bg-contain wave-anim opacity-80"></div>
          
          {/* Ship */}
          <div className="ship-move bottom-10 z-20">
             <div className="text-9xl ship-float filter drop-shadow-2xl">
               ⛵
             </div>
          </div>

          {/* Wave 2 (Foreground) */}
          <div className="absolute -bottom-4 w-[200%] h-32 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNDQwIDMyMCI+PHBhdGggZmlsbD0iIzFkNGVkOCIgZmlsbC1vcGFjaXR5PSIxIiBkPSJNMCAyMjRMODAgMjEzLjNDMTYwIDIwMyAyNDAgMTgyIDMyMCAxODZDNDAwIDE5MiA0ODAgMjI0IDU2MCAyMjkuM0M2NDAgMjM1IDcyMCAyMTMgODAwIDE5MkM4ODAgMTcxIDk2MCAxNDkgMTA0MCAxNDkuM0MxMTIwIDE0OSAxMjAwIDE3MSAxMjgwIDE4Ni43QzEzNjAgMjAzIDE0NDAgMjEzIDE0ODAgMjE4LjdMMTUyMCAyMjRMMTUyMCAzMjBMMTQ4MCAzMjBDMTQ0MCAzMjAgMTM2MCAzMjAgMTI4MCAzMjBDMTIwMCAzMjAgMTEyMCAzMjAgMTA0MCAzMjBDOTYwIDMyMCA4ODAgMzIwIDgwMCAzMjBDNzIwIDMyMCA2NDAgMzIwIDU2MCAzMjBDNDgwIDMyMCA0MDAgMzIwIDMyMCAzMjBDMjQwIDMyMCAxNjAgMzIwIDgwIDMyMEwwIDMyMFoiPjwvcGF0aD48L3N2Zz4=')] bg-repeat-x bg-contain wave-anim" style={{animationDuration: '7s'}}></div>
       </div>
    </div>
  );
};

export default SailingAnimation;