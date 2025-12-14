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
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  // Calculate current capacity usage
  const currentLoad = (Object.values(state.inventory) as number[]).reduce((acc, val) => acc + val, 0);
  const remainingSpace = state.maxCapacity - currentLoad;
  const capacityPercent = (currentLoad / state.maxCapacity) * 100;
  
  const isHighLoad = capacityPercent > 80;
  const isOverloaded = currentLoad > state.maxCapacity;

  const handleQuantityChange = (id: string, value: string) => {
      setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const handleTradeAction = (goodId: string, amount: number, isBuy: boolean) => {
      onTrade(goodId, amount, isBuy);
      setQuantities(prev => ({ ...prev, [goodId]: '' })); // Reset after trade
  };

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
                  <button onClick={() => setMenu('TRADE')} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl group-hover:bg-blue-100 transition-colors">⚖️</div>
                        <span className="font-bold text-lg text-gray-800">לקנות / למכור</span>
                      </div>
                      <span className="text-gray-300 group-hover:text-blue-500 font-bold">←</span>
                  </button>
                  
                  {/* Travel */}
                  <button onClick={onTravelClick} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-indigo-500 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xl group-hover:bg-indigo-100 transition-colors">🚢</div>
                        <span className="font-bold text-lg text-gray-800">הפלגה ליעד אחר</span>
                      </div>
                      <span className="text-gray-300 group-hover:text-indigo-500 font-bold">←</span>
                  </button>
                  
                  {/* Bank */}
                  <button onClick={onBankClick} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-emerald-500 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                       <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-xl group-hover:bg-emerald-100 transition-colors">🏦</div>
                        <span className="font-bold text-lg text-gray-800">בנק</span>
                      </div>
                      <span className="text-gray-300 group-hover:text-emerald-500 font-bold">←</span>
                  </button>
                  
                  {/* Rest */}
                  <button onClick={onRest} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-500 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                       <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xl group-hover:bg-gray-100 transition-colors">🛏️</div>
                        <span className="font-bold text-lg text-gray-800">מנוחה (יום הבא)</span>
                      </div>
                      <span className="text-gray-300 group-hover:text-gray-500 font-bold">←</span>
                  </button>
              </div>
          </div>
      );
  }

  // Unified Trade View - Compact List with Inputs
  if (menu === 'TRADE') {
      return (
          <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">שוק המסחר</h2>
                </div>
                <button onClick={() => setMenu('MAIN')} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-bold">
                    חזרה
                </button>
              </div>

              {/* Capacity Bar */}
              <div className={`mb-4 bg-white p-3 rounded-xl border shadow-sm transition-colors duration-300 ${isOverloaded ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${isOverloaded ? 'text-red-700' : 'text-gray-500'}`}>
                          תפוסה
                      </span>
                      <span className={`text-sm font-bold ${isOverloaded ? 'text-red-700' : 'text-gray-900'}`}>
                          {currentLoad} / {state.maxCapacity}
                      </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${isOverloaded ? 'bg-red-500' : isHighLoad ? 'bg-orange-400' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(100, capacityPercent)}%` }}
                      ></div>
                  </div>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                  {GOODS.map(g => {
                      const price = prices[g.id];
                      const owned = state.inventory[g.id];
                      
                      const maxCanBuyCash = Math.floor(state.cash / price);
                      
                      const inputValue = quantities[g.id] ?? '';
                      const inputAmount = parseInt(inputValue, 10) || 0;
                      
                      const canBuy = inputAmount > 0 && inputAmount <= maxCanBuyCash;
                      const canSell = inputAmount > 0 && inputAmount <= owned;

                      return (
                          <div key={g.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-3">
                              {/* Left Info */}
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-2xl shadow-inner shrink-0">
                                      {g.icon}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                      <span className="font-bold text-gray-900 text-lg leading-tight truncate">{g.name}</span>
                                      <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                          <span className="whitespace-nowrap">מחיר: <span className="font-medium text-gray-900">${price}</span></span>
                                          <span className="hidden sm:inline text-gray-300">|</span>
                                          <span className="whitespace-nowrap">מלאי: <span className="font-medium text-gray-900">{owned}</span></span>
                                      </div>
                                  </div>
                              </div>

                              {/* Right Controls */}
                              <div className="flex items-center gap-2 shrink-0">
                                  {/* Input */}
                                  <div className="w-16 flex flex-col gap-1">
                                      <input 
                                          type="number" 
                                          value={inputValue}
                                          onChange={(e) => handleQuantityChange(g.id, e.target.value)}
                                          placeholder="0"
                                          className="w-full h-9 border border-gray-300 rounded-lg text-center font-bold text-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all"
                                      />
                                      <div className="flex justify-between px-0.5">
                                          <button onClick={() => handleQuantityChange(g.id, maxCanBuyCash.toString())} className="text-[10px] font-bold text-blue-600 hover:underline">
                                            מקס'
                                          </button>
                                          <button onClick={() => handleQuantityChange(g.id, owned.toString())} className="text-[10px] font-bold text-orange-600 hover:underline">
                                            הכל
                                          </button>
                                      </div>
                                  </div>

                                  {/* Buttons */}
                                  <div className="flex flex-col gap-1">
                                      <button 
                                        onClick={() => handleTradeAction(g.id, inputAmount, true)}
                                        disabled={!canBuy}
                                        className="h-8 px-3 bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                      >
                                          קנה
                                      </button>
                                      <button 
                                        onClick={() => handleTradeAction(g.id, inputAmount, false)}
                                        disabled={!canSell}
                                        className="h-8 px-3 bg-rose-500 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                      >
                                          מכור
                                      </button>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
              
              <div className="mt-auto pt-2 text-center shrink-0">
                   <div className={`inline-flex items-center px-4 py-2 rounded-full font-bold border shadow-sm text-sm ${state.cash < 0 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                       <span className="mr-2 text-lg">💵</span>
                       <span>${state.cash.toLocaleString()}</span>
                   </div>
              </div>
          </div>
      );
  }

  return null;
};

export default Market;