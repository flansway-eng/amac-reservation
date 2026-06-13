'use client';

import { Pass, CartPassLine } from '@/lib/types';
import { calcul2Plus1, formatPrice } from '@/lib/utils';

interface PassCardProps {
  pass: Pass;
  line: CartPassLine | undefined;
  onChangeQuantite: (passId: number, delta: number) => void;
}

const PASS_CONFIG: Record<string, { color: string; glow: string; border: string; badge: string }> = {
  BRONZE: {
    color: '#CD7F32',
    glow: 'rgba(205,127,50,0.4)',
    border: 'border-[#CD7F32]/40',
    badge: 'bg-[#CD7F32]',
  },
  ARGENT: {
    color: '#C0C0C0',
    glow: 'rgba(192,192,192,0.3)',
    border: 'border-[#C0C0C0]/40',
    badge: 'bg-[#C0C0C0]',
  },
  OR: {
    color: '#FFD700',
    glow: 'rgba(255,215,0,0.5)',
    border: 'border-[#FFD700]/50',
    badge: 'bg-[#FFD700]',
  },
};

export default function PassCard({ pass, line, onChangeQuantite }: PassCardProps) {
  const cfg = PASS_CONFIG[pass.code] ?? PASS_CONFIG.BRONZE;
  const quantite = line?.quantite ?? 0;
  const { payant, offert } = calcul2Plus1(quantite);

  return (
    <div
      className={`relative rounded-2xl border ${cfg.border} bg-white/5 backdrop-blur-sm p-5 transition-all duration-300 ${
        quantite > 0 ? 'ring-1 ring-yellow-400/40' : ''
      }`}
      style={{ boxShadow: quantite > 0 ? `0 0 20px ${cfg.glow}` : undefined }}
    >
      {/* Médaillon */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black mb-2"
            style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}88)` }}
          >
            {pass.code === 'BRONZE' ? '🥉' : pass.code === 'ARGENT' ? '🥈' : '🥇'}
          </div>
          <h3 className="text-lg font-bold text-white">{pass.label}</h3>
          <p className="text-sm text-white/50">Crédit : {formatPrice(pass.credit)}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black" style={{ color: cfg.color }}>
            {formatPrice(pass.prix)}
          </div>
        </div>
      </div>

      {/* Formule 2+1 badge */}
      {offert > 0 && (
        <div className="mb-3 animate-pulse-slow">
          <span className="inline-flex items-center gap-1 text-xs bg-green-500/20 border border-green-500/40 text-green-400 rounded-full px-3 py-1 font-semibold">
            🎁 {offert} pass offert{offert > 1 ? 's' : ''} — Formule 2+1
          </span>
        </div>
      )}

      {/* Stepper quantité */}
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={() => onChangeQuantite(pass.id, -1)}
          disabled={quantite === 0}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white text-xl font-bold disabled:opacity-30 hover:bg-white/10 transition-all active:scale-95"
        >
          −
        </button>
        <div className="text-center">
          <span className="text-2xl font-black text-white tabular-nums">{quantite}</span>
          {quantite > 0 && (
            <p className="text-xs text-white/50 mt-0.5">
              {payant} payant{payant > 1 ? 's' : ''}
              {offert > 0 && ` + ${offert} offert${offert > 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        <button
          onClick={() => onChangeQuantite(pass.id, +1)}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white text-xl font-bold hover:bg-white/10 transition-all active:scale-95"
        >
          +
        </button>
      </div>

      {/* Sous-total */}
      {quantite > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10 text-sm text-white/60 text-right">
          Sous-total :{' '}
          <span className="text-white font-bold">{formatPrice(payant * pass.prix)}</span>
        </div>
      )}
    </div>
  );
}
