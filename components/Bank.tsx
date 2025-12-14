import React, { useState } from 'react';

interface BankProps {
  cash: number;
  bankBalance: number;
  loan: number;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  onTakeLoan: (amount: number) => void;
  onRepayLoan: (amount: number) => void;
  onBack: () => void;
}

const Bank: React.FC<BankProps> = ({ cash, bankBalance, loan, onDeposit, onWithdraw, onTakeLoan, onRepayLoan, onBack }) => {
  const [amount, setAmount] = useState<string>('');
  const [tab, setTab] = useState<'ACCOUNT' | 'LOAN'>('ACCOUNT');

  const parsedAmount = parseInt(amount, 10) || 0;

  const handleAction = (type: 'DEPOSIT' | 'WITHDRAW' | 'TAKE' | 'REPAY') => {
    if (parsedAmount <= 0) return;
    
    if (type === 'DEPOSIT') onDeposit(parsedAmount);
    if (type === 'WITHDRAW') onWithdraw(parsedAmount);
    if (type === 'TAKE') onTakeLoan(parsedAmount);
    if (type === 'REPAY') onRepayLoan(parsedAmount);

    setAmount('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-3xl font-black text-gray-900">בנק</h2>
            <p className="text-gray-500 text-sm mt-1">שירותים פיננסיים מתקדמים</p>
        </div>
        <button onClick={onBack} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            יציאה
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
        <button 
          onClick={() => { setTab('ACCOUNT'); setAmount(''); }}
          className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'ACCOUNT' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          עובר ושב
        </button>
        <button 
          onClick={() => { setTab('LOAN'); setAmount(''); }}
          className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'LOAN' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          הלוואות ומימון
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
          {tab === 'ACCOUNT' ? (
            <>
              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-2xl flex flex-col items-center">
                      <span className="text-green-600 text-xs font-bold uppercase tracking-wider mb-1">מזומן בכיס</span>
                      <span className="text-2xl font-black text-green-800">${cash.toLocaleString()}</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex flex-col items-center">
                      <span className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">יתרה בבנק</span>
                      <span className="text-2xl font-black text-blue-800">${bankBalance.toLocaleString()}</span>
                  </div>
              </div>

              {/* Input Section */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm max-w-lg mx-auto w-full mb-auto">
                  <label className="block text-gray-700 font-bold mb-4 text-lg text-center">הפקדה או משיכה?</label>
                  
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
                        onClick={() => handleAction('DEPOSIT')}
                        disabled={parsedAmount <= 0 || parsedAmount > cash}
                        className="py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                          הפקדה לבנק
                      </button>
                      <button 
                        onClick={() => handleAction('WITHDRAW')}
                        disabled={parsedAmount <= 0 || parsedAmount > bankBalance}
                        className="py-3 px-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                          משיכה למזומן
                      </button>
                  </div>
                  
                  <div className="mt-4 flex justify-center gap-4 text-sm font-medium">
                     <button onClick={() => setAmount(String(Math.max(0, cash)))} className="text-blue-600 hover:text-blue-800 underline">כל המזומן</button>
                     <button onClick={() => setAmount(String(Math.max(0, bankBalance)))} className="text-orange-600 hover:text-orange-800 underline">כל היתרה</button>
                  </div>
              </div>

               <div className="mt-4 text-center p-3 bg-blue-50/50 rounded-xl text-blue-800 text-xs">
                  💡 הכסף בבנק צובר ריבית של <strong>1%</strong> בכל יום ובכל הפלגה
              </div>
            </>
          ) : (
            <>
              {/* Loan Info Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-2xl flex flex-col items-center">
                      <span className="text-green-600 text-xs font-bold uppercase tracking-wider mb-1">מזומן זמין</span>
                      <span className="text-2xl font-black text-green-800">${cash.toLocaleString()}</span>
                  </div>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex flex-col items-center">
                      <span className="text-red-600 text-xs font-bold uppercase tracking-wider mb-1">חוב נוכחי</span>
                      <span className="text-2xl font-black text-red-800">${loan.toLocaleString()}</span>
                  </div>
              </div>

              {/* Input Section */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm max-w-lg mx-auto w-full mb-auto">
                  <label className="block text-gray-700 font-bold mb-4 text-lg text-center">ניהול הלוואה</label>
                  
                  <div className="flex items-center gap-2 mb-6">
                      <span className="text-2xl font-bold text-gray-400">$</span>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full text-3xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-red-500 outline-none py-2 text-center"
                      />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleAction('TAKE')}
                        disabled={parsedAmount <= 0}
                        className="py-3 px-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                          קחת הלוואה
                      </button>
                      <button 
                        onClick={() => handleAction('REPAY')}
                        disabled={parsedAmount <= 0 || parsedAmount > cash || parsedAmount > loan}
                        className="py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                          החזר הלוואה
                      </button>
                  </div>
                  
                   <div className="mt-4 flex justify-center gap-4 text-sm font-medium">
                     <button onClick={() => setAmount('1000')} className="text-gray-600 hover:text-gray-900 underline">1,000</button>
                     <button onClick={() => setAmount(String(Math.max(0, loan)))} className="text-red-600 hover:text-red-800 underline">שלם הכל</button>
                  </div>
              </div>

              <div className="mt-4 text-center p-3 bg-red-50 rounded-xl text-red-800 text-xs border border-red-100">
                  ⚠️ זהירות: ריבית הלוואה עומדת על <strong>5%</strong> ליום
              </div>
            </>
          )}
      </div>
    </div>
  );
};

export default Bank;