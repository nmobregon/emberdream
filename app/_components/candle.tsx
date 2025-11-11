"use client";

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Helper function to darken a color
function darkenColor(hex: string, percent: number = 50): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = (100 - percent) / 100;
  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Helper function to get a highlight color (lighter version)
function lightenColor(hex: string, percent: number = 30): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = percent / 100;
  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor));
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor));
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function Candle({ height = 100, color = "#ff9224" }) {
  const darkColor = darkenColor(color, 50);
  const lightColor = lightenColor(color, 20);

  return (
    <div
      className="flex w-full items-end justify-center"
      style={{ height: `${height}%` }}
    >
      <div className="candle">
        <div className="flame">
          <div className="shadows"></div>
          <div className="top"></div>
          <div className="middle"></div>
          <div className="bottom"></div>
        </div>
        <div className="wick"></div>
        <div
          className="wax"
          style={{
            background: `linear-gradient(to bottom, ${color} 0px, ${color} 20px, ${darkColor} 50px)`,
            boxShadow: `
              inset 0 7px 12px -2px ${lightColor},
              inset 0 9px 57px -3px rgba(255, 0, 0, 0.4),
              inset 0 -5px 8px 2px black,
              0 0 3px 0px ${color}
            `,
          }}
        />
      </div>
    </div>
  );
}
