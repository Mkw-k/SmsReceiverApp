import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 메인 앱 컴포넌트
const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  // 소비현황 비교 데이터 (작년 동월, 저번 달, 이번 달)
  const [consumptionSummary, setConsumptionSummary] = useState([
    { month: '작년 동월', total: 320000 },
    { month: '저번 달', total: 450000 },
    { month: '이번 달', total: 380000 }
  ]);

  // 주요 카드별 소비 금액
  const [monthlySpending, setMonthlySpending] = useState([
    { card: '신한카드', amount: 200000 },
    { card: '카카오카드', amount: 100000 },
    { card: '삼성카드', amount: 80000 }
  ]);

  // 최근 거래 내역
  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, name: '온라인 쇼핑', category: '쇼핑', date: '2024.10.27', amount: -12500, card: '신한카드' },
    { id: 2, name: '점심 식사', category: '식비', date: '2024.10.27', amount: -8000, card: '카카오카드' },
    { id: 3, name: '커피', category: '카페', date: '2024.10.27', amount: -4500, card: '신한카드' },
    { id: 4, name: '편의점', category: '식품', date: '2024.10.26', amount: -2100, card: '삼성카드' },
    { id: 5, name: '서점', category: '문화', date: '2024.10.26', amount: -25000, card: '신한카드' },
    { id: 6, name: '영화관', category: '문화', date: '2024.10.25', amount: -18000, card: '카카오카드' },
    { id: 7, name: '마트 장보기', category: '식품', date: '2024.10.24', amount: -55000, card: '신한카드' },
    { id: 8, name: '택시', category: '교통', date: '2024.10.23', amount: -15000, card: '카카오카드' },
  ]);

  // 멍청비용 내역
  const [stupidExpenses, setStupidExpenses] = useState([
    { id: 1, name: '편의점 군것질', date: '2024.10.27', amount: -2100 },
    { id: 2, name: '배달비', date: '2024.10.26', amount: -3000 },
    { id: 3, name: '불필요한 구독료', date: '2024.10.25', amount: -8000 },
    { id: 4, name: '새벽 배송', date: '2024.10.24', amount: -4500 },
  ]);

  // 월별 소비 데이터 (더미)
  const [yearlySpending, setYearlySpending] = useState({
    thisYear: [
      { month: '1월', total: 350000 },
      { month: '2월', total: 410000 },
      { month: '3월', total: 290000 },
      { month: '4월', total: 550000 },
      { month: '5월', total: 320000 },
      { month: '6월', total: 470000 },
      { month: '7월', total: 390000 },
      { month: '8월', total: 510000 },
      { month: '9월', total: 420000 },
      { month: '10월', total: 380000 },
    ],
    lastYear: [
      { month: '1월', total: 300000 },
      { month: '2월', total: 350000 },
      { month: '3월', total: 420000 },
      { month: '4월', total: 480000 },
      { month: '5월', total: 290000 },
      { month: '6월', total: 400000 },
      { month: '7월', total: 350000 },
      { month: '8월', total: 460000 },
      { month: '9월', total: 390000 },
      { month: '10월', total: 320000 },
      { month: '11월', total: 510000 },
      { month: '12월', total: 600000 },
    ],
  });

  const totalThisMonth = monthlySpending.reduce((sum, item) => sum + item.amount, 0);
  const totalLastMonth = consumptionSummary.find(item => item.month === '저번 달')?.total || 0;
  const savingAmount = totalLastMonth - totalThisMonth;
  const thisMonthStupidExpenses = stupidExpenses.filter(item => item.date.startsWith('2024.10')).reduce((sum, item) => sum + item.amount, 0);
  const totalStupidExpenses = stupidExpenses.reduce((sum, item) => sum + item.amount, 0);

  // 컴포넌트가 처음 렌더링될 때 스플래시 화면을 3초간 보여줍니다.
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Firebase 초기화 및 사용자 인증 상태 리스너 설정
  useEffect(() => {
    try {
      const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const authInstance = getAuth(app);
      setDb(firestore);
      setAuth(authInstance);

      onAuthStateChanged(authInstance, (user) => {
        if (user) {
          setUserId(user.uid);
          setIsLoggedIn(true);
        } else {
          setUserId(null);
          setIsLoggedIn(false);
        }
        setIsAuthReady(true);
      });

      if (typeof __initial_auth_token !== 'undefined') {
        signInWithCustomToken(authInstance, __initial_auth_token);
      } else {
        signInAnonymously(authInstance);
      }
    } catch (e) {
      console.error('Firebase initialization error:', e);
    }
  }, []);

  // 로그인/회원가입 처리 핸들러
  const handleLogin = (e) => {
    e.preventDefault();
    // 실제 앱에서는 사용자 인증 로직을 여기에 구현합니다.
    console.log('로그인 시도...');
    if (isAuthReady && userId) {
      setIsLoggedIn(true);
    }
  };

  // 로그아웃 처리 핸들러
  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
    setIsLoggedIn(false);
    setShowRegister(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex flex-col items-center p-6 space-y-4">
            <div className="bg-gray-800 text-white rounded-2xl p-6 w-full shadow-lg">
              <h2 className="text-xl font-bold mb-2">내 계좌</h2>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-gray-400">하나은행</p>
                <p className="text-lg font-semibold">1,250,000원</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">카카오뱅크</p>
                <p className="text-lg font-semibold">50,000원</p>
              </div>
            </div>

            <div className="bg-gray-800 text-white rounded-2xl p-6 w-full shadow-lg">
              <h2 className="text-xl font-bold mb-2">SSDMA 지갑</h2>
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">SSDMA 포인트</p>
                <p className="text-lg font-semibold">1,000P</p>
              </div>
            </div>

            <div className="bg-gray-800 text-white rounded-2xl p-6 w-full shadow-lg">
              <h2 className="text-xl font-bold mb-2">자산</h2>
              <p className="text-sm text-gray-400">포트폴리오를 관리해보세요.</p>
            </div>

            {/* 소비현황 섹션 */}
            <div className="bg-gray-800 text-white rounded-2xl p-6 w-full shadow-lg">
              <h2 className="text-xl font-bold mb-4">소비현황</h2>
              <div className="flex justify-between items-center text-lg font-semibold mb-4">
                <span>이번 달 총 지출</span>
                <span>{totalThisMonth.toLocaleString()}원</span>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold mb-2">주요 카드별 소비</p>
                {monthlySpending.map((item, index) => (
                  <div key={index} className="bg-gray-700 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{item.card}</span>
                      <span className="text-sm font-semibold">{item.amount.toLocaleString()}원</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                      <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${(item.amount / totalThisMonth) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('consumption_details')}
                className="w-full mt-6 bg-blue-600 text-white font-bold py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
              >
                상세내역 보기
              </button>
            </div>

            {/* 나의 절약 내역 */}
            <div className="bg-gray-800 text-white rounded-2xl p-6 w-full shadow-lg cursor-pointer" onClick={() => setActiveTab('saving_details')}>
              <h2 className="text-xl font-bold mb-2">나의 절약 내역</h2>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">저번 달 대비</p>
                <p className={`text-lg font-bold ${savingAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {savingAmount.toLocaleString()}원 {savingAmount >= 0 ? '절약 중' : '더 지출'}
                </p>
              </div>
            </div>

            {/* 멍청비용 */}
            <div className="bg-gray-800 text-white rounded-2xl p-6 w-full shadow-lg cursor-pointer" onClick={() => setActiveTab('stupid_expenses_details')}>
              <h2 className="text-xl font-bold mb-2">멍청비용</h2>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-gray-400">이번 달</p>
                <p className="text-lg font-semibold text-red-400">{thisMonthStupidExpenses.toLocaleString()}원</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">누적</p>
                <p className="text-lg font-semibold text-red-400">{totalStupidExpenses.toLocaleString()}원</p>
              </div>
            </div>

            {/* 내 소식 섹션 */}
            <div className="bg-gray-800 text-white rounded-2xl p-6 w-full shadow-lg">
              <h2 className="text-xl font-bold mb-2">내 소식</h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">📌</span>
                  <p className="text-sm text-gray-300">새로운 공지사항이 등록되었습니다.</p>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">🔔</span>
                  <p className="text-sm text-gray-300">계좌 이체가 완료되었습니다. (150,000원)</p>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">⭐</span>
                  <p className="text-sm text-gray-300">SSDMA 포인트를 획득했습니다! (100P)</p>
                </li>
              </ul>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg mt-8"
            >
              로그아웃
            </button>
          </div>
        );
      case 'board':
        return (
          <div className="p-6 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">게시판</h2>
            <p className="text-gray-300">이곳에 게시물 목록이 표시됩니다.</p>
          </div>
        );
      case 'consumption_details':
        const chartData = yearlySpending.thisYear.map((item, index) => ({
          month: item.month,
          thisYear: item.total,
          lastYear: yearlySpending.lastYear[index]?.total || null,
        }));
        return (
          <div className="flex flex-col p-6 space-y-6">
            <h2 className="text-2xl font-bold text-white">소비 상세내역</h2>

            {/* 최근 소비 목록 - 위로 이동 */}
            <div className="bg-gray-800 text-white rounded-2xl p-6 w-full shadow-lg">
              <h3 className="text-lg font-bold mb-4">최근 소비 목록</h3>
              <ul className="space-y-4">
                {recentTransactions.map(transaction => (
                  <li key={transaction.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">
                        {transaction.category === '쇼핑' && '🛍️'}
                        {transaction.category === '식비' && '🍔'}
                        {transaction.category === '카페' && '☕'}
                        {transaction.category === '식품' && '🛒'}
                        {transaction.category === '문화' && '🎬'}
                        {transaction.category === '교통' && '🚗'}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{transaction.name}</p>
                        <p className="text-xs text-gray-400">{transaction.date}</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-red-400">{transaction.amount.toLocaleString()}원</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* 월별 소비 비교 그래프 */}
            <div className="bg-gray-800 text-white rounded-2xl p-6 w-full shadow-lg">
              <h3 className="text-lg font-bold mb-4">월별 소비 비교 (작년 vs 이번 년도)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                    <XAxis dataKey="month" stroke="#cbd5e0" />
                    <YAxis stroke="#cbd5e0" tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`} />
                    <Tooltip
                      formatter={(value, name) => [`${value.toLocaleString()}원`, name]}
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="thisYear" name="이번 년도" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="lastYear" name="작년" stroke="#a78bfa" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        );
      case 'saving_details':
        return (
          <div className="flex flex-col p-6 space-y-6">
            <h2 className="text-2xl font-bold text-white">나의 절약 내역</h2>
            <div className="bg-gray-800 text-white rounded-2xl p-6 w-full shadow-lg">
                <h3 className="text-xl font-bold mb-4">이번 달 절약 금액</h3>
                <div className="flex flex-col items-center justify-center space-y-2">
                    <p className={`text-4xl font-extrabold ${savingAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {savingAmount.toLocaleString()}원
                    </p>
                    <p className="text-sm text-gray-400">
                        {savingAmount >= 0 ? '저번 달 대비 이만큼 아꼈어요!' : '저번 달보다 이만큼 더 썼어요!'}
                    </p>
                </div>
            </div>
            <div className="bg-gray-800 text-white rounded-2xl p-6 w-full shadow-lg">
                <h3 className="text-lg font-bold mb-4">절약 팁</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                    <li>- 식비 지출을 줄여보세요.</li>
                    <li>- 불필요한 구독 서비스를 해지하세요.</li>
                    <li>- 대중교통 이용을 습관화하세요.</li>
                </ul>
            </div>
          </div>
        );
      case 'stupid_expenses_details':
        const totalStupidExpensesAmount = stupidExpenses.reduce((sum, item) => sum + item.amount, 0);
        return (
          <div className="flex flex-col p-6 space-y-6">
            <h2 className="text-2xl font-bold text-white">멍청비용 상세 내역</h2>

            {/* 최근 멍청비용 내역 - 위로 이동 */}
            <div className="bg-gray-800 text-white rounded-2xl p-6 w-full shadow-lg">
                <h3 className="text-lg font-bold mb-4">최근 멍청비용 내역</h3>
                <ul className="space-y-4">
                    {stupidExpenses.map(item => (
                        <li key={item.id} className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-semibold">{item.name}</p>
                                <p className="text-xs text-gray-400">{item.date}</p>
                            </div>
                            <p className="text-lg font-semibold text-red-400">{item.amount.toLocaleString()}원</p>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 멍청비용 총합 */}
            <div className="bg-gray-800 text-white rounded-2xl p-6 w-full shadow-lg">
                <h3 className="text-xl font-bold mb-4">멍청비용 총합</h3>
                <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="text-4xl font-extrabold text-red-400">
                        {totalStupidExpensesAmount.toLocaleString()}원
                    </p>
                    <p className="text-sm text-gray-400">
                        지금까지 누적된 멍청비용입니다.
                    </p>
                </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="flex flex-col p-6 space-y-6">
            <h2 className="text-2xl font-bold text-white">알림 목록</h2>
            <ul className="space-y-4">
              <li className="bg-gray-800 rounded-xl p-4 shadow">
                <p className="font-semibold">새로운 공지: 시스템 업데이트 안내</p>
                <p className="text-sm text-gray-400">SSDMA 시스템이 10월 28일 업데이트될 예정입니다.</p>
              </li>
              <li className="bg-gray-800 rounded-xl p-4 shadow">
                <p className="font-semibold">자산 변동: 카카오뱅크 입금</p>
                <p className="text-sm text-gray-400">10월 27일 50,000원이 입금되었습니다.</p>
              </li>
            </ul>
          </div>
        );
      case 'settings':
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        return (
          <div className="p-6 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">설정</h2>
            <p className="text-sm text-gray-400 mb-2">앱 관련 설정을 관리하세요.</p>
            <p className="text-sm text-gray-400 break-all">
              **사용자 ID:** {userId}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // 스플래시 화면
  if (showSplash || !isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black transition-opacity duration-1000 ease-in-out">
        <h1 className="text-5xl font-bold text-white tracking-widest animate-pulse">SSDMA</h1>
      </div>
    );
  }

  // 로그인 또는 회원가입 페이지
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900"
           style={{ backgroundImage: "url('https://placehold.co/1920x1080/1a202c/FFFFFF?text=Background')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>

        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-auto transform transition-all duration-500 hover:scale-105 border border-gray-700">

          <h1 className="text-3xl font-bold text-white text-center mb-6">
            {showRegister ? '회원가입' : '로그인'}
          </h1>

          <form onSubmit={showRegister ? (e) => e.preventDefault() : handleLogin}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-200 font-semibold mb-2">사용자 이름</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="사용자 이름을 입력하세요"
                className="w-full px-4 py-2 rounded-xl bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-200 font-semibold mb-2">비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-2 rounded-xl bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            {showRegister && (
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-200 font-semibold mb-2">비밀번호 확인</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="비밀번호를 다시 입력하세요"
                  className="w-full px-4 py-2 rounded-xl bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              {showRegister ? '회원가입' : '로그인'}
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-400">
            {showRegister ? (
              <p>
                이미 계정이 있으신가요?
                <span onClick={() => setShowRegister(false)} className="text-blue-400 hover:underline cursor-pointer ml-1">로그인</span>
              </p>
            ) : (
              <p>
                계정이 없으신가요?
                <span onClick={() => setShowRegister(true)} className="text-blue-400 hover:underline cursor-pointer ml-1">회원가입</span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 로그인 성공 화면 (메인 페이지)
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white"
         style={{ backgroundImage: "url('https://placehold.co/1920x1080/1a202c/FFFFFF?text=Background')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>

      {/* Top Header */}
      <header className="flex items-center justify-between p-4 pt-8 bg-gray-900 bg-opacity-30 backdrop-blur-lg">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => setActiveTab('home')}>SSDMA</h1>
        <div className="flex items-center space-x-4">
          <button onClick={() => setActiveTab('notifications')} className="text-gray-300 hover:text-white transition-colors">
            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.04 5.455 1.31m5.823 4.238a2.25 2.25 0 0 1-4.244 0 23.81 23.81 0 0 1-1.875-2.697v-.75a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 .75.75v.75c-.18.324-.363.65-.544.975ZM15 9.75v.75a8.967 8.967 0 0 1 3.313 6.022 23.848 23.848 0 0 1 5.454-1.31 9 9 0 0 0-4.067-10.825 6 6 0 0 0-3.333-1.425ZM9 9.75v.75A8.967 8.967 0 0 1 5.687 16.522 23.848 23.848 0 0 1 .233 17.832 9 9 0 0 0 9 7.425V9A6 6 0 0 0 3 9v.75a.75.75 0 0 1-.75.75h-.5A.75.75 0 0 1 1.75 10.5V9a7.5 7.5 0 0 1 1.5-4.5A9.01 9.01 0 0 0 9 2.25a9.01 9.01 0 0 0 5.625 2.55A7.5 7.5 0 0 1 21 9v1.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75V9.75z" />
            </svg>
          </button>
          <button onClick={() => setActiveTab('settings')} className="text-gray-300 hover:text-white transition-colors">
            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M11.078 1.576a.75.75 0 0 1 .844 0L20 6.306V9.75a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 0 14 11h-4a.75.75 0 0 0-.75.75H5.75a.75.75 0 0 1-.75-.75V6.306l8.078-4.73zM20 10.5v-.006l-4.75 2.778a3 3 0 0 1-2.25 0L10 10.5V11a.75.75 0 0 0-.75.75h-4.5A.75.75 0 0 1 4 11V6.306l8.078-4.73zm-2.25 10.375a3 3 0 0 1-2.25 0L10 18.375v2.375a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 .75-.75v-2.375zM12 21a.75.75 0 0 0 .75-.75V11a.75.75 0 0 0-1.5 0v9.25a.75.75 0 0 0 .75.75zM8 17.625l4.75-2.778a3 3 0 0 1 2.25 0L20 17.625v2.375a.75.75 0 0 0 .75.75h.25a.75.75 0 0 0 .75-.75V11a.75.75 0 0 0-.75-.75h-.25a.75.75 0 0 0-.75.75v6.625zM4 17.625l4.75-2.778a3 3 0 0 1 2.25 0L20 17.625v2.375a.75.75 0 0 0 .75.75h.25a.75.75 0 0 0 .75-.75V11a.75.75 0 0 0-.75-.75h-.25a.75.75 0 0 0-.75.75v6.625z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area (Scrollable) */}
      <main className="flex-1 overflow-y-auto pb-20">
        {renderContent()}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 backdrop-blur-lg p-3 rounded-t-3xl shadow-2xl z-10">
        <ul className="flex justify-around items-center h-full">
          <li className="flex flex-col items-center cursor-pointer" onClick={() => setActiveTab('home')}>
            <svg className={`w-6 h-6 transition-colors duration-200 ${activeTab === 'home' ? 'text-white' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a1.5 1.5 0 0 0 2.12-2.12l-8.69-8.69a3.75 3.75 0 0 0-5.302 0L.39 9.39a1.5 1.5 0 0 0 2.122 2.12l.698-.699V19.5a3 3 0 0 0 3 3h15a.75.75 0 0 1 0 1.5h-15a4.5 4.5 0 0 1-4.5-4.5v-8.156l-.348.348A.75.75 0 0 1 .39 9.39L9.39 3.84a1.5 1.5 0 0 1 2.08 0z" />
            </svg>
            <span className={`text-xs mt-1 transition-colors duration-200 ${activeTab === 'home' ? 'text-white' : 'text-gray-400'}`}>홈</span>
          </li>
          <li className="flex flex-col items-center cursor-pointer" onClick={() => setActiveTab('board')}>
            <svg className={`w-6 h-6 transition-colors duration-200 ${activeTab === 'board' ? 'text-white' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75zM6.75 12.25a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H6.75zM12 17a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75z" clipRule="evenodd" />
            </svg>
            <span className={`text-xs mt-1 transition-colors duration-200 ${activeTab === 'board' ? 'text-white' : 'text-gray-400'}`}>게시판</span>
          </li>
          <li className="flex flex-col items-center cursor-pointer" onClick={() => setActiveTab('settings')}>
            <svg className={`w-6 h-6 transition-colors duration-200 ${activeTab === 'settings' ? 'text-white' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M11.078 1.576a.75.75 0 0 1 .844 0L20 6.306V9.75a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 0 14 11h-4a.75.75 0 0 0-.75.75H5.75a.75.75 0 0 1-.75-.75V6.306l8.078-4.73zM20 10.5v-.006l-4.75 2.778a3 3 0 0 1-2.25 0L10 10.5V11a.75.75 0 0 0-.75.75h-4.5A.75.75 0 0 1 4 11V6.306l8.078-4.73zm-2.25 10.375a3 3 0 0 1-2.25 0L10 18.375v2.375a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 .75-.75v-2.375zM12 21a.75.75 0 0 0 .75-.75V11a.75.75 0 0 0-1.5 0v9.25a.75.75 0 0 0 .75.75zM8 17.625l4.75-2.778a3 3 0 0 1 2.25 0L20 17.625v2.375a.75.75 0 0 0 .75.75h.25a.75.75 0 0 0 .75-.75V11a.75.75 0 0 0-.75-.75h-.25a.75.75 0 0 0-.75.75v6.625zM4 17.625l4.75-2.778a3 3 0 0 1 2.25 0L20 17.625v2.375a.75.75 0 0 0 .75.75h.25a.75.75 0 0 0 .75-.75V11a.75.75 0 0 0-.75-.75h-.25a.75.75 0 0 0-.75.75v6.625z" clipRule="evenodd" />
            </svg>
            <span className={`text-xs mt-1 transition-colors duration-200 ${activeTab === 'settings' ? 'text-white' : 'text-gray-400'}`}>설정</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default App;