# SmsReceiverApp

React Native 기반의 SMS 수신 및 소비 패턴 분석 앱입니다.

## 주요 기능
- **SMS 자동 수신**: `react-native-android-sms-listener`를 통해 카드 결제 및 은행 입출금 문자 자동 인식
- **소비 분석**: 수신된 데이터를 바탕으로 월별 소비 현황 및 '멍청비용' 분석
- **절약 추적**: 저번 달 대비 절약 금액 확인 및 팁 제공

## 기술 스택
- **Framework**: React Native (0.80.0)
- **Navigation**: React Navigation (Stack, Tabs)
- **State Management**: React Hooks
- **Backend**: Firebase (Auth, Firestore)
- **Charts**: React Native Chart Kit
- **Styling**: React Native StyleSheet (refer.jsx 스타일 반영)

## 페이지 구성
1. **Loading/Splash**: 앱 시작 시 로고 및 초기화 세션
2. **Login/Signup**: 사용자 인증 (Firebase 연동)
3. **Main (Index)**: 자산 현황, 지갑 포인트, 요약 소비 현황
4. **Detail Pages**:
   - 소비 상세 내역 (최근 내역 및 월별 비교 그래프)
   - 절약 내역 상세
   - 멍청비용 상세 내역
5. **My Page / Settings**: 사용자 프로필 및 앱 설정

## 실행 방법
안드로이드 에뮬레이터 또는 기기가 연결된 상태에서 다음 명령어를 실행하세요.

```bash
npx react-native run-android
```

## 개발 참고 사항
- `@reference/refer.jsx`의 웹 기반 로직을 React Native 환경에 맞춰 컴포넌트 단위로 분리하여 구현되었습니다.
- SMS 수신 권한(`RECEIVE_SMS`, `READ_SMS`)이 필요합니다.
