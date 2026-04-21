/**
 * COLOR MIXING UTILITIES
 * Mix colors proportionally based on letter frequencies
 */

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Mix colors proportionally
 */
export function mixColors(colors: { color: string; weight: number }[]): string {
  const totalWeight = colors.reduce((sum, c) => sum + c.weight, 0);
  
  if (totalWeight === 0) return '#ffffff';
  
  let r = 0;
  let g = 0;
  let b = 0;
  
  colors.forEach(({ color, weight }) => {
    const rgb = hexToRgb(color);
    const proportion = weight / totalWeight;
    r += rgb.r * proportion;
    g += rgb.g * proportion;
    b += rgb.b * proportion;
  });
  
  return rgbToHex(r, g, b);
}

/**
 * Get color name description (approximate)
 */
export function describeColor(hex: string): string {
  const rgb = hexToRgb(hex);
  const { r, g, b } = rgb;
  
  // Simple color naming
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  // Grayscale
  if (diff < 30) {
    if (max < 50) return 'Negro';
    if (max > 200) return 'Blanco';
    return 'Gris';
  }
  
  // Color detection
  if (r > g && r > b) {
    if (g > 100) return 'Naranja';
    return 'Rojo';
  }
  if (g > r && g > b) {
    if (b > 100) return 'Cyan';
    if (r > 100) return 'Amarillo';
    return 'Verde';
  }
  if (b > r && b > g) {
    if (r > 100) return 'Magenta';
    if (g > 100) return 'Azul Claro';
    return 'Azul';
  }
  
  return 'Mixto';
}
