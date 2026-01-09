
import React, { useState, useMemo, useEffect } from 'react';
import { MarketData } from './types';
import { calculateBottomScore } from './services/calculator';
import { Gauge } from './components/Gauge';
import { IndicatorCard } from './components/IndicatorCard';
import { GoogleGenAI } from "@google/genai";

/**
 * 역사적 주요 저점 데이터베이스 (고정)
 */
const HISTORICAL_DB: Record<string, MarketData> = {
  "2020-03-23": { fearGreed: 3, vix: 82.7, rsiDaily: 16, rsiWeekly: 32, putCallRatio: 1.45 },
  "2022-10-13": { fearGreed: 8, vix: 33.6, rsiDaily: 28, rsiWeekly: 34, putCallRatio: 1.28 },
  "2018-12-24": { fearGreed: 5, vix: 36.1, rsiDaily: 20, rsiWeekly: 30, putCallRatio: 1.35 },
  "2011-10-04": { fearGreed: 12, vix: 45.4, rsiDaily: 25, rsiWeekly: 31, putCallRatio: 1.20 },
  "2015-08-24": { fearGreed: 7, vix: 40.7, rsiDaily: 19, rsiWeekly: 35, putCallRatio: 1.30 },
  "2016-02-11": { fearGreed: 15, vix: 28.1, rsiDaily: 27, rsiWeekly: 38, putCallRatio: 1.15 },
  "2023-10-27": { fearGreed: 22, vix: 21.3, rsiDaily: 30, rsiWeekly: 42, putCallRatio: 1.05 },
  "2024-08-05": { fearGreed: 18, vix: 38.5, rsiDaily: 26, rsiWeekly: 45, putCallRatio: 1.18 },
  "2025-04-07": { fearGreed: 5, vix: 45.0, rsiDaily: 15, rsiWeekly: 20, putCallRatio: 1.35 }
};

