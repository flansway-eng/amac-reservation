'use client';

import { useState, useEffect, useCallback } from 'react';
import { Reservation } from '@/lib/types';
import { formatPrice, formatDateFR } from '@/lib/utils';

type Statut = 'EN_ATTENTE' | 'CONFIRMEE' | 'PAYEE' | 'ANNULEE';

const STATUT_OPTIONS: Statut[] = ['EN_ATTENTE', 'CONFIRMEE', 'PAYEE', 'ANNULEE'];
const STATUT_LABELS: Record<Statut, string> = {
  EN_ATTENTE: 'En attente',
  CONFIRMEE: 'Confirmée',
  PAYEE: 'Payée',
  ANNULEE: 'Annulée',
};
const STATUT_CLASS: Record<Statut, string> = {
  EN_ATTENTE: 'badge-en-attente',
  CONFIRMEE: 'badge-confirmee',
  PAYEE: 'badge-payee',
  ANNULEE: 'badge-annulee',
};

interface Stats {
  totalReservations: number;
  statutStats: Array<{ statut: string; count: number }>;
  passStats: Array<{ code: string; label: string; total: number; totalOfferts: number }>;
  ca: number;
  topItems: Array<{ nom: string; total: number }>;
  latest: Array<Reservation & { reservationPasses?: Array<{ pass: { label: string }; quantite: number }> }>;
}

export default function AdminPage() {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterStatut, setFilterStatut] = useState<Statut | ''>('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchStats = useCallback(async (adminPin: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-admin-pin': adminPin },
      });
      if (!res.ok) {
        setAuthenticated(false);
        setPinError('PIN incorrect');
        return;
      }
      const data = await res.json();
      setStats(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 1) return;
    sessionStorage.setItem('amac_admin_pin', pin);
    setAuthenticated(true);
    fetchStats(pin);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('amac_admin_pin');
    if (saved) {
      setPin(saved);
      setAuthenticated(true);
      fetchStats(saved);
    }
  }, [fetchStats]);

  const updateStatut = async (id: number, statut: Statut) => {
    setUpdatingId(id);
    const savedPin = sessionStorage.getItem('amac_admin_pin') ?? pin;
    try {
      await fetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': savedPin },
        body: JSON.stringify({ statut }),
      });
      fetchStats(savedPin);
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    if (!stats) return;
    const rows = [
      ['Code', 'Nom', 'Téléphone', 'Statut', 'Total Pass', 'Total Menu', 'Total Général', 'Crédit', 'Date'].join(';'),
      ...stats.latest.map((r) =>
        [
          r.code,
          r.nom,
          r.telephone,
          r.statut,
          r.totalPass,
          r.totalMenu,
          r.totalGeneral,
          r.creditTotal,
          r.createdAt,
        ].join(';')
      ),
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `amac-reservations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // ─── Écran PIN ────────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-halo flex items-center justify-center px-4">
        <div className="w-full max-w-sm glass rounded-2xl p-8">
          <div className="text-center mb-6">
            <p className="text-4xl mb-3">🔐</p>
            <h1 className="text-xl font-black text-white">Administration</h1>
            <p className="text-xs text-white/40 mt-1">AMAC Bingerville — Section Café Coton</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN administrateur"
              className="w-full glass rounded-xl px-4 py-3 text-center text-white text-2xl tracking-widest placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              autoFocus
            />
            {pinError && <p className="text-xs text-red-400 text-center">{pinError}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-black"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #FFD700)' }}
            >
              Accéder
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────
  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-halo flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const filtered = stats.latest.filter((r) => {
    if (filterStatut && r.statut !== filterStatut) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.code.toLowerCase().includes(q) || r.nom.toLowerCase().includes(q) || r.telephone.includes(q);
    }
    return true;
  });

  const totalPax = stats.passStats.reduce((s, p) => s + (p.total ?? 0), 0);

  return (
    <div className="min-h-screen bg-halo pb-12">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/90 backdrop-blur border-b border-white/5 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-base font-black text-white">
            🎛️ Admin — AMAC Bingerville
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="text-xs glass rounded-lg px-3 py-1.5 text-white/60 hover:text-white transition-all"
            >
              ⬇️ Export CSV
            </button>
            <button
              onClick={() => fetchStats(pin)}
              className="text-xs glass rounded-lg px-3 py-1.5 text-white/60 hover:text-white transition-all"
            >
              ↻ Rafraîchir
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('amac_admin_pin');
                setAuthenticated(false);
                setPin('');
              }}
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* ── Compteurs ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-yellow-400">{stats.totalReservations}</p>
            <p className="text-xs text-white/40 mt-1">Réservations</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-yellow-400">{totalPax}</p>
            <p className="text-xs text-white/40 mt-1">Pass total</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-green-400">{formatPrice(stats.ca)}</p>
            <p className="text-xs text-white/40 mt-1">CA prévisionnel</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-blue-400">
              {stats.statutStats.find((s) => s.statut === 'PAYEE')?.count ?? 0}
            </p>
            <p className="text-xs text-white/40 mt-1">Payées</p>
          </div>
        </div>

        {/* ── Pass stats ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-4">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Pass par type</p>
            {stats.passStats.map((p) => (
              <div key={p.code} className="flex justify-between items-center py-1.5">
                <span className="text-sm text-white">{p.label}</span>
                <span className="text-sm font-bold text-yellow-400">
                  {p.total ?? 0}
                  {(p.totalOfferts ?? 0) > 0 && (
                    <span className="text-green-400 text-xs ml-1">
                      (🎁{p.totalOfferts})
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-4">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Top 5 items commandés</p>
            {stats.topItems.length === 0 ? (
              <p className="text-xs text-white/30">Aucune commande menu</p>
            ) : (
              stats.topItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-white truncate flex-1">{item.nom}</span>
                  <span className="text-sm font-bold text-yellow-400 ml-2">{item.total}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Liste réservations ──────────────────────────────────────────── */}
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Rechercher par code, nom ou téléphone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
            />
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value as Statut | '')}
              className="glass rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 bg-transparent"
            >
              <option value="" className="bg-black">Tous les statuts</option>
              {STATUT_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-black">{STATUT_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {filtered.length === 0 && (
              <p className="text-center text-white/30 py-8 text-sm">Aucune réservation</p>
            )}
            {filtered.map((r) => (
              <div key={r.id} className="glass rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono font-bold text-yellow-400">{r.code}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUT_CLASS[r.statut as Statut]}`}>
                        {STATUT_LABELS[r.statut as Statut] ?? r.statut}
                      </span>
                    </div>
                    <p className="text-sm text-white font-semibold">{r.nom}</p>
                    <p className="text-xs text-white/40">{r.telephone}</p>
                    {r.reservationPasses && r.reservationPasses.length > 0 && (
                      <p className="text-xs text-white/30 mt-1">
                        {r.reservationPasses.map((rp) => `${rp.quantite}× ${rp.pass.label}`).join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-white/20 mt-0.5">{formatDateFR(r.createdAt)}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-base font-black text-white">{formatPrice(r.totalGeneral)}</span>
                    <select
                      value={r.statut}
                      onChange={(e) => updateStatut(r.id, e.target.value as Statut)}
                      disabled={updatingId === r.id}
                      className="text-xs glass rounded-lg px-2 py-1.5 text-white focus:outline-none bg-transparent border border-white/10 disabled:opacity-50"
                    >
                      {STATUT_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-black">{STATUT_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
