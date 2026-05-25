import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../styles/tokens';

export const styles = StyleSheet.create({
  screenWrap: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: 92,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: colors.slate900,
    shadowOpacity: 0.10,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    padding: 22,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.slate900,
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: colors.gray500,
    lineHeight: 20,
  },
  hint: {
    marginTop: 14,
    fontSize: 13,
    color: colors.slate500,
    lineHeight: 18,
  },
});

