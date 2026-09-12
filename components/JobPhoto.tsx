import Image from 'next/image';

/**
 * A job photo, or the striped placeholder when a homeowner posted none.
 * Design system §7: 135° stripe at 9px, with a mono caption.
 */
export function JobPhoto({
  src,
  alt,
  sizes,
  caption = 'No photo',
  className = '',
  priority = false,
}: {
  src?: string;
  alt: string;
  sizes: string;
  caption?: string;
  className?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-photo-tint bg-[repeating-linear-gradient(135deg,var(--color-photo-stripe)_0_9px,var(--color-photo-tint)_9px_18px)] ${className}`.trim()}
      >
        <span className="font-mono text-[11px] text-ink-400">{caption}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-photo-tint ${className}`.trim()}>
      {src.startsWith('data:') ? (
        // Homeowner uploads are inlined data URLs in phase 1; the image
        // optimiser only handles addressable sources.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="absolute inset-0 size-full object-cover" />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      )}
    </div>
  );
}
