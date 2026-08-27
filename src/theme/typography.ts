import {TextStyle} from 'react-native';

export const Typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  captionBold: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  small: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
};
