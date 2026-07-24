'use client';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { stockApi } from '@/src/core/api/api';

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  lowStockAlert: number;
}

export function useLowStockAlerts() {
  const { orgId } = useAuth();
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [outOfStock, setOutOfStock] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) { setLoading(false); return; }
    let cancelled = false;
    stockApi.alerts(orgId)
      .then((d: any) => {
        if (cancelled) return;
        setLowStock(d?.lowStock ?? []);
        setOutOfStock(d?.outOfStock ?? []);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [orgId]);

  return { lowStock, outOfStock, count: lowStock.length + outOfStock.length, loading };
}
