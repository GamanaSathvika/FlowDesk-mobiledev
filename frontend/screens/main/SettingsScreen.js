// screens/main/SettingsScreen.js
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userApi } from '../../api/user';
import { useTheme } from '../../theme/ThemeProvider';
import { createSettingsStyles } from '../../theme/settingsStyles';

// ─── Focus Duration Options ───────────────────────────────────────────────────
const FOCUS_OPTIONS = ['15 min', '25 min', '30 min', '45 min', '60 min'];

// ─── Avatar Initials ──────────────────────────────────────────────────────────
function AvatarCircle({ name, size = 90, theme }) {
  const initials = name
    .trim()
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.primary,
        shadowOpacity: 0.3,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
      }}
    >
      <Text style={{ color: theme.onPrimary, fontWeight: '800', letterSpacing: 0.5, fontSize: size * 0.36 }}>
        {initials || '?'}
      </Text>
    </View>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ children, style, cardStyle }) {
  return <View style={[cardStyle, style]}>{children}</View>;
}

// ─── Editable Field ───────────────────────────────────────────────────────────
function EditField({ label, value, onChange, placeholder, keyboardType = 'default', multiline = false, required = false, error = false, styles, theme }) {
  return (
    <View style={styles.fieldWrap}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {required && <Text style={styles.requiredBadge}>Required</Text>}
      </View>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldInputMulti, error && styles.fieldInputError]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        autoCorrect={false}
      />
      {error && (
        <Text style={styles.fieldError}>At least one of email or phone is required</Text>
      )}
    </View>
  );
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────
function ToggleRow({ icon, iconColor, iconBg, label, sublabel, value, onChange, last = false, styles, theme }) {
  return (
    <View style={[styles.toggleRow, !last && styles.toggleRowBorder]}>
      <View style={[styles.toggleIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {sublabel ? <Text style={styles.toggleSub}>{sublabel}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.switchTrackFalse, true: theme.switchTrackTrue }}
        thumbColor={value ? theme.switchThumbOn : theme.switchThumbOff}
        ios_backgroundColor={theme.switchTrackFalse}
      />
    </View>
  );
}

// ─── Focus Duration Picker ────────────────────────────────────────────────────
function FocusPicker({ value, onChange, styles }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>Preferred Focus Duration</Text>
      <View style={styles.focusRow}>
        {FOCUS_OPTIONS.map((opt) => (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.focusChip, value === opt && styles.focusChipActive]}
          >
            <Text style={[styles.focusChipText, value === opt && styles.focusChipTextActive]}>
              {opt}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────
export default function SettingsScreen({ profile, onSave, onNavigate }) {
  const { theme, isDarkMode, setDarkMode } = useTheme();
  const s = useMemo(() => createSettingsStyles(theme), [theme]);

  // ── Local editable state (uncommitted until Save) ──
  const [form, setForm] = useState({
    name:          profile?.name          ?? 'Gamana',
    email:         profile?.email         ?? '',
    phone:         profile?.phone         ?? '',
    bio:           profile?.bio           ?? '',
    org:           profile?.org           ?? '',
    focusDuration: profile?.focusDuration ?? '25 min',
  });

  const [settings, setSettings] = useState({
    notifications:   profile?.settings?.notifications   ?? true,
    darkMode:        profile?.settings?.darkMode         ?? false,
    reminderAlerts:  profile?.settings?.reminderAlerts   ?? true,
  });

  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm((prev) => ({
      ...prev,
      name: profile.name ?? prev.name,
      email: profile.email ?? prev.email,
      phone: profile.phone ?? prev.phone,
      bio: profile.bio ?? prev.bio,
      org: profile.org ?? prev.org,
      focusDuration: profile.focusDuration ?? prev.focusDuration,
    }));
    setSettings((prev) => ({
      ...prev,
      ...(profile.settings || {}),
      darkMode: isDarkMode,
    }));
  }, [profile, isDarkMode]);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const cached = await userApi.getCachedProfile();
        if (mounted && cached) {
          setForm((prev) => ({ ...prev, ...cached }));
          setSettings((prev) => ({
            ...prev,
            ...(cached.settings || {}),
            darkMode: isDarkMode,
          }));
        }

        const data = await userApi.getProfile();
        if (!mounted || !data) return;

        setForm((prev) => ({ ...prev, ...data }));
        setSettings((prev) => ({
          ...prev,
          ...(data.settings || {}),
          darkMode: isDarkMode,
        }));
        await userApi.cacheProfile(data);
      } catch (error) {
        console.log(error);
      }
    };

    loadProfile();
    return () => { mounted = false; };
  }, [isDarkMode]);

  const setField = useCallback((key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: false }));
  }, []);

  const handleDarkModeToggle = useCallback((value) => {
    setSettings((prev) => ({ ...prev, darkMode: value }));
    setDarkMode(value);
  }, [setDarkMode]);

  const toggleSetting = useCallback((key) => {
    setSettings((p) => ({ ...p, [key]: !p[key] }));
  }, []);

  // ── Validate & Save ──
  const handleSave = useCallback(async () => {
    const newErrors = {};
    const emailOk = form.email.trim().length > 0;
    const phoneOk = form.phone.trim().length > 0;

    if (!form.name.trim()) {
      newErrors.name = true;
      Alert.alert('Name required', 'Please enter your name before saving.');
      return;
    }
    if (!emailOk && !phoneOk) {
      newErrors.email = true;
      newErrors.phone = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const settingsToSave = { ...settings, darkMode: isDarkMode };
      const updated = await userApi.updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        bio: form.bio,
        org: form.org,
        focusDuration: form.focusDuration,
        settings: settingsToSave,
      });

      const nextProfile = {
        ...updated,
        settings: { ...updated.settings, darkMode: isDarkMode },
      };

      setForm({
        name: nextProfile.name,
        email: nextProfile.email,
        phone: nextProfile.phone,
        bio: nextProfile.bio,
        org: nextProfile.org,
        focusDuration: nextProfile.focusDuration,
      });
      setSettings(nextProfile.settings);
      await userApi.cacheProfile(nextProfile);
      onSave?.(nextProfile);
      onNavigate?.('home');
    } catch (error) {
      Alert.alert('Save failed', error.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  }, [form, settings, isDarkMode, onSave, onNavigate]);

  const canSave = form.name.trim().length > 0;

  // Locate handleLogout inside SettingsScreen.js
