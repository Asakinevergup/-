
import React, { useReducer, useEffect, useState } from 'react';
import { getInitialState, gameReducer } from './utils/gameEngine';
import { getBotAction, getBotGavelDecision } from './utils/aiLogic';
import { GamePhase, TulipColor, ActionType } from './types';
import { audioManager } from './utils/audioManager';
import MarketThermometer from './components/MarketThermometer';
import SupplyMat from './components/SupplyMat';
import PlayerControls from './components/PlayerControls';
import PlayerList from './components/PlayerList';
import { 
    History, ScrollText, Trophy, AlertOctagon, Info, X, BookOpen, Scale, TrendingUp, Skull, Calculator, Feather, Volume2, VolumeX,
    Wind, Sprout, Crown, Droplets, Landmark, FileWarning, Gavel, Flame, ShieldOff, TrendingDown, Flower
} from 'lucide-react';

// Setup Component
const SetupScreen: React.FC<{ onStart: (count: number) => void }> = ({ onStart }) => (
  <div className="h-screen w-full flex items-center justify-center bg-[#0a0500] relative overflow-hidden">
    {/* Classical Oil Painting Background */}
    <div className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e4/Ambrosius_Bosschaert_the_Elder_-_Flower_Still_Life_-_Google_Art_Project.jpg')] bg-cover bg-center animate-kenburns"></div>
    {/* Dark Vignette Overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#0f0c08] via-[#0f0c08]/70 to-[#0f0c08]"></div>
    
    <div className="relative z-10 max-w-2xl w-full p-1">
        {/* Outer Gold Frame */}
        <div className="bg-[#1e1812]/95 border-4 border-double border-[#b8860b] outline outline-2 outline-[#000] p-10 md:p-14 shadow-[0_0_100px_rgba(218,165,32,0.2)] text-center relative overflow-hidden rounded-lg">
            
            {/* Corner Ornaments */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-[#b8860b] rounded-tl-3xl opacity-80"></div>
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-[#b8860b] rounded-tr-3xl opacity-80"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-[#b8860b] rounded-bl-3xl opacity-80"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-[#b8860b] rounded-br-3xl opacity-80"></div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="mb-4 text-[#ffd700] opacity-90 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                    <Flower size={48} strokeWidth={1.5} />
                </div>

                <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#b8860b] mb-2 tracking-[0.15em] drop-shadow-sm font-bold">
                    泡沫时代
                </h1>
                
                <div className="flex items-center gap-4 my-6 w-full justify-center opacity-80">
                    <div className="h-[2px] w-16 bg-gradient-to-l from-[#b8860b] to-transparent"></div>
                    <span className="text-[#deb887] font-serif italic text-lg tracking-widest uppercase">The Tulip Mania · 1637</span>
                    <div className="h-[2px] w-16 bg-gradient-to-r from-[#b8860b] to-transparent"></div>
                </div>

                <div className="text-[#d2b48c] mb-10 text-sm md:text-base leading-loose font-serif max-w-lg mx-auto space-y-4 bg-black/30 p-4 rounded border border-[#b8860b]/30">
                    <p>
                        "欢迎来到17世纪的阿姆斯特丹。
                        运河旁弥漫着财富与贪婪的气息，一颗球茎价值一栋豪宅，理智在疯狂的涨幅面前不值一提。"
                    </p>
                    <p className="text-[#a89f91] text-xs italic">
                        作为一名投机商，你需要在这场金融风暴中低买高卖，利用杠杆做空市场。请记住：当音乐停止时，最后接棒的人将一无所有。
                    </p>
                </div>

                <div className="space-y-4">
                    <p className="text-[#8b4513] text-xs font-serif uppercase tracking-widest font-bold">选择参与赌局的人数</p>
                    <div className="flex gap-6 justify-center">
                        {[4, 5, 6].map(num => (
                        <button 
                            key={num}
                            onClick={() => onStart(num)}
                            className="group relative w-16 h-16 flex items-center justify-center font-serif text-2xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 bg-[#2a2520] border-2 border-[#8b4513] rotate-45 group-hover:rotate-0 transition-transform duration-500 shadow-xl group-hover:bg-gradient-to-br group-hover:from-[#ffd700] group-hover:to-[#b8860b] group-hover:border-[#ffe4b5]"></div>
                            <span className="relative z-10 text-[#deb887] group-hover:text-[#2a1a0a] font-bold transition-colors">{num}</span>
                        </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
);

const RulesModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-[#000]/90 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#18120e] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border-2 border-[#b8860b] shadow-[0_0_50px_rgba(218,165,32,0.1)] relative flex flex-col" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="sticky top-0 bg-[#1e1812] p-6 border-b border-[#5c4033] flex justify-between items-center z-20 shrink-0 shadow-lg">
                    <div>
                        <h2 className="text-2xl font-serif text-[#ffd700] tracking-widest flex items-center gap-3">
                            <BookOpen size={24} className="text-[#b8860b]" />
                            官方规则手册 v19.0
                        </h2>
                        <p className="text-[#8b4513] text-xs font-serif mt-1 font-bold">THE BUBBLE ERA: TULIP WAGER</p>
                    </div>
                    <button onClick={onClose} className="text-[#8b4513] hover:text-[#ffd700] transition-colors"><X size={28}/></button>
                </div>
                
                {/* Content */}
                <div className="p-8 font-serif text-[#a8a29e] space-y-10 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                    
                    {/* 1. Intro */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <h3 className="text-lg text-[#deb887] mb-3 font-bold flex items-center gap-2 border-b border-[#5c4033] pb-1 w-fit">
                                <Trophy size={18} className="text-[#ffd700]" />
                                获胜条件
                            </h3>
                            <p className="text-sm leading-relaxed mb-4">
                                当<strong>“市场崩盘”</strong>（Crash Card）被翻开时，游戏立即结束。
                                所有资产强制清算，<strong>净资产 (Net Worth)</strong> 最高者获胜。
                            </p>
                            <div className="bg-[#2a2520] p-3 rounded border border-[#b8860b]/30 text-xs font-mono text-[#ffd700] shadow-inner">
                                净资产 = (手头现金) + (库存 × 崩盘价) + (做空收益) - (贷款总额)
                            </div>
                        </div>
                        <div className="bg-[#1e1812] p-4 rounded border border-[#5c4033] text-xs space-y-2 shadow-lg">
                            <h4 className="text-[#b8860b] font-bold uppercase border-b border-[#3d2b1f] pb-1 mb-2">游戏配件</h4>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#4a5d43] rounded-full ring-1 ring-white/20"></div> <span className="text-gray-300">普通杂色 (30张)</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#3d4c63] rounded-full ring-1 ring-white/20"></div> <span className="text-gray-300">副王 (人数×5)</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#633d3d] rounded-full ring-1 ring-white/20"></div> <span className="text-gray-300">奥古斯都 (仅5张)</span></div>
                        </div>
                    </section>

                    <hr className="border-[#3d2b1f]" />

                    {/* 2. Mechanics - Pricing Detail */}
                    <section>
                        <h3 className="text-lg text-[#deb887] mb-4 font-bold flex items-center gap-2 border-b border-[#5c4033] pb-1 w-fit">
                            <Calculator size={18} className="text-[#ffd700]" />
                            核心机制：定价系统
                        </h3>
                        
                        <div className="bg-[#1a1612] p-4 rounded border border-[#3d2b1f] space-y-4 shadow-inner">
                            <p className="text-xs text-[#a8a29e]">
                                每株郁金香的当前价格由两个部分组成：
                                <br/>
                                <span className="text-[#ffd700] font-bold text-base">买入价 = 基准价 (Base) + 溢价 (Premium)</span>
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-[#2a2520] p-3 rounded border border-white/5">
                                    <h4 className="text-[#deb887] font-bold text-xs mb-1">1. 基准价 (Base Price)</h4>
                                    <p className="text-[10px] text-[#888] leading-relaxed">
                                        由<strong>“市场热度”</strong> (L1-L10) 决定。
                                        <br/>- 热度越高，所有品种的基础价格都在上涨。
                                        <br/>- 例如：L1时杂色郁金香基准价30盾，L10时高达2000盾。
                                    </p>
                                </div>
                                <div className="bg-[#2a2520] p-3 rounded border border-white/5">
                                    <h4 className="text-[#ffd700] font-bold text-xs mb-1">2. 溢价 (Premium)</h4>
                                    <p className="text-[10px] text-[#888] leading-relaxed">
                                        由<strong>“剩余库存”</strong>决定。
                                        <br/>- 卡垫像一个卡槽，卡牌越少，露出的底部数字越大。
                                        <br/>- 即使热度很低，如果某种花被抢购一空，溢价也会极高（+200/+800）。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg text-[#deb887] mb-4 font-bold flex items-center gap-2 border-b border-[#5c4033] pb-1 w-fit">
                            <Scale size={18} className="text-[#ffd700]" />
                            交易法则
                        </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-[#deb887] font-bold text-sm mb-2">买入 (Buy)</h4>
                                <p className="text-xs text-[#888] leading-relaxed">
                                    支付 <span className="text-[#e5e5e5] font-bold">（基准 + 溢价）</span>。
                                    <br/>拿走卡牌，露出下方更大的数字。
                                    <br/>
                                    <span className="text-[#b8860b]">效应：买入推高价格。</span>
                                </p>
                            </div>
                            <div>
                                <h4 className="text-[#deb887] font-bold text-sm mb-2">卖出 (Sell)</h4>
                                <p className="text-xs text-[#888] leading-relaxed">
                                    获得 <span className="text-[#e5e5e5] font-bold">（仅基准价！）</span>。
                                    <br/>
                                    <span className="text-red-400">注意：溢价不退还。</span>银行只按官方指导价回收。
                                    <br/>
                                    <span className="text-[#b8860b]">效应：卖出压低价格。</span>
                                </p>
                            </div>
                        </div>
                    </section>

                    <hr className="border-[#3d2b1f]" />

                    {/* 3. Risks (Short & Loan) */}
                    <section>
                        <h3 className="text-lg text-[#deb887] mb-4 font-bold flex items-center gap-2 border-b border-[#5c4033] pb-1 w-fit">
                            <Skull size={18} className="text-red-800" />
                            高风险操作：做空与爆仓
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="bg-[#2a1a1a] p-4 rounded border border-red-900/30">
                                    <h4 className="text-[#ef4444] font-bold mb-2 text-sm">做空 (L5 解锁)</h4>
                                    <p className="text-xs mb-2">从银行借花卖出。你拿走<span className="text-white font-bold">基准价现金</span>和一张黑色借条。你需要在这个品种崩盘后，以低价买回平仓。</p>
                                    <p className="text-xs text-[#fca5a5]">收益 = 做空时的基准价 - 游戏结束时的结算价</p>
                                </div>
                                <div className="bg-[#1a202e] p-4 rounded border border-blue-900/30">
                                    <h4 className="text-[#93c5fd] font-bold mb-2 text-sm">贷款 (L3 解锁)</h4>
                                    <p className="text-xs">向银行借 1,000 盾。得到一张红色债务卡。游戏结束时需偿还 1,100 盾。每人限贷 2 张。</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[#e5e5e5] font-bold text-sm mb-2">做空者的三道死亡红线</h4>
                                <ul className="space-y-3 text-xs">
                                    <li className="flex gap-2">
                                        <span className="text-red-500 font-bold whitespace-nowrap">1. 断货逼空:</span>
                                        <span>当某种郁金香库存被买空 (归零) 的瞬间，所有该品种的做空者必须<strong>立即强制平仓</strong>，按当前最高价赔付现金。</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-red-500 font-bold whitespace-nowrap">2. L10 熔断:</span>
                                        <span>热度达到 Lv.10。所有空头<strong>立即强制平仓</strong>。按 L10 顶格价 (40,000+) 支付。这是绝对的破产。</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-red-500 font-bold whitespace-nowrap">3. 政策风险:</span>
                                        <span>遇到《保证金催收》或《球茎腐烂》事件，做空者需支付巨额罚金。</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <hr className="border-[#3d2b1f]" />

                    {/* 4. Event Cards Detail */}
                    <section>
                        <h3 className="text-lg text-[#deb887] mb-4 font-bold flex items-center gap-2 border-b border-[#5c4033] pb-1 w-fit">
                            <ScrollText size={18} className="text-[#ffd700]" />
                            事件卡详解 (18张)
                        </h3>
                        <div className="space-y-4">
                            {/* Mania */}
                            <div className="bg-[#1a2f1a]/30 p-3 rounded border border-[#4a5d43]/50">
                                <h4 className="text-[#86efac] font-bold text-sm mb-1 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#86efac]"></span>
                                    狂热组 (MANIA) - 8张
                                </h4>
                                <ul className="list-disc list-inside text-xs text-[#a8a29e] space-y-1 ml-1">
                                    <li><strong>酒馆里的传闻 (x6):</strong> 简单粗暴，热度 +1。</li>
                                    <li><strong>变异的新品种 (x3):</strong> 热度 +1。所有人免费升级 1 张[杂色]为[副王]。</li>
                                    <li><strong>法国贵族的订单 (x1):</strong> 热度 +1。奥古斯都持有者获利，做空者罚款。</li>
                                </ul>
                            </div>

                            {/* Panic */}
                            <div className="bg-[#2e1a1a]/30 p-3 rounded border border-[#633d3d]/50">
                                <h4 className="text-[#fca5a5] font-bold text-sm mb-1 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#fca5a5]"></span>
                                    恐慌组 (PANIC) - 5张
                                </h4>
                                <ul className="list-disc list-inside text-xs text-[#a8a29e] space-y-1 ml-1">
                                    <li><strong>理性的声音 (x2):</strong> 只有当热度 &gt; 7 (L8+) 时，才会生效导致热度 -2。</li>
                                    <li>
                                        <strong>球茎腐烂 (x2):</strong> 热度 -1。并支付<strong>严酷维护费</strong>：
                                        <br/><span className="pl-4">持有[杂色/副王]：付[当前杂色基准价]/张。</span>
                                        <br/><span className="pl-4">持有[奥古斯都]：付[当前副王基准价]/张。</span>
                                        <br/><span className="pl-4 italic text-red-400">若付不起，必须弃掉该花抵债。</span>
                                    </li>
                                    <li><strong>黑死病蔓延 (x1):</strong> 热度 -1。本轮<strong>禁止卖出</strong>任何球茎（做空者的避风港）。</li>
                                </ul>
                            </div>

                            {/* Policy */}
                            <div className="bg-[#1a202e]/30 p-3 rounded border border-[#3d4c63]/50">
                                <h4 className="text-[#93c5fd] font-bold text-sm mb-1 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#93c5fd]"></span>
                                    政策组 (POLICY) - 2张
                                </h4>
                                <ul className="list-disc list-inside text-xs text-[#a8a29e] space-y-1 ml-1">
                                    <li><strong>央行注资 (x1):</strong> 每人领 200 盾。赤贫开局的救命钱。</li>
                                    <li><strong>保证金催收 (x1):</strong> 惩罚杠杆。每张贷款罚 200，每张做空罚 500。</li>
                                </ul>
                            </div>

                            {/* Crash */}
                            <div className="bg-[#2a2520] p-3 rounded border border-[#8b4513] relative overflow-hidden shadow-lg">
                                <div className="absolute -right-2 -top-2 opacity-10 text-white"><Skull size={48} /></div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-[#e5e5e5] text-black text-[10px] font-bold px-1.5 py-0.5 rounded">CRASH</div>
                                    <h4 className="text-[#e5e5e5] font-bold text-sm">崩盘组 (3张)</h4>
                                </div>
                                <div className="text-xs text-[#a8a29e] space-y-2 relative z-10">
                                    <p className="leading-relaxed">
                                        <strong>1. 流拍的拍卖会 (x1):</strong> 假崩盘！<span className="text-yellow-500">热度立即 -3</span>，但游戏继续。这是最后逃生的机会，还是抄底的良机？
                                    </p>
                                    <p className="leading-relaxed">
                                        <strong>2. 哈勒姆大恐慌 (x1):</strong> 标准崩盘。游戏立即结束，所有资产按残骸价清算。
                                    </p>
                                    <p className="leading-relaxed">
                                        <strong>3. 法庭宣布合约无效 (x1):</strong> 混乱崩盘。游戏立即结束。
                                        <span className="text-[#93c5fd] font-bold">免除所有贷款债务</span>（不用还红卡），但做空合约仍需正常结算。
                                    </p>
                                    <div className="flex gap-4 text-[10px] font-mono mt-2 border-t border-white/5 pt-2">
                                        <span>残骸价:</span>
                                        <span className="text-[#86efac]">杂色: 20盾</span>
                                        <span className="text-[#93c5fd]">副王: 50盾</span>
                                        <span className="text-[#fca5a5]">奥古斯都: 100盾</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr className="border-[#3d2b1f]" />

                    {/* 5. Round Flow */}
                    <section>
                         <h3 className="text-lg text-[#deb887] mb-4 font-bold flex items-center gap-2 border-b border-[#5c4033] pb-1 w-fit">
                            <TrendingUp size={18} className="text-[#ffd700]" />
                            游戏流程
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <h4 className="text-[#deb887] font-bold">第一阶段：开市 (Event)</h4>
                                <p className="text-xs text-[#888]">执锤人翻开 1 张事件卡并结算效果。若热度到顶，先执行【熔断爆仓】，再进入交易。</p>
                            </div>
                            <div>
                                <h4 className="text-[#deb887] font-bold">第二阶段：交易 (Action)</h4>
                                <p className="text-xs text-[#888]">每人 2 个行动点 (AP)。轮流进行买入、卖出、融资或做空。</p>
                                <p className="text-xs text-yellow-600 mt-1 italic">* 特殊规则：热度 L8+ 时，买入奥古斯都会导致热度+1，卖出导致热度-1。</p>
                            </div>
                            <div>
                                <h4 className="text-[#deb887] font-bold">第三阶段：执锤人决断 (The Gavel)</h4>
                                <p className="text-xs text-[#888]">所有玩家行动结束后，执锤人决定：</p>
                                <ul className="list-disc list-inside text-xs pl-4 mt-1 text-[#888]">
                                    <li><strong>A. 休市:</strong> 本轮结束。执锤传给下家。</li>
                                    <li><strong>B. 疯狂加注:</strong> 再翻 1 张事件卡并结算，所有人获得新行动轮次。（全员被动接受）</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

// Helper to determine event icons and colors
const getEventVisuals = (cardId: string) => {
    // Default fallback
    const defaultVisuals = { Icon: ScrollText, bgIcon: ScrollText, color: 'text-gray-400', bgClass: 'bg-[#2a2520]' };

    if (!cardId) return defaultVisuals;

    if (cardId.startsWith('rumor')) {
        return { Icon: Wind, bgIcon: Wind, color: 'text-yellow-500', bgClass: 'bg-[#3d3112]' }; // Yellow for Mania
    }
    if (cardId.startsWith('variety')) {
        return { Icon: Sprout, bgIcon: Sprout, color: 'text-green-500', bgClass: 'bg-[#1a2f1a]' };
    }
    if (cardId.startsWith('french')) {
        return { Icon: Crown, bgIcon: Crown, color: 'text-purple-400', bgClass: 'bg-[#2e1a2e]' };
    }
    if (cardId.startsWith('rational')) {
        return { Icon: Scale, bgIcon: Scale, color: 'text-blue-300', bgClass: 'bg-[#1a202e]' };
    }
    if (cardId.startsWith('rot')) {
        return { Icon: Droplets, bgIcon: Droplets, color: 'text-teal-400', bgClass: 'bg-[#1a2a2a]' };
    }
    if (cardId.startsWith('plague')) {
        return { Icon: Skull, bgIcon: Skull, color: 'text-red-500', bgClass: 'bg-[#2e1a1a]' };
    }
    if (cardId.startsWith('injection')) {
        return { Icon: Landmark, bgIcon: Landmark, color: 'text-blue-500', bgClass: 'bg-[#1a202e]' };
    }
    if (cardId.startsWith('margin')) {
        return { Icon: FileWarning, bgIcon: FileWarning, color: 'text-orange-500', bgClass: 'bg-[#2a1e12]' };
    }
    if (cardId.startsWith('crash_auction')) {
        return { Icon: Gavel, bgIcon: Gavel, color: 'text-gray-200', bgClass: 'bg-[#2a2a2a]' };
    }
    if (cardId.startsWith('crash_haarlem')) {
        return { Icon: Flame, bgIcon: Flame, color: 'text-red-600', bgClass: 'bg-[#4a1a1a]' };
    }
    if (cardId.startsWith('crash_court')) {
        return { Icon: ShieldOff, bgIcon: ShieldOff, color: 'text-blue-200', bgClass: 'bg-[#1a2a3a]' };
    }

    return defaultVisuals;
};

const App: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, null, () => getInitialState(0));
  const [showRules, setShowRules] = useState(false);
  const [muted, setMuted] = useState(false);

  const toggleMute = () => {
      const isMuted = audioManager.toggleMute();
      setMuted(isMuted);
  };

  const startGame = (count: number) => {
    // Initialize Audio Context on user interaction
    audioManager.init();
    audioManager.playBGM();
    audioManager.playSFX('click');
    dispatch({ type: 'START_GAME', playerCount: count });
  };

  // AI Game Loop
  useEffect(() => {
    // Skip if game hasn't really started (player count 0/dummy) or game over
    if (state.players.length === 0 || state.phase === GamePhase.GAME_OVER) {
        if (state.phase === GamePhase.GAME_OVER) {
            audioManager.stopBGM();
        }
        return;
    }

    const currentPlayer = state.players[state.currentPlayerIndex];
    const gavelHolder = state.players[state.gavelHolderIndex];

    // 1. Bot Action Phase
    if (state.phase === GamePhase.PLAYER_ACTIONS && currentPlayer.isAI) {
        
        // Calculate action immediately to determine delay
        const action = getBotAction(state);
        
        // If bot skips turn AND hasn't used any actions, delay for 4 seconds (as requested)
        // Otherwise use standard 1 second delay
        let delay = 1000;
        if (action.type === 'END_TURN' && state.remainingActions === 2) {
             delay = 4000;
        }

        const timer = setTimeout(() => {
             if (action.type === 'END_TURN') {
                 audioManager.playSFX('pass');
                 dispatch({ type: 'END_TURN' });
             } else {
                 if (action.type === 'PERFORM_ACTION') {
                     if (action.action === ActionType.BUY || action.action === ActionType.SELL) audioManager.playSFX('coin');
                     if (action.action === ActionType.LOAN || action.action === ActionType.SHORT) audioManager.playSFX('scribble');
                     if (action.action === ActionType.REPAY) audioManager.playSFX('coin');
                 }
                 dispatch(action);
             }
        }, delay);
        return () => clearTimeout(timer);
    }

    // 2. Bot Gavel Decision Phase
    if (state.phase === GamePhase.ROUND_END && gavelHolder.isAI) {
         const timer = setTimeout(() => {
            const betMore = getBotGavelDecision(state);
            audioManager.playSFX('gavel');
            dispatch({ type: 'PASS_GAVEL', betMore });
         }, 1500);
         return () => clearTimeout(timer);
    }

  }, [state]);

  const handleAction = (type: ActionType, color?: TulipColor) => {
    if (type === ActionType.PASS) {
      audioManager.playSFX('pass');
      dispatch({ type: 'END_TURN' });
    } else {
      if (type === ActionType.BUY || type === ActionType.SELL) audioManager.playSFX('coin');
      if (type === ActionType.LOAN || type === ActionType.SHORT) audioManager.playSFX('scribble');
      if (type === ActionType.REPAY) audioManager.playSFX('coin');

      dispatch({ type: 'PERFORM_ACTION', action: type, color });
    }
  };

  const handleDrawEvent = () => {
      audioManager.playSFX('paper');
      
      // Peek at next card to see if it's a crash (hacky but works for sound trigger)
      // Ideally logic is better separated but for this scope it works
      const nextCard = state.eventDeck[0];
      if (nextCard && nextCard.type === 'CRASH') {
          setTimeout(() => audioManager.playSFX('crash'), 500);
      }
      
      dispatch({ type: 'DRAW_EVENT' });
  };

  const handlePassGavel = (betMore: boolean) => {
      audioManager.playSFX('gavel');
      dispatch({ type: 'PASS_GAVEL', betMore });
  }

  // Helper to split flavor text from effect
  const renderEventDescription = (desc: string, heatEffect?: number) => {
    // Regex matches the final parens e.g., "Text... (Effect)"
    // The capture group includes the parenthesis
    const parts = desc.split(/(\(.*\)$)/); 
    
    // Visual Indicator for Heat Change
    let heatBadge = null;
    if (heatEffect) {
        if (heatEffect > 0) {
            heatBadge = (
                <div className="flex items-center gap-1 text-[#ef4444] font-bold text-xs bg-[#2a1a1a] px-2 py-1 rounded border border-[#4a2525] mt-2 w-fit">
                    <TrendingUp size={14} /> 热度 +{heatEffect}
                </div>
            );
        } else if (heatEffect < 0) {
             heatBadge = (
                <div className="flex items-center gap-1 text-[#93c5fd] font-bold text-xs bg-[#1a202e] px-2 py-1 rounded border border-[#25324a] mt-2 w-fit">
                    <TrendingDown size={14} /> 热度 {heatEffect}
                </div>
            );
        }
    }

    if (parts.length > 1) {
        return (
            <>
                {parts[0]}
                <div className="flex flex-wrap items-center gap-3 mt-3 pt-2 border-t border-[#3d2b1f]">
                     {heatBadge}
                     <span className="text-[#c0a080] font-bold text-sm not-italic tracking-wider">{parts[1].replace(/[()]/g, '')}</span>
                </div>
            </>
        );
    }
    return (
        <>
            {desc}
            {heatBadge}
        </>
    );
  };

  if (state.players.length === 0) return <SetupScreen onStart={startGame} />;

  if (state.phase === GamePhase.GAME_OVER) {
      const winner = state.players.find(p => p.id === state.winner);
      return (
          <div className="h-screen w-full bg-[#0a0500] flex flex-col items-center justify-center text-center p-8 overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-20"></div>
              {/* Damask overlay */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/damask-pattern.png')] opacity-5"></div>
              
              <AlertOctagon className="w-24 h-24 text-red-800 mb-6 relative z-10 animate-pulse" />
              <h1 className="text-6xl font-serif text-[#e5e5e5] mb-2 relative z-10 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">市场崩盘</h1>
              <p className="text-xl text-[#888] mb-12 font-serif italic relative z-10">泡沫破裂。清算完成。</p>
              
              <div className="bg-[#1e1812] p-10 rounded-xl border-2 border-[#b8860b] max-w-2xl w-full relative z-10 shadow-[0_0_30px_rgba(184,134,11,0.2)]">
                  <div className="absolute top-0 left-0 p-2 text-[#b8860b]"><Flower size={24} /></div>
                  <div className="absolute bottom-0 right-0 p-2 text-[#b8860b] rotate-180"><Flower size={24} /></div>

                  <Trophy className="w-16 h-16 text-[#ffd700] mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
                  <h2 className="text-2xl text-[#deb887] font-serif mb-2 uppercase tracking-widest">最终胜者</h2>
                  <div className="text-5xl font-serif text-white mb-8 bg-gradient-to-r from-[#e5e5e5] via-[#fff] to-[#e5e5e5] bg-clip-text text-transparent">{winner?.name}</div>
                  <div className="text-3xl text-[#ffd700] font-mono mb-10 font-bold">{winner?.cash} 盾</div>
                  
                  <div className="space-y-3 text-left">
                      {state.players.map(p => (
                          <div key={p.id} className="flex justify-between border-b border-[#3d2b1f] pb-2">
                              <span className={`font-serif ${p.id === 0 ? 'font-bold text-[#deb887]' : 'text-[#888]'}`}>{p.name}</span>
                              <span className={p.id === state.winner ? 'text-[#ffd700] font-bold' : 'text-gray-600'}>{p.cash} ƒ</span>
                          </div>
                      ))}
                  </div>
              </div>
              <button onClick={() => startGame(0)} className="mt-8 text-[#8b4513] hover:text-[#ffd700] transition-colors underline font-serif relative z-10 text-lg">开始新的一局</button>
          </div>
      )
  }

  const humanPlayer = state.players[0];
  const currentPlayer = state.players[state.currentPlayerIndex];
  const isMyTurn = state.currentPlayerIndex === 0 && state.phase === GamePhase.PLAYER_ACTIONS;
  const gavelHolder = state.players[state.gavelHolderIndex];

  // Logic to get current visuals
  const { Icon: EventIcon, bgIcon: BgIcon, color: iconColor, bgClass } = state.currentEvent 
    ? getEventVisuals(state.currentEvent.id) 
    : getEventVisuals('');

  return (
    <div className="h-screen w-full bg-[#0a0500] text-[#a8a29e] flex flex-col overflow-hidden font-sans selection:bg-[#b8860b] selection:text-black relative">
      
      {/* Global Background Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/damask-pattern.png')] opacity-[0.03] pointer-events-none"></div>

      {/* Rules Modal */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      {/* Top Bar */}
      <header className="h-16 bg-gradient-to-r from-[#14100c] via-[#1e1812] to-[#14100c] border-b border-[#5c4033] flex items-center justify-between px-6 z-20 shrink-0 shadow-lg relative">
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#b8860b]/50 to-transparent"></div>
        
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#b8860b] to-[#8b4513] rounded-lg flex items-center justify-center font-serif font-bold text-[#0f0c08] border border-[#ffd700] shadow">
                <Flower size={24} />
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl font-serif tracking-widest text-[#e5e5e5] hidden md:block leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#e5e5e5] to-[#c0c0c0]">泡沫时代</h1>
                <span className="text-[10px] text-[#8b4513] tracking-[0.2em] font-serif uppercase hidden md:block">Tulip Wager</span>
            </div>
        </div>
        
        <div className="flex gap-10 text-xs font-serif uppercase tracking-widest text-[#5c4033]">
            <div className="flex flex-col items-center">
                <span className="text-[10px]">Round</span>
                <span className="text-[#ffd700] text-lg font-bold">{state.roundCount}</span>
            </div>
            <div className={`flex flex-col items-center ${state.phase === GamePhase.EVENT_DRAW ? 'animate-pulse' : ''}`}>
                <span className="text-[10px]">Phase</span>
                <span className={`text-lg font-bold ${
                     state.phase === GamePhase.SETUP ? 'text-gray-400' : 
                     state.phase === GamePhase.EVENT_DRAW ? 'text-[#ffd700]' :
                     state.phase === GamePhase.PLAYER_ACTIONS ? 'text-[#86efac]' : 'text-[#fca5a5]'
                }`}>
                    {state.phase === GamePhase.SETUP ? '开局' : 
                     state.phase === GamePhase.EVENT_DRAW ? '事件' :
                     state.phase === GamePhase.PLAYER_ACTIONS ? '交易' : '休市'}
                </span>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <button 
                onClick={toggleMute}
                className="text-[#8b4513] hover:text-[#ffd700] transition-colors p-2 hover:bg-[#2a2520] rounded-full"
                title={muted ? "取消静音" : "静音"}
            >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button 
                onClick={() => setShowRules(true)}
                className="flex items-center gap-2 text-[#8b4513] hover:text-[#ffd700] transition-colors border border-[#5c4033] px-3 py-1.5 rounded hover:border-[#b8860b] hover:bg-[#2a2520]" 
                title="查看规则"
            >
               <BookOpen size={16} />
               <span className="text-xs font-serif font-bold">规则</span>
            </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-grow flex relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')]">
        
        {/* Left: Market */}
        <div className="flex-grow p-4 md:p-8 flex flex-col gap-6 overflow-y-auto">
            {/* Top Market Stats */}
            <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-grow">
                    <MarketThermometer heat={state.marketHeat} />
                </div>
                
                {/* Event Card Display */}
                <div className={`w-full xl:w-96 h-52 border-2 border-[#3d2b1f] rounded-lg p-5 relative overflow-hidden shrink-0 shadow-2xl group transition-all duration-500 ${bgClass} ring-1 ring-white/5`}>
                     {/* Texture */}
                     <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>
                     
                     {/* Golden Corner Accents */}
                     <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#b8860b] rounded-tl opacity-50"></div>
                     <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#b8860b] rounded-br opacity-50"></div>

                     {/* Large Background Icon */}
                     <div className={`absolute -top-4 -right-4 p-2 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700 ${iconColor}`}>
                         <BgIcon size={180} />
                     </div>
                     
                     <h3 className="text-[10px] uppercase text-[#5c4033] mb-3 font-serif tracking-widest relative z-10 flex items-center gap-2 font-bold">
                        <ScrollText size={14} className="text-[#b8860b]" /> 当前事件
                     </h3>

                     {state.currentEvent ? (
                         <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-full bg-black/20 ${iconColor} shadow-inner`}>
                                    <EventIcon size={24} strokeWidth={2} />
                                </div>
                                <h4 className="text-xl font-serif text-[#e5e5e5] font-bold leading-none drop-shadow-sm">{state.currentEvent.title}</h4>
                            </div>
                            <p className="text-sm text-[#a8a29e] leading-relaxed font-serif italic pl-1 border-l-2 border-[#b8860b]/30">
                                {renderEventDescription(state.currentEvent.description, state.currentEvent.heatEffect)}
                            </p>
                            <span className={`absolute -bottom-16 right-0 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider
                                ${state.currentEvent.type === 'MANIA' ? 'bg-[#1a2f1a] text-[#86efac]' : 
                                  state.currentEvent.type === 'PANIC' ? 'bg-[#2e1a1a] text-[#fca5a5]' : 
                                  state.currentEvent.type === 'POLICY' ? 'bg-[#1a202e] text-[#93c5fd]' : 'bg-[#2a2520] text-gray-400'}`}>
                                {state.currentEvent.type}
                            </span>
                         </div>
                     ) : (
                         <div className="h-full flex items-center justify-center text-[#5c4033] font-serif italic text-sm">等待来自哈勒姆的消息...</div>
                     )}
                </div>
            </div>

            {/* Supply Mats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow min-h-[400px]">
                {[TulipColor.COMMON, TulipColor.VICEROY, TulipColor.AUGUSTUS].map(color => (
                    <SupplyMat 
                        key={color}
                        color={color}
                        count={state.supply[color]}
                        max={state.maxSupply[color]}
                        heat={state.marketHeat}
                        onBuy={() => handleAction(ActionType.BUY, color)}
                        canBuy={isMyTurn && state.remainingActions > 0}
                    />
                ))}
            </div>
        </div>

        {/* Right: Sidebar (Players + Log) */}
        <aside className="w-80 bg-[#14100c] border-l border-[#3d2b1f] flex flex-col hidden lg:flex shrink-0 h-full shadow-2xl relative z-10">
            {/* Top Half: Player Board */}
            <div className="flex-1 overflow-hidden p-4">
                <PlayerList 
                    players={state.players} 
                    currentPlayerIndex={state.currentPlayerIndex}
                    gavelHolderIndex={state.gavelHolderIndex}
                />
            </div>

            {/* Bottom Half: Log */}
            <div className="h-1/3 border-t border-[#3d2b1f] flex flex-col shrink-0 bg-[#0f0c08] relative">
                <div className="p-3 bg-[#1e1812] border-b border-[#3d2b1f] flex items-center gap-2">
                    <History size={14} className="text-[#b8860b]" />
                    <span className="font-serif text-xs text-[#b8860b] uppercase tracking-widest font-bold">交易所日志</span>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] bg-repeat">
                    {[...state.log].reverse().map((entry, i) => (
                        <div key={i} className="text-[11px] text-[#888] font-serif border-l-2 border-[#8b4513]/50 pl-3 py-0.5 leading-relaxed">
                            {entry}
                        </div>
                    ))}
                </div>
            </div>
        </aside>

        {/* Modal Overlays for Phases */}
        {state.phase === GamePhase.EVENT_DRAW && (
            <div className="absolute inset-0 z-50 bg-[#0f0c08]/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center relative">
                    <div className="absolute -top-10 -left-10 text-[#b8860b] opacity-20"><Wind size={100} /></div>
                    <div className="absolute -bottom-10 -right-10 text-[#b8860b] opacity-20"><Wind size={100} /></div>

                    <h2 className="text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-[#e5e5e5] to-[#a8a8a8] mb-8 tracking-widest drop-shadow-lg font-bold">新的一季</h2>
                    <button 
                        onClick={handleDrawEvent}
                        className="px-12 py-4 bg-gradient-to-b from-[#c0a080] to-[#8b6f4e] hover:from-[#d4b494] hover:to-[#a08060] text-[#0f0c08] font-serif font-bold rounded-lg shadow-[0_0_30px_rgba(192,160,128,0.3)] transition-all transform hover:scale-105 border border-[#e5e5e5]/20 text-lg tracking-widest"
                    >
                        揭示事件
                    </button>
                </div>
            </div>
        )}

        {state.phase === GamePhase.ROUND_END && (
             <div className="absolute inset-0 z-50 bg-[#0f0c08]/80 backdrop-blur-sm flex items-center justify-center">
             <div className="bg-[#1e1812] p-10 rounded-lg border-2 border-[#b8860b] max-w-lg text-center shadow-[0_0_60px_rgba(184,134,11,0.3)] relative">
                 <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#b8860b] shadow-lg"></div>
                 <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#b8860b] shadow-lg"></div>
                 <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#b8860b] shadow-lg"></div>
                 <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#b8860b] shadow-lg"></div>

                 <div className="text-[#b8860b] mb-4 flex justify-center"><Gavel size={48} /></div>
                 <h2 className="text-3xl font-serif text-[#e5e5e5] mb-2 font-bold tracking-wide">执锤定音</h2>
                 {gavelHolder.isAI ? (
                     <div className="text-[#c0a080] animate-pulse font-serif italic text-xl my-6 flex items-center justify-center gap-3">
                         <span className="w-2 h-2 rounded-full bg-[#c0a080]"></span>
                         {gavelHolder.name} 正在审视市场...
                     </div>
                 ) : (
                     <>
                        <p className="text-[#a8a29e] mb-10 font-serif italic text-sm">
                            你握有执锤权。<br/>是平抑市场，还是助推狂热？
                        </p>
                        <div className="flex gap-6 justify-center">
                            <button 
                                onClick={() => handlePassGavel(false)}
                                className="px-8 py-3 bg-[#2a2520] hover:bg-[#3d2b1f] text-[#c0a080] border border-[#5c4033] font-serif uppercase tracking-widest text-xs rounded hover:border-[#b8860b] transition-all"
                            >
                                休市 (结束)
                            </button>
                            <button 
                                onClick={() => handlePassGavel(true)}
                                className="px-8 py-3 bg-[#4a2525] hover:bg-[#633d3d] text-[#fca5a5] border border-[#633d3d] font-serif uppercase tracking-widest text-xs shadow-[0_0_15px_rgba(220,38,38,0.3)] rounded hover:border-red-400 transition-all"
                            >
                                加注 (继续)
                            </button>
                        </div>
                     </>
                 )}
             </div>
         </div>
        )}

      </main>

      {/* Bottom: Player Dashboard - ALWAYS YOU */}
      <PlayerControls 
          player={humanPlayer}
          isCurrentTurn={isMyTurn}
          activePlayerName={currentPlayer.name}
          remainingAP={isMyTurn ? state.remainingActions : 0}
          hasGavel={state.gavelHolderIndex === 0}
          canShort={state.marketHeat >= 5}
          canLoan={state.marketHeat >= 3}
          canSell={!state.sellingForbidden}
          onAction={handleAction}
      />
      
    </div>
  );
};

export default App;
