'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { saleApi, productApi, customerApi } from '@/src/core/api/api';

interface Product { id: string; name: string; price: number; }
interface Customer { id: string; name: string; }
interface CartItem { productId: string; name: string; price: number; qty: number; }
interface Sale { id: string; totalAmount: number; paymentMethod: string; createdAt: string; items: any[]; }

export default function SalesPage() {
  const { orgId } = useAuth();
  const [tab, setTab] = useState<'pos' | 'history'>('pos');
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerId, setCustomerId] = useState('');
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    Promise.all([
      productApi.list(orgId).then((d: any) => setProducts(Array.isArray(d?.products ?? d) ? (d?.products ?? d) : [])).catch(() => {}),
      customerApi.list(orgId).then((d: any) => setCustomers(Array.isArray(d?.customers ?? d) ? (d?.customers ?? d) : [])).catch(() => {}),
      saleApi.list(orgId).then((d: any) => setSales(Array.isArray(d?.sales ?? d) ? (d?.sales ?? d) : [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [orgId]);

  const addToCart = (p: Product) => {
    setCart((c) => {
      const existing = c.find((i) => i.productId === p.id);
      if (existing) return c.map((i) => i.productId === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { productId: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) setCart((c) => c.filter((i) => i.productId !== id));
    else setCart((c) => c.map((i) => i.productId === id ? { ...i, qty } : i));
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  async function handleCheckout() {
    if (!orgId || cart.length === 0) return;
    setProcessing(true); setError(''); setSuccess('');
    try {
      await saleApi.create(orgId, {
        items: cart.map((i) => ({ productId: i.productId, qty: i.qty })),
        paymentMethod,
        paidAmount: total,
        customerId: customerId || undefined,
        note: note || undefined,
      });
      setCart([]); setNote(''); setCustomerId('');
      setSuccess('Sale completed!');
      saleApi.list(orgId).then((d: any) => setSales(Array.isArray(d?.sales ?? d) ? (d?.sales ?? d) : [])).catch(() => {});
    } catch (err: any) { setError(err.message); }
    finally { setProcessing(false); }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading…</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['pos', 'history'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'pos' ? 'POS Terminal' : 'History'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'pos' ? (
        <div className="flex gap-4 h-[calc(100vh-10rem)]">
          {/* Product grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((p) => (
                <button key={p.id} onClick={() => addToCart(p)}
                  className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-indigo-400 hover:shadow-sm transition">
                  <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                  <p className="text-indigo-600 font-bold mt-1">{p.price.toFixed(2)} DA</p>
                </button>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div className="w-80 flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
            <div className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-800">Cart</div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {cart.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No items</p>
              ) : cart.map((item) => (
                <div key={item.productId} className="px-4 py-2 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.price.toFixed(2)} DA each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.productId, item.qty - 1)} className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold hover:bg-gray-200">−</button>
                    <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                    <button onClick={() => updateQty(item.productId, item.qty + 1)} className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold hover:bg-gray-200">+</button>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-16 text-right">{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 p-4 space-y-3">
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">No customer</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile">Mobile</option>
                <option value="credit">Credit</option>
              </select>
              {error && <p className="text-red-600 text-xs">{error}</p>}
              {success && <p className="text-green-600 text-xs">{success}</p>}
              <div className="flex items-center justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-indigo-700">{total.toFixed(2)} DA</span>
              </div>
              <button onClick={handleCheckout} disabled={processing || cart.length === 0}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition">
                {processing ? 'Processing…' : '✓ Checkout'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['#', 'Date', 'Items', 'Payment', 'Total'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No sales yet</td></tr>
              ) : sales.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{s.id?.slice(-6)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{s.items?.length ?? 0} item(s)</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">{s.paymentMethod}</span></td>
                  <td className="px-4 py-3 font-bold text-gray-900">{(s.totalAmount ?? 0).toFixed(2)} DA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
