'use client';
import React from 'react';
import { PortfolioItem } from '@/types/portfolio';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

interface Props {
  stocks: PortfolioItem[];
}

const columns: ColumnDef<PortfolioItem>[] = [
  {
    accessorKey: 'particulars',
    header: 'Stock',
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-sm sm:text-base">{row.original.particulars}</div>
        <div className="text-[10px] sm:text-xs text-gray-500">{row.original.symbol}</div>
      </div>
    ),
  },
  {
    accessorKey: 'purchasePrice',
    header: 'Buy Price',
    cell: ({ row }) => `₹${row.original.purchasePrice.toFixed(2)}`,
  },
  {
    accessorKey: 'quantity',
    header: 'Qty',
  },
  {
    accessorKey: 'investment',
    header: 'Invested',
    cell: ({ row }) => `₹${row.original.investment.toLocaleString('en-IN')}`,
  },
  {
    accessorKey: 'cmp',
    header: 'CMP',
    cell: ({ row }) =>
      row.original.cmp ? (
        <span className="font-medium">₹{row.original.cmp.toFixed(2)}</span>
      ) : (
        '-'
      ),
  },
  {
    accessorKey: 'presentValue',
    header: 'Value',
    cell: ({ row }) =>
      row.original.presentValue
        ? `₹${row.original.presentValue.toLocaleString('en-IN')}`
        : '-',
  },
  {
    accessorKey: 'gainLoss',
    header: 'Gain/Loss',
    cell: ({ row }) => {
      const gain = row.original.gainLoss;
      if (gain === null) return '-';
      return (
        <div className={gain >= 0 ? 'text-green-600' : 'text-red-600'}>
          <div className="font-medium text-sm sm:text-base">
            ₹{Math.abs(gain).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] sm:text-xs">
            ({((gain / row.original.investment) * 100).toFixed(2)}%)
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'peRatio',
    header: 'P/E',
    cell: ({ row }) => row.original.peRatio?.toFixed(2) ?? '-',
  },
  {
    accessorKey: 'Exchange',
    header: 'Exchange',
    cell: ({ row }) => row.original.exchange?.split(' -')[0].trim() ?? '-',
  },
  {
    accessorKey: 'Portfolio (%)',
    header: 'Portfolio (%)',
    cell: ({ row }) => row.original.portfolioPercent ?? '-',
  },
  {
    accessorKey: 'Latest Earnings',
    header: 'Latest Earnings',
    cell: ({ row }) => row.original.latestEarnings?.toFixed(2) ?? '-',
  },
];

function PortfolioTable({ stocks }: Props) {
  const table = useReactTable({
    data: stocks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] sm:min-w-full">
        <table className="w-full border-collapse text-xs sm:text-sm md:text-base">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b bg-gray-100 text-gray-700"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left py-2 px-2 sm:py-3 sm:px-4 font-semibold whitespace-nowrap"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="py-2 px-2 sm:py-3 sm:px-4 text-gray-800 whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default React.memo(PortfolioTable);
