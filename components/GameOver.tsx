import React, { useState, useEffect } from 'react';
import { PlayerState, LeaderboardEntry } from '../types';
import { INITIAL_CASH } from '../constants';

interface GameOverProps {
  state: PlayerState;
  finalPrices: Record<string, number>;
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ state, finalPrices, onRestart }) => {
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const inventoryValue = Object.entries(state.inventory).reduce((total: number, [id, amount]) => {
    return total + ((amount as number) * (finalPrices[id] || 0));
  }, 0);

  const totalValue = state.cash + state.bankBalance + inventoryValue;
  const profit = totalValue - INITIAL_CASH;
  const isWin = profit > 0;

  useEffect(() => {
    const saved = localStorage.getItem('sea_trader_leaderboard');
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse leaderboard', e);
      }
    }
  }, []);

  const handleSaveScore = () => {
    if (!playerName.trim()) return;

    const newEntry: LeaderboardEntry = {
      name: playerName.trim(),
      score: totalValue,
      date: new Date().toLocaleDateString('he-IL')
    };

    const newLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Keep top 10

    setLeaderboard(newLeaderboard);
    localStorage.setItem('sea_trader_leaderboard', JSON.stringify(newLeaderboard));
    setIsSubmitted(true);
  };
  
  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col items-center justify-center text-center p-4">
        <div className="mb-4 inline-block p-4 rounded-full bg-gray-50">
            <span className="text-6xl filter drop-shadow-sm">{isWin ? '🏆' : '⚓'}</span>
        </div>
        
        <h1 className="text-3xl font-black mb-1 text-gray-900">
            {isWin ? 'כל הכבוד!' : 'המשחק נגמר'}
        </h1>
        <p className="text-gray-500 mb-6">
            {isWin ? 'סיימת את השבוע ברווח!' : 'השבוע נגמר, אולי בפעם הבאה?'}
        </p>

        {/* Score Card */}
        <div className="w-full max-w-sm bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-100 shadow-sm">
          <div className="flex justify-between items-center py-1 border-b border-blue-100/50">
              <span className="text-blue-800/70 text-sm font-medium">מזומן</span>
              <span className="font-bold text-blue-900">${state.cash.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-blue-100/50">
              <span className="text-blue-800/70 text-sm font-medium">בנק</span>
              <span className="font-bold text-blue-900">${state.bankBalance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-blue-100/50">
              <span className="text-blue-800/70 text-sm font-medium">שווי סחורה</span>
              <span className="font-bold text-blue-900">${inventoryValue.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center pt-3 mt-1">
              <span className="text-blue-900 font-bold text-lg">סה"כ הון</span>
              <span className="font-black text-2xl text-blue-700">${totalValue.toLocaleString()}</span>
          </div>
        </div>

        {/* Name Entry Form */}
        {!isSubmitted ? (
          <div className="w-full max-w-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <label className="block text-gray-700 text-sm font-bold mb-2">הכנס את שמך לטבלת השיאים:</label>
             <div className="flex gap-2">
               <input 
                 type="text" 
                 value={playerName}
                 onChange={(e) => setPlayerName(e.target.value)}
                 className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="ישראל ישראלי"
                 maxLength={15}
                 autoFocus
               />
               <button 
                 onClick={handleSaveScore}
                 disabled={!playerName.trim()}
                 className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 שמור
               </button>
             </div>
          </div>
        ) : (
           <div className="mb-8 p-3 bg-green-50 text-green-700 rounded-xl font-bold border border-green-100 animate-in zoom-in duration-300">
              ✅ התוצאה נשמרה בהצלחה!
           </div>
        )}

        {/* Leaderboard */}
        <div className="w-full max-w-sm mb-6">
          <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center justify-center gap-2">
            <span>🏅</span> טבלת מובילים
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <table className="w-full text-sm">
               <thead className="bg-gray-50 text-gray-500">
                 <tr>
                   <th className="px-4 py-2 text-right font-medium">#</th>
                   <th className="px-4 py-2 text-right font-medium">שם</th>
                   <th className="px-4 py-2 text-left font-medium">תוצאה</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center text-gray-400 italic">
                        אין עדיין תוצאות. היה הראשון!
                      </td>
                    </tr>
                 ) : (
                   leaderboard.map((entry, index) => (
                     <tr key={index} className={entry.name === playerName && isSubmitted ? 'bg-yellow-50' : ''}>
                       <td className="px-4 py-2 text-right font-bold text-gray-400 w-10">{index + 1}</td>
                       <td className="px-4 py-2 text-right font-medium text-gray-800 truncate max-w-[120px]">{entry.name}</td>
                       <td className="px-4 py-2 text-left font-bold text-blue-600 dir-ltr">${entry.score.toLocaleString()}</td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
          </div>
        </div>

        <button 
          onClick={onRestart}
          className="w-full max-w-sm py-3 bg-gray-900 text-white rounded-xl text-lg font-bold hover:bg-gray-800 hover:shadow-lg transition-all"
        >
          התחל שבוע חדש
        </button>
      </div>
    </div>
  );
};

export default GameOver;