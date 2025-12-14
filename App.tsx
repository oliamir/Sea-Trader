import React, { useState, useEffect } from 'react';
import { PlayerState, GameView, GameEvent, TimeOfDay } from './types';
import { LOCATIONS, INITIAL_CASH, MAX_DAYS, GOODS, TIME_ORDER, DAYS_OF_WEEK } from './constants';
import { generateGlobalPrices, getNextTime, generateTravelEvent, getTravelDuration } from './services/gameEngine';
import Market from './components/Market';
import Travel from './components/Travel';
import Bank from './components/Bank';
import Event from './components/Event';
import GameOver from './components/GameOver';
import SailingAnimation from './components/SailingAnimation';

const getInitialState = (): PlayerState => ({
  cash: INITIAL_CASH,
  bankBalance: 0,
  inventory: { copper: 0, olives: 0, wheat: 0 },
  location: 'israel',
  day: 1,
  timeOfDay: 'Morning',
  isGameOver: false,
});

const App: React.FC = () => {
  const [playerState, setPlayerState] = useState<PlayerState>(getInitialState());
  const [allPrices, setAllPrices] = useState<Record<string, Record<string, number>>>(() => generateGlobalPrices());
  const [view, setView] = useState<GameView>(GameView.Market);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [pendingDestination, setPendingDestination] = useState<string | null>(null);

  // Helper to handle travel finalization (used after event or immediately)
  const finalizeTravel = (destinationId: string, turns: number, cashChange = 0, inventoryLoss = false) => {
     const startDay = playerState.day;
     let currentDay = playerState.day;
     let currentTime = playerState.timeOfDay;
     let isGameOver = playerState.isGameOver;
     let currentBank = playerState.bankBalance;

     for (let i = 0; i < turns; i++) {
        if (isGameOver) break;
        const next = getNextTime(currentDay, currentTime);
        currentDay = next.day;
        currentTime = next.time;
        isGameOver = next.isGameOver;
        
        // Apply 1% interest per turn (compound)
        currentBank = Math.floor(currentBank * 1.01);
     }

     let newCash = playerState.cash + cashChange;
     let newInventory = { ...playerState.inventory };
     if (inventoryLoss) {
         Object.keys(newInventory).forEach(k => {
             newInventory[k] = Math.floor(newInventory[k] * 0.8);
         });
     }
     newCash = Math.max(0, newCash);

     setPlayerState(prev => ({
         ...prev,
         cash: newCash,
         bankBalance: currentBank,
         inventory: newInventory,
         location: destinationId,
         day: currentDay,
         timeOfDay: currentTime,
         isGameOver: isGameOver
     }));

     // Only change prices if the day has advanced
     if (currentDay > startDay) {
         setAllPrices(generateGlobalPrices());
     }

     setView(GameView.Market);
     setCurrentEvent(null);
     setPendingDestination(null);
  };

  const handleRestart = () => {
    setPlayerState(getInitialState());
    setAllPrices(generateGlobalPrices());
    setView(GameView.Market);
    setCurrentEvent(null);
  };

  const handleTrade = (goodId: string, amount: number, isBuy: boolean) => {
    const prices = allPrices[playerState.location] || {};
    const price = prices[goodId];
    if (!price) return;

    const totalCost = price * amount;
    const newInventory = { ...playerState.inventory };
    const currentOwned = newInventory[goodId] || 0;

    if (isBuy) {
      if (playerState.cash >= totalCost) {
        setPlayerState(prev => ({
          ...prev,
          cash: prev.cash - totalCost,
          inventory: { ...newInventory, [goodId]: currentOwned + amount }
        }));
      }
    } else {
      if (currentOwned >= amount) {
        setPlayerState(prev => ({
          ...prev,
          cash: prev.cash + totalCost,
          inventory: { ...newInventory, [goodId]: currentOwned - amount }
        }));
      }
    }
  };

  const handleTravelSelect = (destinationId: string) => {
    // 1. Set Pending Destination
    setPendingDestination(destinationId);
    
    // 2. Switch to Sailing View to start Animation
    setView(GameView.Sailing);

    // 3. Logic triggers after animation
    setTimeout(() => {
        const event = generateTravelEvent();
        const turnsNeeded = getTravelDuration(playerState.location, destinationId);
        
        if (event.type !== 'SMOOTH_SAILING') {
            setCurrentEvent(event);
            setView(GameView.Event);
            // Pending travel closure
            (window as any).__pendingTravel = () => finalizeTravel(destinationId, turnsNeeded, event.outcome.cashChange, event.outcome.inventoryLoss);
        } else {
            finalizeTravel(destinationId, turnsNeeded, 0, false);
        }
    }, 2500); // 2.5 seconds sailing animation
  };

  const handleRest = () => {
      const next = getNextTime(playerState.day, playerState.timeOfDay);
      setPlayerState(prev => ({
          ...prev,
          day: next.day,
          timeOfDay: next.time,
          isGameOver: next.isGameOver,
          // Apply 1% interest for the rest turn
          bankBalance: Math.floor(prev.bankBalance * 1.01)
      }));

      // Only change prices if the day has advanced
      if (next.day > playerState.day) {
          setAllPrices(generateGlobalPrices());
      }
  };

  const handleBankTransaction = (amount: number, isDeposit: boolean) => {
      if (isDeposit) {
          if (playerState.cash >= amount) {
              setPlayerState(prev => ({
                  ...prev,
                  cash: prev.cash - amount,
                  bankBalance: prev.bankBalance + amount
              }));
          }
      } else {
          if (playerState.bankBalance >= amount) {
              setPlayerState(prev => ({
                  ...prev,
                  cash: prev.cash + amount,
                  bankBalance: prev.bankBalance - amount
              }));
          }
      }
  };

  const currentLocation = LOCATIONS.find(l => l.id === playerState.location);
  const currentPrices = allPrices[playerState.location] || {};
  const destinationName = LOCATIONS.find(l => l.id === pendingDestination)?.name || '';
  const dayName = DAYS_OF_WEEK[(playerState.day - 1) % 7];
  
  // Theme logic for Time of Day
  const getTimeTheme = (time: TimeOfDay) => {
    switch(time) {
        case 'Morning': 
            return { 
                container: 'bg-amber-100 border-amber-200 text-amber-900', 
                icon: '☀️', 
                label: 'בוקר',
                iconBg: 'bg-yellow-200'
            };
        case 'Noon': 
            return { 
                container: 'bg-orange-100 border-orange-200 text-orange-900', 
                icon: '🌤️', 
                label: 'צהריים',
                iconBg: 'bg-orange-200'
            };
        case 'Evening': 
            return { 
                container: 'bg-indigo-900 border-indigo-800 text-white', 
                icon: '🌙', 
                label: 'ערב',
                iconBg: 'bg-indigo-700'
            };
    }
  };
  
  const timeTheme = getTimeTheme(playerState.timeOfDay);

  return (
    <div className="w-full h-full max-w-7xl mx-auto flex flex-col gap-3 p-3 font-sans select-none text-gray-800 relative">
      
      {/* Top Section: Main Area + Sidebar */}
      <div className="flex flex-1 min-h-0 gap-3">
          
          {/* LEFT: Scroll Area (Main View) */}
          <div className="w-3/4 bg-white rounded-3xl shadow-xl overflow-hidden relative border border-gray-100 flex flex-col">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600 z-10"></div>
              
              {/* Animation Overlay */}
              {view === GameView.Sailing && (
                  <SailingAnimation timeOfDay={playerState.timeOfDay} destinationName={destinationName} />
              )}

              <div className="p-6 flex-1 overflow-y-auto relative">
                {view === GameView.Market && (
                    <Market 
                        state={playerState} 
                        prices={currentPrices}
                        allPrices={allPrices} 
                        onTrade={handleTrade}
                        onTravelClick={() => setView(GameView.Travel)}
                        onRest={handleRest}
                        onBankClick={() => setView(GameView.Bank)}
                    />
                )}

                {view === GameView.Travel && (
                    <Travel 
                        currentLocationId={playerState.location}
                        currentTime={playerState.timeOfDay}
                        onTravel={handleTravelSelect}
                        onCancel={() => setView(GameView.Market)}
                    />
                )}

                {view === GameView.Bank && (
                    <Bank 
                        cash={playerState.cash}
                        bankBalance={playerState.bankBalance}
                        onDeposit={(amount) => handleBankTransaction(amount, true)}
                        onWithdraw={(amount) => handleBankTransaction(amount, false)}
                        onBack={() => setView(GameView.Market)}
                    />
                )}
                
                {view === GameView.GameOver && (
                     <GameOver 
                        state={playerState} 
                        finalPrices={currentPrices} 
                        onRestart={handleRestart}
                    />
                )}
              </div>
          </div>

          {/* RIGHT: Status Sidebar */}
          <div className="w-1/4 flex flex-col gap-3 overflow-y-auto">
              
              {/* Combined Location & Time Box */}
              <div className={`rounded-2xl p-6 shadow-lg border flex flex-col items-center text-center shrink-0 transition-all duration-500 gap-4 ${timeTheme.container}`}>
                  {/* Location Section */}
                  <div className="flex flex-col items-center">
                      <div className="text-6xl mb-2 filter drop-shadow-md transform transition-transform hover:scale-110 duration-300">
                          {currentLocation?.imageEmoji}
                      </div>
                      <h2 className="text-2xl font-black tracking-tight leading-none">
                          {currentLocation?.name}
                      </h2>
                      <span className="text-xs opacity-75 font-medium mt-1">מיקום נוכחי</span>
                  </div>

                  {/* Divider */}
                  <div className="w-1/2 h-px bg-current opacity-20"></div>

                  {/* Time Section */}
                  <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-1">
                           <span className="text-xl">{timeTheme.icon}</span>
                           <span className="text-lg font-bold">{timeTheme.label}</span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-black/10 text-xs font-bold backdrop-blur-sm shadow-sm flex flex-col items-center">
                          <span>יום {dayName}</span>
                          <span className="text-[10px] opacity-80 mt-0.5">יום {playerState.day} / {MAX_DAYS}</span>
                      </div>
                  </div>
              </div>

              {/* Inventory Box */}
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 flex-1 flex flex-col min-h-0">
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">מלאי נוכחי</h3>
                  <div className="space-y-3 flex-1 overflow-y-auto">
                      {GOODS.map(g => (
                          <div key={g.id} className="flex justify-between items-center group">
                              <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-lg shadow-sm group-hover:bg-blue-50 transition-colors">
                                      {g.icon}
                                  </div>
                                  <span className="font-medium text-gray-700 text-sm">{g.name}</span>
                              </div>
                              <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full text-sm">{playerState.inventory[g.id]}</span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Cash Box */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 shadow-lg text-white shrink-0">
                  <div className="flex justify-between items-end mb-2 border-b border-green-400/50 pb-2">
                      <span className="text-green-100 text-xs font-medium">מזומן</span>
                      <span className="text-lg font-bold tracking-tight">${playerState.cash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end">
                      <span className="text-green-100 text-xs font-medium">בנק</span>
                      <span className="text-md font-bold tracking-tight text-green-50">${playerState.bankBalance.toLocaleString()}</span>
                  </div>
              </div>

          </div>
      </div>

      {/* Bottom Section: Global Prices - Fixed Height */}
      <div className="h-40 shrink-0 flex gap-3 overflow-x-auto pb-1">
          {LOCATIONS.map(loc => {
              const isCurrent = loc.id === playerState.location;
              return (
                  <div key={loc.id} className={`flex-1 min-w-[160px] rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden shadow-md
                      ${isCurrent 
                          ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-offset-2' 
                          : 'bg-white border-gray-200 opacity-90 hover:opacity-100'
                      }`}>
                      <div className={`p-2 text-center font-bold border-b text-xs flex items-center justify-center gap-2
                          ${isCurrent ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                          <span>{loc.imageEmoji}</span>
                          <span>{loc.name}</span>
                      </div>
                      <div className="p-2 flex-1 flex flex-col justify-center space-y-1">
                          {GOODS.map(g => {
                              const price = allPrices[loc.id]?.[g.id];
                              const isLow = price < g.basePrice * 0.8;
                              const isHigh = price > g.basePrice * 1.2;
                              
                              return (
                                  <div key={g.id} className="flex justify-between items-center text-xs">
                                      <span className="text-gray-500">{g.name}</span>
                                      <span className={`font-mono font-medium ${isLow ? 'text-green-600' : isHigh ? 'text-red-500' : 'text-gray-900'}`}>
                                          ${price}
                                      </span>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              );
          })}
      </div>

      {/* Modern Modal Overlay */}
      {view === GameView.Event && currentEvent && (
        <Event 
            event={currentEvent} 
            onContinue={() => {
                const pending = (window as any).__pendingTravel;
                if (pending) {
                    pending();
                    (window as any).__pendingTravel = null;
                } else {
                    setView(GameView.Market);
                    setCurrentEvent(null);
                }
            }} 
        />
      )}
    </div>
  );
};

export default App;