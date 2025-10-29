'use client';

import { useState, useEffect } from 'react';
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
          stocks: []
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

  const totalInvested = sectors.reduce((sum, s) => sum + s.totalInvestment, 0);
  const totalValue = sectors.reduce((sum, s) => sum + s.totalPresentValue, 0);
  const totalGain = totalValue - totalInvested;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Dashboard</h1>
          <p className="text-gray-600">
            {lastUpdate ? `Last updated: ${lastUpdate.toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Total Invested</h3>
            <p className="text-2xl font-bold mt-1">₹{totalInvested.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Current Value</h3>
            <p className="text-2xl font-bold mt-1">₹{totalValue.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Total Gain/Loss</h3>
            <p className={`text-2xl font-bold mt-1 ${totalGain >= 0 ? 'text-gain' : 'text-loss'}`}>
              ₹{Math.abs(totalGain).toLocaleString('en-IN')} ({((totalGain / totalInvested) * 100).toFixed(2)}%)
            </p>
          </div>
        </div>

        {loading && <LoadingSpinner />}
        {error && <p className="text-red-500 text-center py-4">Error: {error}</p>}

        {!loading && sectors.length === 0 && (
          <p className="text-center text-gray-500 py-8">No portfolio data found.</p>
        )}

        {!loading && sectors.map(sector => (
          <SectorAccordion key={sector.sector} sector={sector} />
        ))}
      </div>
    </main>
  );
}