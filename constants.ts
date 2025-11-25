
import { EventCard, TulipColor } from './types';

// Base Price Table (Heat L1-L10)
export const BASE_PRICES: Record<number, Record<TulipColor, number>> = {
  1: { [TulipColor.COMMON]: 30, [TulipColor.VICEROY]: 60, [TulipColor.AUGUSTUS]: 100 },
  2: { [TulipColor.COMMON]: 40, [TulipColor.VICEROY]: 80, [TulipColor.AUGUSTUS]: 200 },
  3: { [TulipColor.COMMON]: 60, [TulipColor.VICEROY]: 120, [TulipColor.AUGUSTUS]: 400 },
  4: { [TulipColor.COMMON]: 100, [TulipColor.VICEROY]: 200, [TulipColor.AUGUSTUS]: 800 },
  5: { [TulipColor.COMMON]: 150, [TulipColor.VICEROY]: 350, [TulipColor.AUGUSTUS]: 1500 },
  6: { [TulipColor.COMMON]: 250, [TulipColor.VICEROY]: 600, [TulipColor.AUGUSTUS]: 3000 },
  7: { [TulipColor.COMMON]: 400, [TulipColor.VICEROY]: 1000, [TulipColor.AUGUSTUS]: 6000 },
  8: { [TulipColor.COMMON]: 600, [TulipColor.VICEROY]: 1500, [TulipColor.AUGUSTUS]: 12000 },
  9: { [TulipColor.COMMON]: 1000, [TulipColor.VICEROY]: 3000, [TulipColor.AUGUSTUS]: 25000 },
  10: { [TulipColor.COMMON]: 2000, [TulipColor.VICEROY]: 6000, [TulipColor.AUGUSTUS]: 40000 },
};

// Crash/Liquidation Prices (Based on L1)
export const CRASH_PRICES = {
  [TulipColor.COMMON]: 20,
  [TulipColor.VICEROY]: 50,
  [TulipColor.AUGUSTUS]: 100,
};

// Supply Zones and Premium Calculation
export const getSupplyPremium = (current: number, max: number): number => {
  const percentage = current / max;
  if (percentage > 0.8) return 0; // Zone 1 (Full)
  if (percentage > 0.6) return 20; // Zone 2
  if (percentage > 0.4) return 50; // Zone 3
  if (percentage > 0.2) return 100; // Zone 4
  return 200; // Zone 5 (Empty/Scarcity)
};

export const PREMIUM_TABLE = (color: TulipColor, zoneIndex: number): number => {
  const table = {
    [TulipColor.COMMON]: [0, 0, 10, 30, 100],
    [TulipColor.VICEROY]: [0, 20, 50, 100, 200],
    [TulipColor.AUGUSTUS]: [0, 100, 200, 400, 800],
  };
  return table[color][zoneIndex] || 0;
};

export const getZoneIndex = (current: number, max: number): number => {
    // 5 zones. 
    if (current === 0) return 4;
    const ratio = current / max;
    if (ratio > 0.8) return 0;
    if (ratio > 0.6) return 1;
    if (ratio > 0.4) return 2;
    if (ratio > 0.2) return 3;
    return 4;
}

// FULL EVENT DECK DEFINITION (18 Cards) - CHINESE
// Rich narrative text added for immersion.

export const CARD_DEFINITIONS: EventCard[] = [
  // MANIA
  { id: 'rumor', title: '酒馆里的传闻', description: '阿姆斯特丹港口的酒馆里流传着新的财富故事，据说来自东方的船队带来了无尽的黄金，推高了人们的心理预期。 (热度 +1)', type: 'MANIA', heatEffect: 1 },
  { id: 'variety', title: '变异新品种', description: '哈勒姆的一位植物学家培育出了拥有罕见火焰条纹的新品种，全城的贵族都为之疯狂，竞相出价。所有玩家免费升级 1 张[杂色]为[副王]。 (热度 +1)', type: 'MANIA', heatEffect: 1 },
  { id: 'french', title: '法国贵族的订单', description: '凡尔赛宫的信使送来了路易十三的亲笔订单，法国皇室渴望收购市面上所有的奥古斯都。奥古斯都持有者获利，做空者罚款。 (热度 +1)', type: 'MANIA', heatEffect: 1 },
  
  // PANIC
  { id: 'rational', title: '理性的声音', description: '一位受人尊敬的教授在市政厅发表演讲，警告郁金香价格已经严重脱离了实际价值，呼吁人们回归理性。 (若热度>7，则热度-2)', type: 'PANIC', heatEffect: -2 },
  { 
      id: 'rot', 
      title: '球茎腐烂', 
      description: '连日的阴雨导致地下仓库受潮。维护成本激增：持有[杂色/副王]每张需支付[当前杂色基准价]，持有[奥古斯都]每张需支付[当前副王基准价]。付不起必须弃牌抵债！ (热度 -1)', 
      type: 'PANIC', 
      heatEffect: -1 
  },
  { id: 'plague', title: '黑死病蔓延', description: '黑死病的阴影再次笼罩城市，集市被强制关闭，医生建议人们留在家中。本轮禁止任何[卖出]操作。 (热度 -1)', type: 'PANIC', heatEffect: -1 },
  
  // POLICY
  { id: 'injection', title: '央行注资', description: '为了挽救颓势，阿姆斯特丹银行宣布放宽信贷限制，向市场注入流动性资金。所有玩家获得 200 盾。', type: 'POLICY' },
  { id: 'margin', title: '保证金催收', description: '银行认为市场风险过高，要求所有使用杠杆的投机者立即补足保证金。每张贷款罚 200，每张做空罚 500。', type: 'POLICY' },
  
  // CRASH (Unique Cards)
  { 
      id: 'crash_auction', 
      title: '流拍的拍卖会', 
      description: '拍卖师敲断了木槌，却无人应价。全场死寂，只有沉重的呼吸声。这是一次假摔，还是末日的预演？ (热度立即 -3，游戏继续)', 
      type: 'CRASH', 
      heatEffect: -3 
  },
  { 
      id: 'crash_haarlem', 
      title: '哈勒姆大恐慌', 
      description: '恐慌像野火一样从哈勒姆蔓延到阿姆斯特丹。泡沫彻底破裂，游戏结束。执行标准清算。', 
      type: 'CRASH' 
  },
  { 
      id: 'crash_court', 
      title: '法庭宣布合约无效', 
      description: '为了平息暴乱，最高法院通过紧急法案：所有红色债务契约即刻作废！游戏结束。(免除偿还贷款，但做空合约仍需结算)', 
      type: 'CRASH' 
  },
];

export const DECK_COMPOSITION = {
  rumor: 6,
  variety: 3,
  french: 1,
  rational: 2,
  rot: 2,
  plague: 1,
  injection: 1,
  margin: 1,
  // 1 of each crash card
  crash_auction: 1,
  crash_haarlem: 1,
  crash_court: 1
};

// Colors mapping for display
export const TULIP_NAMES_CN: Record<TulipColor, string> = {
  [TulipColor.COMMON]: '杂色郁金香',
  [TulipColor.VICEROY]: '副王',
  [TulipColor.AUGUSTUS]: '奥古斯都'
};
