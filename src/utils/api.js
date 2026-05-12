import { Alert, Platform } from 'react-native';

const BASE_URL = "https://www.save-time.kro.kr/sms-monitor";
// const BASE_URL = Platform.OS === 'android' 
//   ? "http://10.0.2.2:8080" 
//   : "http://localhost:8080";

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
    
    // 응답 텍스트를 먼저 가져옴
    const responseText = await response.text();
    console.log(`[API Response] ${response.status} ${url} : ${responseText}`);

    let result = {};
    if (responseText) {
      try {
        // JSON 파싱 시도
        result = JSON.parse(responseText);
      } catch (e) {
        // JSON이 아닌 일반 텍스트(예: "Registered")인 경우
        console.log(`[API Response] Plain text received: ${responseText}`);
        result = { message: responseText, isPlainText: true };
      }
    }

    if (!response.ok) {
      throw new Error(result.message || `요청 처리 중 오류가 발생했습니다. (Status: ${response.status})`);
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
