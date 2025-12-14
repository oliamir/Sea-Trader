import React from 'react';
import { PlayerState, GameView } from '../types';
import { GOODS, LOCATIONS } from '../constants';

interface HelperProps {
  state: PlayerState;
  currentPrices: Record<string, number>;
  allPrices: Record<string, Record<string, number>>;
  onBack: () => void;
  onNavigate: (view: GameView, destinationId?: string) => void;
}

const Helper: React.FC<HelperProps> = ({ state, currentPrices, allPrices, onBack, onNavigate }) => {
  
  // --- Recommendation Logic ---
  const getRecommendation = () => {
    const { inventory, cash, maxCapacity } = state;
    const currentLoad = (Object.values(inventory) as number[]).reduce((a, b) => a + b, 0);
    const hasSpace = currentLoad < maxCapacity;
    
    // 1. Check for High Profit Sales (Selling is priority if we have goods and price is high)
    for (const good of GOODS) {
        if (inventory[good.id] > 0) {
            const price = currentPrices[good.id];
            // If price is near max (top 20% of range)
            const range = good.maxPrice - good.minPrice;
            const threshold = good.minPrice + (range * 0.8);
            
            if (price >= threshold) {
                return {
                    action: 'SELL',
                    goodName: good.name,
                    icon: '💰',
                    title: `תמכור את ה${good.name}!`,
                    reason: `המחיר כאן ממש גבוה! (${price}$). זה הזמן לעשות כסף!`,
                    buttonText: 'לך לשוק',
                    targetView: GameView.Market
                };
            }
        }
    }

    // 2. Check for Amazing Buys (If we have space and cash)
    if (hasSpace) {
        // Sort goods by "discount" (how close to min price)
        const bestDeals = GOODS.map(good => {
            const price = currentPrices[good.id];
            const range = good.maxPrice - good.minPrice;
            // Lower percentage is better deal
            const percentage = (price - good.minPrice) / range;
            return { ...good, price, percentage };
        }).sort((a, b) => a.percentage - b.percentage);

        const bestDeal = bestDeals[0];
        
        // If the best deal is really good (bottom 30% of price range)
        if (bestDeal.percentage <= 0.3 && cash >= bestDeal.price) {
             return {
                action: 'BUY',
                goodName: bestDeal.name,
                icon: '🛍️',
                title: `תקנה ${bestDeal.name}!`,
                reason: `זה סופר זול כאן (${bestDeal.price}$). נוכל למכור את זה ביוקר במקום אחר!`,
                buttonText: 'לך לשוק',
                targetView: GameView.Market
            };
        }
    }

    // 3. Check for Better Selling Opportunities Elsewhere
    for (const good of GOODS) {
        if (inventory[good.id] > 0) {
             const currentPrice = currentPrices[good.id];
             // Find a location with much better price
             for (const loc of LOCATIONS) {
                 if (loc.id === state.location) continue;
                 const locPrice = allPrices[loc.id][good.id];
                 
                 // If price elsewhere is significantly higher (e.g. +30% or more)
                 if (locPrice > currentPrice * 1.3) {
                      return {
                        action: 'TRAVEL',
                        destination: loc.name,
                        destinationId: loc.id,
                        icon: '⛵',
                        title: `בוא נפליג ל${loc.name}!`,
                        reason: `ב${loc.name} משלמים המון על ${good.name} (${locPrice}$). כדאי לנו לשוט לשם!`,
                        buttonText: 'מפת הפלגה',
                        targetView: GameView.Travel
                    };
                 }
             }
        }
    }

    // 4. Default: Travel if bored or nothing special
    return {
        action: 'EXPLORE',
        icon: '🗺️',
        title: 'בוא נחקור עולם!',
        reason: 'אין כאן עסקאות מדהימות כרגע. אולי נפליג למקום חדש ונראה מה יש שם?',
        buttonText: 'מפת הפלגה',
        targetView: GameView.Travel
    };
  };

  const rec = getRecommendation();

  return (
    <div className="h-full flex flex-col items-center p-4">
      {/* Header */}
      <div className="flex w-full justify-between items-center mb-6">
         <h2 className="text-3xl font-black text-gray-900">התוכי היועץ</h2>
         <button onClick={onBack} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold">חזרה</button>
      </div>

      {/* Character Image */}
      <div className="w-32 h-32 text-8xl mb-6 animate-bounce filter drop-shadow-xl">
          🦜
      </div>

      {/* Speech Bubble */}
      <div className="bg-white border-2 border-blue-400 rounded-3xl p-6 relative shadow-lg max-w-sm w-full mb-8">
          {/* Bubble Tail */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-t-2 border-l-2 border-blue-400 rotate-45"></div>
          
          <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{rec.icon}</span>
              <h3 className="text-2xl font-black text-blue-900">{rec.title}</h3>
          </div>
          <p className="text-lg text-gray-700 font-medium leading-relaxed">
              {rec.reason}
          </p>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => onNavigate(rec.targetView, (rec as any).destinationId)}
        className="w-full max-w-xs py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl text-xl font-black shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
      >
          <span>{rec.buttonText}</span>
          <span>➜</span>
      </button>

      <div className="mt-auto text-center text-gray-400 text-sm font-medium">
          "קווואק! תמיד כאן בשבילך, קפטן!"
      </div>
    </div>
  );
};

export default Helper;