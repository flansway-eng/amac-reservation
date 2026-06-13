'use client';

import { MenuItem, CartItemLine } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

// Couleurs et emojis par catégorie (gradient de fond simulant la photo)
const CAT_THEMES: Record<string, { from: string; to: string; emoji: string }> = {
  saucisses:       { from: '#7C2D12', to: '#C2410C', emoji: '🌭' },
  brochettes:      { from: '#431407', to: '#9A3412', emoji: '🍢' },
  autres:          { from: '#3B1616', to: '#7F1D1D', emoji: '🍖' },
  accompagnements: { from: '#422006', to: '#92400E', emoji: '🍟' },
  desserts:        { from: '#500724', to: '#9D174D', emoji: '🍰' },
  boissons:        { from: '#0C1A2E', to: '#1E3A5F', emoji: '🥤' },
};

interface MenuItemCardProps {
  item: MenuItem;
  catSlug: string;
  lines: CartItemLine[];
  onAdd: (item: MenuItem, variantId: number | null) => void;
  onRemove: (item: MenuItem, variantId: number | null) => void;
  onVariantClick: (item: MenuItem) => void;
  readOnly?: boolean;
}

export default function MenuItemCard({
  item,
  catSlug,
  lines,
  onAdd,
  onRemove,
  onVariantClick,
  readOnly = false,
}: MenuItemCardProps) {
  const theme = CAT_THEMES[catSlug] ?? { from: '#1A1A1A', to: '#333', emoji: '🍽️' };
  const totalQty = lines.reduce((s, l) => s + l.quantite, 0);
  const isSelected = totalQty > 0;
  const isBock = item.nom === 'Bière Bock';

  // Prix d'affichage (item simple ou min des variantes)
  const displayPrice =
    item.prix !== null
      ? formatPrice(item.prix)
      : item.variants.length > 0
      ? `dès ${formatPrice(Math.min(...item.variants.map((v) => v.prix)))}`
      : null;

  return (
    <div
      className={`menu-card rounded-2xl overflow-hidden flex flex-col ${isSelected ? 'selected' : ''}`}
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* ── Photo / Image area ─────────────────────────────────────────── */}
      <div
        className="relative h-28 flex items-center justify-center overflow-hidden menu-card-img"
        style={{ background: `linear-gradient(145deg, ${theme.from}, ${theme.to})` }}
        onClick={() => {
          if (readOnly) return;
          if (!item.commandable) return;
          if (item.variants.length > 0) onVariantClick(item);
          else onAdd(item, null);
        }}
      >
        {/* Image réelle si disponible, sinon emoji */}
        <span className="text-5xl select-none" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}>
          {theme.emoji}
        </span>

        {/* Badge sélectionné */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-black"
            style={{ background: '#E8730C' }}>
            {totalQty}
          </div>
        )}

        {/* Badge BOCK */}
        {isBock && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">
            2+1 🎁
          </div>
        )}

        {/* Badge non commandable */}
        {!item.commandable && (
          <div className="absolute inset-0 bg-salsa-deep/50 flex items-center justify-center">
            <span className="text-xs text-white/60 font-semibold">Prix sur place</span>
          </div>
        )}
      </div>

      {/* ── Info ───────────────────────────────────────────────────────── */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-sm font-bold text-white leading-tight mb-0.5">{item.nom}</p>
        {item.description && (
          <p className="text-[11px] text-white/40 leading-tight mb-1">{item.description}</p>
        )}

        {/* Variantes pills */}
        {item.variants.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {item.variants.slice(0, 3).map((v) => (
              <span key={v.id} className="text-[10px] text-white/40 bg-white/5 rounded px-1.5 py-0.5">
                {v.label}
              </span>
            ))}
            {item.variants.length > 3 && (
              <span className="text-[10px] text-white/30 px-1">+{item.variants.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto gap-2">
          {displayPrice && (
            <span className="text-sm font-black" style={{ color: '#E8730C' }}>
              {displayPrice}
            </span>
          )}

          {!readOnly && item.commandable && (
            <>
              {/* Item avec variantes : bouton sélectionner */}
              {item.variants.length > 0 ? (
                <button
                  onClick={() => onVariantClick(item)}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
                  style={isSelected
                    ? { background: '#E8730C', color: 'white' }
                    : { background: 'rgba(232,115,12,0.15)', color: '#E8730C', border: '1px solid rgba(232,115,12,0.3)' }
                  }
                >
                  {isSelected ? '✓ Modifier' : 'Choisir'}
                </button>
              ) : (
                /* Item simple : stepper */
                <div className="flex items-center gap-1.5 ml-auto">
                  {isSelected && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemove(item, null); }}
                      className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white font-bold text-base hover:bg-white/10 transition-all"
                    >
                      −
                    </button>
                  )}
                  {isSelected && (
                    <span className="text-white font-black text-sm w-4 text-center">{totalQty}</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSelected && item.variants.length === 0) onAdd(item, null);
                      else if (isSelected) onAdd(item, null);
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-base transition-all"
                    style={{ background: isSelected ? 'rgba(232,115,12,0.8)' : 'rgba(232,115,12,0.15)', border: isSelected ? 'none' : '1px solid rgba(232,115,12,0.3)' }}
                  >
                    {isSelected ? '+' : '＋'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
