import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, SafeAreaView, StatusBar,
  ScrollView, Vibration, ActivityIndicator, Alert, Modal, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

// ✅ Pointing to your existing api folder
import { tasksApi } from '../../api/tasks';
import { useTheme } from '../../theme/ThemeProvider';
import { createFocusStyles, getFocusModes, RING_SIZE } from '../../theme/focusStyles';

const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function fmtTimer(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ✅ FIXED: Displays seconds ('s') if time is under 1 minute so your 10s tests update instantly!
function fmtDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  if (h === 0 && m === 0) {
    return `${s}s`; 
  }

  if (h > 0) return `${h}h ${m > 0 ? m + 'm' : ''}`.trim();
  return `${m}m`;
}

function TimerRing({ remaining, total, color, state, styles, theme }) {
  const pct = total > 0 ? remaining / total : 1;
  const offset = CIRCUMFERENCE * (1 - pct);
  const center = RING_SIZE / 2;
  const stateColor = state === 'paused' ? theme.warning : color;

  return (
    <View style={styles.ringWrap}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle cx={center} cy={center} r={RING_RADIUS} stroke={theme.borderLight} strokeWidth={RING_STROKE} fill="none" />
        <Circle
          cx={center} cy={center} r={RING_RADIUS} stroke={stateColor} strokeWidth={RING_STROKE} fill="none"
          strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
          rotation="-90" origin={`${center},${center}`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.ringCenter}>
          <Text style={styles.ringTime}>{fmtTimer(remaining)}</Text>
          <Text style={[styles.ringStateLbl, { color: state === 'paused' ? theme.warning : theme.textTertiary }]}>
            {state === 'running' ? 'IN PROGRESS' : state === 'paused' ? 'PAUSED' : 'READY'}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function FocusScreen() {
  const { theme } = useTheme();
  const s = useMemo(() => createFocusStyles(theme), [theme]);
  const MODES = useMemo(() => getFocusModes(theme), [theme]);

  const TEST_TIME = 10;
  const [modeIdx, setModeIdx] = useState(0);
  const [remaining, setRemaining] = useState(TEST_TIME);
  const [timerState, setTimerState] = useState('idle');
  const [currentTask, setCurrentTask] = useState('');
  const [taskList, setTaskList] = useState([]); 
  const [sessionsToday, setSessionsToday] = useState(0);
  const [totalFocusSecs, setTotalFocusSecs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false); 

  const intervalRef = useRef(null);
  const mode = MODES[modeIdx];

  const loadData = async () => {
    try {
      const [stats, tasks] = await Promise.all([
        tasksApi.getFocusStats(),
        tasksApi.getTasks()
      ]);
      setSessionsToday(stats.sessionCount || 0);
      setTotalFocusSecs(stats.totalSecondsToday || 0);
      setTaskList(tasks || []);
      if (tasks && tasks.length > 0) setCurrentTask(tasks[0].title);
    } catch (e) {
      console.error("Load Error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSessionComplete = useCallback(async () => {
    setTimerState('idle');
    clearInterval(intervalRef.current);
    Vibration.vibrate([0, 400, 200, 400]);

    try {
      if (mode.key === 'focus') {
        const title = typeof currentTask === 'object' ? currentTask.title : currentTask;
       
        await tasksApi.logFocusSession(title || "Quick Focus", TEST_TIME);
       
        const updatedStats = await tasksApi.getFocusStats();
        setSessionsToday(updatedStats.sessionCount);
        setTotalFocusSecs(updatedStats.totalSecondsToday);
       
        Alert.alert("Success", "Focus session saved!");
      }
    } catch (e) {
      console.error("Save Error:", e.message);
      Alert.alert("Error", "Could not save session. Check your server connection.");
    }

    setRemaining(TEST_TIME);
  }, [currentTask, mode]);

  const tick = useCallback(() => {
    setRemaining((prev) => {
      if (prev <= 1) {
        handleSessionComplete();
        return 0;
      }
      return prev - 1;
    });
  }, [handleSessionComplete]);

  const toggleTimer = () => {
    if (timerState === 'running') {
      clearInterval(intervalRef.current);
      setTimerState('paused');
    } else {
      setTimerState('running');
      intervalRef.current = setInterval(tick, 1000);
    }
  };

  if (loading) {
    return (
      <View style={s.safe}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.background} />
      <ScrollView contentContainerStyle={s.scrollContent}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Focus</Text>
          <Text style={s.headerSub}>Stay focused and get things done</Text>
        </View>

        <View style={s.modesRow}>
          {MODES.map((m, i) => (
            <Pressable key={m.key} style={[s.modeChip, modeIdx === i && { backgroundColor: m.color, borderColor: m.color }]} onPress={() => { clearInterval(intervalRef.current); setTimerState('idle'); setModeIdx(i); setRemaining(TEST_TIME); }}>
              <Text style={[s.modeChipText, modeIdx === i && s.modeChipTextActive]}>{m.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={s.timerSection}>
          <TimerRing remaining={remaining} total={TEST_TIME} color={mode.color} state={timerState} styles={s} theme={theme} />
        </View>

        <View style={s.controls}>
          <Pressable style={[s.mainBtn, { backgroundColor: timerState === 'paused' ? theme.warning : mode.color }]} onPress={toggleTimer}>
            <Ionicons name={timerState === 'running' ? 'pause' : 'play'} size={20} color={theme.onPrimary} />
            <Text style={s.mainBtnText}>{timerState === 'running' ? 'Pause' : timerState === 'paused' ? 'Resume' : 'Start'}</Text>
          </Pressable>
          <Pressable style={s.resetBtn} onPress={() => { clearInterval(intervalRef.current); setTimerState('idle'); setRemaining(TEST_TIME); }}>
            <Ionicons name="refresh" size={20} color={theme.textSecondary} />
          </Pressable>
        </View>

        <Pressable style={s.taskCard} onPress={() => setModalVisible(true)}>
          <View style={[s.taskIcon, { backgroundColor: mode.bgColor }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color={mode.color} />
          </View>
          <View style={s.taskBody}>
            <Text style={s.taskEyebrow}>FOCUSING ON</Text>
            <Text style={s.taskTitle}>{currentTask || "General Focus"}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={theme.textTertiary} />
        </Pressable>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statVal}>{sessionsToday}</Text>
            <Text style={s.statLbl}>Sessions today</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statVal}>{fmtDuration(totalFocusSecs)}</Text>
            <Text style={s.statLbl}>Focus today</Text>
          </View>
        </View>
      </ScrollView>

      {/* Task Selection Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select Task</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={s.modalList}>
              {taskList.map((task, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={s.taskItem}
                  onPress={() => {
                    setCurrentTask(task.title);
                    setModalVisible(false);
                  }}
                >
                  <Text style={s.taskItemText}>{task.title}</Text>
                  {currentTask === task.title && <Ionicons name="checkmark" size={20} color={theme.primary} />}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={s.taskItem}
                onPress={() => { setCurrentTask("General Focus"); setModalVisible(false); }}
              >
                <Text style={s.taskItemText}>General Focus</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}