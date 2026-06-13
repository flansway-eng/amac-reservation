import Link from 'next/link';
import Image from 'next/image';

const PASS_DATA = [
  { code: 'BRONZE', label: 'Pass Bronze', prix: '5 000', credit: '5 000', color: '#CD7F32', glow: 'rgba(205,127,50,0.35)', emoji: '🥉' },
  { code: 'ARGENT', label: 'Pass Argent', prix: '10 000', credit: '10 000', color: '#C0C0C0', glow: 'rgba(192,192,192,0.25)', emoji: '🥈' },
  { code: 'OR', label: 'Pass Or', prix: '15 000', credit: '15 000', color: '#FFD700', glow: 'rgba(255,215,0,0.45)', emoji: '🥇' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-halo text-white">

      {/* HERO */}
      <section className="relative overflow-hidden px-4 pt-10 pb-14 text-center">
        <div className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 45% at 50% 0%, rgba(232,115,12,0.13) 0%, transparent 70%)' }} />

        {/* Logo AMAC */}
        <div className="flex justify-center mb-5">
          <Image src="/logo-amac.png" alt="AMAC Bingerville — Section Café Coton"
            width={130} height={130} className="object-contain drop-shadow-[0_0_24px_rgba(232,115,12,0.4)]" priority />
        </div>

        <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: '#1B7A3D' }}>
          Section Café Coton — Les Amis de la Musique Afro-Cubaine
        </p>

        <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Fête combinée des{' '}
          <span className="text-amac-gradient">Mères & des Pères</span>
        </h1>

        <p className="text-white/55 text-sm mb-5 max-w-sm mx-auto">
          Sous la présidence de <span className="text-white font-semibold">Rose Léa Amany</span>
        </p>

        <div className="inline-flex flex-col sm:flex-row gap-2 sm:gap-5 items-center justify-center glass rounded-2xl px-5 py-3.5 mb-5 text-sm">
          <div className="flex items-center gap-2">
            <span style={{ color: '#E8730C' }}>📅</span>
            <span className="font-bold">Jeudi 18 juin 2026</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/15" />
          <div className="flex items-center gap-2">
            <span style={{ color: '#E8730C' }}>🕕</span>
            <span className="font-bold">18H00</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/15" />
          <div className="flex items-center gap-2">
            <span style={{ color: '#E8730C' }}>📍</span>
            <span className="text-white/70 text-xs sm:text-sm">Rooftop Capitol Hôtel, Riviera Golf</span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold mb-7"
          style={{ background: 'rgba(27,122,61,0.15)', border: '1px solid rgba(27,122,61,0.4)', color: '#22A050' }}>
          ⚽ Coupe du Monde suivie sur place
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/reserver"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-black text-white animate-amac-pulse btn-amac">
            🎟️ Réserver mon PASS
          </Link>
          <Link href="/menu"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-4 text-sm font-semibold text-white/75 hover:bg-white/5 transition-all">
            🍽️ Voir la carte
          </Link>
          <Link href="/ma-reservation"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-4 text-sm font-semibold text-white/50 hover:bg-white/5 transition-all">
            🔍 Ma réservation
          </Link>
        </div>
      </section>

      {/* PARTENAIRES */}
      <section className="px-4 py-4 text-center">
        <p className="text-[10px] text-white/25 uppercase tracking-widest mb-3">Partenaires officiels</p>
        <div className="flex items-center justify-center gap-4">
          <div className="glass rounded-xl px-5 py-2.5 text-center">
            <p className="text-sm font-bold text-white/70">🏨 Capitol Hotel</p>
            <p className="text-[10px] text-white/35">Riviera Golf</p>
          </div>
          <div className="rounded-xl px-5 py-2.5 text-center glass-green">
            <p className="text-sm font-bold" style={{ color: '#22A050' }}>🍺 Bière BOCK</p>
            <p className="text-[10px] text-white/35">Solibra — Offre 2+1</p>
          </div>
        </div>
      </section>

      {/* FORMULE 2+1 */}
      <section className="px-4 py-4 max-w-2xl mx-auto">
        <div className="glass-orange rounded-2xl p-4 text-center">
          <p className="font-bold text-base mb-1" style={{ color: '#E8730C' }}>🎁 Formule 2+1 — Offre spéciale Pass</p>
          <p className="text-white/55 text-sm">
            Pour <strong className="text-white">2 pass identiques</strong> dans la même commande,
            le <strong className="text-white">3e est offert</strong>. Remise appliquée automatiquement au panier.
          </p>
        </div>
      </section>

      {/* CARTES PASS */}
      <section className="px-4 py-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-black text-center text-amac-gradient mb-8"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Choisissez votre Pass
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PASS_DATA.map((p) => (
            <div key={p.code}
              className="relative rounded-2xl border p-6 text-center transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              style={{ borderColor: `${p.color}40`, background: 'rgba(255,255,255,0.04)', boxShadow: `0 0 22px ${p.glow}` }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}80)` }}>
                {p.emoji}
              </div>
              <h3 className="text-xl font-black text-white mb-1">{p.label}</h3>
              <div className="text-3xl font-black mb-1" style={{ color: p.color }}>{p.prix} FCFA</div>
              <p className="text-xs text-white/35 mb-4">Crédit consommation : {p.credit} FCFA</p>
              <Link href="/reserver"
                className="block w-full py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)` }}>
                Réserver
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* LIEU */}
      <section className="px-4 py-6 max-w-md mx-auto text-center">
        <div className="glass rounded-2xl p-5">
          <p className="text-3xl mb-3">🏙️</p>
          <h3 className="text-base font-bold text-white mb-1">Rooftop du Capitol Hôtel</h3>
          <p className="text-sm text-white/50">Riviera Golf — face Mosquée Albayane, Abidjan</p>
        </div>
      </section>

      {/* CONDITIONS */}
      <section className="px-4 pb-10 max-w-xl mx-auto">
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
          <p className="text-[10px] font-bold text-white/25 uppercase tracking-wider mb-2">Conditions Pass</p>
          <ul className="space-y-1.5 text-xs text-white/35">
            <li className="flex items-start gap-2">
              <span style={{ color: '#E8730C' }}>•</span>
              Le crédit couvre vos consommations. Seul le dépassement éventuel est à régler sur place.
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: '#E8730C' }}>•</span>
              Le crédit n'est ni remboursable ni échangeable contre de l'espèce.
            </li>
          </ul>
        </div>
        <div className="flex justify-center mt-6">
          <Image src="/logo-amac.png" alt="AMAC" width={52} height={52} className="object-contain opacity-25" />
        </div>
        <p className="text-center text-xs text-white/15 mt-2">
          AMAC Bingerville — Section Café Coton © {new Date().getFullYear()}
        </p>
      </section>
    </main>
  );
}
