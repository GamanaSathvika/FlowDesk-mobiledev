import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../styles/tokens';

export const styles = StyleSheet.create({
  safeBar: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    paddingTop: spacing.xs,
  },
  barShell: {
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: colors.slate900,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 6,
  },
  indicator: {
    width: 26,
    height: 3,
    borderRadius: 4,
    backgroundColor: colors.blue500,
    opacity: 0,
  },
  indicatorActive: {
    opacity: 1,
  },
  icon: {
    fontSize: 18,
    lineHeight: 18,
    color: colors.gray500,
  },
  iconActive: {
    color: colors.blue500,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.15,
    color: colors.gray500,
  },
  labelActive: {
    color: colors.blue500,
  },
});

