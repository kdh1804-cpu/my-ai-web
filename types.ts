
export interface MarketData {
  fearGreed: number;
  vix: number;
  rsiDaily: number;
  rsiWeekly: number;
  putCallRatio: number;
}

export interface ScoreResult {
  totalScore: number;
  fearGreedScore: number;
  vixScore: number;
  rsiScore: number;
  putCallScore: number;
  status: string;
  statusColor: string;
}
