'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import BackButton from '@/components/BackButton';
import Stepper from '@/components/Stepper';
import PassCard from '@/components/PassCard';
import CartSummary from '@/components/CartSummary';
import MenuItemCard from '@/components/MenuItemCard';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { Pass, MenuItem, MenuCategory, CartPassLine, CartItemLine, CartState, Reservation } from '@/lib/types';
import { calcul2Plus1, calculBock2Plus1, formatPrice } from '@/lib/utils';

const STEPS = ['Pass', 'Menu', 'Coordonnées', 'Confirmation'];

function buildCart(passLines: CartPassLine[], itemLines: CartItemLine[]): Omit<CartState, 'passLines' | 'itemLines'> {
  const totalPass = passLines.reduce((s, l) => s + l.sousTotal, 0);
  const totalMenu = itemLines.reduce((s, l) => s + l.sousTotal, 0);
  const creditTotal = passLines.reduce((s, l) => s + l.pass.credit * l.quantite, 0);
  const extraMenu = Math.max(0, totalMenu - creditTotal);
  return { totalPass, totalMenu, totalGeneral: extraMenu, creditTotal };
}

function Confetti() {
  const colors = ['#E8730C', '#FF8A2B', '#1B7A3D', '#22A050', '#D4AF37', '#FFD700'];
  const pieces = Array.from({ length: 45 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: colors[i % colors.length],
    duration: `${2 + Math.random() * 2}s`,
    delay: `${Math.random() * 0.8}s`,
    size: `${5 + Math.random() * 8}px`,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {pieces.map((p) => (
        <div key={p.id} className="confetti-piece absolute top-0"
          style={{ left: p.left, width: p.size, height: p.size, backgroundColor: p.color,
            borderRadius: p.id % 3 === 0 ? '50%' : '2px',
            animationDuration: p.duration, animationDelay: p.delay }} />
      ))}
    </div>
  );
}

// ─── Invoice Panel ─────────────────────────────────────────────────────────
function InvoicePanel({ cart, onGoToStep }: { cart: CartState; onGoToStep: (s: number) => void }) {
  const extraMenu = Math.max(0, cart.totalMenu - cart.creditTotal);
  const creditUsed = Math.min(cart.totalMenu, cart.creditTotal);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06]"
        style={{ background: 'linear-gradient(135deg, rgba(255,45,85,0.18), rgba(123,47,247,0.1))' }}>
        <div className="flex items-center gap-2">
          <span className="text-base">🧾</span>
          <span className="text-sm font-black text-white">Facture provisoire</span>
        </div>
      </div>

      <div className="p-4 space-y-3 text-sm">
        {cart.passLines.length === 0 && cart.itemLines.length === 0 ? (
          <p className="text-white/25 text-xs italic text-center py-4">Votre sélection apparaît ici</p>
        ) : (
          <>
            {/* PASS */}
            {cart.passLines.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Pass</p>
                  <button onClick={() => onGoToStep(0)} className="text-[10px] text-orange-400 hover:underline">
                    ✏️ modifier
                  </button>
                </div>
                {cart.passLines.map((l) => (
                  <div key={l.passId} className="flex justify-between py-1 border-b border-white/[0.05]">
                    <div>
                      <span className="text-white/80">{l.pass.label}</span>
                      <span className="text-white/35 ml-1 text-xs">×{l.quantite}</span>
                      {l.quantiteOfferte > 0 && (
                        <span className="ml-1 text-green-400 text-[11px]">🎁{l.quantiteOfferte}</span>
                      )}
                    </div>
                    <span className="text-white font-semibold">{formatPrice(l.sousTotal)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* MENU */}
            {cart.itemLines.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Menu</p>
                  <button onClick={() => onGoToStep(1)} className="text-[10px] text-orange-400 hover:underline">
                    ✏️ modifier
                  </button>
                </div>
                {cart.itemLines.map((l, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-white/[0.05]">
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="text-white/80 text-xs leading-tight block truncate">{l.item.nom}</span>
                      {l.variant && <span className="text-white/30 text-[10px]">{l.variant.label}</span>}
                      <span className="text-white/30 ml-1 text-[10px]">×{l.quantite}</span>
                    </div>
                    <span className="text-white font-semibold text-xs whitespace-nowrap">{formatPrice(l.sousTotal)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* TOTAUX */}
            <div className="pt-2 border-t border-white/10 space-y-1.5">
              {cart.totalMenu > 0 && (
                <>
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Sous-total menu</span><span>{formatPrice(cart.totalMenu)}</span>
                  </div>
                  {creditUsed > 0 && (
                    <div className="flex justify-between text-xs text-green-400 font-semibold">
                      <span>− Crédit pass</span><span>− {formatPrice(creditUsed)}</span>
                    </div>
                  )}
                  {extraMenu > 0 && (
                    <div className="flex justify-between text-xs text-orange-400 font-semibold">
                      <span>Supplément menu</span><span>{formatPrice(extraMenu)}</span>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-white font-black">Total à payer</span>
                <span className="text-xl font-black" style={{ color: '#E8730C' }}>
                  {formatPrice(cart.totalGeneral)}
                </span>
              </div>

              {cart.totalMenu > 0 && cart.creditTotal > 0 && (
                <div className="mt-1.5">
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${extraMenu > 0 ? 'bg-orange-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min((cart.totalMenu / cart.creditTotal) * 100, 100)}%` }} />
                  </div>
                  <p className={`text-[10px] mt-1 ${extraMenu > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                    {extraMenu > 0
                      ? `⚠️ Supplément de ${formatPrice(extraMenu)} à régler sur place`
                      : `✓ Menu couvert par votre crédit`}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ────────────────────────────────────────────────────────
export default function ReserverPage() {
  const [step, setStep] = useState(0);
  const [passes, setPasses] = useState<Pass[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [passLines, setPassLines] = useState<CartPassLine[]>([]);
  const [itemLines, setItemLines] = useState<CartItemLine[]>([]);

  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [note, setNote] = useState('');
  const [telError, setTelError] = useState('');
  const [nomError, setNomError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const [activeCatSlug, setActiveCatSlug] = useState('');
  const [search, setSearch] = useState('');
  const [variantModal, setVariantModal] = useState<{ item: MenuItem } | null>(null);
  const [showMobileInvoice, setShowMobileInvoice] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/passes').then((r) => r.json()),
      fetch('/api/menu').then((r) => r.json()),
    ]).then(([p, m]: [Pass[], MenuCategory[]]) => {
      setPasses(p);
      setCategories(m);
      const first = m.find((c) => c.items.some((i) => i.commandable));
      if (first) setActiveCatSlug(first.slug);
      setLoading(false);
    });
  }, []);

  const cart: CartState = { passLines, itemLines, ...buildCart(passLines, itemLines) };

  // ── Pass ────────────────────────────────────────────────────────────────
  const handlePassChange = useCallback((passId: number, delta: number) => {
    const pass = passes.find((p) => p.id === passId);
    if (!pass) return;
    setPassLines((prev) => {
      const existing = prev.find((l) => l.passId === passId);
      const currentQty = existing?.quantite ?? 0;
      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) return prev.filter((l) => l.passId !== passId);
      const { payant, offert } = calcul2Plus1(newQty);
      const updated: CartPassLine = { passId, pass, quantite: newQty, quantiteOfferte: offert, sousTotal: payant * pass.prix };
      if (existing) return prev.map((l) => (l.passId === passId ? updated : l));
      return [...prev, updated];
    });
  }, [passes]);

  // ── Menu ────────────────────────────────────────────────────────────────
  const handleItemChange = useCallback((item: MenuItem, variantId: number | null, delta: number) => {
    const variant = variantId ? item.variants.find((v) => v.id === variantId) : null;
    const prix = variant ? variant.prix : item.prix ?? 0;
    const isBock = item.nom === 'Bière Bock';

    setItemLines((prev) => {
      const idx = prev.findIndex((l) => l.itemId === item.id && l.variantId === variantId);
      const currentQty = idx >= 0 ? prev[idx].quantite : 0;
      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) return prev.filter((l) => !(l.itemId === item.id && l.variantId === variantId));
      const { payant, offert } = isBock ? calculBock2Plus1(newQty) : { payant: newQty, offert: 0 };
      const updated: CartItemLine = { itemId: item.id, item, variantId, variant: variant ?? null,
        quantite: newQty, quantiteOfferte: offert, prixUnitaire: prix, sousTotal: payant * prix };
      if (idx >= 0) { const copy = [...prev]; copy[idx] = updated; return copy; }
      return [...prev, updated];
    });
  }, []);

  const getItemLines = (itemId: number) => itemLines.filter((l) => l.itemId === itemId);

  // ── Submit ──────────────────────────────────────────────────────────────
  const validateCoords = () => {
    let valid = true;
    if (nom.trim().length < 2) { setNomError('Nom complet requis (min. 2 caractères)'); valid = false; } else setNomError('');
    const telClean = telephone.replace(/\s+/g, '');
    if (!/^\+225\d{10}$/.test(telClean)) { setTelError('Format requis : +225 XX XX XX XX XX'); valid = false; } else setTelError('');
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateCoords()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: nom.trim(),
          telephone: telephone.replace(/\s+/g, ''),
          passLines: passLines.map((l) => ({ passId: l.passId, quantite: l.quantite })),
          itemLines: itemLines.map((l) => ({ itemId: l.itemId, variantId: l.variantId, quantite: l.quantite })),
          note: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? 'Erreur lors de la réservation'); return; }
      const resa = data.reservation as Reservation;
      localStorage.setItem('amac_last_code', resa.code);
      setReservation(resa);
      setStep(3);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    } finally { setSubmitting(false); }
  };

  const whatsappText = reservation
    ? encodeURIComponent(`🎉 Ma réservation AMAC Bingerville\nCode : *${reservation.code}*\nFête Mères & Pères — 18 juin 2026 à 18H00\nRooftop Capitol Hôtel, Riviera Golf\nTotal : ${formatPrice(reservation.totalGeneral)}`)
    : '';
  const icsContent = reservation
    ? `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:20260618T180000\nDTEND:20260618T230000\nSUMMARY:Fête Mères & Pères — AMAC Bingerville\nLOCATION:Rooftop Capitol Hôtel, Riviera Golf, Abidjan\nDESCRIPTION:Code réservation : ${reservation.code}\nEND:VEVENT\nEND:VCALENDAR`
    : '';

  // Menu items filtrés
  const displayCats = categories.filter((c) => c.items.some((i) => i.commandable));
  const visibleItems = search
    ? categories.flatMap((c) => c.items.filter((i) => i.commandable && i.nom.toLowerCase().includes(search.toLowerCase())).map((i) => ({ cat: c, item: i })))
    : displayCats.find((c) => c.slug === activeCatSlug)?.items.filter((i) => i.commandable).map((i) => ({ cat: displayCats.find((c2) => c2.slug === activeCatSlug)!, item: i })) ?? [];

  if (loading) {
    return (
      <div className="min-h-screen bg-halo flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3" style={{ borderColor: '#E8730C', borderTopColor: 'transparent' }} />
          <p className="text-white/40 text-sm">Chargement…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-halo pb-28">
      {showConfetti && <Confetti />}

      {/* ── Header sticky ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 salsa-header">
        <div className="max-w-6xl mx-auto px-3 py-1 flex items-center gap-3">
          <BackButton href="/" />
          <Image src="/logo-amac.svg" alt="AMAC" width={36} height={36} className="object-contain flex-none" />
          <div className="flex-1 min-w-0">
            <Stepper steps={STEPS} current={step} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 pt-4">
        {/* ─── Grille principale + panneau droit ─────────────────────────── */}
        <div className="lg:flex lg:gap-5 lg:items-start">

          {/* ════════ CONTENU ÉTAPES ════════════════════════════════════════ */}
          <div className="flex-1 min-w-0">

            {/* ═══ ÉTAPE 0 : PASS ═══════════════════════════════════════════ */}
            {step === 0 && (
              <div>
                <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Choisissez vos <span className="text-amac-gradient">Pass</span>
                </h2>
                <p className="text-white/40 text-sm mb-6">Formule 2+1 appliquée automatiquement.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {passes.map((p) => (
                    <PassCard key={p.id} pass={p} line={passLines.find((l) => l.passId === p.id)} onChangeQuantite={handlePassChange} />
                  ))}
                </div>
              </div>
            )}

            {/* ═══ ÉTAPE 1 : MENU ════════════════════════════════════════════ */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Pré-commandez votre <span style={{ background: 'linear-gradient(135deg,#E8730C,#FF8A2B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>menu</span>
                </h2>
                <p className="text-white/40 text-sm mb-3">
                  Optionnel — crédit disponible : <strong className="text-white">{formatPrice(cart.creditTotal || 0)}</strong>
                </p>

                {/* Offre BOCK */}
                <div className="rounded-xl p-3 mb-4 flex items-center gap-3"
                  style={{ background: 'rgba(27,122,61,0.1)', border: '1px solid rgba(27,122,61,0.3)' }}>
                  <span className="text-xl">🍺</span>
                  <p className="text-xs font-bold" style={{ color: '#22A050' }}>Offre BOCK × Solibra — 2 achetées = 1 offerte</p>
                </div>

                {/* Recherche */}
                <input type="text" placeholder="🔍 Rechercher un plat ou boisson…" value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none mb-3"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />

                {/* Chips catégories */}
                {!search && (
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
                    {displayCats.map((cat) => (
                      <button key={cat.slug} onClick={() => setActiveCatSlug(cat.slug)}
                        className="flex-none rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all"
                        style={activeCatSlug === cat.slug
                          ? { background: '#E8730C', color: 'white' }
                          : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.1)' }
                        }
                      >
                        {cat.emoji} {cat.nom}
                      </button>
                    ))}
                  </div>
                )}

                {/* GRILLE PHOTO-CARDS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {visibleItems.map(({ cat, item }) => {
                    const CAT_THEMES: Record<string, { from: string; to: string; emoji: string }> = {
                      saucisses:       { from: '#7C2D12', to: '#C2410C', emoji: '🌭' },
                      brochettes:      { from: '#431407', to: '#9A3412', emoji: '🍢' },
                      autres:          { from: '#3B1616', to: '#7F1D1D', emoji: '🍖' },
                      accompagnements: { from: '#422006', to: '#92400E', emoji: '🍟' },
                      desserts:        { from: '#500724', to: '#9D174D', emoji: '🍰' },
                      boissons:        { from: '#0C1A2E', to: '#1E3A5F', emoji: '🥤' },
                    };
                    const theme = CAT_THEMES[cat.slug] ?? { from: '#1A1A1A', to: '#333', emoji: '🍽️' };
                    const lines = getItemLines(item.id);
                    const qty = lines.reduce((s, l) => s + l.quantite, 0);
                    const selected = qty > 0;
                    const isBock = item.nom === 'Bière Bock';
                    const displayPrice = item.prix !== null
                      ? formatPrice(item.prix)
                      : item.variants.length > 0
                      ? `dès ${formatPrice(Math.min(...item.variants.map((v) => v.prix)))}`
                      : null;

                    return (
                      <div key={item.id}
                        onClick={() => {
                          if (item.variants.length > 0) setVariantModal({ item });
                          else handleItemChange(item, null, selected ? -1 : 1);
                        }}
                        style={{
                          borderRadius: 16,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: selected ? '2.5px solid #E8730C' : '1px solid rgba(255,255,255,0.09)',
                          background: 'rgba(255,255,255,0.04)',
                          boxShadow: selected ? '0 0 0 3px rgba(232,115,12,0.2), 0 8px 24px rgba(232,115,12,0.15)' : 'none',
                          transform: selected ? 'translateY(-2px)' : 'none',
                          transition: 'all 0.18s ease',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        {/* ZONE PHOTO */}
                        <div style={{
                          position: 'relative',
                          height: 110,
                          background: `linear-gradient(145deg, ${theme.from}, ${theme.to})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <span style={{ fontSize: 44, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}>
                            {theme.emoji}
                          </span>

                          {/* Checkbox coin haut-droite */}
                          <div style={{
                            position: 'absolute', top: 8, right: 8,
                            width: 28, height: 28, borderRadius: '50%',
                            background: selected ? '#FF2D55' : 'rgba(13,5,24,0.65)',
                            border: selected ? '2px solid #FF8A2B' : '2px solid rgba(255,255,255,0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.18s ease',
                          }}>
                            {selected ? (
                              <span style={{ color: 'white', fontSize: 15, fontWeight: 900 }}>✓</span>
                            ) : (
                              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>+</span>
                            )}
                          </div>

                          {/* Badge BOCK */}
                          {isBock && (
                            <div style={{
                              position: 'absolute', top: 8, left: 8,
                              background: '#EAB308', color: 'black', borderRadius: 10,
                              padding: '2px 7px', fontSize: 9, fontWeight: 900,
                            }}>2+1 🎁</div>
                          )}

                          {/* Badge qty si > 1 */}
                          {selected && qty > 1 && (
                            <div style={{
                              position: 'absolute', bottom: 8, right: 8,
                              background: '#E8730C', color: 'white', borderRadius: 12,
                              padding: '2px 8px', fontSize: 11, fontWeight: 900,
                            }}>×{qty}</div>
                          )}
                        </div>

                        {/* INFO */}
                        <div style={{ padding: '10px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1.3, margin: 0 }}>
                            {item.nom}
                          </p>
                          {item.description && (
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.3, margin: 0 }}>
                              {item.description}
                            </p>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 6 }}>
                            {displayPrice && (
                              <span style={{ fontSize: 13, fontWeight: 900, color: '#E8730C' }}>{displayPrice}</span>
                            )}
                            {/* Stepper pour items simples sélectionnés */}
                            {!item.variants.length && selected && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                                onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => handleItemChange(item, null, -1)}
                                  style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'transparent', color: 'white', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  −
                                </button>
                                <span style={{ color: 'white', fontWeight: 900, minWidth: 16, textAlign: 'center', fontSize: 13 }}>{qty}</span>
                                <button onClick={() => handleItemChange(item, null, 1)}
                                  style={{ width: 26, height: 26, borderRadius: '50%', border: 'none',
                                    background: 'rgba(232,115,12,0.7)', color: 'white', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  +
                                </button>
                              </div>
                            )}
                            {/* Bouton Choisir pour variants */}
                            {item.variants.length > 0 && (
                              <button style={{
                                fontSize: 11, padding: '4px 12px', borderRadius: 20, fontWeight: 700, cursor: 'pointer',
                                background: selected ? '#E8730C' : 'rgba(232,115,12,0.15)',
                                color: selected ? 'white' : '#E8730C',
                                border: selected ? 'none' : '1px solid rgba(232,115,12,0.35)',
                              }}
                                onClick={(e) => { e.stopPropagation(); setVariantModal({ item }); }}>
                                {selected ? '✓ Modifier' : 'Choisir'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {visibleItems.length === 0 && (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'rgba(255,255,255,0.25)', padding: '32px 0', fontSize: 14 }}>
                      Aucun résultat
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ═══ ÉTAPE 2 : COORDONNÉES ══════════════════════════════════════ */}
            {step === 2 && (
              <div className="max-w-md">
                <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Vos <span className="text-amac-gradient">coordonnées</span>
                </h2>
                <p className="text-white/40 text-sm mb-6">Aucun compte requis. Code AMAC-XXXX généré immédiatement.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/60 mb-1.5">Nom complet *</label>
                    <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                      placeholder="Rose Amany"
                      className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#E8730C' } as React.CSSProperties}
                    />
                    {nomError && <p className="text-xs text-red-400 mt-1">{nomError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/60 mb-1.5">Téléphone *</label>
                    <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)}
                      placeholder="+225 07 12 34 56 78"
                      className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#E8730C' } as React.CSSProperties}
                    />
                    {telError && <p className="text-xs text-red-400 mt-1">{telError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/60 mb-1.5">Note (optionnel)</label>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)}
                      placeholder="Allergie, demande spéciale…" rows={3}
                      className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 resize-none"
                      style={{ '--tw-ring-color': '#E8730C' } as React.CSSProperties}
                    />
                  </div>
                </div>
                <div className="mt-5 glass rounded-2xl p-4">
                  <CartSummary cart={cart} showCreditGauge />
                </div>
              </div>
            )}

            {/* ═══ ÉTAPE 3 : CONFIRMATION ═════════════════════════════════════ */}
            {step === 3 && reservation && (
              <div className="text-center max-w-md mx-auto">
                <div className="text-5xl mb-3 animate-bounce">🎉</div>
                <h2 className="text-3xl font-black mb-2 text-amac-gradient" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Réservation confirmée !
                </h2>
                <p className="text-white/40 text-sm mb-5">Présentez ce code à l'entrée le jeudi 18 juin 2026</p>

                <div className="rounded-2xl border border-orange-500/40 p-6 mb-5 animate-amac-pulse"
                  style={{ background: 'rgba(232,115,12,0.07)' }}>
                  <p className="text-xs text-white/35 uppercase tracking-widest mb-2">Votre code</p>
                  <p className="text-5xl font-black tracking-widest mb-1" style={{ color: '#E8730C' }}>
                    {reservation.code}
                  </p>
                  <p className="text-xs text-white/25">Conservez ce code précieusement</p>
                </div>

                <div className="glass rounded-2xl p-4 mb-5 inline-block">
                  <QRCodeDisplay value={reservation.code} size={170} />
                  <p className="text-xs text-white/25 mt-2">Scannable à l'entrée</p>
                </div>

                <div className="glass rounded-2xl p-4 mb-5 text-left">
                  <p className="text-xs text-white/35 mb-1">Réservé par : <span className="text-white">{reservation.nom}</span></p>
                  <p className="text-xs text-white/35 mb-3">Tél : <span className="text-white">{reservation.telephone}</span></p>
                  <CartSummary cart={cart} showCreditGauge />
                </div>

                <div className="flex flex-col gap-3">
                  <a href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-500 transition-all">
                    💬 Partager sur WhatsApp
                  </a>
                  <a href={`data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`}
                    download="amac-fete-2026.ics"
                    className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold glass text-white hover:bg-white/10 transition-all">
                    📅 Ajouter au calendrier
                  </a>
                  <a href={`/ma-reservation?code=${reservation.code}`} className="text-sm mt-1"
                    style={{ color: '#E8730C' }}>
                    Voir ma réservation →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* ════════ PANNEAU INVOICE — desktop ═════════════════════════════ */}
          {step < 3 && (
            <div className="hidden lg:block w-72 flex-none">
              <div className="sticky top-20">
                <InvoicePanel cart={cart} onGoToStep={setStep} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Barre navigation mobile ─────────────────────────────────────── */}
      {step < 3 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 salsa-footer px-4 py-3">
          {/* Mini total mobile */}
          {cart.totalGeneral > 0 && (
            <div className="flex justify-between items-center mb-2 text-xs">
              <span className="text-white/40">Total à payer</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-base" style={{ color: '#E8730C' }}>
                  {formatPrice(cart.totalGeneral)}
                </span>
                {/* Bouton invoice mobile */}
                {step === 1 && (
                  <button onClick={() => setShowMobileInvoice(true)}
                    className="text-[10px] glass px-2 py-1 rounded text-white/50 hover:text-white transition-all">
                    🧾 Détail
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)}
                className="flex-none rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                ← Retour
              </button>
            )}
            {step === 0 && (
              <button onClick={() => setStep(1)} disabled={passLines.length === 0}
                className="flex-1 rounded-xl py-3 text-sm font-black text-white transition-all disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg, #E8730C, #FF8A2B)' }}>
                Continuer → Menu
              </button>
            )}
            {step === 1 && (
              <button onClick={() => setStep(2)}
                className="flex-1 rounded-xl py-3 text-sm font-black text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #E8730C, #FF8A2B)' }}>
                {cart.itemLines.length > 0 ? 'Continuer →' : 'Passer cette étape →'}
              </button>
            )}
            {step === 2 && (
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 rounded-xl py-3 text-sm font-black text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #E8730C, #FF8A2B)' }}>
                {submitting ? '⏳ Envoi…' : '✓ Confirmer ma réservation'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Modal variantes ─────────────────────────────────────────────── */}
      {variantModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center salsa-overlay"
          onClick={() => setVariantModal(null)}>
          <div className="w-full sm:max-w-sm glass rounded-t-3xl sm:rounded-2xl p-5 m-0 sm:m-4"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-8 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />
            <h3 className="text-base font-bold text-white mb-4">{variantModal.item.nom}</h3>
            <div className="space-y-1">
              {variantModal.item.variants.map((v) => {
                const qty = itemLines.find((l) => l.itemId === variantModal.item.id && l.variantId === v.id)?.quantite ?? 0;
                return (
                  <div key={v.id} className="flex items-center justify-between py-2.5 border-b border-white/[0.06]">
                    <div>
                      <p className="text-sm text-white font-medium">{v.label}</p>
                      <p className="text-xs text-white/40">{formatPrice(v.prix)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleItemChange(variantModal.item, v.id, -1)} disabled={qty === 0}
                        className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white font-bold disabled:opacity-30 hover:bg-white/10 transition-all">
                        −
                      </button>
                      <span className="text-white font-black w-5 text-center">{qty}</span>
                      <button onClick={() => handleItemChange(variantModal.item, v.id, 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-all"
                        style={{ background: 'rgba(232,115,12,0.7)' }}>
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setVariantModal(null)}
              className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-white btn-amac">
              Valider
            </button>
          </div>
        </div>
      )}

      {/* ── Invoice mobile overlay ───────────────────────────────────────── */}
      {showMobileInvoice && (
        <div className="fixed inset-0 z-50 flex items-end justify-center salsa-overlay lg:hidden"
          onClick={() => setShowMobileInvoice(false)}>
          <div className="w-full max-h-[70vh] overflow-y-auto glass rounded-t-3xl p-5"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-8 h-1 bg-white/20 rounded-full mx-auto mb-4" />
            <InvoicePanel cart={cart} onGoToStep={(s) => { setStep(s); setShowMobileInvoice(false); }} />
            <button onClick={() => setShowMobileInvoice(false)}
              className="w-full mt-4 py-3 rounded-xl text-sm font-semibold glass text-white/70 hover:text-white transition-all">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
