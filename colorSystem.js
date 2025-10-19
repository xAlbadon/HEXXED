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
    let h = hsl.h; // 0-360
    const s = hsl.s; // 0-1
    const l = hsl.l; // 0-1
    
    // Normalize hue to ensure it's strictly within 0-360 range
    // This prevents floating-point edge cases from reaching the Chroma fallback
    h = h % 360;
    if (h < 0) h += 360;
    
    // Check for exact base primary colors first (no "Vivid" prefix for pure primaries)
    const hexColor = this.rgbToHex(r, g, b);
    if (hexColor === '#FF0000') return 'Red';
    if (hexColor === '#0000FF') return 'Blue';
    if (hexColor === '#FFFF00') return 'Yellow';
    if (hexColor === '#00FF00') return 'Lime'; // Pure green is actually lime in HSL
    // 1. Grayscale check
    // 1. Grayscale check (more refined)
    if (s < 0.08) { // Slightly lower threshold for considering grayscale
      if (l >= 0.96) return 'White';
      if (l >= 0.88) return 'Off-White';
      
      // Silver check within grayscale - prioritize Silver for its lightness range
      if (l >= 0.72 && l < 0.88) {
        // Traditional silvers include pure grays (S=0) and very desaturated colors
        if (s >= 0.0 && s < 0.08) {
          let tint = '';
          if (h >= 40 && h < 60 && s >= 0.03) tint = 'Golden ';
          else if (h >= 200 && h < 240 && s >= 0.03) tint = 'Bluish ';
          return `${tint}Silver`;
        }
      }
      
      if (l >= 0.75) return 'Pale Gray';
      if (l >= 0.60) return 'Light Gray';
      if (l >= 0.40) return 'Gray';
      if (l >= 0.25) return 'Dark Gray';
      if (l >= 0.10) return 'Charcoal';
      return 'Black';
    }
    // Metallic-like colors (Gold, Silver - checked before general hues)
    // Gold & Dark Gold: Metallic yellow-orange hues with high saturation.
    // Narrowed range to 40-53° to avoid catching oranges (like #FFA500)
    // Gold should be brighter (L >= 0.55) to appear metallic and shiny
    // Darker yellows (L < 0.48) should fall through to Mustard
    if (h >= 40 && h < 53 && s >= 0.60 && s <= 1.0 && l >= 0.30 && l <= 0.80) {
        let prefix = '';
        if (s >= 0.80) { // Apply Vivid for high saturation
            prefix = 'Vivid ';
        }
        // Dark Gold for darker but still metallic golds (L: 0.30-0.48)
        // Adjusted threshold to avoid calling standard gold "dark"
        if (l < 0.48) {
            return prefix + 'Dark Gold';
        }
        // Regular Gold for brighter, shinier golds (L >= 0.55)
        return prefix + 'Gold';
    }
    // Silver: Low saturation, very high lightness for a brighter, more metallic feel
    // Expanded to catch pale silvery colors with moderate saturation at very high lightness
    // Extended to include true grayscale silvers (S=0) for colors like #C0C0C0
    // Upper boundary lowered to 0.88 to avoid nearly-white colors being called Silver
    // Lower boundary lowered to 0.72 to include desaturated mid-light colors
    // Silver: For moderately saturated colors (above grayscale threshold)
    // that still appear silvery due to very high lightness
    if (l >= 0.72 && l < 0.88 && s >= 0.08 && s < 0.65) {
        // Only the more saturated silvers remain here
        // Very low saturation silvers (S < 0.08) are handled in grayscale block
        if (s >= 0.08 && s < 0.18) {
            let tint = '';
            if (h >= 40 && h < 60) tint = 'Golden ';
            else if (h >= 200 && h < 240) tint = 'Bluish ';
            return `${tint}Silver`;
        }
        // Pale silvery colors with moderate saturation but still appear silvery due to high lightness
        else if (s >= 0.18 && s < 0.65 && l >= 0.83 && l < 0.88) {
            let tint = '';
            if (h >= 35 && h < 65) tint = 'Golden ';
            else if (h >= 200 && h < 260) tint = 'Bluish ';
            else if (h >= 130 && h < 180) tint = 'Greenish ';
            else if (h >= 300 && h < 330) tint = 'Pinkish ';
            return `${tint}Silver`;
        }
    }
    // Beige and Cream tones: Light, desaturated yellow-orange/yellows and peachy-beiges
    // H (12-50: Red-Orange to Warm Yellow), S (0.10-0.60: Low to Moderate-Low), L (0.60-0.93: Light to Very Light)
    // Narrowed upper hue limit to 50° to avoid capturing lime/yellow-green colors
    if (h >= 12 && h <= 50 && s >= 0.10 && s <= 0.60 && l >= 0.60 && l < 0.93) {
        // Avoid classifying more saturated colors as Beige
        // Raised threshold to s > 0.60 to catch #F5F5DC (Beige, S=0.56)
        if (l >= 0.80 && s > 0.60) {
            // Let it fall through to be named "Pale Yellow" or "Light Yellow" etc.
        } else if (l >= 0.75 && s < 0.15) {
            // Very desaturated and light - let it fall through to grayscale or pale descriptors
        } else {
            return 'Beige';
        }
    }
    
    // Tan: Light, desaturated browns/beiges
    // H (25-40), S (0.20-0.45), L (0.55-0.72)
    // Between Beige and Light Brown
    if (h >= 25 && h < 40 && s >= 0.20 && s <= 0.45 && l >= 0.55 && l < 0.72) {
        return 'Tan';
    }
    
    // Khaki: Pale yellow-brown
    // H (40-55°), S (0.25-0.45), L (0.60-0.75)
    if (h >= 40 && h < 55 && s >= 0.25 && s <= 0.45 && l >= 0.60 && l < 0.75) {
        return 'Khaki';
    }
    
    // Dark Orange: Highly saturated, darker oranges (not browns)
    // H (25-40°: Orange range), S (0.85-1.0: Very saturated), L (0.40-0.55: Medium-dark, not too dark)
    // Adjusted to avoid catching browns - browns are darker and/or less saturated in this hue range
    if (h >= 25 && h < 40 && s >= 0.85 && s <= 1.0 && l >= 0.40 && l < 0.55) {
        return 'Dark Orange';
    }
    
    // 2. Determine Hue Name (Expanded and Adjusted)
    let hueName = '';
    // Brown: specific conditions for orange/red-orange hues with lower saturation/lightness
    // Brown: True browns are darker, muted orange-red hues
    // Browns: True browns are darker, can be moderately to highly saturated in orange-red hues
    // Extended to include desaturated reds (H=0) to catch colors like #A52A2A (Brown)
    // Extended saturation range to catch vivid dark browns that were incorrectly labeled as "Dark Orange"
    // Hue: 0-38° (red through orange-red range)
    // Saturation: 0.30-1.0 (muted to highly saturated)
    // Lightness: 0.15-0.48 (dark to medium-dark)
    const isVividDarkBrown = ((h >= 0 && h < 10) || (h >= 350 && h <= 360) || (h >= 18 && h < 38)) && s > 0.65 && s <= 1.0 && l >= 0.15 && l < 0.40;
    const isStandardBrown = ((h >= 0 && h < 10) || (h >= 350 && h <= 360) || (h >= 18 && h < 38)) && s >= 0.30 && s <= 0.65 && l >= 0.15 && l < 0.48;
    
    if (isVividDarkBrown || isStandardBrown) {
        let prefix = '';
        const coreName = 'Brown';
        
        // Vivid Brown for higher saturation within brown range (0.65-0.80)
        if (s >= 0.65 && s <= 0.80) {
            prefix = 'Vivid ';
        }
        
        // Dark Brown for lower lightness
        if (l < 0.26) {
            return prefix + 'Dark ' + coreName;
        }
        
        // For vivid dark browns specifically (darker + more saturated within brown range)
        if (isVividDarkBrown) {
            return 'Vivid ' + coreName;
        }
        
        // Light Brown for higher lightness and lower saturation
        if (l >= 0.40 && s < 0.50) {
            return 'Light Brown';
        }
        
        return prefix + coreName;
    }
    
    // Rust: Dark orange-red
    // H (15-25°), S (0.60-0.85), L (0.35-0.50)
    // Falls between Red-Orange and Brown
    if (h >= 15 && h < 25 && s >= 0.60 && s <= 0.85 && l >= 0.35 && l < 0.50) {
        return 'Rust';
    }
    
    // Terracotta: Reddish brown
    // H (10-20°), S (0.50-0.75), L (0.40-0.55)
    if (h >= 10 && h < 20 && s >= 0.50 && s <= 0.75 && l >= 0.40 && l < 0.55) {
        return 'Terracotta';
    }
    
    // Copper: Like rust but lighter
    // H (20-30°), S (0.70-0.95), L (0.45-0.60)
    if (h >= 20 && h < 30 && s >= 0.70 && s <= 0.95 && l >= 0.45 && l < 0.60) {
        return 'Copper';
    }
    
    // Maroon/Burgundy: Dark, moderately saturated reds
    // H (350-10°), S (0.40-0.70), L (0.20-0.35)
    // Wine colors distinct from both Brown and Dark Red
    const isMaroonHue = (h >= 350 && h <= 360) || (h >= 0 && h < 10);
    if (isMaroonHue && s >= 0.40 && s <= 0.70 && l >= 0.20 && l < 0.35) {
        return 'Maroon';
    }
    
    // Crimson: Vivid dark reds
    // Extended to H=340° to catch colors like #DC143C (H=348°)
    // H (340-10°), S (0.80-1.0), L (0.35-0.50)
    // More specific than "Vivid Dark Red"
    // IMPORTANT: Checked BEFORE Hot Pink to take priority
    const isCrimsonHue = (h >= 340 && h <= 360) || (h >= 0 && h < 10);
    if (isCrimsonHue && s >= 0.80 && s <= 1.0 && l >= 0.35 && l < 0.50) {
        return 'Crimson';
    }
    
    // Violet: Traditional violet range (285-310°) with moderate-high lightness
    // This distinguishes colors like #EE82EE (Violet/Plum) from Pink
    // H (285-310°), S (0.40-1.0), L (0.55-0.88)
    if (h >= 285 && h < 310 && s >= 0.40 && l >= 0.55 && l < 0.88) {
        let prefix = '';
        if (l >= 0.80) prefix = 'Pale ';
        else if (l >= 0.72) prefix = 'Light ';
        if (s >= 0.80 && l >= 0.60 && l < 0.80) prefix = 'Vivid ';
        return prefix + 'Violet';
    }
    
    // Hot Pink / Vivid Pink: Saturated medium-dark pinks in the pink-magenta range
    // H (330-350: Deep pink/hot pink range), S (>=0.75: Highly saturated), L (0.38-0.60: Medium to medium-dark)
    if (h >= 330 && h < 350 && s >= 0.75 && l >= 0.38 && l < 0.60) {
        if (s >= 0.90) {
            return 'Vivid Pink';
        }
        return 'Hot Pink';
    }
    
    // Pink: for lighter/desaturated reds and magentas. Catches hues that might otherwise be Magenta/Violet/Red if very pale.
    // Hue condition for pinkish colors (true Reds and Magentas only, excluding red-orange/peach range):
    // Narrowed to exclude 10-20° range which contains peachy/beige tones
    // Extended to 345 to cover the 340-345° gap for darker/muted pinks
    // Now excludes 285-310° (traditional violet range) by starting at 310° instead of 300°
    const isPinkHue = ((h >= 345 && h <= 360) || (h >= 0 && h < 10) || (h >= 310 && h < 345));
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
    
    // Salmon: Light pinkish-orange with descriptors
    // H (0-12°), S (0.65-0.92), L (0.65-0.85)
    // Lighter and pinker than Coral
    if (h >= 0 && h < 12 && s >= 0.65 && s <= 0.92 && l >= 0.65 && l < 0.85) {
        let prefix = '';
        if (l >= 0.78) prefix = 'Pale ';
        else if (l < 0.70) prefix = 'Deep ';
        if (s >= 0.85) prefix = 'Vivid ';
        return prefix + 'Salmon';
    }
    
    // Coral: Light orange-pinks with descriptors
    // H (5-20°), S (0.55-0.92), L (0.60-0.82)
    // Different from both Peach and Pink
    if (h >= 5 && h < 20 && s >= 0.55 && s <= 0.92 && l >= 0.60 && l < 0.82) {
        let prefix = '';
        if (l >= 0.76) prefix = 'Pale ';
        else if (l >= 0.70 && l < 0.76) prefix = 'Light ';
        else if (l < 0.65) prefix = 'Deep ';
        if (s >= 0.82 && l >= 0.62 && l < 0.76) prefix = 'Vivid ';
        return prefix + 'Coral';
    }
    
    // Rose: Light pink-red with descriptors
    // H (345-10°), S (0.45-0.85), L (0.55-0.78)
    // Different from Pink
    const isRoseHue = (h >= 345 && h <= 360) || (h >= 0 && h < 10);
    if (isRoseHue && s >= 0.45 && s <= 0.85 && l >= 0.55 && l < 0.78) {
        let prefix = '';
        if (l >= 0.72) prefix = 'Pale ';
        else if (l < 0.62) prefix = 'Deep ';
        if (s >= 0.75 && l >= 0.60 && l < 0.72) prefix = 'Vivid ';
        return prefix + 'Rose';
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
    
    // Mint: Pale cyan-greens with descriptors for range
    // H (150-170°), S (0.30-0.60), L (0.70-0.90)
    // Distinct from Seafoam (which is greener)
    if (h >= 150 && h < 170 && s >= 0.30 && s <= 0.60 && l >= 0.70 && l < 0.90) {
        let prefix = '';
        if (l >= 0.85) prefix = 'Pale ';
        else if (l >= 0.78) prefix = 'Light ';
        if (l < 0.75 && s >= 0.45) prefix = 'Vivid ';
        return prefix + 'Mint';
    }
    
    // Jade: Medium-light green with descriptors
    // H (150-170°), S (0.40-0.70), L (0.55-0.78)
    // Warmer than Mint
    if (h >= 150 && h < 170 && s >= 0.40 && s <= 0.70 && l >= 0.55 && l < 0.78) {
        let prefix = '';
        if (l >= 0.72) prefix = 'Light ';
        else if (l < 0.62) prefix = 'Dark ';
        if (s >= 0.62 && l >= 0.60 && l < 0.72) prefix = 'Vivid ';
        return prefix + 'Jade';
    }
    
    // Emerald: Vivid green
    // H (140-155°), S (0.75-1.0), L (0.40-0.60)
    // More specific than generic "Vivid Green"
    if (h >= 140 && h < 155 && s >= 0.75 && s <= 1.0 && l >= 0.40 && l < 0.60) {
        return 'Emerald';
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
    
    // Forest Green: Dark, somewhat desaturated greens
    // H (110-140°), S (0.35-0.65), L (0.18-0.35)
    if (h >= 110 && h < 140 && s >= 0.35 && s <= 0.65 && l >= 0.18 && l < 0.35) {
        return 'Forest Green';
    }
    
    // Chartreuse: Vivid yellow-green with descriptors
    // H (65-80°), S (0.65-1.0), L (0.45-0.75)
    // The gap between Yellow and Lime
    if (h >= 65 && h < 80 && s >= 0.65 && s <= 1.0 && l >= 0.45 && l < 0.75) {
        let prefix = '';
        if (l >= 0.68) prefix = 'Light ';
        else if (l < 0.55) prefix = 'Dark ';
        if (s >= 0.88) prefix = 'Vivid ';
        return prefix + 'Chartreuse';
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
    
    // Amber: Warm orange-yellow with descriptors
    // H (35-45°), S (0.70-1.0), L (0.50-0.75)
    if (h >= 35 && h < 45 && s >= 0.70 && s <= 1.0 && l >= 0.50 && l < 0.75) {
        let prefix = '';
        if (l >= 0.68) prefix = 'Light ';
        else if (l < 0.58) prefix = 'Dark ';
        return prefix + 'Amber';
    }
    
    // Mustard: Dull dark yellow
    // H (40-60°): Extended to catch darker yellows at the orange-yellow boundary
    // S (0.60-0.90): Moderate to high saturation but not as bright as gold
    // L (0.40-0.55): Dark yellows that are too dark to be gold
    // Catches colors that failed the Gold lightness test (L < 0.55)
    if (h >= 40 && h < 60 && s >= 0.60 && s <= 0.90 && l >= 0.40 && l < 0.55) {
        return 'Mustard';
    }
    
    // Brass: Yellow-gold
    // H (45-55°), S (0.60-0.90), L (0.50-0.65)
    if (h >= 45 && h < 55 && s >= 0.60 && s <= 0.90 && l >= 0.50 && l < 0.65) {
        return 'Brass';
    }
    
    // Slate: Blue-gray with descriptors
    // H (200-220°), S (0.08-0.30), L (0.35-0.68)
    if (h >= 200 && h < 220 && s >= 0.08 && s <= 0.30 && l >= 0.35 && l < 0.68) {
        let prefix = '';
        if (l >= 0.58) prefix = 'Light ';
        else if (l < 0.45) prefix = 'Dark ';
        return prefix + 'Slate';
    }
    
    // Navy: Very dark blues
    // H (220-245°), S (0.50-1.0), L (0.10-0.25)
    // Much more specific than "Deep Blue"
    // Added epsilon tolerance to catch #000080 (Navy, L≈0.2509)
    if (h >= 220 && h < 245 && s >= 0.50 && s <= 1.0 && l >= 0.10 && l <= 0.25) {
        return 'Navy';
    }
    
    // Sapphire: Deep vivid blue
    // Adjusted to avoid catching pure blue (#0000FF which has L=0.5)
    // H (235-245°), S (0.80-1.0), L (0.40-0.48)
    // Between Navy and Blue, gemstone-like
    if (h >= 235 && h < 245 && s >= 0.80 && s <= 1.0 && l >= 0.40 && l < 0.48) {
        return 'Sapphire';
    }
    
    // Sky Blue: Light blue with specific characteristics
    // H (190-210°), S (0.45-0.75), L (0.70-0.85)
    // Common color like #87CEEB
    if (h >= 190 && h < 210 && s >= 0.45 && s <= 0.75 && l >= 0.70 && l < 0.85) {
        return 'Sky Blue';
    }
    
    // Indigo: The gap between Blue and Purple for darker, saturated hues
    // Extended range to 245-280° to better capture indigo colors like #4B0082
    // H (245-280°), S (0.60-1.0), L (0.25-0.45)
    if (h >= 245 && h < 280 && s >= 0.60 && s <= 1.0 && l >= 0.25 && l < 0.45) {
        return 'Indigo';
    }
    
    // Periwinkle: Light blue-purple with descriptors
    // H (245-260°), S (0.40-0.70), L (0.65-0.88)
    // Gap between Light Blue and Lavender
    if (h >= 245 && h < 260 && s >= 0.40 && s <= 0.70 && l >= 0.65 && l < 0.88) {
        let prefix = '';
        if (l >= 0.82) prefix = 'Pale ';
        else if (l < 0.70) prefix = 'Dark ';
        if (s >= 0.62 && l >= 0.70 && l < 0.82) prefix = 'Vivid ';
        return prefix + 'Periwinkle';
    }
    
    // Lavender: Light purple/violets with descriptors
    // H (260-290°), S (0.30-0.70), L (0.65-0.88)
    // Very recognizable color, more specific than "Light Purple"
    if (h >= 260 && h < 290 && s >= 0.30 && s <= 0.70 && l >= 0.65 && l < 0.88) {
        let prefix = '';
        if (l >= 0.82) prefix = 'Pale ';
        else if (l >= 0.78 && l < 0.82) prefix = 'Light ';
        else if (l < 0.72) prefix = 'Deep ';
        if (s >= 0.60 && l >= 0.70 && l < 0.82) prefix = 'Vivid ';
        else if (s < 0.40) prefix = 'Muted ' + (prefix || '');
        return prefix.trim() + (prefix ? ' ' : '') + 'Lavender';
    }
    
    // Plum: Dark purples with descriptors
    // H (285-310°), S (0.45-0.75), L (0.22-0.45)
    if (h >= 285 && h < 310 && s >= 0.45 && s <= 0.75 && l >= 0.22 && l < 0.45) {
        let prefix = '';
        if (l < 0.28) prefix = 'Deep ';
        else if (l >= 0.38) prefix = 'Light ';
        if (s >= 0.68) prefix = 'Vivid ';
        return prefix + 'Plum';
    }
    
    // Mauve: Desaturated purples with descriptors
    // H (285-310°), S (0.15-0.40), L (0.50-0.80)
    // Muted but not dark
    if (h >= 285 && h < 310 && s >= 0.15 && s <= 0.40 && l >= 0.50 && l < 0.80) {
        let prefix = '';
        if (l >= 0.72) prefix = 'Pale ';
        else if (l >= 0.65) prefix = 'Light ';
        else if (l < 0.58) prefix = 'Dark ';
        return prefix + 'Mauve';
    }
    
    // Fuchsia: Vivid magenta
    // H (320-340°), S (0.85-1.0), L (0.50-0.65)
    // More specific than "Vivid Magenta"
    if (h >= 320 && h < 340 && s >= 0.85 && s <= 1.0 && l >= 0.50 && l < 0.65) {
        return 'Fuchsia';
    }
    
    // Define Red-Orange hue range
    const redOrangeHueStart = 10;
    const redOrangeHueEnd = 22; // Red-Orange spans from 10° to 22°
    if (h >= 350 || h < redOrangeHueStart) hueName = 'Red'; // Red: 350-360° and 0-10°
    else if (h >= redOrangeHueStart && h < redOrangeHueEnd) hueName = 'Red-Orange'; // Red-Orange: 10-22°
    else if (h >= redOrangeHueEnd && h < 40) hueName = 'Orange'; // Orange: 22-40°
    else if (h >= 35 && h < 68) hueName = 'Yellow';  // Yellow now extends up to (but not including) 68
    else if (h >= 68 && h < 80) hueName = 'Lime';    // Lime now starts at 68
    else if (h >= 80 && h < 145) hueName = 'Green';  // Green ends before 145
    else if (h >= 145 && h < 176) hueName = 'Turquoise'; // Turquoise: 145 to <176 (includes 175)
    else if (h >= 176 && h < 195) hueName = 'Teal';   // Teal: 176 to <195
    else if (h >= 195 && h < 210) hueName = 'Cyan';   // Cyan: 195 to <210
    else if (h >= 210 && h < 235) hueName = 'Azure';  // Azure: 210 to <235
    else if (h >= 235 && h < 250) hueName = 'Blue';   // Blue: 235 to <250
    else if (h >= 250 && h < 285) hueName = 'Purple'; // Purple: 250 to <285 (extended to cover #800080)
    else if (h >= 285 && h < 295) hueName = 'Violet'; // Violet: narrowed range
    else if (h >= 295 && h < 350) hueName = 'Magenta';// Magenta: extended to 295-350 (covers #FF00FF at H=300)
    else {
      // This should NEVER be reached as all hues 0-360 are covered above
      // If this executes, there's a floating-point precision bug
      console.error(`[ColorSystem] UNEXPECTED: Hue ${h}° fell through to Chroma fallback. Using Red as safety fallback.`);
      hueName = 'Red'; // Safety fallback - use Red instead of Chroma
    }
    // 3. Determine Lightness Descriptor (Adjusted thresholds)
    let lightnessDesc = '';
    if (l >= 0.83) lightnessDesc = 'Pale';         // Pale now starts at L=0.83
    else if (l >= 0.63 && l < 0.83) lightnessDesc = 'Light'; // Light now starts at L=0.63
    else if (l > 0.35 && l < 0.63) lightnessDesc = '';    // Mid-tones, no descriptor
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
    
    // Check for "Bright" - high lightness + high saturation
    // This replaces "Light" + "Vivid" with a single "Bright" descriptor
    const isBright = l >= 0.70 && l < 0.83 && s >= 0.75;
    
    // 5. Combine names
    const parts = [];
    if (saturationDesc && lightnessDesc === 'Pale' && s < 0.3) {
        // Avoid "Muted Pale Pink", prefer "Pastel Pink" or just "Pale Pink"
        // If it's already "Pastel Pink" from above, this won't apply
    } else if (isBright) {
        // Use "Bright" instead of "Light" + "Vivid" for highly saturated light colors
        parts.push('Bright');
    } else if (saturationDesc) {
        parts.push(saturationDesc);
    }
    
    // Add lightness descriptor unless it's being replaced by "Bright"
    if (lightnessDesc && !isBright) parts.push(lightnessDesc);
    
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