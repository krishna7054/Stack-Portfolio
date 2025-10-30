'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchExpandedPortfolio } from '@/lib/api';
import { PortfolioItem, SectorSummary } from '@/types/portfolio';
import SectorAccordion from '@/components/SectorAccordion';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const [sectors, setSectors] = useState<SectorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const groupBySector = (items: PortfolioItem[]): SectorSummary[] => {
    const map = new Map<string, SectorSummary>();

    items.forEach(item => {
      const sector = item.sector || 'Others';
      if (!map.has(sector)) {
        map.set(sector, {
          sector,
          totalInvestment: 0,
          totalPresentValue: 0,
          totalGainLoss: 0,
          totalGainLossPct: 0,
          stocks: [],
        });
      }

      const summary = map.get(sector)!;
      summary.stocks.push(item);
      summary.totalInvestment += item.investment;
      if (item.presentValue) summary.totalPresentValue += item.presentValue;
      if (item.gainLoss) summary.totalGainLoss += item.gainLoss;
    });

    // Calculate %
    map.forEach(s => {
      s.totalGainLossPct = s.totalInvestment > 0 ? s.totalGainLoss / s.totalInvestment : 0;
    });

    return Array.from(map.values()).sort((a, b) => b.totalInvestment - a.totalInvestment);
  };

  const loadData = async () => {
    try {
      const data = await fetchExpandedPortfolio();
      const grouped = groupBySector(data);
      setSectors(grouped);
      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const { totalInvested, totalValue, totalGain } = useMemo(() => {
    const totalInvested = sectors.reduce((sum, s) => sum + s.totalInvestment, 0);
    const totalValue = sectors.reduce((sum, s) => sum + s.totalPresentValue, 0);
    const totalGain = totalValue - totalInvested;
    return { totalInvested, totalValue, totalGain };
  }, [sectors]);

  return (
    <main className="min-h-screen bg-gray-50 px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 transition-all">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white border-b border-amber-400 border-t border-t-blue-400 shadow-sm mb-6 rounded-md">
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif text-gray-900">
                  Portfolio{' '}
                  <span className="text-blue-500 font-serif">Dashboard</span>
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base font-light">
                  Real-time stock portfolio tracking
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-gray-600">Last updated</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {lastUpdate ? `${lastUpdate.toLocaleTimeString()}` : 'Loading...'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-lg border border-gray-200 shadow-sm border-t-4 border-t-cyan-400 transition-transform hover:scale-[1.02]">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">
              Total Invested
            </h3>
            <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900">
              ₹{totalInvested.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-lg border border-gray-200 shadow-sm border-t-4 border-t-zinc-400 transition-transform hover:scale-[1.02]">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">
              Current Value
            </h3>
            <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900">
              ₹{totalValue.toLocaleString('en-IN')}
            </p>
          </div>

          <div
            className={`bg-white p-4 sm:p-5 md:p-6 rounded-lg border border-gray-200 shadow-sm border-t-4 ${
              totalGain >= 0 ? 'border-t-green-400' : 'border-t-red-400'
            } transition-transform hover:scale-[1.02]`}
          >
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">
              Total Gain/Loss
            </h3>
            <p
              className={`text-xl sm:text-2xl font-bold mt-1 ${
                totalGain >= 0 ? 'text-gain' : 'text-loss'
              }`}
            >
              ₹{Math.abs(totalGain).toLocaleString('en-IN')} (
              {((totalGain / totalInvested) * 100).toFixed(2)}%)
            </p>
          </div>
        </div>

        {/* Data State Handling */}
        {loading && <LoadingSpinner />}
        {error && (
          <p className="text-red-500 text-center text-sm sm:text-base py-4">
            Error: {error}
          </p>
        )}

        {!loading && sectors.length === 0 && (
          <p className="text-center text-gray-500 text-sm sm:text-base py-8">
            No portfolio data found.
          </p>
        )}

        {/* Sector Accordions */}
        {!loading &&
          sectors.map(sector => (
            <SectorAccordion key={sector.sector} sector={sector} />
          ))}
      </div>
    </main>
  );
}
