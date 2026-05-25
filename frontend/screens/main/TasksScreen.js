// screens/main/TasksScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { tasksApi } from '../../api/tasks';
import {
  PRIORITIES,
  SUGGESTED_TAGS,
  formatDueDisplay,
  mergeDateKeepTime,
  mergeTimeKeepDate,
  getTaskDueLine,
} from '../../utils/taskForm';
import { useTheme } from '../../theme/ThemeProvider';
import { useTaskScreenStyles } from '../../theme/taskScreenStyles';

const FILTERS = [
  { key: 'all',    label: 'All' },
  { key: 'high',   label: 'High Priority',   priority: 'High' },
  { key: 'medium', label: 'Medium Priority', priority: 'Medium' },
  { key: 'low',    label: 'Low Priority',    priority: 'Low' },
];

function RequiredLabel({ children, styles }) {
  return (
    <Text style={styles.label}>
      {children}
      <Text style={styles.required}> *</Text>
    </Text>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function TaskModal({ visible, task, onSave, onClose }) {
  const { theme, isDarkMode } = useTheme();
  const { m } = useTaskScreenStyles();
  const scrollRef = useRef(null);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [title, setTitle] = useState('');
  const [categoryTag, setCategoryTag] = useState('');
  const [priority, setPriority] = useState(null);
  const [dueAt, setDueAt] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!visible) return;
    setErrors({});
    setShowDatePicker(false);
    setShowTimePicker(false);
    if (task) {
      setTitle(task.title || '');
      setCategoryTag(task.categoryTag || '');
      setPriority(task.priority || 'Medium');
      setDueAt(task.dueAt ? new Date(task.dueAt) : null);
    } else {
      setTitle('');
      setCategoryTag('');
      setPriority(null);
      setDueAt(null);
    }
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
  }, [task, visible]);

  useEffect(() => {
    if (!visible) {
      setKeyboardInset(0);
      return;
    }
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = (e) => {
      const height = e.endCoordinates?.height ?? 0;
      setKeyboardInset(Platform.OS === 'android' ? height + 24 : 32);
    };
    const onHide = () => setKeyboardInset(0);
    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [visible]);

  const scrollToField = (y) => {
    setTimeout(() => scrollRef.current?.scrollTo({ y, animated: true }), 100);
  };

  const setQuickDate = (preset) => {
    const next = dueAt ? new Date(dueAt) : new Date();
    const base = new Date();
    if (preset === 'tomorrow') base.setDate(base.getDate() + 1);
    next.setFullYear(base.getFullYear(), base.getMonth(), base.getDate());
    if (!dueAt) next.setHours(17, 0, 0, 0);
    setDueAt(next);
  };

  const handleSave = () => {
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = 'Title is required';
    if (!priority) nextErrors.priority = 'Select a priority';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const trimmedTag = categoryTag.trim();
    const dueLabel = dueAt ? formatDueDisplay(dueAt) : '';
    onSave({
      title: title.trim(),
      priority,
      tag: trimmedTag,
      categoryTag: trimmedTag,
      dueAt: dueAt ? dueAt.toISOString() : null,
      sub: dueLabel,
    });
  };

  const canSave = Boolean(title.trim() && priority);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.modalRoot}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={m.overlay} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={m.kvContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : StatusBar.currentHeight ?? 0}
        >
          <SafeAreaView style={m.sheetSafe}>
            <View style={m.sheet}>
              <View style={m.handle} />
              <ScrollView
                ref={scrollRef}
                style={m.sheetScroll}
                contentContainerStyle={[
                  m.sheetScrollContent,
                  { paddingBottom: 28 + keyboardInset },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                nestedScrollEnabled
                bounces={false}
              >
                <Text style={m.sheetTitle}>{task ? 'Edit Task' : 'New Task'}</Text>

            <RequiredLabel styles={m}>Task Title</RequiredLabel>
            <TextInput
              style={[m.input, errors.title && m.inputError]}
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
            placeholderTextColor={theme.textTertiary}
            returnKeyType="next"
            accessibilityLabel="Task title, required"
          />
            {errors.title ? <Text style={m.errorText}>{errors.title}</Text> : null}

            <Text style={m.label}>Tag</Text>
            <View style={m.suggestRow}>
              {SUGGESTED_TAGS.map(t => {
                const active = categoryTag === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setCategoryTag(active ? '' : t)}
                    style={[m.suggestChip, active && m.suggestChipActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[m.suggestChipText, active && m.suggestChipTextActive]}>{t}</Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              style={m.input}
              value={categoryTag}
              onChangeText={setCategoryTag}
              placeholder="Custom tag (optional)"
              placeholderTextColor={theme.textTertiary}
              accessibilityLabel="Task tag, optional"
              onFocus={() => scrollToField(120)}
            />

            <Text style={m.label}>Due Date & Time</Text>
            <View style={m.quickRow}>
              {['today', 'tomorrow'].map(preset => (
                <Pressable
                  key={preset}
                  onPress={() => setQuickDate(preset)}
                  style={m.quickChip}
                  accessibilityRole="button"
                >
                  <Text style={m.quickChipText}>{preset === 'today' ? 'Today' : 'Tomorrow'}</Text>
                </Pressable>
              ))}
              {dueAt ? (
                <Pressable onPress={() => setDueAt(null)} style={m.clearChip} accessibilityRole="button">
                  <Text style={m.clearChipText}>Clear</Text>
                </Pressable>
              ) : null}
            </View>
            <View style={m.dueRow}>
              <Pressable
                style={m.dueBtn}
                onPress={() => setShowDatePicker(true)}
                accessibilityRole="button"
                accessibilityLabel="Pick due date"
              >
                <Ionicons name="calendar-outline" size={16} color={theme.primary} />
                <Text style={m.dueBtnText}>{dueAt ? formatDueDisplay(dueAt) : 'Select date & time'}</Text>
              </Pressable>
              <Pressable
                style={m.dueIconBtn}
                onPress={() => setShowTimePicker(true)}
                accessibilityRole="button"
                accessibilityLabel="Pick due time"
              >
                <Ionicons name="time-outline" size={18} color={theme.primary} />
              </Pressable>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={dueAt || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                themeVariant={isDarkMode ? 'dark' : 'light'}
                onChange={(event, selected) => {
                  if (Platform.OS === 'android') setShowDatePicker(false);
                  if (event.type === 'dismissed' || !selected) return;
                  setDueAt(mergeDateKeepTime(dueAt, selected));
                }}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={dueAt || new Date()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                themeVariant={isDarkMode ? 'dark' : 'light'}
                onChange={(event, selected) => {
                  if (Platform.OS === 'android') setShowTimePicker(false);
                  if (event.type === 'dismissed' || !selected) return;
                  setDueAt(mergeTimeKeepDate(dueAt, selected));
                }}
              />
            )}

            <RequiredLabel styles={m}>Priority</RequiredLabel>
            <View style={m.tagRow}>
              {PRIORITIES.map(p => {
                const cfg = theme.priority[p];
                const active = priority === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPriority(p)}
                    style={[
                      m.tagChip,
                      { backgroundColor: active ? cfg.bg : theme.inputBg },
                      active && { borderColor: cfg.text },
                      errors.priority && !priority && m.tagChipError,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[m.tagChipText, { color: active ? cfg.text : theme.textTertiary }]}>{p}</Text>
                  </Pressable>
                );
              })}
            </View>
            {errors.priority ? <Text style={m.errorText}>{errors.priority}</Text> : null}

            <View style={m.btnRow}>
              <Pressable style={m.cancelBtn} onPress={onClose} accessibilityRole="button">
                <Text style={m.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[m.saveBtn, !canSave && m.saveBtnDisabled]}
                onPress={handleSave}
                accessibilityRole="button"
              >
                <Text style={m.saveText}>{task ? 'Save changes' : 'Add task'}</Text>
              </Pressable>
            </View>
              </ScrollView>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Action Sheet (Edit / Delete) ─────────────────────────────────────────────

function ActionSheet({ visible, task, onEdit, onArchive, onDelete, onClose }) {
  const { theme } = useTheme();
  const { a } = useTaskScreenStyles();
  if (!task) return null;
  const tag = theme.priority[task.priority] || theme.priority.Medium;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}><View style={a.overlay} /></TouchableWithoutFeedback>
      <View style={a.sheet}>
        <View style={a.handle} />

        <View style={a.preview}>
          <Text style={a.previewTitle} numberOfLines={2}>{task.title}</Text>
          <View style={[a.previewTag, { backgroundColor: tag.bg }]}>
            <Text style={[a.previewTagText, { color: tag.text }]}>{task.priority}</Text>
          </View>
        </View>

        <View style={a.divider} />

        {/* Edit Button */}
        <Pressable style={a.action} onPress={onEdit}>
          <View style={[a.actionIcon, { backgroundColor: theme.primarySoft }]}><Ionicons name="create-outline" size={18} color={theme.primary} /></View>
          <View style={a.actionBody}><Text style={a.actionTitle}>Edit task</Text></View>
          <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
        </Pressable>

        <View style={a.divider} />

        {/* Archive Button */}
        <Pressable style={a.action} onPress={onArchive}>
          <View style={[a.actionIcon, { backgroundColor: theme.secondarySurface }]}><Ionicons name="archive-outline" size={18} color={theme.textSecondary} /></View>
          <View style={a.actionBody}><Text style={a.actionTitle}>Archive task</Text></View>
          <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
        </Pressable>

        <View style={a.divider} />

        {/* DELETE PERMANENTLY Button */}
        <Pressable style={a.action} onPress={() => onDelete(task.id)}>
          <View style={[a.actionIcon, { backgroundColor: theme.priority.High.bg }]}><Ionicons name="trash-outline" size={18} color={theme.error} /></View>
          <View style={a.actionBody}><Text style={[a.actionTitle, { color: theme.error }]}>Delete Permanently</Text></View>
          <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
        </Pressable>

        <Pressable style={a.cancelBtn} onPress={onClose}><Text style={a.cancelText}>Cancel</Text></Pressable>
      </View>
    </Modal>
  );
}
// ─── Task Card ────────────────────────────────────────────────────────────────

const TaskCard = React.memo(function TaskCard({ task, onToggle, onPress }) {
  const { theme } = useTheme();
  const { s } = useTaskScreenStyles();
  const priorityStyle = theme.priority[task.priority] || theme.priority.Medium;
  return (
    <Pressable
      style={({ pressed }) => [s.taskCard, pressed && s.taskCardPressed]}
      onPress={() => onPress(task)}
    >
      <Pressable
        onPress={() => onToggle(task.id)}
        hitSlop={8}
        style={[s.checkbox, task.done ? s.cbDone : s.cbUndone]}
      >
        {task.done && <Ionicons name="checkmark" size={13} color={theme.onPrimary} />}
      </Pressable>

      <View style={s.taskBody}>
        <Text style={[s.taskTitle, task.done && s.taskTitleDone]} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={s.taskSubRow}>
          <Ionicons name="time-outline" size={11} color={theme.textTertiary} />
          <Text style={s.taskSub} numberOfLines={1}>{getTaskDueLine(task)}</Text>
        </View>
      </View>

      <View style={[s.tag, { backgroundColor: priorityStyle.bg }]}>
        <Text style={[s.tagText, { color: priorityStyle.text }]}>{task.priority}</Text>
      </View>

      <Ionicons name="ellipsis-horizontal" size={16} color={theme.textTertiary} style={{ marginLeft: 4 }} />
    </Pressable>
  );
});

// ─── Archived Task Card ───────────────────────────────────────────────────────

const ArchivedCard = React.memo(function ArchivedCard({ item, onRestore, onDeletePermanently }) {
  const { theme } = useTheme();
  const { s, ar } = useTaskScreenStyles();
  const priorityStyle = theme.priority[item.priority] || theme.priority.Medium;
  return (
    <View style={ar.card}>
      <View style={ar.cardHeader}>
        <View style={[ar.typeChip, item.done ? ar.typeCompleted : ar.typeDeleted]}>
          <Ionicons
            name={item.done ? 'checkmark-circle-outline' : 'archive-outline'}
            size={11}
            color={item.done ? theme.success : theme.error}
          />
          <Text style={[ar.typeText, { color: item.done ? theme.success : theme.error }]}>
            {item.done ? 'Completed' : 'Archived'}
          </Text>
        </View>
        <View style={[s.tag, { backgroundColor: priorityStyle.bg }]}>
          <Text style={[s.tagText, { color: priorityStyle.text }]}>{item.priority}</Text>
        </View>
      </View>

      <Text style={ar.title} numberOfLines={1}>{item.title}</Text>
      <View style={ar.subRow}>
        <Ionicons name="time-outline" size={11} color={theme.textTertiary} />
        <Text style={ar.sub} numberOfLines={1}>{getTaskDueLine(item)}</Text>
      </View>

      <View style={ar.actions}>
        <Pressable
          style={({ pressed }) => [ar.restoreBtn, pressed && ar.btnPressed]}
          onPress={() => onRestore(item.id)}
        >
          <Ionicons name="refresh-outline" size={14} color={theme.primary} />
          <Text style={ar.restoreText}>Restore</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [ar.deleteBtn, pressed && ar.btnPressed]}
          onPress={() => onDeletePermanently(item.id)}
        >
          <Ionicons name="trash-outline" size={14} color={theme.error} />
          <Text style={ar.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
});

// ─── Archive Modal ────────────────────────────────────────────────────────────

function ArchiveModal({ visible, archivedTasks, onClose, onRestore, onDeletePermanently }) {
  const { theme } = useTheme();
  const { ar } = useTaskScreenStyles();
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const completedItems = archivedTasks.filter(i => i.done);
  const deletedItems   = archivedTasks.filter(i => !i.done);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={ar.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View style={[ar.sheet, { transform: [{ translateY }] }]}>
        <View style={ar.handle} />
        <View style={ar.sheetHeader}>
          <View style={ar.sheetTitleRow}>
            <View style={ar.sheetIconWrap}>
              <Ionicons name="archive-outline" size={18} color={theme.textSecondary} />
            </View>
            <View>
              <Text style={ar.sheetTitle}>Archive</Text>
              <Text style={ar.sheetSub}>{archivedTasks.length} archived tasks</Text>
            </View>
          </View>
          <Pressable style={ar.closeBtn} onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>

        <ScrollView
          style={ar.scroll}
          contentContainerStyle={ar.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {archivedTasks.length === 0 ? (
            <View style={ar.emptyWrap}>
              <View style={ar.emptyIcon}>
                <Ionicons name="archive-outline" size={36} color={theme.textTertiary} />
              </View>
              <Text style={ar.emptyTitle}>No archived tasks</Text>
              <Text style={ar.emptySub}>Completed or removed tasks will appear here</Text>
            </View>
          ) : (
            <>
              {completedItems.length > 0 && (
                <>
                  <Text style={ar.sectionLbl}>COMPLETED · {completedItems.length}</Text>
                  {completedItems.map(item => (
                    <ArchivedCard
                      key={item.id}
                      item={item}
                      onRestore={onRestore}
                      onDeletePermanently={onDeletePermanently}
                    />
                  ))}
                </>
              )}

              {deletedItems.length > 0 && (
                <>
                  {completedItems.length > 0 && <View style={ar.sep} />}
                  <Text style={ar.sectionLbl}>ARCHIVED · {deletedItems.length}</Text>
                  {deletedItems.map(item => (
                    <ArchivedCard
                      key={item.id}
                      item={item}
                      onRestore={onRestore}
                      onDeletePermanently={onDeletePermanently}
                    />
                  ))}
                </>
              )}
            </>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }) {
  const { theme } = useTheme();
  const { s } = useTaskScreenStyles();
  return (
    <View style={s.emptyWrap}>
      <View style={s.emptyIcon}>
        <Ionicons name="clipboard-outline" size={36} color={theme.textTertiary} />
      </View>
      <Text style={s.emptyTitle}>No tasks here</Text>
      <Text style={s.emptySub}>Add your first task to get started</Text>
      <Pressable style={s.emptyBtn} onPress={onAdd}>
        <Ionicons name="add" size={16} color={theme.primary} />
        <Text style={s.emptyBtnText}>Add a task</Text>
      </Pressable>
    </View>
  );
}

// ─── Tasks Screen ─────────────────────────────────────────────────────────────

export default function TasksScreen() {
  const { theme } = useTheme();
  const { s } = useTaskScreenStyles();
  const [tasks,          setTasks]          = useState([]);
  const [archivedTasks,  setArchivedTasks]  = useState([]);
  const [search,         setSearch]         = useState('');
  const [activeFilter,   setActiveFilter]   = useState('all');
  const [modalVisible,   setModalVisible]   = useState(false);
  const [editingTask,    setEditingTask]     = useState(null);
  const [sheetVisible,   setSheetVisible]   = useState(false);
  const [selectedTask,   setSelectedTask]   = useState(null);
  const [archiveVisible, setArchiveVisible] = useState(false);

  const refreshTasks = useCallback(async () => {
    try {
      const [active, archived] = await Promise.all([
        tasksApi.getTasks(),
        tasksApi.getArchivedTasks(),
      ]);
      setTasks(active || []);
      setArchivedTasks(archived || []);
    } catch (error) {
      console.error("Refresh Error:", error);
    }
  }, []);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const filtered = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === 'all') return true;
    const filter = FILTERS.find(f => f.key === activeFilter);
    return filter?.priority ? (t.priority || 'Medium') === filter.priority : true;
  });
  const pendingCount = tasks.filter(t => !t.done).length;

  const toggleTask = useCallback(async (id) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (task && !task.done) {
        await tasksApi.updateTask(id, { done: true, archived: true });
        await refreshTasks();
      }
    } catch (error) {
      console.error("Toggle Error:", error);
    }
  }, [tasks, refreshTasks]);

  const openSheet = (task) => { setSelectedTask(task); setSheetVisible(true); };
  const closeSheet = () => { setSheetVisible(false); setSelectedTask(null); };
  const openAdd = () => { setEditingTask(null); setModalVisible(true); };
  
  const openEdit = () => {
    const taskToEdit = selectedTask;
    closeSheet();
    setTimeout(() => {
      setEditingTask(taskToEdit);
      setModalVisible(true);
    }, 100);
  };

  const handleArchive = async () => {
    if (!selectedTask) return;
    try {
      await tasksApi.updateTask(selectedTask.id, { archived: true, done: false });
      await refreshTasks();
      closeSheet();
    } catch (error) {}
  };

  const handleMoveToArchive = async (id) => {
    try {
      await tasksApi.updateTask(id, { archived: true, done: false });
      await refreshTasks();
    } catch (error) {
      console.error("Archive Error:", error);
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingTask) {
        await tasksApi.updateTask(editingTask.id, data);
      } else {
        await tasksApi.create(data);
      }
      await refreshTasks();
      setModalVisible(false);
    } catch (error) {}
  };

  const handleRestore = async (id) => {
  try {
    // When restoring, we want it back in the main list and uncompleted
    await tasksApi.updateTask(id, { 
      archived: false, 
      done: false 
    });
    await refreshTasks();
  } catch (error) {
    console.error("Restore Error:", error);
  }
};

  const handleDeletePermanently = async (id) => {
    try {
      await tasksApi.deleteTask(id);
      await refreshTasks();
    } catch (error) {}
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.background} />
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Tasks</Text>
          <Text style={s.headerSub}>{tasks.length} tasks · {pendingCount} pending</Text>
        </View>
        <Pressable style={s.iconBtn} onPress={() => setArchiveVisible(true)}>
          <Ionicons name="archive-outline" size={19} color={theme.textSecondary} />
          {archivedTasks.length > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{archivedTasks.length}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={s.searchWrap}>
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={17} color={theme.textTertiary} />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search tasks..."
            placeholderTextColor={theme.textTertiary}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filtersScroll}
        contentContainerStyle={s.filtersRow}
      >
        {FILTERS.map(f => (
          <Pressable
            key={f.key}
            onPress={() => setActiveFilter(f.key)}
            style={[s.chip, activeFilter === f.key ? s.chipActive : s.chipInactive]}
          >
            <Text style={[s.chipText, activeFilter === f.key ? s.chipTextActive : s.chipTextInactive]}>{f.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {filtered.length === 0 ? (
          <EmptyState onAdd={openAdd} />
        ) : (
          <>
            <Text style={s.sectionLbl}>PENDING · {filtered.length}</Text>
            <View style={s.taskList}>{filtered.map(t => <TaskCard key={t.id} task={t} onToggle={toggleTask} onPress={openSheet} />)}</View>
          </>
        )}
      </ScrollView>

      <Pressable style={s.fab} onPress={openAdd}><Ionicons name="add" size={26} color={theme.onPrimary} /></Pressable>

      <ActionSheet 
  visible={sheetVisible} 
  task={selectedTask} 
  onEdit={openEdit} 
  onArchive={handleArchive} // Moves to archive
  onDelete={(id) => {
    handleMoveToArchive(id);
    closeSheet();
  }}
  onClose={closeSheet} 
/>
      <TaskModal visible={modalVisible} task={editingTask} onSave={handleSave} onClose={() => setModalVisible(false)} />
      <ArchiveModal visible={archiveVisible} archivedTasks={archivedTasks} onRestore={handleRestore} onDeletePermanently={handleDeletePermanently} onClose={() => setArchiveVisible(false)} />
    </SafeAreaView>
  );
}
