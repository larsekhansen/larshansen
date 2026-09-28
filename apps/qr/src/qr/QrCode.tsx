import QRCodeStyling, { type Options } from "qr-code-styling";
import { useEffect, useRef } from "react";

interface QrCodeProps {
  options: Options;
  /** What the code contains, for screen readers. Leave out for decorative codes. */
  label?: string;
  className?: string;
}

/** Draws a code with qr-code-styling and redraws it whenever `options` changes. */
export function QrCode({ options, label, className }: QrCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    new QRCodeStyling(options).append(container);
    return () => container.replaceChildren();
  }, [options]);

  return label ? (
    <div ref={containerRef} className={className} role="img" aria-label={label} />
  ) : (
    <div ref={containerRef} className={className} aria-hidden="true" />
  );
}
