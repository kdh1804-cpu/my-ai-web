
import { MarketData, ScoreResult } from '../types';

export const calculateBottomScore = (data: MarketData): ScoreResult => {
  // 1. Fear & Greed (0 to 100, lower is better for bottom)
  // 0 -> 25 points, 100 -> 0 points
  const fearGreedScore = Math.max(0, Math.min(25, (100 - data.fearGreed) / 4));

  // 2. VIX (Higher is better for bottom)
  // Below 15 -> 0 points, 30+ -> 25 points
  let vixScore = 0;
  if (data.vix >= 30) vixScore = 25;
  else if (data.vix <= 15) vixScore = 0;
  else vixScore = ((data.vix - 15) / (30 - 15)) * 25;

  // 3. RSI (Lower is better for bottom, avg of daily and weekly)
  const avgRsi = (data.rsiDaily + data.rsiWeekly) / 2;
  // 70+ -> 0 points, 30- -> 25 points
  let rsiScore = Math.max(0, Math.min(25, ((70 - avgRsi) / (70 - 30)) * 25));

  // 4. Put/Call Ratio (Near or above 1.0 is better for bottom)
  // 0.6 -> 0 points, 1.1 -> 25 points
  let putCallScore = Math.max(0, Math.min(25, ((data.putCallRatio - 0.6) / (1.1 - 0.6)) * 25));

  const totalScore = fearGreedScore + vixScore + rsiScore + putCallScore;

  let status = "판독 중";
  let statusColor = "text-gray-400";

  // 사용자의 구체적인 요청 사항 반영
  if (totalScore >= 90) {
    status = "세기의 저점 (강력 매수)";
    statusColor = "text-red-500";
  } else if (totalScore >= 80) {
    status = "과매도 바닥권 (매수 고려)";
    statusColor = "text-orange-500";
  } else if (totalScore >= 70) {
    status = "매도 진행 중 (관망)";
    statusColor = "text-yellow-500";
  } else if (totalScore >= 60) {
    status = "평년 단계 (보통)";
    statusColor = "text-emerald-400";
  } else {
    status = "고점 근처 (리스크 관리)";
    statusColor = "text-blue-500";
  }

  return {
    totalScore,
    fearGreedScore,
    vixScore,
    rsiScore,
    putCallScore,
    status,
    statusColor
  };
};
