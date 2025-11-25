
import React from 'react';
import { Player, TulipColor, ActionType } from '../types';
import { Gavel, AlertTriangle, TrendingDown, Clock, Ban, Wallet } from 'lucide-react';

interface Props {
  player: Player;
  isCurrentTurn: boolean;
  activePlayerName: string;
  remainingAP: number;
  hasGavel: boolean;
  canShort: boolean;
  canLoan: boolean;
  canSell: boolean;
  onAction: (type: ActionType, color?: TulipColor) => void;
}

const PlayerControls: React.FC<Props> = ({ 
    player, 
    isCurrentTurn, 
    activePlayerName, 
    remainingAP, 
    hasGavel, 
    canShort, 
    canLoan, 
    canSell, 
    onAction 
}) => {
  
  return (
    <div className={`p-6 border-t border-[#3d2b1f] transition-colors duration-500 relative bg-[#14100c]`}>
      
      {/* Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/leather.png')]"></div>

      {/* Waiting Overlay */}
      {!isCurrentTurn && (
        <div className="absolute inset-0 bg-[#0f0c08]/80 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <div className="flex items-center gap-3 text-[#c0a080] border border-[#3d2b1f] bg-[#1e1812] px-6 py-3 rounded-full shadow-2xl">
                <Clock className="animate-spin text-[#c0a080]" size={20} />
                <span className="font-serif text-sm tracking-wide">等待 <span className="font-bold text-white">{activePlayerName}</span> 行动...</span>
            </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        
        {/* Identity */}
        <div className="flex items-center gap-4 min-w-[200px]">
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-serif font-bold text-2xl bg-[#c0a080] text-[#0f0c08] border-2 border-[#5c4033] shadow-lg">
            我
          </div>
          <div>
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-bold text-[#e5e5e5] flex items-center gap-2">
                    {player.name}
                </h2>
                {hasGavel && <Gavel className="w-5 h-5 text-[#c0a080]" />}
            </div>
            <div className="flex items-center gap-2 text-[#c0a080] font-mono text-lg">
              <Wallet size={18} />
              <span>{player.cash} <span className="text-xs opacity-70">盾</span></span>
            </div>
          </div>
        </div>

        {/* Inventory Status (Desk Objects) */}
        <div className="flex gap-4 bg-[#1e1812] px-6 py-3 rounded-xl border border-[#3d2b1f] shadow-inner">
            {[TulipColor.COMMON, TulipColor.VICEROY, TulipColor.AUGUSTUS].map(c => (
                <div key={c} className="flex flex-col items-center w-14 relative">
                    <div className={`w-2 h-2 rounded-full mb-2 
                        ${c === TulipColor.COMMON ? 'bg-[#4a5d43]' : c === TulipColor.VICEROY ? 'bg-[#3d4c63]' : 'bg-[#633d3d]'}`} 
                    />
                    <span className="font-serif font-bold text-xl leading-none text-[#e5e5e5]">{player.inventory[c]}</span>
                    
                    {player.shorts[c] > 0 && (
                         <div className="absolute -bottom-2 px-1 bg-red-900/80 text-[9px] text-red-200 rounded border border-red-800">
                             -{player.shorts[c]}
                         </div>
                    )}
                </div>
            ))}
            <div className="w-px bg-[#3d2b1f] mx-2"></div>
            <div className="flex flex-col items-center w-14">
                <AlertTriangle className="w-4 h-4 text-[#ef4444] mb-1" />
                <span className="font-serif font-bold text-xl leading-none text-[#ef4444]">{player.loans}</span>
            </div>
        </div>

        {/* Actions Dashboard */}
        <div className="flex flex-wrap gap-3 justify-end items-end">
            
            {/* AP Indicator */}
            <div className="flex flex-col items-center mr-4">
               <span className="text-[10px] text-[#5c4033] uppercase tracking-widest font-serif mb-1">行动点</span>
               <div className="flex gap-1">
                   {[1, 2].map(i => (
                       <div key={i} className={`w-3 h-3 rounded-full border border-[#c0a080] ${remainingAP >= i ? 'bg-[#c0a080]' : 'bg-transparent'}`} />
                   ))}
               </div>
            </div>

            {/* Pass */}
             <button 
                 onClick={() => onAction(ActionType.PASS)}
                 className="px-4 py-3 bg-[#2a2520] hover:bg-[#3d2b1f] border border-[#5c4033] rounded text-xs font-serif uppercase tracking-widest text-[#c0a080] transition-colors"
                 disabled={!isCurrentTurn}
               >
                   跳过
             </button>

            {/* Sell Buttons */}
            <div className="flex flex-col gap-1">
                <span className="text-[9px] text-center text-[#5c4033] uppercase tracking-wider font-serif">卖出</span>
                <div className="flex gap-1">
                    {[TulipColor.COMMON, TulipColor.VICEROY, TulipColor.AUGUSTUS].map(c => (
                        <button
                            key={`sell-${c}`}
                            onClick={() => onAction(ActionType.SELL, c)}
                            disabled={!canSell || player.inventory[c] === 0 || remainingAP === 0 || !isCurrentTurn}
                            className={`w-10 h-10 rounded flex items-center justify-center border border-[#3d2b1f] hover:bg-[#2a2520] disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-md
                                ${c === TulipColor.COMMON ? 'text-[#86efac]' : c === TulipColor.VICEROY ? 'text-[#93c5fd]' : 'text-[#fca5a5]'}
                            `}
                            title={!canSell ? "禁止卖出" : "卖出库存"}
                        >
                            {canSell ? <TrendingDown size={18} /> : <Ban size={16} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Short Buttons */}
            <div className="flex flex-col gap-1 border-l border-[#3d2b1f] pl-3">
                <span className="text-[9px] text-center text-[#5c4033] uppercase tracking-wider font-serif">做空</span>
                <div className="flex gap-1">
                    {[TulipColor.COMMON, TulipColor.VICEROY, TulipColor.AUGUSTUS].map(c => (
                        <button
                            key={`short-${c}`}
                            onClick={() => onAction(ActionType.SHORT, c)}
                            disabled={!canShort || remainingAP === 0 || !isCurrentTurn}
                            className="w-10 h-10 rounded flex items-center justify-center border border-[#3d2b1f] bg-[#0f0c08] text-[#c0a080] hover:bg-[#1e1812] disabled:opacity-20 disabled:cursor-not-allowed text-xs font-serif font-bold transition-all shadow-md"
                        >
                            空
                        </button>
                    ))}
                </div>
            </div>

             {/* Financial */}
             <div className="flex flex-col gap-1 border-l border-[#3d2b1f] pl-3">
                <span className="text-[9px] text-center text-[#5c4033] uppercase tracking-wider font-serif">银行</span>
                <div className="flex gap-1">
                   <button 
                     onClick={() => onAction(ActionType.LOAN)}
                     disabled={!canLoan || player.loans >= 2 || remainingAP === 0 || !isCurrentTurn}
                     className="px-3 py-1 bg-[#2a1a1a] text-[#ef4444] border border-[#4a2525] rounded text-[10px] uppercase font-bold hover:bg-[#3d1a1a] disabled:opacity-30 disabled:cursor-not-allowed transition-all h-10"
                     title={!canLoan ? "需要热度 L3+" : "申请贷款"}
                   >
                       贷
                   </button>
                   <button 
                     onClick={() => onAction(ActionType.REPAY)}
                     disabled={player.loans === 0 || player.cash < 1100 || remainingAP === 0 || !isCurrentTurn}
                     className="px-3 py-1 bg-[#1a2a1a] text-[#86efac] border border-[#254a25] rounded text-[10px] uppercase font-bold hover:bg-[#1a3d1a] disabled:opacity-30 disabled:cursor-not-allowed transition-all h-10"
                   >
                       还
                   </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PlayerControls;