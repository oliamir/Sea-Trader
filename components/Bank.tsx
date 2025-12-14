import React, { useState } from 'react';

interface BankProps {
  cash: number;
  bankBalance: number;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  onBack: () => void;
}

const Bank: React.FC<BankProps> = ({ cash, bankBalance, onDeposit, onWithdraw, onBack }) => {
  const [amount, setAmount] = useState<string>('');

  const parsedAmount = parseInt(amount, 10) || 0;

  const handleAction = (isDeposit: boolean) => {
    if (parsedAmount <= 0) return;
    if (isDeposit) {
        onDeposit(parsedAmount);
    } else {
        onWithdraw(parsedAmount);
    }
    setAmount('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-black text-gray-900">הבנק הבינלאומי</h2>
            <p className="text-gray-500 text-sm mt-1">כספך מוגן אצלנו ב-100%</p>
        </div>
        <button onClick={onBack} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            יציאה
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 p-6 rounded-2xl flex flex-col items-center">
              <span className="text-green-600 font-medium mb-1">מזומן בכיס</span>
              <span className="text-3xl font-bold text-green-800">${cash.toLocaleString()}</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl flex flex-col items-center">
              <span className="text-blue-600 font-medium mb-1">יתרה בבנק</span>
              <span className="text-3xl font-bold text-blue-800">${bankBalance.toLocaleString()}</span>
          </div>
      </div>

      {/* Input Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-lg mx-auto w-full">
          <label className="block text-gray-700 font-bold mb-4 text-xl text-center">כמה תרצה להפקיד או למשוך?</label>
          
          <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-bold text-gray-400">$</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full text-3xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-blue-500 outline-none py-2 text-center"
              />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleAction(true)}
                disabled={parsedAmount <= 0 || parsedAmount > cash}
                className="py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                  הפקדה לבנק
              </button>
              <button 
                onClick={() => handleAction(false)}
                disabled={parsedAmount <= 0 || parsedAmount > bankBalance}
                className="py-3 px-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                  משיכה למזומן
              </button>
          </div>
          
          <div className="mt-4 flex justify-center gap-2 text-sm">
             <button onClick={() => setAmount(String(cash))} className="text-blue-600 hover:underline">כל המזומן</button>
             <span className="text-gray-300">|</span>
             <button onClick={() => setAmount(String(bankBalance))} className="text-orange-600 hover:underline">כל היתרה</button>
          </div>
      </div>

      {/* Interest Info */}
      <div className="mt-auto text-center p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-800 text-sm">
          💡 הכסף בבנק צובר ריבית של <strong>1%</strong> בכל יום ובכל הפלגה!
      </div>
    </div>
  );
};

export default Bank;