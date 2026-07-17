import { useEffect, useRef, useState } from 'react';
import { FermentadorHolograma } from './FermentadorHolograma';

interface AvatarResponsiveProps {
  active?: boolean;
  responding?: boolean;
}

/**
 * Mide el ancho real disponible del contenedor padre y lo traduce a un
 * `size` numérico para que el holograma del fermentador escale con la pantalla.
 */
export function AvatarResponsive({ active, responding }: AvatarResponsiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(280);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const width = el.getBoundingClientRect().width;
      if (width > 0) setSize(Math.round(width));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex items-center justify-center">
      <FermentadorHolograma size={size} active={active} responding={responding} />
    </div>
  );
}
