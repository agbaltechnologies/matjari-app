'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLowStockAlerts } from '../hooks/useLowStockAlerts';

export function LowStockBell() {
  const { lowStock, outOfStock, count } = useLowStockAlerts();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const items = [...outOfStock, ...lowStock];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-600"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg border border-gray-200 shadow-lg py-2 z-40 max-h-80 overflow-y-auto">
          <p className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Stock alerts</p>
          {items.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400">All stocked up.</p>
          ) : (
            items.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/products/${p.id}/edit`}
                className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                <span className="text-gray-800 truncate">{p.name}</span>
                <span className={`ml-2 shrink-0 font-semibold ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                  {p.stock} left
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
