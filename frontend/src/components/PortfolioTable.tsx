'use client';

import { PortfolioItem } from '@/types/portfolio';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

interface Props {
  stocks: PortfolioItem[];
}

const columns: ColumnDef<PortfolioItem>[] = [
  {
    accessorKey: 'particulars',
    header: 'Stock',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.particulars}</div>
        <div className="text-xs text-gray-500">{row.original.symbol}</div>
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
    cell: ({ row }) => row.original.cmp ? <span className="font-medium">₹{row.original.cmp.toFixed(2)}</span> : '-',
  },
  {
    accessorKey: 'presentValue',
    header: 'Value',
    cell: ({ row }) => row.original.presentValue ? `₹${row.original.presentValue.toLocaleString('en-IN')}` : '-',
  },
  {
    accessorKey: 'gainLoss',
    header: 'Gain/Loss',
    cell: ({ row }) => {
      const gain = row.original.gainLoss;
      if (gain === null) return '-';
      return (
        <div className={gain >= 0 ? 'text-gain' : 'text-loss'}>
          <div className="font-medium">₹{Math.abs(gain).toLocaleString('en-IN')}</div>
          <div className="text-xs">
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
];

export default function PortfolioTable({ stocks }: Props) {
  const table = useReactTable({
    data: stocks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="border-b bg-gray-50">
              {headerGroup.headers.map(header => (
                <th key={header.id} className="text-left py-3 px-4 font-medium text-gray-700">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="border-b hover:bg-gray-50 transition">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="py-3 px-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}