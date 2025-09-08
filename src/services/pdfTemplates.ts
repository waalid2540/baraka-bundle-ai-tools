// BarakahTool Premium PDF Templates
// Powerful Islamic Design Templates with Multiple Themes

export interface PDFTheme {
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  arabicGlow: string
  borderStyle: 'classic' | 'modern' | 'ornate' | 'minimal'
}

export const PDF_THEMES: { [key: string]: PDFTheme } = {
  // 🌙 Night Prayer Theme - Deep blues and silver
  nightPrayer: {
    name: 'Night Prayer',
    primary: '#1e3a8a',      // Deep blue
    secondary: '#60a5fa',    // Light blue
    accent: '#c0c0c0',       // Silver
    background: '#f0f9ff',   // Very light blue
    text: '#1e293b',         // Dark slate
    arabicGlow: 'rgba(96, 165, 250, 0.3)',
    borderStyle: 'ornate'
  },
  
  // 🌅 Fajr Dawn Theme - Pink and purple gradients
  fajrDawn: {
    name: 'Fajr Dawn',
    primary: '#9333ea',      // Purple
    secondary: '#ec4899',    // Pink
    accent: '#fbbf24',       // Gold
    background: '#fdf4ff',   // Light purple
    text: '#581c87',         // Dark purple
    arabicGlow: 'rgba(236, 72, 153, 0.3)',
    borderStyle: 'modern'
  },
  
  // 🕌 Masjid Green Theme - Traditional Islamic green
  masjidGreen: {
    name: 'Masjid Green',
    primary: '#15803d',      // Islamic green
    secondary: '#22c55e',    // Light green
    accent: '#fbbf24',       // Gold
    background: '#f0fdf4',   // Light green tint
    text: '#14532d',         // Dark green
    arabicGlow: 'rgba(34, 197, 94, 0.3)',
    borderStyle: 'classic'
  },
  
  // ✨ Royal Gold Theme - Luxury gold and black
  royalGold: {
    name: 'Royal Gold',
    primary: '#a16207',      // Dark gold
    secondary: '#fbbf24',    // Bright gold
    accent: '#f59e0b',       // Amber
    background: '#fffbeb',   // Light gold
    text: '#451a03',         // Dark brown
    arabicGlow: 'rgba(251, 191, 36, 0.4)',
    borderStyle: 'ornate'
  },
  
  // 🌹 Rose Garden Theme - Soft pink and red
  roseGarden: {
    name: 'Rose Garden',
    primary: '#be123c',      // Rose red
    secondary: '#fb7185',    // Pink
    accent: '#fda4af',       // Light pink
    background: '#fff1f2',   // Very light pink
    text: '#881337',         // Dark rose
    arabicGlow: 'rgba(251, 113, 133, 0.3)',
    borderStyle: 'modern'
  },
  
  // 🌊 Ocean Depth Theme - Teal and cyan
  oceanDepth: {
    name: 'Ocean Depth',
    primary: '#0f766e',      // Teal
    secondary: '#14b8a6',    // Light teal
    accent: '#06b6d4',       // Cyan
    background: '#f0fdfa',   // Light teal tint
    text: '#134e4a',         // Dark teal
    arabicGlow: 'rgba(20, 184, 166, 0.3)',
    borderStyle: 'minimal'
  },
  
  // 🔥 Sunset Orange Theme - Warm oranges and reds
  sunsetOrange: {
    name: 'Sunset Orange',
    primary: '#c2410c',      // Dark orange
    secondary: '#fb923c',    // Light orange
    accent: '#fcd34d',       // Yellow
    background: '#fff7ed',   // Light orange tint
    text: '#7c2d12',         // Dark orange brown
    arabicGlow: 'rgba(251, 146, 60, 0.3)',
    borderStyle: 'modern'
  },
  
  // ⚫ Midnight Black Theme - Elegant black and silver
  midnightBlack: {
    name: 'Midnight Black',
    primary: '#000000',      // Black
    secondary: '#525252',    // Gray
    accent: '#fbbf24',       // Gold accent
    background: '#fafafa',   // Light gray
    text: '#171717',         // Near black
    arabicGlow: 'rgba(251, 191, 36, 0.5)',
    borderStyle: 'minimal'
  }
}

// Border decoration patterns
export const BORDER_PATTERNS = {
  classic: {
    corners: 'islamic-star',
    lines: 'double',
    ornaments: ['crescents', 'stars']
  },
  modern: {
    corners: 'geometric',
    lines: 'gradient',
    ornaments: ['dots', 'diamonds']
  },
  ornate: {
    corners: 'floral',
    lines: 'decorated',
    ornaments: ['arabesques', 'calligraphy']
  },
  minimal: {
    corners: 'simple',
    lines: 'single',
    ornaments: ['dots']
  }
}

// Arabic text formatter with tashkeel
export const formatArabicWithTashkeel = (text: string): string => {
  // This ensures the text maintains proper tashkeel
  // The AI should generate text with tashkeel already included
  // This function can add additional formatting if needed
  
  // Common diacritical marks in Arabic
  const tashkeel = {
    fatha: '\u064E',     // َ
    kasra: '\u0650',     // ِ
    damma: '\u064F',     // ُ
    sukun: '\u0652',     // ْ
    shadda: '\u0651',    // ّ
    tanweenFath: '\u064B', // ً
    tanweenKasr: '\u064D', // ٍ
    tanweenDamm: '\u064C', // ٌ
  }
  
  // Return text as-is since AI should provide it with tashkeel
  // Add any additional processing here if needed
  return text
}

// Template-specific decorations
export const getTemplateDecorations = (theme: PDFTheme) => {
  const decorations: any = {
    header: {
      bismillah: theme.name === 'Masjid Green' || theme.name === 'Royal Gold',
      ayahSymbol: theme.name === 'Night Prayer',
      crescentMoon: theme.name === 'Fajr Dawn',
      geometricPattern: theme.name === 'Ocean Depth' || theme.name === 'Sunset Orange'
    },
    footer: {
      propheticSeal: theme.name === 'Masjid Green',
      stars: theme.name === 'Night Prayer' || theme.name === 'Midnight Black',
      florals: theme.name === 'Rose Garden',
      waves: theme.name === 'Ocean Depth'
    },
    arabicFrame: {
      style: BORDER_PATTERNS[theme.borderStyle],
      color: theme.primary,
      accent: theme.accent
    }
  }
  
  return decorations
}

// Get theme by name
export const getTheme = (themeName: string): PDFTheme => {
  return PDF_THEMES[themeName] || PDF_THEMES.royalGold
}

// Get all theme names for selector
export const getThemeNames = (): string[] => {
  return Object.keys(PDF_THEMES)
}

// Special Arabic fonts configuration
export const ARABIC_FONTS = {
  traditional: {
    name: 'Amiri',
    style: 'classical',
    size: 24
  },
  modern: {
    name: 'Cairo',
    style: 'contemporary',
    size: 22
  },
  calligraphy: {
    name: 'Diwani',
    style: 'decorative',
    size: 26
  }
}

// Template layouts
export const TEMPLATE_LAYOUTS = {
  centered: {
    arabicAlign: 'center',
    translationAlign: 'center',
    padding: 40
  },
  traditional: {
    arabicAlign: 'right',
    translationAlign: 'left',
    padding: 30
  },
  modern: {
    arabicAlign: 'center',
    translationAlign: 'justify',
    padding: 35
  }
}