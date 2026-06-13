'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MenuItemCard from '@/components/MenuItemCard';
import { MenuCategory } from '@/lib/types';

export default function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/menu').then((r) => r.json()).then((data: MenuCategory[]) => {
      setCategories(data);
      if (data.length > 0) setActiveCat(data[0].slug);
      setLoading(false);
    });
  }, []);

  const displayCats = categories;

  const filteredItems = search
    ? displayCats.flatMap((c) => c.items.filter((i) => i.nom.toLowerCase().includes(search.toLowerCase())).map((i) => ({ cat: c, item: i })))
    : displayCats.find((c) => c.slug === activeCat)?.items.map((i) => ({
        cat: displayCats.find((c2) => c2.slug === activeCat)!,
        item: i,
      })) ?? [];

  if (loading) {
    return (
      <div className="min-h-screen bg-halo flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#E8730C', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-halo pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/85 backdrop-blur border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image src="/logo-amac.png" alt="AMAC" width={36} height={36} className="object-contain" />
            </Link>
            <div>
              <Link href="/" className="text-[10px] text-white/30 hover:text-white/60 transition-colors block">← Accueil</Link>
              <h1 className="text-base font-black text-white leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                🍽️ La Carte
              </h1>
            </div>
          </div>
          <Link href="/reserver" className="rounded-full px-4 py-2 text-xs font-bold text-white btn-amac">
            Réserver →
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4">
        {/* Offre BOCK */}
        <div className="glass-green rounded-2xl p-3 mb-4 flex items-center gap-3">
          <span className="text-2xl">🍺</span>
          <div>
            <p className="text-sm font-bold" style={{ color: '#22A050' }}>Offre Partenaire BOCK × Solibra</p>
            <p className="text-xs text-white/45">2 bouteilles achetées = 1 offerte</p>
          </div>
        </div>

        <input type="text" placeholder="🔍 Rechercher dans la carte…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 mb-4"
          style={{ '--tw-ring-color': '#E8730C' } as React.CSSProperties}
        />

        {!search && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {displayCats.map((cat) => (
              <button key={cat.slug} onClick={() => setActiveCat(cat.slug)}
                className="flex-none rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all"
                style={activeCat === cat.slug
                  ? { background: '#E8730C', color: 'white' }
                  : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }
                }>
                {cat.emoji} {cat.nom}
              </button>
            ))}
          </div>
        )}

        {!search && (
          <h2 className="text-sm font-bold text-white/35 mb-3">
            {displayCats.find((c) => c.slug === activeCat)?.emoji}{' '}
            {displayCats.find((c) => c.slug === activeCat)?.nom}
          </h2>
        )}

        {/* Grille photos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredItems.map(({ cat, item }) => (
            <MenuItemCard key={item.id} item={item} catSlug={cat.slug} lines={[]}
              onAdd={() => {}} onRemove={() => {}} onVariantClick={() => {}} readOnly />
          ))}
          {filteredItems.length === 0 && (
            <p className="col-span-4 text-center text-white/25 py-12 text-sm">Aucun résultat</p>
          )}
        </div>

        <div className="mt-8 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
          <p className="text-[10px] text-white/25 mb-2 font-bold uppercase tracking-wider">Conditions Pass</p>
          <ul className="space-y-1 text-xs text-white/30">
            <li>• Le crédit couvre vos consommations. Seul le dépassement éventuel est réglé sur place.</li>
            <li>• Le crédit n'est ni remboursable ni échangeable contre de l'espèce.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
