'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import PortfolioTable from './PortfolioTable';
import { SectorSummary } from '@/types/portfolio';

interface Props {
  sector: SectorSummary;
}

function SectorAccordion({ sector }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const formatPct = (val: number) => `${(val * 100).toFixed(2)}%`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 transition-all duration-300">
      {/* Header Section */}
      <div
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Sector Name */}
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{sector.sector}</h2>

        {/* Summary Details */}
        <div className="flex flex-wrap sm:flex-nowrap justify-between sm:items-center gap-2 sm:gap-6 text-sm sm:text-base">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
            <span className="text-gray-500">Invested:</span>
            <span className="font-medium">{formatCurrency(sector.totalInvestment)}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
            <span className="text-gray-500">Value:</span>
            <span className="font-medium">{formatCurrency(sector.totalPresentValue)}</span>
          </div>

          <div
            className={`flex flex-col sm:flex-row sm:items-center sm:gap-1 ${
              sector.totalGainLoss >= 0 ? 'text-gain' : 'text-loss'
            }`}
          >
            <span className="font-medium">{formatCurrency(sector.totalGainLoss)}</span>
            <span className="text-xs sm:text-sm">({formatPct(sector.totalGainLossPct)})</span>
          </div>

          <div className="flex justify-end sm:justify-center">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {/* Expandable Table */}
      {isOpen && (
        <div className="border-t border-gray-200 p-3 sm:p-4 overflow-x-auto">
          <PortfolioTable stocks={sector.stocks} />
        </div>
      )}
    </div>
  );
}

export default React.memo(SectorAccordion);
