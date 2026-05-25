import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ensure this URL exactly matches your current live Serveo domain URL
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

export const getAnalytics = async (range = 'week') => {
  try {
    const header = await getAuthHeader();
    // This calls the exact address your Express backend expects: /api/analytics/data
    const res = await axios.get(`${BASE_URL}/api/analytics/data?range=${range}`, header);
    return res.data;
  } catch (error) {
    console.error("Error inside getAnalytics API helper:", error.response?.status || error.message);
    throw error;
  }
};