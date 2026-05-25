import { StyleSheet, Platform, StatusBar } from 'react-native';

export function createBarChartStyles(t) {
  return StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 5 },
    col: { flex: 1, alignItems: 'center', gap: 5 },
    barWrap: { width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
    bar: { width: '100%', borderRadius: 5 },
    label: { fontSize: 10, color: t.textTertiary, fontWeight: '500' },
  });
}

export function createSegmentStyles(t) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    label: { fontSize: 12, color: t.textSecondary, fontWeight: '600', width: 80 },
    track: { flex: 1, height: 8, backgroundColor: t.borderLight, borderRadius: 99, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 99 },
    pct: { fontSize: 11, fontWeight: '700', width: 32, textAlign: 'right' },
  });
}

export function createAnalyticsStyles(t) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0 },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 8 },
    header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 24 : 20, paddingBottom: 12 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: t.textPrimary, letterSpacing: -0.5 },
    headerSub: { fontSize: 13, color: t.textTertiary, marginTop: 3 },
    iconBtn: { width: 36, height: 36, backgroundColor: t.surface, borderWidth: 1, borderColor: t.borderSubtle, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    rangeScroll: { marginBottom: 14 },
    rangeRow: { paddingHorizontal: 16, gap: 8 },
    rangeChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 99, borderWidth: 1, borderColor: t.borderSubtle, backgroundColor: t.surface },
    rangeChipActive: { backgroundColor: t.primary, borderColor: t.primary },
    rangeChipText: { fontSize: 11, fontWeight: '700', color: t.textSecondary },
    rangeChipTextActive: { color: t.onPrimary },
    summaryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 14 },
    sumCard: { flex: 1, backgroundColor: t.elevatedSurface, borderWidth: 1, borderColor: t.borderSubtle, borderRadius: 16, padding: 12, shadowColor: t.shadow, shadowOpacity: t.cardShadowOpacity, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: t.cardElevation },
    sumIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    sumVal: { fontSize: 18, fontWeight: '800', color: t.textPrimary, letterSpacing: -0.5, lineHeight: 22 },
    sumLbl: { fontSize: 10, color: t.textTertiary, fontWeight: '600', marginTop: 3, lineHeight: 14 },
    sumTrend: { fontSize: 9, fontWeight: '700', marginTop: 5 },
    card: { marginHorizontal: 16, marginBottom: 14, backgroundColor: t.elevatedSurface, borderWidth: 1, borderColor: t.borderSubtle, borderRadius: 20, padding: 18, shadowColor: t.shadow, shadowOpacity: t.cardShadowOpacity, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: t.cardElevation },
    cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    cardTitle: { fontSize: 14, fontWeight: '700', color: t.textPrimary },
    badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7 },
    badgeText: { fontSize: 10, fontWeight: '700' },
    badgeGreen: { backgroundColor: t.priority.Low.bg },
    badgeBlue: { backgroundColor: t.primarySoft },
    badgeAmber: { backgroundColor: t.priority.Medium.bg },
    chartFooter: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, marginTop: 6, borderTopWidth: 1, borderTopColor: t.borderLight },
    chartStat: { flex: 1, alignItems: 'center' },
    chartStatVal: { fontSize: 15, fontWeight: '800', color: t.textPrimary },
    chartStatLbl: { fontSize: 10, color: t.textTertiary, marginTop: 2 },
    chartStatDivider: { width: 1, height: 28, backgroundColor: t.borderLight },
    focusStatsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: t.inputBg, borderRadius: 12, marginBottom: 14, overflow: 'hidden' },
    focusStat: { flex: 1, alignItems: 'center', padding: 12 },
    focusStatVal: { fontSize: 15, fontWeight: '800', color: t.textPrimary, letterSpacing: -0.3 },
    focusStatLbl: { fontSize: 10, color: t.textTertiary, marginTop: 3 },
    focusStatDivider: { width: 1, height: 28, backgroundColor: t.border },
    sectionMicroLbl: { fontSize: 10, fontWeight: '700', color: t.textTertiary, letterSpacing: 0.8, marginBottom: 10 },
    legendRow: { flexDirection: 'row', gap: 12, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: t.borderLight },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 11, color: t.textSecondary },
    streakCard: { marginHorizontal: 16, marginBottom: 14, backgroundColor: t.elevatedSurface, borderWidth: 1, borderColor: t.borderSubtle, borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16, shadowColor: t.shadow, shadowOpacity: t.cardShadowOpacity, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: t.cardElevation },
    streakFlame: { width: 52, height: 52, backgroundColor: t.priority.Medium.bg, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    streakBody: { flex: 1 },
    streakVal: { fontSize: 18, fontWeight: '800', color: t.textPrimary, letterSpacing: -0.4 },
    streakLbl: { fontSize: 12, color: t.textTertiary, marginTop: 2 },
    streakDots: { flexDirection: 'row', gap: 5, marginTop: 10 },
    streakDot: { flex: 1, height: 6, borderRadius: 99 },
    insightCard: { marginHorizontal: 16, backgroundColor: t.primarySoft, borderWidth: 1, borderColor: t.primarySoftBorder, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    insightEyebrow: { fontSize: 10, fontWeight: '700', color: t.primary, letterSpacing: 0.8, marginBottom: 5 },
    insightText: { fontSize: 12, color: t.primary, fontWeight: '500', lineHeight: 18 },
  });
}
