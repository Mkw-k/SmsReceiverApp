import { Alert } from 'react-native';

const BASE_URL = "https://www.save-time.kro.kr/sms-monitor"; // 운영 서버 주소
// const BASE_URL = "http://10.0.2.2:8080"; // 로컬 서버 주소

let accessToken = null;

export const setToken = (token) => {
  accessToken = token;
};

export const getToken = () => accessToken;

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`[API Request] ${options.method || 'GET'} ${url}`);
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '요청 처리 중 오류가 발생했습니다.');
    }
    return result;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    Alert.alert('알림', error.message || '네트워크 연결 상태를 확인해주세요.');
    throw error;
  }
};

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
};
