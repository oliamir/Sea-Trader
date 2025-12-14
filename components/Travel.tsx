import React from 'react';
import { LOCATIONS, TIME_ORDER } from '../constants';
import { getTravelDuration } from '../services/gameEngine';
import { TimeOfDay } from '../types';

interface TravelProps {
  currentLocationId: string;
  currentTime: TimeOfDay;
  onTravel: (destinationId: string) => void;
  onCancel: () => void;
}

const Travel: React.FC<TravelProps> = ({ currentLocationId, currentTime, onTravel, onCancel }) => {
  // 0=Morning, 1=Noon, 2=Evening
  const currentTimeIndex = TIME_ORDER.indexOf(currentTime);

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-gray-900">יעד הפלגה</h2>
          <p className="text-gray-500 mt-2">בחר את הנמל הבא שלך</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto p-1">
        {LOCATIONS.map((loc) => {
          if (loc.id === currentLocationId) return null;
          const turns = getTravelDuration(currentLocationId, loc.id);
          // 1 turn = 6 hours (Morning->Noon)
          const hours = turns * 6;
          
          // Logic: Cannot sail if arrival pushes beyond Evening (index 2) of current day
          // Morning(0) + 1 turn = Noon(1) -> OK
          // Morning(0) + 2 turns = Evening(2) -> OK
          // Noon(1) + 2 turns = Night(3) -> ERROR
          const isValid = currentTimeIndex + turns <= 2;

          return (
            <button
              key={loc.id}
              onClick={() => isValid && onTravel(loc.id)}
              disabled={!isValid}
              className={`group relative overflow-hidden bg-white border rounded-2xl p-6 text-right transition-all duration-300
                 ${isValid 
                    ? 'border-gray-200 hover:border-blue-400 hover:shadow-lg cursor-pointer' 
                    : 'border-red-100 bg-gray-50 cursor-not-allowed opacity-80'
                 }
              `}
            >
              <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${isValid ? 'bg-gray-200 group-hover:bg-blue-500' : 'bg-red-300'}`}></div>
              
              <div className="flex justify-between items-start">
                  <div>
                      <span className={`text-4xl mb-2 block filter drop-shadow-sm transition-transform duration-300 origin-bottom-right ${isValid ? 'group-hover:scale-110' : 'grayscale'}`}>
                        {loc.imageEmoji}
                      </span>
                      <h3 className={`text-2xl font-bold transition-colors ${isValid ? 'text-gray-900 group-hover:text-blue-600' : 'text-gray-400'}`}>
                        {loc.name}
                      </h3>
                  </div>
                  
                  <div className="flex flex-col gap-1 items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide 
                          ${turns > 1 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}
                          ${!isValid ? 'opacity-50' : ''}
                          `}>
                          {hours} שעות הפלגה
                      </span>
                      
                      {!isValid && (
                         <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100 mt-1">
                             נדרשת מנוחה (לילה)
                         </span>
                      )}
                  </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-auto text-center pt-4">
        <button 
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-900 font-medium px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          ביטול וחזרה
        </button>
      </div>
    </div>
  );
};

export default Travel;