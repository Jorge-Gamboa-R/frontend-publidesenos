import type { ReactNode } from 'react';

interface MugTemplateProps {
  /** Color hex (#RRGGBB) del asa, borde interior y aro del mug */
  color?: string;
  /** Mostrar el área de impresión punteada (true por defecto) */
  showPrintArea?: boolean;
  /** Contenido a colocar dentro del área de impresión (texto/imagen del cliente) */
  children?: ReactNode;
  /** Texto opcional dentro del área de impresión cuando no hay children */
  placeholder?: string;
  className?: string;
}

/**
 * Plantilla SVG de un mug 11oz que se tinta dinámicamente con el color elegido.
 * Reemplaza la foto del producto en el flujo de personalización para que el cliente
 * vea cómo lucirá su diseño sobre un mug del color seleccionado.
 */
export default function MugTemplate({
  color = '#fbbf24',
  showPrintArea = true,
  children,
  placeholder,
  className,
}: MugTemplateProps) {
  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      <svg
        viewBox="0 0 320 280"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        {/* Sombra suave bajo el mug */}
        <ellipse cx="135" cy="265" rx="100" ry="6" fill="rgba(0,0,0,0.08)" />

        {/* Asa (handle) — color del mug */}
        <path
          d="M 220 95 C 296 95 296 205 220 205 L 220 180 C 262 180 262 120 220 120 Z"
          fill={color}
          stroke="rgba(0,0,0,0.12)"
          strokeWidth="1.5"
        />

        {/* Cuerpo blanco del mug */}
        <path
          d="M 40 85 Q 40 80 45 80 L 215 80 Q 220 80 220 85 L 220 245 Q 220 255 210 255 L 50 255 Q 40 255 40 245 Z"
          fill="white"
          stroke="rgba(0,0,0,0.18)"
          strokeWidth="2"
        />

        {/* Interior visible del mug (color) */}
        <ellipse cx="130" cy="82" rx="90" ry="14" fill={color} />

        {/* Aro / borde superior — fina franja blanca */}
        <ellipse
          cx="130"
          cy="78"
          rx="90"
          ry="7"
          fill="white"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="1.2"
        />

        {/* Brillo sutil del cuerpo */}
        <path
          d="M 55 95 Q 55 90 60 90 L 70 90 Q 75 90 75 95 L 75 240 Q 75 248 67 248 L 60 248 Q 55 248 55 240 Z"
          fill="rgba(255,255,255,0.55)"
        />

        {/* Área de impresión punteada */}
        {showPrintArea && (
          <rect
            x="65"
            y="120"
            width="130"
            height="115"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            strokeDasharray="6 4"
            rx="3"
          />
        )}
      </svg>

      {/* Capa para children (imagen/texto del cliente) o placeholder, posicionada
          sobre el área de impresión del SVG (porcentajes calculados sobre 320x280) */}
      {(children || placeholder) && (
        <div
          className="absolute flex items-center justify-center text-center"
          style={{
            left: `${(65 / 320) * 100}%`,
            top: `${(120 / 280) * 100}%`,
            width: `${(130 / 320) * 100}%`,
            height: `${(115 / 280) * 100}%`,
          }}
        >
          {children ?? (
            <span className="text-xs sm:text-sm font-bold tracking-widest text-gray-400 select-none">
              {placeholder}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
