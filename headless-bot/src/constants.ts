import { Good, Location, TimeOfDay } from './types.js';

export const LOCATIONS: Location[] = [
  { id: 'israel', name: 'ישראל', imageEmoji: '🕍', color: 'bg-blue-100' },
  { id: 'egypt', name: 'מצרים', imageEmoji: '🔺', color: 'bg-yellow-100' },
  { id: 'turkey', name: 'טורקיה', imageEmoji: '🕌', color: 'bg-red-100' },
  { id: 'italy', name: 'איטליה', imageEmoji: '🏛️', color: 'bg-green-100' },
];

export const GOODS: Good[] = [
  {
    id: 'copper',
    name: 'נחושת',
    icon: '🥉',
    basePrice: 3000,
    minPrice: 1500,
    maxPrice: 4500,
    increment: 50
  },
  {
    id: 'olives',
    name: 'זיתים',
    icon: '🫒',
    basePrice: 500,
    minPrice: 200,
    maxPrice: 800,
    increment: 50
  },
  {
    id: 'wheat',
    name: 'חיטה',
    icon: '🌾',
    basePrice: 45,
    minPrice: 25,
    maxPrice: 80,
    increment: 5
  },
];

export const TIME_ORDER: TimeOfDay[] = ['Morning', 'Noon', 'Evening'];

export const DAYS_OF_WEEK = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export const TRANSLATIONS = {
  Morning: 'בוקר',
  Noon: 'צהריים',
  Evening: 'ערב'
};

export const INITIAL_CASH = 5000;
export const MAX_DAYS = 7;
export const LOAN_INTEREST_RATE = 0.05;
export const INITIAL_CAPACITY = 100;