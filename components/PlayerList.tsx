
import React from 'react';
import { Player, TulipColor } from '../types';
import { Coins, Gavel, AlertTriangle, Bot, User } from 'lucide-react';

interface Props {
  players: Player[];
  currentPlayerIndex: number;
  gavelHolderIndex: number;
}

const PlayerList: React.FC<Props> = ({ players, currentPlayerIndex, gavelHolderIndex }) => {
  return (
    <div className="flex flex-col h-full bg-[#1e1812] rounded-lg border border-[#3d2b1f] overflow-hidden shadow-2xl">
      <div className="p-3 bg-[#0f0c08] border-b border-[#3d2b1f] font-serif text-[#c0a080] font-bold tracking-widest text-xs uppercase flex items-center gap-2">
        <User size={14} />
        交易账本
      </div>
      
      <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-[#3d2b1f] scrollbar-track-transparent">
        {players.map((p, i) => {
          const isActive = i === currentPlayerIndex;
          const hasGavel = i === gavelHolderIndex;
          
          return (
            <div 
              key={p.id} 
              className={`p-3 border-b border-[#2d2016] transition-all duration-300 relative
                ${isActive ? 'bg-[#2a2520] border-l-2 border-l-[#c0a080]' : 'border-l-2 border-l-transparent opacity-60'}
              `}
            >
              {/* Header: Name & Cash */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center border border-white/10
                    ${p.isAI ? 'bg-[#2d2620] text-gray-500' : 'bg-[#c0a080] text-[#0f0c08]'}`}>
                    {p.isAI ? <Bot size={12} /> : <User size={12} />}
                  </div>
                  <span className={`font-serif text-sm ${isActive ? 'text-[#e5e5e5]' : 'text-[#888]'}`}>
                    {p.name}
                  </span>
                  {hasGavel && <Gavel size={14} className="text-[#c0a080]" />}
                </div>
                <div className="flex items-center gap-1 text-[#c0a080] font-mono text-sm">
                  <Coins size={12} />
                  {p.cash}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                {/* Inventory */}
                <div className="flex items-center gap-1 col-span-1 text-[#86efac]" title="杂色郁金香">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4a5d43]"></div>
                  {p.inventory[TulipColor.COMMON]}
                </div>
                <div className="flex items-center gap-1 col-span-1 text-[#93c5fd]" title="副王郁金香">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3d4c63]"></div>
                  {p.inventory[TulipColor.VICEROY]}
                </div>
                <div className="flex items-center gap-1 col-span-1 text-[#fca5a5]" title="奥古斯都">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#633d3d]"></div>
                  {p.inventory[TulipColor.AUGUSTUS]}
                </div>

                {/* Loans/Shorts Indicator */}
                <div className="col-span-1 flex justify-end gap-2">
                    {p.loans > 0 && (
                        <div className="flex items-center text-[#ef4444] font-bold" title="贷款数">
                            <AlertTriangle size={10} className="mr-0.5" />
                            {p.loans}
                        </div>
                    )}
                </div>
              </div>
              
              {/* Short Positions Row (Only if existing) */}
              {(p.shorts[TulipColor.COMMON] > 0 || p.shorts[TulipColor.VICEROY] > 0 || p.shorts[TulipColor.AUGUSTUS] > 0) && (
                  <div className="mt-2 text-[10px] flex gap-2 bg-black/20 p-1 rounded border border-white/5">
                      <span className="text-[#ef4444] uppercase font-bold">做空:</span>
                      {p.shorts[TulipColor.COMMON] > 0 && <span className="text-gray-400">{p.shorts[TulipColor.COMMON]}</span>}
                      {p.shorts[TulipColor.VICEROY] > 0 && <span className="text-gray-400">{p.shorts[TulipColor.VICEROY]}</span>}
                      {p.shorts[TulipColor.AUGUSTUS] > 0 && <span className="text-gray-400">{p.shorts[TulipColor.AUGUSTUS]}</span>}
                  </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerList;