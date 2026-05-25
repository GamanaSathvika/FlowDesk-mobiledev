import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAnalytics } from '../../api/analytics';
import { useTheme } from '../../theme/ThemeProvider';
import { createAnalyticsStyles, createBarChartStyles, createSegmentStyles } from '../../theme/analyticsStyles';

const RANGES = [
  { key: 'week',    label: 'This week'  },
  { key: 'month',   label: 'This month' },
  { key: 'quarter', label: 'Quarter'    },
];

function SectionCard({ children, style, cardStyle }) {
  return <View style={[cardStyle, style]}>{children}</View>;
}

function CardHeader({ title, badge, badgeStyle, badgeTextStyle, styles }) {
  return (
    <View style={styles.cardHead}>
      <Text style={styles.cardTitle}>{title}</Text>
      {badge ? (
        <View style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, badgeTextStyle]}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

function BarChart({ data, maxVal, barColor, height = 80, bc }) {
  const max = maxVal || Math.max(...data.map(d => d.v), 1);
  return (
    <View style={[bc.wrap, { height: height + 20 }]}>
      {data.map((d, i) => {
        const barH = Math.max(4, Math.round((d.v / max) * height));
        const color = typeof barColor === 'function' ? barColor(d, i) : barColor;
        return (
          <View key={i} style={bc.col}>
            <View style={bc.barWrap}>
              <View style={[bc.bar, { height: barH, backgroundColor: color }]} />
            </View>
            <Text style={bc.label}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function SegmentBar({ label, pct, color, sg }) {
  return (
    <View style={sg.row}>
      <Text style={sg.label}>{label}</Text>
      <View style={sg.track}>
        <View style={[sg.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[sg.pct, { color }]}>{pct}%</Text>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const s = useMemo(() => createAnalyticsStyles(theme), [theme]);
  const bc = useMemo(() => createBarChartStyles(theme), [theme]);
  const sg = useMemo(() => createSegmentStyles(theme), [theme]);

  const [range, setRange] = useState('week');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const data = await getAnalytics(range);
        if (!mounted) return;
        setAnalyticsData(data);
      } catch (error) {
        console.log("Analytics loading error:", error);
        if (mounted) setAnalyticsData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAnalytics();
    return () => { mounted = false; };
  }, [range]);

  // Root fallback object
  const d = analyticsData || {};

  // Structural sub-object fallbacks to safeguard rendering properties
  const summary = d.summary || { tasks: 0, focus: '0s', score: 0 };
  const completedTotal = d.completedCount ?? summary.tasks ?? 0;
  const trend = d.trend || { focus: '', score: '' };
  const bars = d.bars || [];
  const completion = d.completion || { completed: 0, inProgress: 0, pending: 0 };
  const focusStats = d.focusStats || { total: '0s', avg: '0s', sessions: 0 };

  const weeklyBarColor = useCallback((item) => {
    if (item.label === d?.bestDay) return theme.chartStrong;
    if (item.v >= 5) return theme.chartMid;
    if (item.v >= 2) return theme.chartLight;
    return theme.chartMuted;
  }, [d?.bestDay, theme]);

  const focusBarColor = useCallback((item) => {
    if (item.label === d?.bestDay) return theme.focusGreenStrong;
    if (item.v >= 600) return theme.focusGreenMid;
    if (item.v >= 300) return theme.focusGreenLight;
    return theme.focusGreenMuted;
  }, [d?.bestDay, theme]);

  if (loading) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.background} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Analytics</Text>
            <Text style={s.headerSub}>Track your productivity</Text>
          </View>
          <Pressable style={s.iconBtn} hitSlop={8}>
            <Ionicons name="calendar-outline" size={19} color={theme.textSecondary} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.rangeRow}
          style={s.rangeScroll}
        >
          {RANGES.map(r => (
            <Pressable
              key={r.key}
              onPress={() => setRange(r.key)}
              style={[s.rangeChip, range === r.key && s.rangeChipActive]}
            >
              <Text style={[s.rangeChipText, range === r.key && s.rangeChipTextActive]}>
                {r.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={s.summaryRow}>
          <View style={s.sumCard}>
            <View style={[s.sumIcon, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="checkmark-done-outline" size={15} color={theme.primary} />
            </View>
            <Text style={s.sumVal}>{completedTotal}</Text>
            <Text style={s.sumLbl}>Tasks done{'\n'}today</Text>
            <Text style={[s.sumTrend, { color: theme.success }]}>Score: {summary.score}%</Text>
          </View>

          <View style={s.sumCard}>
            <View style={[s.sumIcon, { backgroundColor: theme.priority.Low.bg }]}>
              <Ionicons name="time-outline" size={15} color={theme.priority.Low.text} />
            </View>
            <Text style={s.sumVal}>{summary.focus}</Text>
            <Text style={s.sumLbl}>Focus{'\n'}today</Text>
            <Text style={[s.sumTrend, { color: theme.success }]}>{trend.focus}</Text>
          </View>

          <View style={s.sumCard}>
            <View style={[s.sumIcon, { backgroundColor: theme.priority.Medium.bg }]}>
              <Ionicons name="star-outline" size={15} color={theme.warning} />
            </View>
            <Text style={s.sumVal}>{summary.score}%</Text>
            <Text style={s.sumLbl}>Productivity{'\n'}score</Text>
            <Text style={[s.sumTrend, { color: theme.success }]}>{trend.score}</Text>
          </View>
        </View>

        <SectionCard cardStyle={s.card}>
          <CardHeader
            title="Weekly Progress"
            badge="Live update"
            badgeStyle={s.badgeGreen}
            badgeTextStyle={{ color: theme.priority.Low.text }}
            styles={s}
          />
          <BarChart
            data={bars.map(b => ({ v: b.tasks || 0, label: b.day || '' }))}
            barColor={weeklyBarColor}
            height={80}
            bc={bc}
          />
          <View style={s.chartFooter}>
            <View style={s.chartStat}>
              <Text style={s.chartStatVal}>{d.totalCompletedHistory ?? d.totalTasks ?? 0}</Text>
              <Text style={s.chartStatLbl}>Total completed</Text>
            </View>
            <View style={s.chartStatDivider} />
            <View style={s.chartStat}>
              <Text style={[s.chartStatVal, { color: theme.primary }]}>{d.bestDay || '-'}</Text>
              <Text style={s.chartStatLbl}>Best day</Text>
            </View>
            <View style={s.chartStatDivider} />
            <View style={s.chartStat}>
              <Text style={s.chartStatVal}>{d.avgPerDay || 0}</Text>
              <Text style={s.chartStatLbl}>Avg / day</Text>
            </View>
          </View>
        </SectionCard>

        <SectionCard cardStyle={s.card}>
          <CardHeader
            title="Focus Time"
            badge={focusStats.total + ' tracked'}
            badgeStyle={s.badgeBlue}
            badgeTextStyle={{ color: theme.primary }}
            styles={s}
          />
          <View style={s.focusStatsRow}>
            <View style={s.focusStat}>
              <Text style={s.focusStatVal}>{focusStats.total}</Text>
              <Text style={s.focusStatLbl}>Total</Text>
            </View>
            <View style={s.focusStatDivider} />
            <View style={s.focusStat}>
              <Text style={s.focusStatVal}>{focusStats.avg}</Text>
              <Text style={s.focusStatLbl}>Avg session</Text>
            </View>
            <View style={s.focusStatDivider} />
            <View style={s.focusStat}>
              <Text style={s.focusStatVal}>{focusStats.sessions}</Text>
              <Text style={s.focusStatLbl}>Sessions</Text>
            </View>
          </View>

          <Text style={s.sectionMicroLbl}>DAILY BREAKDOWN</Text>
          <BarChart
            data={bars.map(b => ({ v: b.focus || 0, label: b.day || '' }))}
            barColor={focusBarColor}
            height={52}
            bc={bc}
          />
        </SectionCard>

        <SectionCard cardStyle={s.card}>
          <CardHeader
            title="Task Completion"
            badge={`${completion.pending}% remaining`}
            badgeStyle={s.badgeAmber}
            badgeTextStyle={{ color: theme.warning }}
            styles={s}
          />
          <SegmentBar label="Completed" pct={completion.completed} color={theme.primary} sg={sg} />
          <SegmentBar label="In Progress" pct={completion.inProgress} color={theme.warning} sg={sg} />
          <SegmentBar label="Pending" pct={completion.pending} color={theme.textTertiary} sg={sg} />

          <View style={s.legendRow}>
            {[
              { color: theme.primary, label: 'Completed' },
              { color: theme.warning, label: 'In Progress' },
              { color: theme.textTertiary, label: 'Pending' },
            ].map(item => (
              <View key={item.label} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: item.color }]} />
                <Text style={s.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <View style={s.streakCard}>
          <View style={s.streakFlame}>
            <Ionicons name="flame" size={26} color={theme.warning} />
          </View>
          <View style={s.streakBody}>
            <Text style={s.streakVal}>{d.streakDays || 0}-day streak</Text>
            <Text style={s.streakLbl}>Keep going — consistency rules!</Text>
            <View style={s.streakDots}>
              {Array.from({ length: 7 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    s.streakDot,
                    { backgroundColor: i < (d.streakDays || 0) ? theme.primary : theme.border },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={s.insightCard}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={theme.primary}
            style={{ flexShrink: 0, marginTop: 1 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={s.insightEyebrow}>PERFORMANCE INSIGHT</Text>
            <Text style={s.insightText}>{d.insight || 'No insight data compiled for this scope.'}</Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}