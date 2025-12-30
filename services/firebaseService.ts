import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { PlayerState } from '../types';

export const saveGameResult = async (playerState: PlayerState) => {
    try {
        const docRef = await addDoc(collection(db, 'game_results'), {
            cash: playerState.cash,
            bankBalance: playerState.bankBalance,
            loan: playerState.loan,
            totalNetWorth: playerState.cash + playerState.bankBalance - playerState.loan,
            day: playerState.day,
            maxCapacity: playerState.maxCapacity,
            location: playerState.location,
            inventory: playerState.inventory,
            isGameOver: playerState.isGameOver,
            timestamp: serverTimestamp(),
            platform: navigator.userAgent // Optional: to see where it was played
        });
        console.log("Game result saved with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        return null;
    }
};
