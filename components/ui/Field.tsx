import Image from 'next/image';

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label className="label" htmlFor={htmlFor}>
      {children}
    </label>
  );
}

export function Input({
  invalid,
  className = '',
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={`field ${invalid ? 'field-error' : ''} ${className}`.trim()}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}

export function Textarea({
  invalid,
  className = '',
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={`field resize-none ${invalid ? 'field-error' : ''} ${className}`.trim()}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}

/** Input with a leading `$`, for prices. */
export function PriceInput({
  invalid,
  className = '',
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-400">
        $
      </span>
      <input
        className={`field pl-8 ${invalid ? 'field-error' : ''} ${className}`.trim()}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    </div>
  );
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-2 text-[12.5px] font-semibold text-danger-text">
      {children}
    </p>
  );
}

/**
 * A 3D marketing render. Always carries the ground-removal treatment — see
 * `.illus` in globals.css for why it is not optional.
 */
export function Illustration({
  src,
  size,
  alt = '',
  className = '',
}: {
  src: string;
  size: number;
  alt?: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`illus ${className}`.trim()}
      style={{ width: size, height: size }}
    />
  );
}
