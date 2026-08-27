export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  danger: string;
  dangerDark: string;
  warning: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textLight: string;
  border: string;
  borderLight: string;
  overlay: string;
  white: string;
  black: string;
  placeholder: string;
  transparent: string;
  card: string;
  cardBorder: string;
}

export const LightColors: ThemeColors = {
  primary: '#4F46E5',
  primaryDark: '#4338CA',
  primaryLight: '#818CF8',
  secondary: '#10B981',
  secondaryDark: '#059669',
  danger: '#EF4444',
  dangerDark: '#DC2626',
  warning: '#F59E0B',
  background: '#F3F4F6',
  surface: '#FFFFFF',
  surfaceAlt: '#F9FAFB',
  text: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  overlay: 'rgba(0,0,0,0.5)',
  white: '#FFFFFF',
  black: '#000000',
  placeholder: '#9CA3AF',
  transparent: 'transparent',
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
};

export const DarkColors: ThemeColors = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#A5B4FC',
  secondary: '#10B981',
  secondaryDark: '#059669',
  danger: '#F87171',
  dangerDark: '#EF4444',
  warning: '#FBBF24',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceAlt: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textLight: '#64748B',
  border: '#334155',
  borderLight: '#1E293B',
  overlay: 'rgba(0,0,0,0.75)',
  white: '#FFFFFF',
  black: '#000000',
  placeholder: '#64748B',
  transparent: 'transparent',
  card: '#1E293B',
  cardBorder: '#334155',
};

export const Colors = LightColors;
