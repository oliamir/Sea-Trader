import React, { useEffect } from 'react';
import { DAYS_OF_WEEK } from '../constants';

interface DayTransitionProps {
  day: number;
  onComplete: () => void;
}

const DayTransition: React.FC<DayTransitionProps> = ({ day, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // 2.5 seconds duration
    return () => clearTimeout(timer);
  }, [onComplete]);

  const dayName = DAYS_OF_WEEK[(day - 1) % 7];

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-gray-900/95 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="text-center p-8">
        <div className="mb-6 text-8xl animate-[bounce_2s_infinite]">
            🌅
        </div>
        <h1 className="text-7xl font-black text-yellow-400 mb-4 drop-shadow-2xl animate-in zoom-in duration-500 slide-in-from-bottom-5">
            יום {day}
        </h1>
        <div className="h-1 w-32 bg-yellow-500/50 mx-auto rounded-full mb-6"></div>
        <h2 className="text-5xl font-bold text-white tracking-wide animate-in slide-in-from-bottom-8 duration-700 delay-100">
            {dayName}
        </h2>
        <p className="text-gray-400 mt-12 text-xl font-medium animate-pulse">
            השמש עולה, המחירים משתנים...
        </p>
      </div>
    </div>
  );
};

export default DayTransition;