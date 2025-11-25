import React from 'react';
import { TulipColor } from '../types';
import { getZoneIndex, PREMIUM_TABLE, BASE_PRICES } from '../constants';
import { Ban, Flower, TrendingUp } from 'lucide-react';

interface Props {
  color: TulipColor;
  count: number;
  max: number;
  heat: number;
  onBuy: () => void;
  canBuy: boolean;
}

const SupplyMat: React.FC<Props> = ({ color, count, max, heat, onBuy, canBuy }) => {
  const zone = getZoneIndex(count, max);
  const premium = PREMIUM_TABLE(color, zone);
  const base = BASE_PRICES[heat][color];
  const buyPrice = base + premium;
  const sellPrice = base; // Sell Price ignores premium

  const getTheme = (c: TulipColor) => {
    switch (c) {
      case TulipColor.COMMON: 
        return { 
          title: '杂色郁金香',
          border: 'border-[#4a5d43]', 
          bg: 'bg-[#1a2f1a]', 
          text: 'text-[#86efac]', 
          accent: 'bg-[#2d4a2d]',
          iconColor: '#4ade80' 
        };
      case TulipColor.VICEROY: 
        return { 
          title: '副王郁金香',
          border: 'border-[#3d4c63]', 
          bg: 'bg-[#1a202e]', 
          text: 'text-[#93c5fd]', 
          accent: 'bg-[#25324a]',
          iconColor: '#60a5fa' 
        };
      case TulipColor.AUGUSTUS: 
        return { 
          title: '奥古斯都',
          border: 'border-[#633d3d]', 
          bg: 'bg-[#2e1a1a]', 
          text: 'text-[#fca5a5]', 
          accent: 'bg-[#4a2525]',
          iconColor: '#f87171' 
        };
    }
  };

  const theme = getTheme(color);
  const percentage = (count / max) * 100;

  // Interaction Wrapper Logic
  const isClickable = canBuy && count > 0;
  
  return (
    <div 
        onClick={isClickable ? onBuy : undefined}
        className={`relative rounded-xl border-2 ${theme.border} ${theme.bg} shadow-xl flex flex-col justify-between h-[280px] overflow-hidden transition-all duration-300 
        ${isClickable ? 'hover:shadow-2xl hover:scale-[1.02] cursor-pointer ring-2 ring-transparent hover:ring-[#c0a080]' : 'opacity-90 cursor-default'}
    `}>
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>

      {/* Header */}
      <div className={`p-4 border-b ${theme.border} bg-black/20 flex justify-between items-center relative z-10`}>
        <div>
          <h4 className="font-serif font-bold text-lg tracking-wider text-gray-200">{theme.title}</h4>
          <span className="text-xs text-gray-500 font-mono">库存: {count}</span>
        </div>
        <div className="text-right flex flex-col items-end">
            <span className="text-[9px] text-gray-400 font-mono uppercase">买入价</span>
            <div className={`text-2xl font-serif font-bold ${theme.text}`}>{buyPrice}ƒ</div>
        </div>
      </div>

      {/* Main Illustration Area */}
      <div className="flex-grow relative flex items-center justify-center p-4">
          
          {/* Progress Background */}
          <div className="absolute bottom-0 left-0 w-full bg-current opacity-5 pointer-events-none" 
               style={{ height: `${percentage}%`, color: theme.iconColor }}></div>

          {count > 0 ? (
            <div className={`w-32 h-40 rounded-lg border border-white/10 ${theme.accent} shadow-inner flex flex-col items-center justify-center relative group`}>
                <Flower size={64} color={theme.iconColor} strokeWidth={1} />
                <div className="mt-2 font-serif text-xs opacity-50 uppercase tracking-widest">Specimen</div>
                
                {/* Premium Badge */}
                {premium > 0 && (
                  <div className="absolute -top-3 -right-3 bg-yellow-600 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border border-yellow-400">
                    +{premium} 溢价
                  </div>
                )}
            </div>
          ) : (
             <div className="w-32 h-40 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-600">
                <Ban size={32} />
                <span className="text-xs mt-2 font-bold">已售罄</span>
             </div>
          )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-black/30 border-t border-white/5 relative z-10">
          <div className="flex justify-between items-center px-1 mb-2">
             <div className="flex flex-col">
                 <span className="text-[9px] text-gray-500">基准价: {base}ƒ</span>
                 <span className={`text-[9px] ${premium > 0 ? 'text-yellow-500' : 'text-gray-500'}`}>溢价: {premium}ƒ</span>
             </div>
             <div className="flex flex-col items-end">
                 <span className="text-[9px] text-[#c0a080] uppercase tracking-wider font-bold">卖出价</span>
                 <span className="text-sm font-bold text-[#c0a080]">{sellPrice}ƒ</span>
             </div>
          </div>
          <button 
            disabled={!isClickable}
            className={`w-full py-2.5 rounded font-serif font-bold text-sm uppercase tracking-widest transition-all pointer-events-none
                ${canBuy && count > 0 
                    ? `bg-[#c0a080] text-[#2a2a2a]` 
                    : 'bg-[#2a2520] text-[#4a4a4a] border border-white/5'}
            `}
          >
            {canBuy ? '点击购入' : '不可用'}
          </button>
      </div>

      {count === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="bg-red-900/90 text-red-200 border-2 border-red-500 px-4 py-2 text-xl font-serif font-bold -rotate-12 shadow-2xl backdrop-blur-sm">
                  断货逼空
              </div>
          </div>
      )}
    </div>
  );
};

export default SupplyMat;