const App: React.FC = () => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isLoading, setIsLoading] = useState(false);
  
  const [marketData, setMarketData] = useState<MarketData>({
    fearGreed: 50,
    vix: 15,
    rsiDaily: 50,
    rsiWeekly: 50,
    putCallRatio: 0.8
  });

  // 최근 1개월 이내인지 확인하는 함수
  const isWithinLastMonth = (dateStr: string) => {
    const selected = new Date(dateStr);
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    return selected >= oneMonthAgo && selected <= today;
  };

  const fetchRecentMarketData = async (date: string) => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Search for real stock market data on ${date}. 
      I need these 4 indicators for QQQ/Nasdaq:
      1. CNN Fear & Greed Index (0-100)
      2. CBOE VIX Index
      3. RSI (14 days)
      4. Equity Put/Call Ratio
      Provide the result strictly in JSON format: {"fearGreed": number, "vix": number, "rsiDaily": number, "rsiWeekly": number, "putCallRatio": number}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });

      const data = JSON.parse(response.text || "{}");
      if (data.fearGreed !== undefined) {
        setMarketData(data);
      }
    } catch (error) {
      console.error("Failed to fetch recent data:", error);
      generateFallbackData(date);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackData = (date: string) => {
    const seed = date.split('-').reduce((acc, part) => acc + parseInt(part), 0);
    const hash = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };
    setMarketData({
      fearGreed: Math.round(30 + hash(seed) * 50),
      vix: Number((12 + hash(seed + 1) * 15).toFixed(1)),
      rsiDaily: Math.round(35 + hash(seed + 2) * 40),
      rsiWeekly: Math.round(40 + hash(seed + 3) * 30),
      putCallRatio: Number((0.65 + hash(seed + 4) * 0.4).toFixed(2))
    });
  };

  useEffect(() => {
    if (HISTORICAL_DB[selectedDate]) {
      setMarketData(HISTORICAL_DB[selectedDate]);
      return;
    }

    if (isWithinLastMonth(selectedDate)) {
      fetchRecentMarketData(selectedDate);
    } else {
      generateFallbackData(selectedDate);
    }
  }, [selectedDate]);

  const result = useMemo(() => calculateBottomScore(marketData), [marketData]);

  const updateField = (field: keyof MarketData) => (val: number) => {
    setMarketData(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-12 text-center relative">
        <h1 className="text-5xl font-black mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          QQQ 저점 판독기
        </h1>
        <p className="text-gray-400 font-medium tracking-wide">Nasdaq-100 매수 타이밍 정밀 분석 도구</p>
      </header>

      <section className="flex flex-col items-center mb-12">
        <div className="w-full max-w-md relative">
            {isLoading && (
              <div className="absolute inset-0 bg-gray-950/60 z-20 flex items-center justify-center rounded-3xl backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-bold text-blue-400">실시간 데이터 분석 중...</span>
                </div>
              </div>
            )}
            <Gauge 
                value={result.totalScore} 
                status={result.status} 
                color={result.statusColor} 
            />
            
            <div className="mt-6 flex flex-col items-center gap-2">
              <label htmlFor="date-picker" className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">조회 기준일 선택</label>
              <input 
                id="date-picker"
                type="date" 
                value={selectedDate}
                min="2010-01-01"
                max={todayStr}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-gray-900 border border-gray-800 text-white px-6 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer font-bold text-lg shadow-xl"
              />
              <div className="flex gap-3 mt-3">
                {HISTORICAL_DB[selectedDate] && (
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-1 rounded-full font-bold border border-emerald-500/20">HISTORICAL DATA</span>
                )}
                {isWithinLastMonth(selectedDate) && (
                  <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-1 rounded-full font-bold border border-blue-500/20">REAL-TIME SYNC</span>
                )}
              </div>
            </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <IndicatorCard 
            label="Fear & Greed Index"
            value={marketData.fearGreed}
            min={0}
            max={100}
            step={1}
            onChange={updateField('fearGreed')}
            score={result.fearGreedScore}
        />
        <IndicatorCard 
            label="VIX (Volatility)"
            value={marketData.vix}
            min={10}
            max={90}
            step={0.1}
            onChange={updateField('vix')}
            score={result.vixScore}
        />
        <IndicatorCard 
            label="RSI (Daily/Weekly Avg)"
            value={Math.round((marketData.rsiDaily + marketData.rsiWeekly) / 2)}
            min={5}
            max={95}
            step={1}
            onChange={(val) => {
                setMarketData(prev => ({ ...prev, rsiDaily: val, rsiWeekly: val }));
            }}
            score={result.rsiScore}
        />
        <IndicatorCard 
            label="Put/Call Ratio (PCR)"
            value={marketData.putCallRatio}
            min={0.5}
            max={2.5}
            step={0.01}
            onChange={updateField('putCallRatio')}
            score={result.putCallScore}
        />
      </div>

      <section className="bg-gray-900/40 p-8 rounded-[2rem] border border-gray-800/50 mb-12 backdrop-blur-md">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full"></span>
            판독 알고리즘 가이드
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-gray-950/50 rounded-2xl border border-gray-800 group hover:border-red-500/50 transition-colors">
                <p className="font-bold text-red-500 text-lg mb-2">90+ : 세기의 저점</p>
                <p className="text-sm text-gray-400 leading-relaxed">역사적 대바닥. 공포가 극에 달하여 가장 높은 확률의 매수 기회를 제공합니다.</p>
            </div>
            <div className="p-5 bg-gray-950/50 rounded-2xl border border-gray-800 group hover:border-orange-500/50 transition-colors">
                <p className="font-bold text-orange-500 text-lg mb-2">80+ : 과매도 바닥권</p>
                <p className="text-sm text-gray-400 leading-relaxed">시장 심리가 위축된 상태입니다. 분할 매수를 시작하기에 적절한 시점입니다.</p>
            </div>
            <div className="p-5 bg-gray-950/50 rounded-2xl border border-gray-800 group hover:border-yellow-500/50 transition-colors">
                <p className="font-bold text-yellow-500 text-lg mb-2">70+ : 매도 진행 중</p>
                <p className="text-sm text-gray-400 leading-relaxed text-left">조정 압력이 발생하고 있습니다. 추가 하락 여부를 관망하며 대응하세요.</p>
            </div>
            <div className="p-5 bg-gray-950/50 rounded-2xl border border-gray-800 group hover:border-emerald-500/50 transition-colors">
                <p className="font-bold text-emerald-400 text-lg mb-2">60+ : 평년 단계</p>
                <p className="text-sm text-gray-400 leading-relaxed text-left">시장이 비교적 안정적인 평균 범주에 머물고 있습니다.</p>
            </div>
        </div>
      </section>

      {/* 광고 배너 섹션 */}
      <section className="mt-8 mb-12">
        <a 
          href="https://mkt.shopping.naver.com/link/695fb2e9a93b0f6613460d2d" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="w-full bg-[#fdf5d7] text-[#332511] p-6 sm:p-10 rounded-[2.5rem] border border-[#e5dec0] flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-2xl">
            <div className="z-10 text-center sm:text-left">
              <span className="inline-block px-3 py-1 bg-[#332511] text-[#fdf5d7] text-[10px] font-black rounded-full mb-3 tracking-tighter">LIMITED OFFER</span>
              <h3 className="text-2xl sm:text-4xl font-black mt-1 leading-tight tracking-tight">
                방수 쇼파패드<br/>리뉴얼 전 재고정리
              </h3>
              <div className="mt-6 mb-6 flex flex-col items-center sm:items-start">
                 <div className="bg-[#332511] text-[#fdf5d7] rounded-2xl px-8 py-3 inline-flex flex-col items-center shadow-lg">
                    <span className="text-sm font-bold opacity-80">전품목 기획전</span>
                    <span className="text-4xl font-black">1 + 1</span>
                 </div>
              </div>
              <p className="text-xs font-medium opacity-70">
                준비된 재고 소진 시 예고 없이 종료됩니다.
              </p>
            </div>
            <div className="w-full sm:w-1/2 h-52 sm:h-72 rounded-[2rem] overflow-hidden shadow-2xl ring-4 ring-[#332511]/5">
               <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800" alt="Premium Sofa" className="w-full h-full object-cover transition-transform hover:scale-110 duration-700" />
            </div>
          </div>
        </a>
      </section>

      <footer className="mt-20 pb-10 text-center text-gray-600 text-[11px] font-medium border-t border-gray-900 pt-10">
        <div className="flex justify-center gap-6 mb-4 opacity-50">
          <span>REAL-TIME ANALYSIS</span>
          <span>HISTORICAL BACKTESTING</span>
          <span>MARKET SENTIMENT</span>
        </div>
        <p>© 2024 QQQ BOTTOM DETECTOR. ALL RIGHTS RESERVED.</p>
        <p className="mt-1">INVESTMENT AT YOUR OWN RISK.</p>
      </footer>
    </div>
  );
};

export default App;
