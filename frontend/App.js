// App.js
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from './api/auth';
// import { userApi } from './api/user'; // Keeping for future use

import BottomTabBar from './components/BottomTabBar/BottomTabBar';
import InputField from './components/InputField';
import HomeLandingScreen from './screens/main/HomeLandingScreen';
import TasksScreen from './screens/main/TasksScreen';
import FocusScreen from './screens/main/FocusScreen';
import AnalyticsScreen from './screens/main/AnalyticsScreen';
import SettingsScreen from './screens/main/SettingsScreen';
import { ThemeProvider, useTheme } from './theme/ThemeProvider';
import { userApi } from './api/user';

const initialLogin = { email: '', password: '' };
const initialSignup = { name: '', email: '', password: '', confirmPassword: '' };
const initialProfile = {
  name: 'User',
  email: '',
  phone: '',
  bio: '',
  org: '',
  focusDuration: '25 min',
  settings: { notifications: true, darkMode: false, reminderAlerts: true },
};

function AppContent() {
  const { theme, setDarkMode } = useTheme();
  const [isSignup, setIsSignup] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [appLoading, setAppLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [loginData, setLoginData] = useState(initialLogin);
  const [signupData, setSignupData] = useState(initialSignup);
  const [loginErr, setLoginErr] = useState('');
  const [signupErr, setSignupErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.removeItem('token');
      } finally {
        setIsAuthed(false);
        setAppLoading(false);
      }
    })();
  }, []);

  // Clear errors when switching modes
  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    setLoginErr('');
    setSignupErr('');
  };

  const onLogin = useCallback(async () => {
    const { email, password } = loginData;
    if (!email.trim() || !password.trim()) { setLoginErr('Please fill in credentials.'); return; }
    setLoading(true);
    setLoginErr(''); // Clear previous error
    try {
      const response = await authApi.login({ email, password });
      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
        if (response.user) {
          const next = userApi.normalizeProfile(response.user);
          setProfile((p) => ({ ...p, ...next }));
          await userApi.cacheProfile({ ...initialProfile, ...next });
        }
        setIsAuthed(true);
        setActiveTab('home');
      }
    } catch (err) {
      setLoginErr(err.message || 'Login failed. Check connection.');
    } finally {
      setLoading(false);
    }
  }, [loginData, setDarkMode]);

  const onSignup = useCallback(async () => {
    const { name, email, password, confirmPassword } = signupData;
    if (!name.trim() || !email.trim() || !password.trim()) { setSignupErr('Fill all fields.'); return; }
    if (password !== confirmPassword) { setSignupErr('Passwords mismatch.'); return; }
    setLoading(true);
    setSignupErr(''); // Clear previous error
    try {
      const response = await authApi.signup({ name, email, password });
      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
        if (response.user) {
          const next = userApi.normalizeProfile(response.user);
          setProfile((p) => ({ ...p, ...next }));
          await userApi.cacheProfile({ ...initialProfile, ...next });
        }
        setIsAuthed(true);
        setActiveTab('home');
      }
    } catch (err) {
      setSignupErr(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  }, [signupData]);

  const handleProfileSave = useCallback(async (data) => {
    setProfile((p) => ({
      ...p,
      ...data,
      settings: { ...p.settings, ...(data.settings || {}) },
    }));
    await userApi.cacheProfile(data);
    setActiveTab('home');
  }, []);

  const handleNavigate = async (tab) => {
    if (tab === 'perform-logout') {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem(userApi.PROFILE_CACHE_KEY);
      setIsAuthed(false);
      return;
    }
    setActiveTab(tab);
  };

  const authStyles = useMemo(() => createAuthStyles(theme), [theme]);

  if (appLoading) return <View style={authStyles.center}><ActivityIndicator size="large" color={theme.primary} /></View>;

  if (isAuthed) {
    const renderContent = () => {
      switch (activeTab) {
        case 'home':      return <HomeLandingScreen profile={profile} onNavigate={handleNavigate} />;
        case 'tasks':     return <TasksScreen onNavigate={handleNavigate} />;
        case 'focus':     return <FocusScreen onNavigate={handleNavigate} />;
        case 'analytics': return <AnalyticsScreen onNavigate={handleNavigate} />;
        case 'settings':
          return (
            <SettingsScreen
              profile={profile}
              onNavigate={handleNavigate}
              onSave={handleProfileSave}
            />
          );
        default:          return <HomeLandingScreen profile={profile} onNavigate={handleNavigate} />;
      }
    };

    return (
      <SafeAreaView style={authStyles.safe}>
        <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.background} />
        <View style={authStyles.flex}>
          <Animated.View key={activeTab} entering={FadeInDown.duration(200)} style={authStyles.flex}>
            {renderContent()}
          </Animated.View>
        </View>
        {activeTab !== 'settings' && <BottomTabBar activeTab={activeTab} onTabPress={handleNavigate} />}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={authStyles.safe}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.background} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={authStyles.flex}>
        <ScrollView contentContainerStyle={authStyles.scroll} keyboardShouldPersistTaps="handled">
          <View style={authStyles.topBar}>
            <View style={authStyles.logoMark}><Ionicons name="flash" size={18} color={theme.primary} /></View>
            <Text style={authStyles.wordmark}>FLOWDESK</Text>
          </View>
          <Animated.View entering={FadeInDown.duration(400)} style={authStyles.card}>
            <Text style={authStyles.title}>{isSignup ? 'Create Account' : 'Welcome back'}</Text>
            {isSignup ? (
              <View>
                <InputField icon="person-outline" label="Full name" value={signupData.name} onChangeText={(t) => setSignupData(p=>({...p, name: t}))} />
                <InputField icon="mail-outline" label="Email" value={signupData.email} onChangeText={(t) => setSignupData(p=>({...p, email: t}))} />
                <InputField icon="lock-closed-outline" label="Password" value={signupData.password} onChangeText={(t) => setSignupData(p=>({...p, password: t}))} secure />
                <InputField icon="shield-checkmark-outline" label="Confirm" value={signupData.confirmPassword} onChangeText={(t) => setSignupData(p=>({...p, confirmPassword: t}))} secure />
                <PrimaryButtonThemed label="Create Account" onPress={onSignup} loading={loading} />
              </View>
            ) : (
              <View>
                <InputField icon="mail-outline" label="Email" value={loginData.email} onChangeText={(t) => setLoginData(p=>({...p, email: t}))} />
                <InputField icon="lock-closed-outline" label="Password" value={loginData.password} onChangeText={(t) => setLoginData(p=>({...p, password: t}))} secure />
                <PrimaryButtonThemed label="Sign In" onPress={onLogin} loading={loading} />
              </View>
            )}
            {Boolean(isSignup ? signupErr : loginErr) && <View style={authStyles.errorBox}><Text style={authStyles.errorText}>{isSignup ? signupErr : loginErr}</Text></View>}
            <Pressable onPress={toggleAuthMode} style={authStyles.switchRow}>
              <Text style={authStyles.switchText}>{isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PrimaryButtonThemed({ label, onPress, loading = false }) {
  const { theme } = useTheme();
  const btn = useMemo(() => createAuthBtn(theme), [theme]);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [btn.primary, pressed && btn.primaryPressed, loading && { opacity: 0.7 }]}
      disabled={loading}
    >
      {loading ? <ActivityIndicator color={theme.onPrimary} size="small" /> : <Text style={btn.primaryText}>{label}</Text>}
    </Pressable>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function createAuthStyles(t) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    flex: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: t.background },
    scroll: { padding: 24, paddingTop: 60 },
    topBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 40 },
    logoMark: { width: 34, height: 34, backgroundColor: t.primarySoft, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    wordmark: { fontSize: 16, fontWeight: '800', color: t.textPrimary, letterSpacing: 1 },
    card: { backgroundColor: t.surface, borderRadius: 24, padding: 24, elevation: 4 },
    title: { fontSize: 24, fontWeight: '800', color: t.textPrimary, marginBottom: 24 },
    switchRow: { marginTop: 24, alignItems: 'center' },
    switchText: { fontSize: 14, color: t.primary, fontWeight: '600' },
    errorBox: { marginTop: 16, padding: 12, backgroundColor: t.priority.High.bg, borderRadius: 12 },
    errorText: { color: t.error, fontSize: 13, textAlign: 'center', fontWeight: '500' },
  });
}

function createAuthBtn(t) {
  return StyleSheet.create({
    primary: { backgroundColor: t.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 12 },
    primaryPressed: { backgroundColor: t.primaryPressed },
    primaryText: { color: t.onPrimary, fontSize: 16, fontWeight: '700' },
  });
}