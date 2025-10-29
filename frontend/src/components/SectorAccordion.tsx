'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import PortfolioTable from './PortfolioTable';
import { SectorSummary } from '@/types/portfolio';

interface Props {
  sector: SectorSummary;
}

export default function SectorAccordion({ sector }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const formatPct = (val: number) => `${(val * 100).toFixed(2)}%`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      <div
        className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-semibold text-gray-800">{sector.sector}</h2>
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-gray-500">Invested:</span>{' '}
            <span className="font-medium">{formatCurrency(sector.totalInvestment)}</span>
          </div>
          <div>
            <span className="text-gray-500">Value:</span>{' '}
            <span className="font-medium">{formatCurrency(sector.totalPresentValue)}</span>
          </div>
          <div className={sector.totalGainLoss >= 0 ? 'text-gain' : 'text-loss'}>
            <span className="font-medium">{formatCurrency(sector.totalGainLoss)}</span>{' '}
            <span className="text-xs">({formatPct(sector.totalGainLossPct)})</span>
          </div>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-gray-200 p-4">
          <PortfolioTable stocks={sector.stocks} />
        </div>
      )}
    </div>
  );
}