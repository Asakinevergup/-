
import React from 'react';

interface Props {
  heat: number;
}

const MarketThermometer: React.FC<Props> = ({ heat }) => {
  return (
    <div className="flex flex-col items-center bg-[#1e1812] p-4 rounded-lg border border-[#5c4033] shadow-xl relative overflow-hidden">
      {/* Texture */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
      
      <div className="relative z-10 w-full">
        <div className="flex justify-between items-end mb-2">
            <h3 className="font-serif font-bold text-[#c0a080] text-sm uppercase tracking-[0.2em]">市场热度</h3>
            <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${heat >= 8 ? 'bg-red-900 text-red-200' : 'bg-[#2a2520] text-gray-500'}`}>
                Lv.{heat}
            </span>
        </div>

        <div className="w-full flex space-x-0.5 h-10 bg-[#0f0c08] p-1 rounded border border-[#3d2b1f]">
            {Array.from({ length: 10 }).map((_, i) => {
            const level = i + 1;
            const isActive = level <= heat;
            
            let activeColor = '';
            if (level <= 4) activeColor = 'bg-[#4a5d43] shadow-[0_0_5px_#4a5d43]'; // Muted Green
            else if (level <= 7) activeColor = 'bg-[#cca348] shadow-[0_0_5px_#cca348]'; // Dull Gold
            else if (level <= 9) activeColor = 'bg-[#b45309] shadow-[0_0_5px_#b45309]'; // Dark Orange
            else activeColor = 'bg-[#7f1d1d] animate-pulse shadow-[0_0_8px_#7f1d1d]'; // Blood Red

            return (
                <div 
                key={level}
                className={`flex-1 flex items-center justify-center text-[10px] font-bold transition-all duration-500 first:rounded-l last:rounded-r
                    ${isActive ? `${activeColor} text-[#0f0c08]` : 'bg-[#1a1612] text-[#2d2620]'}
                `}
                >
                {isActive && level}
                </div>
            );
            })}
        </div>
        
        <div className="mt-2 flex justify-between text-[9px] text-[#5c4033] font-serif uppercase tracking-wider">
            <span>平稳</span>
            <span>狂热</span>
            <span>崩盘</span>
        </div>
      </div>
    </div>
  );
};

export default MarketThermometer;