const handleLogout = useCallback(() => {
  Alert.alert(
    'Log Out',
    'Are you sure you want to log out of FlowDesk?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            // 1. Clear the storage
            await AsyncStorage.removeItem('token');
            
            // 2. IMPORTANT: Instead of just 'logout', 
            // tell the parent to reset the whole user state
            onNavigate?.('perform-logout'); 
          } catch (error) {
            console.log(error);
          }
        },
      },
    ]
  );
}, [onNavigate]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.background} />

      {/* ── Header ── */}
      <View style={s.header}>
        <Pressable onPress={() => onNavigate?.('home')} style={s.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
        </Pressable>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── 1. Avatar & Name ── */}
        <View style={s.avatarSection}>
          <Pressable
            onPress={() => Alert.alert('Change Photo', 'Photo picker coming soon')}
            style={s.avatarWrap}
          >
            <AvatarCircle name={form.name || 'U'} size={90} theme={theme} />
            <View style={s.avatarEditBadge}>
              <Ionicons name="camera" size={13} color={theme.onPrimary} />
            </View>
          </Pressable>

          {editingName ? (
            <View style={s.nameEditRow}>
              <TextInput
                style={s.nameInput}
                value={form.name}
                onChangeText={(t) => setField('name', t)}
                autoFocus
                onBlur={() => setEditingName(false)}
                onSubmitEditing={() => setEditingName(false)}
                placeholder="Your name"
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          ) : (
            <Pressable onPress={() => setEditingName(true)} style={s.nameRow}>
              <Text style={s.nameText}>{form.name || 'Tap to set name'}</Text>
              <Ionicons name="pencil-outline" size={14} color={theme.primary} style={{ marginLeft: 6 }} />
            </Pressable>
          )}
          <Text style={s.avatarHint}>Tap avatar to change photo · Tap name to edit</Text>
        </View>

        {/* ── 2. Profile Details ── */}
        <Text style={s.sectionLabel}>PROFILE</Text>
        <SectionCard cardStyle={s.card}>
          <EditField
            label="Full Name"
            value={form.name}
            onChange={(t) => setField('name', t)}
            placeholder="Your full name"
            error={errors.name}
            styles={s}
            theme={theme}
          />
          <View style={s.divider} />
          <EditField
            label="Email Address"
            value={form.email}
            onChange={(t) => setField('email', t)}
            placeholder="you@example.com"
            keyboardType="email-address"
            required
            error={errors.email}
            styles={s}
            theme={theme}
          />
          <View style={s.divider} />
          <EditField
            label="Phone Number"
            value={form.phone}
            onChange={(t) => setField('phone', t)}
            placeholder="+91 00000 00000"
            keyboardType="phone-pad"
            required
            error={errors.phone}
            styles={s}
            theme={theme}
          />
          {(errors.email || errors.phone) && (
            <View style={s.contactError}>
              <Ionicons name="alert-circle-outline" size={14} color={theme.error} />
              <Text style={s.contactErrorText}>At least one contact method (email or phone) is required.</Text>
            </View>
          )}
        </SectionCard>

        {/* ── 3. Additional Details ── */}
        <Text style={s.sectionLabel}>ADDITIONAL INFO</Text>
        <SectionCard cardStyle={s.card}>
          <EditField
            label="Bio"
            value={form.bio}
            onChange={(t) => setField('bio', t)}
            placeholder="A short bio about yourself…"
            multiline
            styles={s}
            theme={theme}
          />
          <View style={s.divider} />
          <EditField
            label="College / Organization"
            value={form.org}
            onChange={(t) => setField('org', t)}
            placeholder="Where do you work or study?"
            styles={s}
            theme={theme}
          />
          <View style={s.divider} />
          <FocusPicker
            value={form.focusDuration}
            onChange={(v) => setField('focusDuration', v)}
            styles={s}
          />
        </SectionCard>

        {/* ── 4. Settings Toggles ── */}
        <Text style={s.sectionLabel}>PREFERENCES</Text>
        <SectionCard cardStyle={s.card}>
          <ToggleRow
            icon="notifications-outline"
            iconColor={theme.primary}
            iconBg={theme.primarySoft}
            label="Notifications"
            sublabel="Task reminders & updates"
            value={settings.notifications}
            onChange={() => toggleSetting('notifications')}
            styles={s}
            theme={theme}
          />
          <ToggleRow
            icon="moon-outline"
            iconColor={theme.accent}
            iconBg={theme.primarySoft}
            label="Dark Mode"
            sublabel="Easy on the eyes at night"
            value={isDarkMode}
            onChange={handleDarkModeToggle}
            styles={s}
            theme={theme}
          />
          <ToggleRow
            icon="alarm-outline"
            iconColor={theme.warning}
            iconBg={theme.priority.Medium.bg}
            label="Reminder Alerts"
            sublabel="Before task deadlines"
            value={settings.reminderAlerts}
            onChange={() => toggleSetting('reminderAlerts')}
            last
            styles={s}
            theme={theme}
          />
        </SectionCard>

        {/* ── 5. Actions ── */}
        <Pressable
          onPress={handleSave}
          disabled={saving || !canSave}
          style={({ pressed }) => [s.saveBtn, pressed && s.saveBtnPressed, (saving || !canSave) && { opacity: 0.5 }]}
        >
          <Ionicons name="save-outline" size={18} color={theme.onPrimary} />
          <Text style={s.saveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
        </Pressable>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [s.logoutBtn, pressed && s.logoutBtnPressed]}
        >
          <Ionicons name="log-out-outline" size={17} color={theme.error} />
          <Text style={s.logoutBtnText}>Log Out</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}