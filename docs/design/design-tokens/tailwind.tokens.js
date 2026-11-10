// Merge into tailwind.config: theme: { extend: require('./docs/design/design-tokens/tailwind.tokens.js') }
module.exports = {
  colors: {
    brand: { DEFAULT: '#C8281E', hover: '#A8201A', tint: '#FDECEA' },
    ink: { DEFAULT: '#14161B', 2: '#2B2F38', muted: '#4A505E', subtle: '#5F6675' },
    page: '#F5F6F8',
    surface: '#FFFFFF',
    track: '#EEF0F3',
    line: { DEFAULT: '#E4E6EB', strong: '#D5D9E0' },
    ok: { fg: '#126C34', bg: '#E7F6EC' },
    warn: { fg: '#7A4F00', bg: '#FFF4D6' },
    fail: { fg: '#FFFFFF', bg: '#14161B' }
  },
  fontFamily: {
    sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
    arabic: ['"Noto Sans Arabic"', 'sans-serif']
  },
  fontSize: {
    caption: ['12px', '16px'],
    body: ['14px', '20px'],
    section: ['16px', '22px'],
    panel: ['20px', '26px'],
    title: ['28px', '34px']
  },
  borderRadius: { field: '10px', button: '12px', card: '16px', sheet: '20px' },
  spacing: { sidebar: '232px', topbar: '56px', brief: '260px', inspector: '320px', tap: '44px' }
};
