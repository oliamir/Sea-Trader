import { GOODS, TIME_ORDER, LOCATIONS, MAX_DAYS } from './constants';
import { PlayerState, TimeOfDay, GameEvent } from './types.js'; // Added .js for ESM

export const getNextTime = (day: number, time: TimeOfDay): { day: number, time: TimeOfDay, isGameOver: boolean } => {
  const currentIndex = TIME_ORDER.indexOf(time);

  if (currentIndex < TIME_ORDER.length - 1) {
    return { day, time: TIME_ORDER[currentIndex + 1], isGameOver: false };
  } else {
    // End of day
    const nextDay = day + 1;
    if (nextDay > MAX_DAYS) {
      return { day, time: time, isGameOver: true };
    }
    return { day: nextDay, time: 'Morning', isGameOver: false };
  }
};

export const getTravelDuration = (fromId: string, toId: string): number => {
  // Returns number of turns (Time units)
  // Standard trip = 1 turn (e.g., Morning -> Noon) = 6 hours
  // Long trip (Italy) = 2 turns (e.g., Morning -> Evening) = 12 hours

  // Exception: Italy <-> Turkey is short (6 hours / 1 turn)
  if ((fromId === 'italy' && toId === 'turkey') || (fromId === 'turkey' && toId === 'italy')) {
    return 1;
  }

  if (fromId === 'italy' || toId === 'italy') {
    return 2;
  }
  return 1;
};

export const generatePrices = (locationId: string): Record<string, number> => {
  const prices: Record<string, number> = {};

  GOODS.forEach(good => {
    // Determine a range bias based on location (0 = minPrice, 1 = maxPrice)
    let bias = 0.5;

    // Supply/Demand logic (simulated by location bias)
    // Modified logic: Israel, Egypt, Turkey are more stable (closer to 0.5).
    // Italy is wild.

    if (locationId === 'italy') {
      // Italy Specifics:
      // High structural bias for Wheat (Expensive)
      if (good.id === 'wheat') bias = 0.8;

      // Extreme Volatility for Italy: +/- 0.60
      // This creates very frequent min/max price situations
      bias += (Math.random() * 1.2 - 0.6);

    } else {
      // Standard Locations (Israel, Egypt, Turkey)
      // Dampened structural biases (closer to 0.5 than before)

      if (locationId === 'egypt' && good.id === 'wheat') bias = 0.35; // Was 0.2

      if (locationId === 'israel' && good.id === 'olives') bias = 0.35; // Was 0.2
      if (locationId === 'turkey' && good.id === 'olives') bias = 0.65; // Was 0.8

      if (locationId === 'turkey' && good.id === 'copper') bias = 0.35; // Was 0.2
      if (locationId === 'israel' && good.id === 'copper') bias = 0.65; // Was 0.8

      // Low Volatility: +/- 0.15
      // Keeps prices closer to the average/bias point
      bias += (Math.random() * 0.3 - 0.15);
    }

    // Clamp bias 0 to 1
    bias = Math.max(0, Math.min(1, bias));

    // Calculate raw price from range
    const range = good.maxPrice - good.minPrice;
    let rawPrice = good.minPrice + (range * bias);

    // Round to increment
    let rounded = Math.round(rawPrice / good.increment) * good.increment;

    // Clamp final result to ensure it stays within limits after rounding
    rounded = Math.max(good.minPrice, Math.min(good.maxPrice, rounded));

    prices[good.id] = rounded;
  });

  return prices;
};

export const generateGlobalPrices = (): Record<string, Record<string, number>> => {
  const allPrices: Record<string, Record<string, number>> = {};
  LOCATIONS.forEach(loc => {
    allPrices[loc.id] = generatePrices(loc.id);
  });
  return allPrices;
};

export const generateTravelEvent = (currentLoad: number, maxCapacity: number): GameEvent => {
  const roll = Math.random();

  // Calculate Overflow Risk
  // If load > 80% of capacity, increase storm/loss chance
  const loadRatio = currentLoad / maxCapacity;
  const isOverloaded = loadRatio > 0.8;

  // Adjusted Probabilities based on load
  // Standard: 15% Pirates, 10% Storm, 10% Treasure, 65% Smooth
  // Overloaded: 15% Pirates, 35% Storm (Loss), 10% Treasure, 40% Smooth

  const stormChance = isOverloaded ? 0.35 : 0.10;
  // Thresholds
  const piratesThreshold = 0.15;
  const stormThreshold = piratesThreshold + stormChance;
  const treasureThreshold = stormThreshold + 0.10;

  if (roll < piratesThreshold) {
    // Pirates - Scaled for new economy
    const loss = 500 + Math.floor(Math.random() * 1000);
    return {
      type: 'PIRATES',
      title: 'פיראטים!',
      message: `ספינת פיראטים שחורה התקרבה ואילצה אותך לשלם כופר של ${loss}$.`,
      outcome: { cashChange: -loss }
    };
  } else if (roll < stormThreshold) {
    // Storm / Overflow
    if (isOverloaded) {
      return {
        type: 'STORM',
        title: 'ספינה עמוסה מדי!',
        message: 'הספינה הייתה כבדה מדי מכדי להתמודד עם הגלים. חלק מהסחורה נפל למים.',
        outcome: { inventoryLoss: true }
      };
    } else {
      return {
        type: 'STORM',
        title: 'סערה בים',
        message: 'הגלים הגבוהים שטפו חלק מהסחורה לים.',
        outcome: { inventoryLoss: true }
      };
    }
  } else if (roll < treasureThreshold) {
    // Treasure - Scaled for new economy
    const amount = 1000 + Math.floor(Math.random() * 2000);
    return {
      type: 'TREASURE',
      title: 'תיבה צפה',
      message: `מצאת תיבה עתיקה צפה במים ובתוכה ${amount}$!`,
      outcome: { cashChange: amount }
    };
  }

  return {
    type: 'SMOOTH_SAILING',
    title: 'הפלגה שקטה',
    message: 'הים היה שקט והרוח טובה. הגעת ליעד בבטחה.',
    outcome: {}
  };
};