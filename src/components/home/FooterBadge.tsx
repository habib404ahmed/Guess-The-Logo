/**
 * FooterBadge — 1:1 Match to User's Reference Sub-Footer
 * ─────────────────────────────────────────────────────────────────────────────
 * Features:
 * - Center text: ← FRESHERS ORIENTATION - 2026 →
 * - Bold Cyan sub-text: SELECT A CHALLENGE TO BEGIN
 */
export function FooterBadge() {
  return (
    <div className="flex flex-col items-center gap-1.5 select-none relative z-10">
      <div className="flex items-center gap-3">
        <div className="h-px w-10 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        <span className="text-xs font-black tracking-widest uppercase text-[#94a3b8]">
          ← FRESHERS ORIENTATION - 2026 →
        </span>
        <div className="h-px w-10 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
      </div>
      <p
        className="text-xs font-black tracking-widest uppercase text-cyan-400"
        style={{ textShadow: '0 0 12px rgba(0, 243, 255, 0.7)' }}
      >
        SELECT A CHALLENGE TO BEGIN
      </p>
    </div>
  );
}
