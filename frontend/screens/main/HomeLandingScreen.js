import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { tasksApi } from '../../api/tasks';
import { useTheme } from '../../theme/ThemeProvider';
import { createHomeStyles } from '../../theme/homeStyles';
import { formatDueDate, isTaskInTodaysSection, isTaskInTodaysProgress } from '../../utils/dateHelpers';

function ProgressRing({ pct = 0, size = 88, stroke = 7, theme, styles }) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const safePct = isNaN(pct) ? 0 : pct;
  const offset = circumference - (safePct / 100) * circumference;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={r} stroke={theme.borderLight} strokeWidth={stroke} fill="none" />
        <Circle
          cx={center} cy={center} r={r}
          stroke={theme.progressPrimary} strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={isNaN(offset) ? circumference : offset}
          rotation="-90"
          originX={center}
          originY={center}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.ringPct}>{safePct}%</Text>
          <Text style={styles.ringLabel}>done</Text>
      </View>
    </View>
  );
}

function SectionHeader({ title, link, onLinkPress, styles }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {link ? (
        <Pressable onPress={onLinkPress} hitSlop={12}>
          <Text style={styles.sectionLink}>{link}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function TaskRow({ task, onToggle, theme, styles }) {
  const tag = theme.priority[task.priority || task.tag] || theme.priority.Low;
  return (
    <View style={styles.taskRow}>
      <Pressable
        onPress={() => onToggle(task.id)}
        style={[styles.taskCheck, task.done ? styles.taskCheckDone : styles.taskCheckUndone]}
      >
        {task.done && <Ionicons name="checkmark" size={12} color={theme.onPrimary} />}
      </Pressable>
      <View style={styles.taskBody}>
        <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]} numberOfLines={1}>{task.title}</Text>
        <Text style={styles.taskMeta}>{formatDueDate(task.dueAt)}</Text>
      </View>
      <View style={[styles.taskTag, { backgroundColor: tag.bg }]}>
        <Text style={[styles.taskTagText, { color: tag.text }]}>{task.priority || task.tag}</Text>
      </View>
    </View>
  );
}

export default function HomeLandingScreen({ profile, onNavigate }) {
  const { theme } = useTheme();
  const s = useMemo(() => createHomeStyles(theme), [theme]);
  const [tasks, setTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [focusStats, setFocusStats] = useState({ totalSecondsToday: 0, sessionCount: 0 });

  const pendingTodayTasks = useMemo(
    () => tasks.filter(isTaskInTodaysSection),
    [tasks],
  );

  const archivedCompletedToday = useMemo(
    () => archivedTasks.filter((t) => t.done && isTaskInTodaysProgress(t)),
    [archivedTasks],
  );

  const progressTotal = pendingTodayTasks.length + archivedCompletedToday.length;
  const progressDone = archivedCompletedToday.length;
  const hasDueTodayTasks = progressTotal > 0;
  const pct = useMemo(() => {
    if (!hasDueTodayTasks) return 0;
    return Math.round((progressDone / progressTotal) * 100);
  }, [progressDone, progressTotal, hasDueTodayTasks]);

  const pendingToday = useMemo(
    () => pendingTodayTasks.slice(0, 3),
    [pendingTodayTasks],
  );

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    try {
      const updated = await tasksApi.updateTask(id, { done: !task.done });
      if (updated.archived && updated.done) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        setArchivedTasks((prev) => [updated, ...prev.filter((t) => t.id !== id)]);
      } else {
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
    } catch (err) { console.error(err); }
  };

  const refreshData = useCallback(async () => {
  try {
    const [taskData, archivedData, stats] = await Promise.all([
      tasksApi.getTasks(),
      tasksApi.getArchivedTasks(),
      tasksApi.getFocusStats(),
    ]);

    setTasks(taskData || []);
    setArchivedTasks(archivedData || []);
    
    // Explicitly update state
    if (stats) {
      setFocusStats({
        totalSecondsToday: Number(stats.totalSecondsToday) || 0,
        sessionCount: Number(stats.sessionCount) || 0
      });
    }
  } catch (error) { 
    console.warn("Refresh Data Error:", error); 
  }
}, []);

useEffect(() => { refreshData(); }, [refreshData]);

  const formatFocusTime = (totalSeconds) => {
    const val = parseInt(totalSeconds) || 0;
    const h = Math.floor(val / 3600);
    const m = Math.floor((val % 3600) / 60);
    const s = val % 60; // Get remaining seconds

    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`; // This will now show "10s" instead of "0m"
  };
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.background} />
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        
        <View style={s.header}>
          <View style={s.logoRow}>
            <View style={s.logoBox}><Ionicons name="flash" size={20} color={theme.primary} /></View>
            <Text style={s.appName}>FlowDesk</Text>
          </View>
          <Pressable onPress={() => onNavigate('settings')} style={s.iconBtn}>
            <Ionicons name="settings-outline" size={20} color={theme.textSecondary} />
          </Pressable>
        </View>

        <View style={s.greeting}>
          <Text style={s.greetingMain}>Hello, {profile?.name || 'User'}!</Text>
          <Text style={s.greetingSub}>Let's finish your goals today.</Text>
        </View>

        <View style={s.progressCard}>
          <ProgressRing pct={pct} size={88} stroke={7} theme={theme} styles={s} />
          <View style={s.progressInfo}>
            <Text style={s.progressEyebrow}>TODAY'S PROGRESS</Text>
            <Text style={s.progressHeading}>
              {hasDueTodayTasks ? `${progressDone} of ${progressTotal} tasks` : 'No tasks due today'}
            </Text>
            {hasDueTodayTasks ? (
              <View style={s.progressBarRow}>
                <View style={s.progressBarBg}><View style={[s.progressBarFill, { width: `${pct}%` }]} /></View>
                <Text style={s.progressBarPct}>{pct}%</Text>
              </View>
            ) : null}
          </View>
        </View>

        <SectionHeader title="Today's Tasks" link="See all" onLinkPress={() => onNavigate('tasks')} styles={s} />
        {pendingToday.length > 0 ? (
          <View style={s.tasksList}>
            {pendingToday.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} theme={theme} styles={s} />
            ))}
          </View>
        ) : (
          <View style={s.tasksEmpty}>
            <Text style={s.tasksEmptyTitle}>🎉 All tasks are done!</Text>
            <Text style={s.tasksEmptySub}>No tasks due today.</Text>
          </View>
        )}

        <View style={s.focusCard}>
          <View>
            <Text style={s.focusEyebrow}>FOCUS TIME TODAY</Text>
            <Text style={s.focusTime}>{formatFocusTime(focusStats.totalSecondsToday)}</Text>
            <Text style={s.focusSub}>{focusStats.sessionCount || 0} sessions completed</Text>
          </View>
          <Pressable onPress={() => onNavigate('focus')} style={s.focusBtn}>
            <Ionicons name="timer-outline" size={15} color={theme.onPrimary} />
            <Text style={s.focusBtnText}>Start</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
