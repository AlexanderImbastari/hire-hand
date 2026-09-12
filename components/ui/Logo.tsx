/**
 * The mark: a map pin with an H cut out of it — location plus trade, one shape.
 *
 * Tight-crop viewBox `48 22 144 190` per the design system. Inlined rather than
 * loaded from /public so the two-tone ink variant needs no extra request; the
 * same artwork also ships as files in /public/brand for favicon and app-icon use.
 */

const BODY =
  'M120 22C159.76 22 192 54.24 192 94C192 110.78 186.26 126.22 176.64 138.46L120 212L63.36 138.46C53.74 126.22 48 110.78 48 94C48 70.35 59.4 49.37 77 36.25V124H105V108H135V146H163V70H135V86H105V23.56C109.84 22.54 114.86 22 120 22Z';
const CROSSBAR = 'M105 108V86H135V108H105Z';

export type LogoVariant = 'ink' | 'white' | 'orange';

const BODY_FILL: Record<LogoVariant, string> = {
  ink: '#141210',
  white: '#FFFFFF',
  orange: '#FF5A36',
};

export function LogoMark({
  variant = 'ink',
  size = 32,
  className = '',
}: {
  variant?: LogoVariant;
  /** Mark height in px. Minimum 20 standalone, 28 in a lockup. */
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="48 22 144 190"
      style={{ height: size }}
      className={`block w-auto flex-none ${className}`}
      role="img"
      aria-label="HireHand"
    >
      <path fill={BODY_FILL[variant]} d={BODY} />
      {/* Only the ink variant carries the accent crossbar. Never recoloured. */}
      {variant === 'ink' && <path fill="#FF5A36" d={CROSSBAR} />}
    </svg>
  );
}

export function Logo({
  variant = 'ink',
  size = 32,
  wordmark = true,
  className = '',
}: {
  variant?: LogoVariant;
  size?: number;
  wordmark?: boolean;
  className?: string;
}) {
  if (!wordmark) {
    return <LogoMark variant={variant} size={size} className={className} />;
  }
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark variant={variant} size={size} />
      <span
        className="font-extrabold tracking-[-0.03em]"
        style={{
          fontSize: Math.round(size * 0.59),
          color: variant === 'ink' ? '#141210' : BODY_FILL[variant],
        }}
      >
        HireHand
      </span>
    </span>
  );
}
