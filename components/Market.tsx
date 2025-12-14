import React, { useState } from 'react';
import { PlayerState } from '../types';
import { GOODS } from '../constants';

interface MarketProps {
  state: PlayerState;
  prices: Record<string, number>;
  allPrices: Record<string, Record<string, number>>;
  onTrade: (goodId: string, amount: number, isBuy: boolean) => void;
  onTravelClick: () => void;
  onRest: () => void;
  onBankClick: () => void;
}

type MenuState = 'MAIN' | 'TRADE';

const Market: React.FC<MarketProps> = ({ state, prices, onTrade, onTravelClick, onRest, onBankClick }) => {
  const [menu, setMenu] = useState<MenuState>('MAIN');

  // Main Menu View
  if (menu === 'MAIN') {
      return (
          <div className="flex flex-col items-center h-full justify-center">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-gray-900 mb-2">תפריט פעולות</h1>
                <p className="text-gray-500">מה תרצה לעשות היום?</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
                  {/* Combined Trade Button */}
                  <button onClick={() => setMenu('TRADE')} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md hover:text-blue-600 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">⚖️</span>
                        <span className="font-bold text-lg">מסחר בסחורות</span>
                      </div>
                      <span className="text-gray-300 group-hover:text-blue-500">←</span>
                  </button>
                  
                  {/* Travel */}
                  <button onClick={onTravelClick} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md hover:text-indigo-600 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🚢</span>
                        <span className="font-bold text-lg">הפלגה ליעד אחר</span>
                      </div>
                      <span className="text-gray-300 group-hover:text-indigo-500">←</span>
                  </button>
                  
                  {/* Bank */}
                  <button onClick={onBankClick} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:shadow-md hover:text-orange-600 transition-all group">
                       <div className="flex items-center gap-3">
                        <span className="text-2xl">🏦</span>
                        <span className="font-bold text-lg">הבנק הבינלאומי</span>
                      </div>
                      <span className="text-gray-300 group-hover:text-orange-500">←</span>
                  </button>
                  
                  {/* Rest */}
                  <button onClick={onRest} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-500 hover:shadow-md hover:text-gray-800 transition-all group">
                       <div className="flex items-center gap-3">
                        <span className="text-2xl">🛏️</span>
                        <span className="font-bold text-lg">מנוחה (יום הבא)</span>
                      </div>
                      <span className="text-gray-300 group-hover:text-gray-500">←</span>
                  </button>
              </div>
          </div>
      );
  }

  // Unified Trade View
  if (menu === 'TRADE') {
      return (
          <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                    <h2 className="text-3xl font-black text-gray-900">שוק המסחר</h2>
                    <p className="text-gray-500 text-sm mt-1">קניה ומכירה של סחורות</p>
                </div>
                <button onClick={() => setMenu('MAIN')} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                    חזרה לתפריט
                </button>
              </div>
              
              <div className="grid gap-3 overflow-y-auto pr-2">
                  {GOODS.map(g => {
                      const price = prices[g.id];
                      const owned = state.inventory[g.id];
                      const canBuy = Math.floor(state.cash / price);

                      return (
                          <div key={g.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                              {/* Info */}
                              <div className="flex items-center gap-4 min-w-[180px]">
                                  <div className="text-3xl bg-gray-50 w-12 h-12 flex items-center justify-center rounded-full shadow-inner">{g.icon}</div>
                                  <div>
                                      <h3 className="text-lg font-bold text-gray-900 leading-tight">{g.name}</h3>
                                      <div className="text-sm font-mono text-gray-500">
                                        מחיר: <span className="text-gray-900 font-bold">${price}</span>
                                      </div>
                                  </div>
                              </div>

                              {/* Inventory Status (Center) */}
                              <div className="bg-gray-50 px-4 py-2 rounded-lg text-center min-w-[100px]">
                                <span className="text-xs text-gray-500 block">במלאי</span>
                                <span className="text-xl font-bold text-gray-800">{owned}</span>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-6">
                                  {/* Buy Controls */}
                                  <div className="flex flex-col gap-1 items-center">
                                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">קנייה</span>
                                      <div className="flex gap-1">
                                          <button 
                                            onClick={() => onTrade(g.id, 1, true)} 
                                            disabled={state.cash < price}
                                            className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                            title="קנה יחידה אחת"
                                          >
                                              +1
                                          </button>
                                          <button 
                                            onClick={() => onTrade(g.id, Math.max(1, canBuy), true)} 
                                            disabled={canBuy === 0}
                                            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                            title={`קנה מקסימום (${canBuy})`}
                                          >
                                              מקסימום
                                          </button>
                                      </div>
                                  </div>

                                  <div className="w-px h-10 bg-gray-200"></div>

                                  {/* Sell Controls */}
                                  <div className="flex flex-col gap-1 items-center">
                                      <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">מכירה</span>
                                      <div className="flex gap-1">
                                          <button 
                                            onClick={() => onTrade(g.id, 1, false)} 
                                            disabled={owned === 0}
                                            className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                            title="מכור יחידה אחת"
                                          >
                                              -1
                                          </button>
                                          <button 
                                            onClick={() => onTrade(g.id, owned, false)} 
                                            disabled={owned === 0}
                                            className="px-3 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                            title="מכור הכל"
                                          >
                                              הכל
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
              
              <div className="mt-auto pt-4 text-center shrink-0">
                   <span className="inline-block px-4 py-2 bg-green-50 text-green-700 rounded-full font-bold border border-green-100 shadow-sm">
                       💵 יתרה זמינה: ${state.cash.toLocaleString()}
                   </span>
              </div>
          </div>
      );
  }

  return null;
};

export default Market;