import { StyleSheet } from 'react-native';

export const RING_SIZE = 220;

export function getFocusModes(theme) {
  return [
    { key: 'focus', label: 'Focus', duration: 25 * 60, color: theme.primary, bgColor: theme.primarySoft, tip: 'Work for 25 minutes.' },
    { key: 'short', label: 'Short Break', duration: 5 * 60, color: theme.priority.Low.text, bgColor: theme.priority.Low.bg, tip: 'Take a 5 min break.' },
    { key: 'long', label: 'Long Break', duration: 15 * 60, color: theme.primary, bgColor: theme.primarySoft, tip: 'Take a 15 min break.' },
  ];
}

export function createFocusStyles(t) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    scrollContent: { padding: 20 },
    header: { alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: t.textPrimary },
    headerSub: { fontSize: 13, color: t.textTertiary },
    modesRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
    modeChip: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: t.borderSubtle, alignItems: 'center', backgroundColor: t.surface },
    modeChipText: { fontSize: 11, fontWeight: '700', color: t.textSecondary },
    modeChipTextActive: { color: t.onPrimary },
    timerSection: { marginVertical: 30 },
    controls: { flexDirection: 'row', gap: 12, marginBottom: 30 },
    mainBtn: { flex: 1, flexDirection: 'row', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10 },
    mainBtnText: { color: t.onPrimary, fontWeight: '700', fontSize: 16 },
    resetBtn: { width: 56, height: 56, borderRadius: 16, backgroundColor: t.surface, borderWidth: 1, borderColor: t.borderSubtle, alignItems: 'center', justifyContent: 'center' },
    taskCard: {
      backgroundColor: t.surface,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: t.borderSubtle,
      shadowColor: t.shadow,
      shadowOpacity: t.cardShadowOpacity,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: t.cardElevation,
    },
    taskIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    taskBody: { flex: 1 },
    taskEyebrow: { fontSize: 10, fontWeight: '700', color: t.textTertiary, marginBottom: 2 },
    taskTitle: { fontSize: 14, fontWeight: '700', color: t.textPrimary },
    statsRow: { flexDirection: 'row', gap: 12 },
    statCard: { flex: 1, backgroundColor: t.elevatedSurface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: t.borderSubtle, shadowColor: t.shadow, shadowOpacity: t.cardShadowOpacity, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: t.cardElevation },
    statVal: { fontSize: 20, fontWeight: '800', color: t.textPrimary },
    statLbl: { fontSize: 12, color: t.textTertiary },
    modalOverlay: { flex: 1, backgroundColor: t.overlay, justifyContent: 'flex-end' },
    modalContent: { backgroundColor: t.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: t.textPrimary },
    taskItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.borderLight },
    taskItemText: { fontSize: 16, color: t.textPrimary },
    ringWrap: { width: RING_SIZE, height: RING_SIZE, alignSelf: 'center', position: 'relative' },
    ringCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
    ringTime: { fontSize: 52, fontWeight: '800', color: t.textPrimary, letterSpacing: -2 },
    ringStateLbl: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8 },
  });
}
