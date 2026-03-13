export const colors = {
  bg: '#0A0A0F',
  bgCard: '#13131A',
  bgElevated: '#1C1C26',
  primary: '#2563EB', // slightly darker blue
  primaryLight: '#60A5FA', // lighter but still blue
  primaryDark: '#1E40AF', // much darker blue
  primaryGlow: 'rgba(108, 99, 255, 0.15)',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerGlow: 'rgba(239, 68, 68, 0.15)',
  textPrimary: '#F0F0F8',
  textSecondary: '#9090A8',
  textMuted: '#5A5A70',
  border: '#2A2A38',
  borderLight: '#3A3A50',
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400', color: colors.textSecondary },
  bodyBold: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '400', color: colors.textMuted },
  captionBold: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  label: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.2, textTransform: 'uppercase' },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  glow: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  }),
};