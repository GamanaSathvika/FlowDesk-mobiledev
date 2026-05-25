import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeTask } from '../utils/taskForm';

// Ensure this URL matches your current live Serveo URL
const BASE_URL = 'https://imaginary-snowbird-nebula.ngrok-free.dev';

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('token');
  return { 
    headers: { 
      'x-auth-token': token,
      'Bypass-Tunnel-Reminder': 'true'
    } 
  };
};

const mapTask = (task) => normalizeTask({ ...task, id: task._id });

export const tasksApi = {
  // GET -> https://.../api/tasks
  getTasks: async () => {
    const header = await getAuthHeader();
    const res = await axios.get(`${BASE_URL}/api/tasks`, header);
    return Array.isArray(res.data) ? res.data.map(mapTask) : [];
  },

  // GET -> https://.../api/tasks/archive (Fixed typo from 'archived')
  getArchivedTasks: async () => {
    const header = await getAuthHeader();
    try {
      const res = await axios.get(`${BASE_URL}/api/tasks/archive`, header);
      return Array.isArray(res.data) ? res.data.map(mapTask) : [];
    } catch (error) {
      console.warn("Archived route error:", error.message);
      return [];
    }
  },

  // POST -> https://.../api/focus
  logFocusSession: async (taskTitle, durationSeconds) => {
    const header = await getAuthHeader();
    const payload = { taskTitle: taskTitle || "General Focus", durationSeconds };
    try {
      const res = await axios.post(`${BASE_URL}/api/focus`, payload, header);
      return res.data;
    } catch (error) {
      console.error("POST /api/focus failed:", error.response?.status);
      throw error;
    }
  },

  // GET -> https://.../api/focus/stats
  getFocusStats: async () => {
    const header = await getAuthHeader();
    try {
      const res = await axios.get(`${BASE_URL}/api/focus/stats`, header);
      return res.data; 
    } catch (error) {
      return { totalSecondsToday: 0, sessionCount: 0 };
    }
  },

  // PATCH -> https://.../api/tasks/:id
  updateTask: async (id, updates) => {
    const header = await getAuthHeader();
    const res = await axios.patch(`${BASE_URL}/api/tasks/${id}`, updates, header);
    return mapTask(res.data);
  },

  // POST -> https://.../api/tasks
  create: async (taskData) => {
    const header = await getAuthHeader();
    const res = await axios.post(`${BASE_URL}/api/tasks`, taskData, header);
    return mapTask(res.data);
  },

  // DELETE -> https://.../api/tasks/:id
  deleteTask: async (id) => {
    const header = await getAuthHeader();
    const res = await axios.delete(`${BASE_URL}/api/tasks/${id}`, header);
    return res.data;
  }
};