import React from 'react';
import { GameEvent } from '../types';

interface EventProps {
  event: GameEvent;
  onContinue: (choice?: string) => void;
}

const Event: React.FC<EventProps> = ({ event, onContinue }) => {
  
  const getIcon = () => {
      switch(event.type) {
          case 'PIRATES': return '🏴‍☠️';
          case 'TREASURE': return '💎';
          case 'STORM': return '⛈️';
          case 'SHIPYARD': return '🏗️';
          default: return '⛵';
      }
  };

  const getTheme = () => {
    switch(event.type) {
        case 'PIRATES': return 'bg-red-50 text-red-900 ring-red-100';
        case 'TREASURE': return 'bg-yellow-50 text-yellow-900 ring-yellow-100';
        case 'STORM': return 'bg-slate-50 text-slate-900 ring-slate-200';
        case 'SHIPYARD': return 'bg-amber-50 text-amber-900 ring-amber-200';
        default: return 'bg-blue-50 text-blue-900 ring-blue-100';
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all scale-100 ring-1 ring-black/5">
        
        <div className={`p-8 text-center flex flex-col items-center ${getTheme()}`}>
             <div className="text-6xl mb-4 filter drop-shadow-md animate-bounce">
                 {getIcon()}
             </div>
             <h2 className="text-3xl font-black mb-2">{event.title}</h2>
        </div>
        
        <div className="p-8 text-center bg-white">
            <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium">
                {event.message}
            </p>
            
            {event.type === 'SHIPYARD' && event.data ? (
                <div className="flex flex-col gap-3">
                     <button 
                        onClick={() => onContinue('UPGRADE')}
                        className="w-full py-4 bg-amber-600 text-white rounded-xl text-lg font-bold hover:bg-amber-700 hover:shadow-lg transition-all"
                    >
                        שדרג ספינה (${event.data.upgradeCost})
                    </button>
                    <button 
                        onClick={() => onContinue('IGNORE')}
                        className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl text-lg font-bold hover:bg-gray-200 transition-all"
                    >
                        לא תודה
                    </button>
                </div>
            ) : (
                <button 
                    onClick={() => onContinue()}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl text-lg font-bold hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                    המשך במשחק
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default Event;