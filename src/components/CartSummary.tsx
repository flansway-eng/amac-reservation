'use client';

import { CartState } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface CartSummaryProps {
  cart: CartState;
  showCreditGauge?: boolean;
  compact?: boolean;
}

export default function CartSummary({ cart, showCreditGauge = false, compact = false }: CartSummaryProps) {
  const extraMenu = Math.max(0, cart.totalMenu - cart.creditTotal);
  const creditUsed = Math.min(cart.totalMenu, cart.creditTotal);

  if (cart.passLines.length === 0 && cart.itemLines.length === 0) {
    return (
      <div className="text-center text-white/25 py-6 text-sm italic">Votre panier est vide</div>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      {/* PASS */}
      {cart.passLines.length > 0 && (
        <div className="space-y-1.5">
          {!compact && <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Pass</p>}
          {cart.passLines.map((l) => (
            <div key={l.passId} className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <span className="text-white/80">{l.pass.label}</span>
                <span className="text-white/35 ml-1 text-xs">×{l.quantite}</span>
                {l.quantiteOfferte > 0 && (
                  <span className="ml-1.5 text-green-400 text-[11px] font-semibold">
                    🎁{l.quantiteOfferte} offert{l.quantiteOfferte > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <span className="text-white font-semibold whitespace-nowrap">{formatPrice(l.sousTotal)}</span>
            </div>
          ))}
        </div>
      )}

      {/* MENU */}
      {cart.itemLines.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
          {!compact && <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Menu</p>}
          {cart.itemLines.map((l, i) => (
            <div key={i} className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <span className="text-white/80">{l.item.nom}</span>
                {l.variant && <span className="text-white/35 ml-1 text-[11px]">({l.variant.label})</span>}
                <span className="text-white/35 ml-1 text-xs">×{l.quantite}</span>
                {l.quantiteOfferte > 0 && (
                  <span className="ml-1.5 text-green-400 text-[11px] font-semibold">🎁{l.quantiteOfferte}</span>
                )}
              </div>
              <span className="text-white font-semibold whitespace-nowrap">{formatPrice(l.sousTotal)}</span>
            </div>
          ))}
        </div>
      )}

      {/* TOTAUX */}
      <div className="border-t border-white/10 pt-3 mt-1 space-y-1.5">
        {cart.totalPass > 0 && cart.totalMenu > 0 && (
          <div className="flex justify-between text-xs text-white/40">
            <span>Sous-total pass</span><span>{formatPrice(cart.totalPass)}</span>
          </div>
        )}

        {cart.totalMenu > 0 && showCreditGauge && (
          <>
            <div className="flex justify-between text-xs text-white/40">
              <span>Sous-total menu</span><span>{formatPrice(cart.totalMenu)}</span>
            </div>
            {creditUsed > 0 && (
              <div className="flex justify-between text-xs text-green-400 font-semibold">
                <span>− Crédit pass</span><span>− {formatPrice(creditUsed)}</span>
              </div>
            )}
            {cart.creditTotal > 0 && (
              <div className="pt-0.5">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${extraMenu > 0 ? 'bg-orange-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min((cart.totalMenu / cart.creditTotal) * 100, 100)}%` }}
                  />
                </div>
                <p className={`text-[11px] mt-1 ${extraMenu > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                  {extraMenu > 0
                    ? `⚠️ Supplément ${formatPrice(extraMenu)} à régler sur place`
                    : '✓ Entièrement couvert par votre crédit pass'}
                </p>
              </div>
            )}
          </>
        )}

        <div className="flex justify-between items-center pt-1">
          <span className="text-white font-black text-base">Total à payer</span>
          <span className="text-lg font-black" style={{ color: '#E8730C' }}>
            {formatPrice(cart.totalGeneral)}
          </span>
        </div>
        {cart.totalMenu > 0 && cart.creditTotal > 0 && (
          <p className="text-[10px] text-white/25 text-right">
            Pass {formatPrice(cart.totalPass)}{extraMenu > 0 ? ` + supplément ${formatPrice(extraMenu)}` : ' · menu inclus'}
          </p>
        )}
      </div>
    </div>
  );
}
