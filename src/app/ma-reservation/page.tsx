'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { Reservation } from '@/lib/types';
import { formatPrice, formatDateFR } from '@/lib/utils';

const STATUT_LABELS: Record<string, { label: string; cssClass: string }> = {
  EN_ATTENTE: { label: 'En attente', cssClass: 'badge-en-attente' },
  CONFIRMEE:  { label: 'Confirmée',  cssClass: 'badge-confirmee' },
  PAYEE:      { label: 'Payée',      cssClass: 'badge-payee' },
  ANNULEE:    { label: 'Annulée',    cssClass: 'badge-annulee' },
};

function MaReservationContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') ?? '');
  const [tel, setTel] = useState('');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMe, setIsMe] = useState(true);

  // Pré-remplir depuis localStorage
  useEffect(() => {
    if (!code) {
      const saved = localStorage.getItem('amac_last_code');
      if (saved) setCode(saved);
    }
  }, [code]);

  // Auto-chercher si code en URL
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) {
      lookup(urlCode, '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function lookup(c: string, t: string) {
    setLoading(true);
    setError('');
    setReservation(null);

    const params = new URLSearchParams();
    if (c) params.set('code', c.toUpperCase());
    else if (t) params.set('tel', t);
    else {
      setError('Saisissez un code ou un numéro de téléphone');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/reservations/lookup?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Réservation introuvable');
      } else {
        setReservation(data);
      }
    } catch {
      setError('Erreur réseau, veuillez réessayer');
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    lookup(code, tel);
  };

  const handleNotMe = () => {
    setIsMe(false);
    setReservation(null);
    setCode('');
    localStorage.removeItem('amac_last_code');
  };

  const { label: statutLabel, cssClass: statutClass } = STATUT_LABELS[reservation?.statut ?? ''] ?? {
    label: reservation?.statut ?? '',
    cssClass: '',
  };

  return (
    <div className="min-h-screen bg-halo pb-12">
      {/* Header */}
      <div className="sticky top-0 z-20 salsa-header px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <BackButton href="/" />
          <h1 className="text-base font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ma Réservation
          </h1>
          <div className="w-[72px]" />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6">
        {/* Formulaire de recherche */}
        {!reservation && (
          <form onSubmit={handleSearch} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">
                Code de réservation
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="AMAC-XXXX"
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 uppercase tracking-widest font-mono text-lg"
                maxLength={9}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30">ou</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                placeholder="+225 07 12 34 56 78"
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!code && !tel)}
              className="w-full py-3 rounded-xl font-bold text-black disabled:opacity-40 transition-all"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #FFD700)' }}
            >
              {loading ? '⏳ Recherche…' : '🔍 Retrouver ma réservation'}
            </button>
          </form>
        )}

        {/* Résultat */}
        {reservation && (
          <div className="space-y-4">
            {/* Bannière localStorage */}
            {isMe && (
              <div className="glass rounded-xl p-3 flex items-center justify-between">
                <p className="text-xs text-white/50">
                  Dernière réservation retrouvée
                </p>
                <button
                  onClick={handleNotMe}
                  className="text-xs text-yellow-400 underline hover:no-underline"
                >
                  Ce n'est pas moi
                </button>
              </div>
            )}

            {/* Code + statut */}
            <div
              className="rounded-2xl border border-yellow-500/30 p-5 text-center"
              style={{ background: 'rgba(212,175,55,0.06)' }}
            >
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold mb-3 ${statutClass}`}>
                {statutLabel}
              </span>
              <p className="text-4xl font-black text-yellow-400 tracking-widest">
                {reservation.code}
              </p>
              <p className="text-xs text-white/30 mt-2">
                Réservé le {formatDateFR(reservation.createdAt)}
              </p>
            </div>

            {/* QR Code */}
            <div className="glass rounded-2xl p-4 text-center">
              <QRCodeDisplay value={reservation.code} size={160} />
              <p className="text-xs text-white/30 mt-2">À présenter à l'entrée</p>
            </div>

            {/* Infos */}
            <div className="glass rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Nom</span>
                <span className="text-white font-semibold">{reservation.nom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Téléphone</span>
                <span className="text-white font-semibold">{reservation.telephone}</span>
              </div>
              {reservation.note && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-white/40">Note : {reservation.note}</p>
                </div>
              )}
            </div>

            {/* Pass */}
            {reservation.reservationPasses && reservation.reservationPasses.length > 0 && (
              <div className="glass rounded-2xl p-4">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Pass réservés</p>
                {reservation.reservationPasses.map((rp) => (
                  <div key={rp.id} className="flex justify-between items-start py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm text-white font-semibold">{rp.pass.label}</p>
                      <p className="text-xs text-white/40">
                        {rp.quantite} ×{' '}
                        {formatPrice(rp.prixUnitaire)}
                        {rp.quantiteOfferte > 0 && (
                          <span className="text-green-400 ml-1">
                            (🎁 {rp.quantiteOfferte} offert{rp.quantiteOfferte > 1 ? 's' : ''})
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-white">{formatPrice(rp.sousTotal)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Menu */}
            {reservation.reservationItems && reservation.reservationItems.length > 0 && (
              <div className="glass rounded-2xl p-4">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Menu pré-commandé</p>
                {reservation.reservationItems.map((ri, i) => (
                  <div key={i} className="flex justify-between items-start py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm text-white font-semibold">
                        {ri.item.nom}
                        {ri.variant && <span className="text-white/40 ml-1 text-xs">({ri.variant.label})</span>}
                      </p>
                      <p className="text-xs text-white/40">
                        {ri.quantite} × {formatPrice(ri.prixUnitaire)}
                        {ri.quantiteOfferte > 0 && (
                          <span className="text-green-400 ml-1">
                            (🎁 {ri.quantiteOfferte} offert{ri.quantiteOfferte > 1 ? 's' : ''})
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-white">{formatPrice(ri.sousTotal)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Totaux */}
            <div className="glass rounded-2xl p-4 space-y-2 text-sm">
              {reservation.totalPass > 0 && (
                <div className="flex justify-between text-white/50">
                  <span>Pass (hors total)</span><span>{formatPrice(reservation.totalPass)}</span>
                </div>
              )}
              {reservation.totalMenu > 0 && (
                <div className="flex justify-between text-white/50">
                  <span>Menu</span><span>{formatPrice(reservation.totalMenu)}</span>
                </div>
              )}
              {(reservation.totalPass > 0 || reservation.totalMenu > 0) && (
                <div className="border-t border-white/10 pt-2" />
              )}
              <div className="flex justify-between text-base font-black">
                <span className="text-white">Total à payer</span>
                <span className="text-yellow-400">{formatPrice(reservation.totalGeneral)}</span>
              </div>
              <div className="flex justify-between text-xs text-white/40">
                <span>Crédit pass</span>
                <span>{formatPrice(reservation.creditTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => { setReservation(null); setCode(''); setTel(''); setIsMe(true); }}
              className="w-full py-3 rounded-xl text-sm font-semibold glass text-white/60 hover:text-white transition-all"
            >
              Rechercher une autre réservation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MaReservationPage() {
  return (
    <Suspense>
      <MaReservationContent />
    </Suspense>
  );
}
