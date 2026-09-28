import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Shop() {
  const { user, refreshUser } = useAuth();
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [buying, setBuying] = useState(null);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState('power-ups');

  useEffect(() => {
    Promise.all([api.get('/users/shop'), api.get('/users/inventory')])
      .then(([s, inv]) => { setItems(s.data); setInventory(inv.data); });
  }, []);

  const showToast = (msg, ok) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2200);
  };

  const buy = async item => {
    if (buying) return;
    if ((user?.gems || 0) < item.cost_gems) {
      showToast('Not enough gems!', false);
      return;
    }
    setBuying(item.id);
    try {
      await api.post(`/users/shop/buy/${item.id}`);
      await refreshUser();
      const inv = await api.get('/users/inventory');
      setInventory(inv.data);
      showToast(`${item.name} purchased!`, true);
    } catch (err) {
      showToast(err.response?.data?.error || 'Purchase failed', false);
    } finally {
      setBuying(null);
    }
  };

  const categories = [...new Set(items.map(i => i.category))];
  const filtered = items.filter(i => i.category === tab);

  const CATEGORY_META = {
    'power-ups': { label: 'POWER-UPS', emoji: '⚡' },
    'outfits':   { label: 'OUTFITS',   emoji: '👕' },
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-[#3C3C3C]">Shop</h1>
        <div className="flex items-center gap-2 border-2 border-[#E5E5E5] border-b-[4px] rounded-2xl px-5 py-2">
          <span className="text-xl">💎</span>
          <span className="text-xl font-black text-[#3C3C3C]">{(user?.gems || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Hearts card */}
      <div className="border-2 border-[#E5E5E5] rounded-2xl p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-2">Your hearts</p>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-2xl ${i < (user?.hearts || 0) ? '' : 'grayscale opacity-20'}`}>❤️</span>
            ))}
          </div>
        </div>
        {(user?.hearts || 0) < 5 && (
          <button
            onClick={() => buy({ id: 1, cost_gems: 350, name: 'Heart Refill', icon: '❤️' })}
            className="btn-red py-2 px-5 text-sm"
          >
            REFILL · 350 💎
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6">
        {categories.map(cat => {
          const m = CATEGORY_META[cat] || { label: cat.toUpperCase(), emoji: '🛒' };
          return (
            <button
              key={cat}
              onClick={() => setTab(cat)}
              className={`flex-1 py-3 rounded-2xl font-extrabold text-sm tracking-wider uppercase transition-colors flex items-center justify-center gap-2 ${
                tab === cat
                  ? 'bg-[#FFC800] text-[#3C3C3C] border-b-[3px] border-[#E5B400]'
                  : 'bg-[#F7F7F7] text-[#AFAFAF] border-b-[3px] border-[#E5E5E5] hover:bg-[#EAEAEA]'
              }`}
            >
              {m.emoji} {m.label}
            </button>
          );
        })}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(item => {
          const owned = inventory.find(i => i.id === item.id);
          const canAfford = (user?.gems || 0) >= item.cost_gems;

          return (
            <div key={item.id} className="border-2 border-[#E5E5E5] rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span className="text-4xl">{item.icon}</span>
                <div className="flex-1">
                  <h3 className="font-extrabold text-[#3C3C3C]">{item.name}</h3>
                  <p className="text-sm text-[#AFAFAF] font-bold">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1 font-extrabold text-[#3C3C3C]">
                  <span>💎</span>
                  <span>{item.cost_gems.toLocaleString()}</span>
                </div>
                {owned && (
                  <span className="text-xs bg-[#D7FFB8] text-[#2B730A] font-extrabold px-2 py-1 rounded-full">
                    ×{owned.quantity} owned
                  </span>
                )}
                <button
                  onClick={() => buy(item)}
                  disabled={buying === item.id || !canAfford}
                  className={canAfford
                    ? 'bg-[#FFC800] text-[#3C3C3C] font-extrabold uppercase tracking-wider text-sm px-5 py-2 rounded-2xl border-b-[3px] border-[#E5B400] hover:bg-[#FFD740] active:border-b-[1px] active:translate-y-[2px] transition-all cursor-pointer'
                    : 'bg-[#E5E5E5] text-[#AFAFAF] font-extrabold uppercase tracking-wider text-sm px-5 py-2 rounded-2xl border-b-[3px] border-[#C7C7C7] cursor-not-allowed'
                  }
                >
                  {buying === item.id ? '...' : 'BUY'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 px-7 py-3.5 rounded-2xl font-extrabold shadow-xl animate-pop z-50 tracking-wide whitespace-nowrap ${
            toast.ok ? 'bg-[#58CC02] text-white' : 'bg-[#FF4B4B] text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
