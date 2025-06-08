// Define base colors as a module-level constant
const BASE_COLOR_DEFINITIONS = [
  { name: 'Red', hex: '#FF0000', rgb: [255, 0, 0], isPrimary: true, mixArity: 1, discoveredTimestamp: Date.now() - 5000, isEditable: true },
  { name: 'Blue', hex: '#0000FF', rgb: [0, 0, 255], isPrimary: true, mixArity: 1, discoveredTimestamp: Date.now() - 4000, isEditable: true },
  { name: 'Yellow', hex: '#FFFF00', rgb: [255, 255, 0], isPrimary: true, mixArity: 1, discoveredTimestamp: Date.now() - 3000, isEditable: true },
  { name: 'White', hex: '#FFFFFF', rgb: [255, 255, 255], isPrimary: true, mixArity: 1, discoveredTimestamp: Date.now() - 2000, isShadingColor: true, isEditable: false },
  { name: 'Black', hex: '#000000', rgb: [0, 0, 0], isPrimary: true, mixArity: 1, discoveredTimestamp: Date.now() - 1000, isShadingColor: true, isEditable: false },
  // Saturation Modifiers
  { name: 'Saturator', hex: '#A0A0A0', rgb: [160, 160, 160], isPrimary: true, mixArity: 1, discoveredTimestamp: Date.now() - 500, isSaturationModifier: true, saturationEffect: 0.20, isEditable: false },
  { name: 'Desaturator', hex: '#606060', rgb: [96, 96, 96], isPrimary: true, mixArity: 1, discoveredTimestamp: Date.now() - 400, isSaturationModifier: true, saturationEffect: -0.20, isEditable: false }
];
export class ColorSystem {
  constructor() {
    this.discoveredColors = new Map();
    this.initializeBaseColors();
  }
  initializeBaseColors() {
    BASE_COLOR_DEFINITIONS.forEach(color => {
      // Ensure timestamp is present, even if re-initializing or loading
      // Create a new object to avoid modifying the constant definitions if they were to be reused directly elsewhere without copying
      const colorWithTimestamp = { ...color, discoveredTimestamp: color.discoveredTimestamp || Date.now() };
      this.discoveredColors.set(color.hex, colorWithTimestamp);
    });
  }
  getInitialBaseColors() {
    // Return a deep copy of the definitions to prevent external modification
    // Although in current usage (spread operator in main.js), direct return is also safe.
    // A map or returning new objects ensures true isolation if requirements change.
    return BASE_COLOR_DEFINITIONS.map(c => ({ ...c }));
  }
  mixColors(colorArray) {
    if (colorArray.length < 2) return null; // Need at least two orbs (color + modifier, or color + color)
    const saturationModifiers = colorArray.filter(c => c.isSaturationModifier);
    const nonModifierColors = colorArray.filter(c => !c.isSaturationModifier);
    const actualColors = nonModifierColors.filter(c => !c.isShadingColor);
    const shadingColors = nonModifierColors.filter(c => c.isShadingColor);
    const sortedInputHexes = colorArray.map(c => c.hex).sort();
    // If no actual (non-shading, non-modifier) colors are present, cannot mix.
    // (e.g. selecting only SaturationUp + White, or SaturationUp + SaturationDown)
    if (actualColors.length === 0) {
      // Special case: if mixing two shading colors (Black+White), allow that without actualColors.
      // Saturation modifiers won't apply here.
      if (shadingColors.length >= 2 && saturationModifiers.length === 0) {
        let l = 0;
        shadingColors.forEach(sc => l += this.rgbToHsl(...sc.rgb).l);
        l /= shadingColors.length;
        const [r, g, b] = this.hslToRgb(0, 0, l); // Result is grayscale
        const hex = this.rgbToHex(r, g, b);
        const name = this.generateColorName(r, g, b);
        return { name, hex, rgb: [r, g, b], mixedFrom: sortedInputHexes, mixArity: shadingColors.length, discoveredTimestamp: Date.now() };
      }
      return null; // Otherwise, not a valid mix.
    }
    let mixedH, mixedS, mixedL;
    // Special case for Yellow + Blue (only from actualColors)
    const actualColorHexesSorted = actualColors.map(c => c.hex).sort();
    const isYellowBlueMix = actualColors.length === 2 &&
      ((actualColorHexesSorted[0] === '#0000FF' && actualColorHexesSorted[1] === '#FFFF00'));
    if (isYellowBlueMix) {
      mixedH = 175; 
      mixedS = 0.85;
      mixedL = 0.55; 
      // Apply shading from Black/White (from nonModifierColors)
      shadingColors.forEach(sc => {
        if (sc.hex === '#FFFFFF') mixedL = Math.min(1, mixedL + 0.15);
        if (sc.hex === '#000000') mixedL = Math.max(0, mixedL - 0.15);
      });
      mixedL = Math.max(0, Math.min(1, mixedL));
    } else {
      // Generalized HSL Mixing for actualColors
      let sumCosH = 0;
      let sumSinH = 0;
      let sumS = 0;
      let sumL = 0;
      actualColors.forEach(color => {
        const hsl = this.rgbToHsl(...color.rgb);
        sumS += hsl.s;
        sumL += hsl.l;
        const hueRad = hsl.h * Math.PI / 180;
        sumCosH += Math.cos(hueRad);
        sumSinH += Math.sin(hueRad);
      });
      let avgH_rad = Math.atan2(sumSinH / actualColors.length, sumCosH / actualColors.length);
      mixedH = avgH_rad * 180 / Math.PI;
      if (mixedH < 0) mixedH += 360;
      mixedH %= 360;
      mixedS = (sumS / actualColors.length) * 0.97; 
      mixedL = (sumL / actualColors.length); 
      // Apply shading from Black/White (from nonModifierColors)
      shadingColors.forEach(sc => {
        if (sc.hex === '#FFFFFF') mixedL = Math.min(1, mixedL + 0.15);
        if (sc.hex === '#000000') mixedL = Math.max(0, mixedL - 0.15);
      });
      mixedS = Math.max(0, Math.min(1, mixedS));
      mixedL = Math.max(0, Math.min(1, mixedL));
    }
    // Apply saturation modifiers
    saturationModifiers.forEach(mod => {
      mixedS += mod.saturationEffect;
    });
    mixedS = Math.max(0, Math.min(1, mixedS)); // Clamp Saturation
    const [r, g, b] = this.hslToRgb(mixedH, mixedS, mixedL);
    const hex = this.rgbToHex(r, g, b);
    const name = this.generateColorName(r, g, b);
    return {
      name,
      hex,
      rgb: [r, g, b],
      mixedFrom: sortedInputHexes, // Use original sortedInputHexes for correct lineage tracking
      mixArity: colorArray.length, // Reflect total number of orbs used in mix
      discoveredTimestamp: Date.now()
    };
  }

  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0,0,0]; // Default to black if parse fails
  }
  generateColorName(r, g, b) {
    const hsl = this.rgbToHsl(r, g, b);
    const h = hsl.h; // 0-360
    const s = hsl.s; // 0-1
    const l = hsl.l; // 0-1
    // 1. Grayscale check
    // 1. Grayscale check (more refined)
    if (s < 0.08) { // Slightly lower threshold for considering grayscale
      if (l >= 0.96) return 'White';
      if (l >= 0.88) return 'Off-White';
      if (l >= 0.75) return 'Pale Gray'; // New
      if (l >= 0.60) return 'Light Gray';
      if (l >= 0.40) return 'Gray';
      if (l >= 0.25) return 'Dark Gray';
      if (l >= 0.10) return 'Charcoal';
      return 'Black';
    }
    // Metallic-like colors (Gold, Silver - checked before general hues)
    // Gold & Dark Gold: Metallic yellow-orange hues with high saturation.
    // "Dark Gold" is used for lower lightness values within this range.
    if (h >= 36 && h < 53 && s >= 0.60 && s <= 1.0 && l >= 0.30 && l <= 0.80) { // Adjusted h < 55 to h < 53
        let prefix = '';
        if (s >= 0.80) { // Apply Vivid for high saturation
            prefix = 'Vivid ';
        }
        if (l < 0.48) { // Threshold for "Dark Gold"
            return prefix + 'Dark Gold';
        }
        return prefix + 'Gold';
    }
    // Silver: Low saturation, very high lightness for a brighter, more metallic feel
    if (s >= 0.03 && s < 0.18 && l >= 0.78 && l <= 0.94) {
        // Add hue descriptor for very faint tint if any, with narrower hue bands
        let tint = '';
        if (h >= 40 && h < 60 && s >= 0.08) tint = 'Golden '; // More specific yellow hue for golden tint
        else if (h >= 200 && h < 240 && s >= 0.08) tint = 'Bluish '; // Standard blue hue for bluish tint
        return `${tint}Silver`;
    }
    // Beige and Cream tones: Light, desaturated yellow-orange/yellows
    // H (35-60: Yellow to Greenish-Yellow), S (0.10-0.60: Low to Moderate-Low), L (0.65-0.93: Light to Very Light)
    if (h >= 35 && h <= 60 && s >= 0.10 && s <= 0.60 && l >= 0.65 && l < 0.93) {
        // Avoid classifying more saturated "Pale Yellow" or "Light Yellow" as Beige
        if (l >= 0.80 && s > 0.45) {
            // Let it fall through to be named "Pale Yellow" or "Light Yellow" etc.
        } else if (l >= 0.75 && s < 0.20) { // Very desaturated and light could be "Off-White" or "Pale Gray" like
             // Let it fall through to grayscale if s is very low, or specific light/pale descriptor
        }
        else {
            return 'Beige';
        }
    }
    
    // 2. Determine Hue Name (Expanded and Adjusted)
    let hueName = '';
    // Brown: specific conditions for orange/red-orange hues with lower saturation/lightness
    // Brown: specific conditions for orange/red-orange hues with lower saturation/lightness.
    // Expanded saturation range (up to 0.95) to catch highly saturated dark yellows/oranges that appear brown.
    // Expanded saturation range (up to 0.95) and lowered minimum lightness (to 0.03) to catch highly saturated dark yellows/oranges that appear brown.
    // Adjusted Brown condition: removed max saturation (s <= 0.95) here, will be handled by inner logic.
    // Expanded Brown hue range to h < 48 to include dark, saturated yellows.
    if ((h >= 10 && h < 48) && (s >= 0.25) && (l >= 0.03 && l < 0.55)) { 
        // If the color is highly saturated (s > 0.80) AND has medium lightness (l >= 0.40)
        // for this hue range, it's more likely a vivid Orange/Red-Orange than Brown.
        // In this case, we let it "fall through" to be classified by the general hue rules later.
        if (s > 0.80 && l >= 0.40) {
            // This color will be named by subsequent hue checks (e.g., Orange, Red-Orange).
        } else {
            // Otherwise, it's a genuine Brown variant.
            let prefix = '';
            const coreName = 'Brown';
            if (s > 0.75) { // For highly saturated browns (that are not vivid oranges)
                prefix = 'Vivid ';
            }
            // Note: Order of these checks matters. Dark/Light classifications are more specific.
            // Adjusted Dark Brown threshold to l < 0.26.
            // This makes colors like L=0.28 (like the user's example) "Brown" instead of "Dark Brown".
            if (l < 0.26) { 
                return prefix + 'Dark ' + coreName; 
            }
            if (l >= 0.45 && s < 0.55) { // Light Brown
                return 'Light Brown'; 
            }
            return prefix + coreName; // Default Brown or Vivid Brown
        }
    }
    // Pink: for lighter/desaturated reds and magentas. Catches hues that might otherwise be Magenta/Violet/Red if very pale.
    // Hue condition for pinkish colors (Reds, Magentas, some Violets):
    const isPinkHue = ((h >= 330 && h <= 360) || (h >= 0 && h < 20) || (h >= 300 && h < 330));
    // Extended upper lightness boundary to cover very pale pinks up to L=0.95 (exclusive of 0.96, which is White)
    if (isPinkHue && s >= 0.30 && l >= 0.60 && l < 0.96) {
        if (l >= 0.90) { // For L from 0.90 to 0.95 (Very Pale Pinks)
            // At this extreme lightness, "Vivid" can be misleading.
            // "Pale Pink" for reasonably saturated, "Faint Pink" for less saturated.
            if (s >= 0.50) {
                return 'Pale Pink'; // e.g., HSL(314, 85%, 95%) -> Pale Pink
            } else { // s from 0.30 to 0.49 for these very light pinks
                return 'Faint Pink';
            }
        } else if (l >= 0.80) { // For L from 0.80 to 0.89 (Light Pinks)
            if (s >= 0.80) {
                return 'Vivid Pink'; // e.g., HSL(315, 84%, 80%) -> Vivid Pink
            } else if (s < 0.45) { // Low saturation (0.30-0.44) for Light Pinks
                return 'Pastel Pink';
            } else { // Moderate saturation (0.45-0.79) for Light Pinks
                return 'Light Pink';
            }
        } else { // For L from 0.60 to 0.79 (Standard Pinks)
                 // This covers the original L threshold of 0.60 for Pink.
            if (s >= 0.80) {
                return 'Vivid Pink';
            } else { // Saturation 0.30-0.79 for standard Pinks
                return 'Pink';
            }
        }
    }
    // Seafoam Green: Pale, desaturated green-blues/greens
    // Hue (130-175: Greenish to Cyanish-Green), Sat (0.20-0.55: Muted), Light (0.70-0.92: Light to Pale)
    if (h >= 130 && h < 175 && s >= 0.20 && s < 0.55 && l >= 0.70 && l < 0.92) {
        // This check helps avoid "Seafoam Green" for very pale colors that might be better described
        // by "Pale Muted [Hue]" or "Off-White" if saturation is extremely low.
        if (l >= 0.85 && s < 0.30) { 
            // Let it fall through for more generic pale descriptors or grayscale processing.
        } else {
            return 'Seafoam Green';
        }
    }
    // Olive: Dark, saturated yellow-greens
    // H (50-85: Yellow-Green to Greenish), S (>=0.30: at least somewhat saturated), L (0.15-0.40: Darkish)
    if (h >= 50 && h < 85 && s >= 0.30 && l >= 0.15 && l < 0.40) {
        let prefix = '';
        // For very saturated olives, add "Vivid"
        if (s >= 0.70) {
            prefix = 'Vivid ';
        }
        // For very dark olives, add "Dark"
        if (l < 0.28) {
            return prefix + 'Dark Olive';
        }
        return prefix + 'Olive';
    } 
    // Peach tones
    // H (25-40: Orangey), S (0.50-1.0: Moderate to High Saturation), L (0.70-0.85: Light)
    if (h >= 25 && h < 40 && s >= 0.50 && l >= 0.70 && l < 0.85) {
        let prefix = '';
        // Determine prefix (Vivid or Pastel)
        if (s >= 0.85) {
            prefix = 'Vivid ';
        } else if (s < 0.65 && l >= 0.75) { // Pastel for lighter, less saturated peaches
            prefix = 'Pastel ';
        }
        // Determine main name (Light Peach or Peach)
        if (l >= 0.80) { 
            return prefix + 'Light Peach';
        }
        return prefix + 'Peach';
    }
    // Define Red-Orange hue range
    const redOrangeHueStart = 12;
    const redOrangeHueEnd = 17; // Adjusted: Red-Orange now ends before hue 17
    if (h >= 345 || h < redOrangeHueStart) hueName = 'Red'; // Red ends before Red-Orange
    else if (h >= redOrangeHueStart && h < redOrangeHueEnd) hueName = 'Red-Orange'; // Red-Orange is now h 12 to <17
    else if (h >= redOrangeHueEnd && h < 35) hueName = 'Orange'; // Orange now starts at h 17
    else if (h >= 35 && h < 68) hueName = 'Yellow';  // Yellow now extends up to (but not including) 68
    else if (h >= 68 && h < 80) hueName = 'Lime';    // Lime now starts at 68
    else if (h >= 80 && h < 145) hueName = 'Green';  // Green ends before 145
    else if (h >= 145 && h < 176) hueName = 'Turquoise'; // Turquoise: 145 to <176 (includes 175)
    else if (h >= 176 && h < 195) hueName = 'Teal';   // Teal: 176 to <195
    else if (h >= 195 && h < 210) hueName = 'Cyan';   // Cyan: 195 to <210
    else if (h >= 210 && h < 235) hueName = 'Azure';  // Azure: 210 to <235
    else if (h >= 235 && h < 250) hueName = 'Blue';   // Blue: 235 to <250
    else if (h >= 250 && h < 285) hueName = 'Purple'; // Purple now starts at 250
    else if (h >= 285 && h < 310) hueName = 'Violet'; // Violet shifted
    else if (h >= 310 && h < 340) hueName = 'Magenta';// Magenta shifted, end remains
    // Removed Rose, covered by Pink or Red variations
    else hueName = 'Chroma'; // Fallback for unclassified vivid hues
    // 3. Determine Lightness Descriptor (Adjusted thresholds)
    let lightnessDesc = '';
    if (l >= 0.83) lightnessDesc = 'Pale';         // Pale now starts at L=0.83
    else if (l >= 0.70 && l < 0.83) lightnessDesc = 'Light'; // Light now ends before L=0.83
    else if (l > 0.35 && l < 0.70) lightnessDesc = '';    // Mid-tones, no descriptor
    else if (l >= 0.18 && l <= 0.35) lightnessDesc = 'Dark'; // Adjusted range
    else if (l < 0.18) lightnessDesc = 'Deep';        // Lowered threshold
    // 4. Determine Saturation Descriptor (Adjusted thresholds)
    let saturationDesc = '';
    if (s >= 0.80) {
      if (lightnessDesc === 'Pale') {
        // For Pale colors, require even higher saturation to be called Vivid.
        // S (0.80-0.89) on a Pale color might not appear "Vivid" due to being washed out.
        if (s >= 0.90) { 
          saturationDesc = 'Vivid';
        } else {
          saturationDesc = ''; // Not Vivid enough if Pale and S is 0.80-0.89
        }
      } else { // For non-Pale colors (Light, normal, Dark, Deep)
        saturationDesc = 'Vivid';
      }
    }
    else if (s >= 0.50 && s < 0.80) saturationDesc = ''; // Moderate saturation, no descriptor
    else if (s >= 0.15 && s < 0.50) saturationDesc = 'Muted'; // Adjusted range (0.08-0.15 is near-grayscale)
    
    // 5. Combine names
    const parts = [];
    if (saturationDesc && lightnessDesc === 'Pale' && s < 0.3) {
        // Avoid "Muted Pale Pink", prefer "Pastel Pink" or just "Pale Pink"
        // If it's already "Pastel Pink" from above, this won't apply
    } else if (saturationDesc) {
        parts.push(saturationDesc);
    }
    if (lightnessDesc) parts.push(lightnessDesc);
    
    parts.push(hueName);
    
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }
  rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s, l: l };
  }
  hslToRgb(h, s, l) {
    let r, g, b;
    h /= 360; // Convert h to [0,1] range
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  isNewColor(colorData) {
    return !this.discoveredColors.has(colorData.hex);
  }

  addDiscoveredColor(colorData) {
    // Ensure timestamp is present when adding
    const colorWithTimestamp = { ...colorData, discoveredTimestamp: colorData.discoveredTimestamp || Date.now() };
    this.discoveredColors.set(colorData.hex, colorWithTimestamp);
  }
  getDiscoveredColors() {
    return Array.from(this.discoveredColors.values());
  }

  getColorByHex(hex) {
    return this.discoveredColors.get(hex);
  }
  getBaseColorArity(hex) {
    const baseColors = [
        { hex: '#FF0000', mixArity: 1 }, { hex: '#0000FF', mixArity: 1 }, { hex: '#FFFF00', mixArity: 1 },
        { hex: '#00FF00', mixArity: 2 }, { hex: '#FFA500', mixArity: 2 }, { hex: '#800080', mixArity: 2 }
    ];
    const found = baseColors.find(c => c.hex === hex);
    return found ? found.mixArity : undefined;
  }
}