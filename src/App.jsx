import React, { useState, useEffect } from 'react';
import { Moon, Sun, User, LogOut, Timer, Heart, Target, BarChart3, Clock, Zap, TreePine, Shield, AlertTriangle, CheckCircle, XCircle, Activity, Eye, BellRing, Settings, Brain, Loader } from 'lucide-react';
import { authAPI, userAPI, contentAPI, moodAPI, focusAPI } from './services/api';
import { MoodTrendChart, FocusSessionsChart, ContentCategoryChart, PlatformUsageChart } from './components/Charts';

const MindfulTechApp = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [focusTime, setFocusTime] = useState(1 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [moodEntries, setMoodEntries] = useState([]);
  const [todayMood, setTodayMood] = useState(null);
  const [focusSessions, setFocusSessions] = useState([]);
  const [userStats, setUserStats] = useState({
    totalFocusTime: 0,
    sessionsCompleted: 0,
    currentStreak: 0,
    ecosystemLevel: 1,
    safetyScore: 85
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAge, setRegAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contentLogs, setContentLogs] = useState([]);
  const [platformUsage, setPlatformUsage] = useState({});
  const [contentAlerts, setContentAlerts] = useState([
    { id: 1, type: 'warning', platform: 'YouTube', content: 'Extended viewing of negative news content', time: '15 mins ago', severity: 'medium' },
    { id: 2, type: 'danger', platform: 'TikTok', content: 'Content flagged as potentially harmful', time: '1 hour ago', severity: 'high' },
    { id: 3, type: 'info', platform: 'Instagram', content: 'Screen time limit approaching', time: '2 hours ago', severity: 'low' }
  ]);
  const [safetySettings, setSafetySettings] = useState({
    blockHarmfulContent: true,
    ageRestrictions: true,
    mentalHealthFilter: true,
    screenTimeLimit: 180,
    parentalControls: false
  });

  // ── AI Analyzer State ──────────────────────────────────────────────────────
  const [aiInput, setAiInput] = useState('');
  const [aiPlatform, setAiPlatform] = useState('TikTok');
  const [aiDuration, setAiDuration] = useState(30);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiLogged, setAiLogged] = useState(false);
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setCurrentUser(response.data);
      setUserStats(response.data.userStats);
      setSafetySettings(response.data.safetySettings);
      fetchContentData();
      fetchMoodData();
      fetchFocusData();
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      localStorage.removeItem('token');
    }
  };

  const fetchContentData = async () => {
    try {
      const [logsResponse, summaryResponse] = await Promise.all([
        contentAPI.getContentLogs(),
        contentAPI.getPlatformSummary()
      ]);
      setContentLogs(logsResponse.data);
      setPlatformUsage(summaryResponse.data);
    } catch (error) {
      console.error('Failed to fetch content data:', error);
    }
  };

  const fetchMoodData = async () => {
    try {
      const [moodsResponse] = await Promise.all([
        moodAPI.getMoods({ limit: 10 }),
        moodAPI.getMoodStats({ days: 7 })
      ]);
      setMoodEntries(moodsResponse.data);
      const today = new Date().toDateString();
      const todayEntry = moodsResponse.data.find(
        entry => new Date(entry.timestamp).toDateString() === today
      );
      if (todayEntry) setTodayMood(todayEntry.mood);
    } catch (error) {
      console.error('Failed to fetch mood data:', error);
    }
  };

  const fetchFocusData = async () => {
    try {
      const [sessionsResponse, statsResponse] = await Promise.all([
        focusAPI.getSessions({ limit: 10 }),
        focusAPI.getFocusStats({ days: 7 })
      ]);
      setFocusSessions(sessionsResponse.data);
      if (statsResponse.data.userStats) setUserStats(statsResponse.data.userStats);
    } catch (error) {
      console.error('Failed to fetch focus data:', error);
    }
  };

  useEffect(() => {
    let interval;
    if (isTimerActive && focusTime > 0) {
      interval = setInterval(() => {
        setFocusTime(prev => {
          if (prev <= 1) { handleTimerComplete(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, focusTime]);

  const handleTimerComplete = async () => {
    setIsTimerActive(false);
    try {
      const response = await focusAPI.logSession({ duration: 1, completed: true });
      setFocusSessions(prev => [response.data.session, ...prev]);
      const statsResponse = await focusAPI.getFocusStats({ days: 7 });
      if (statsResponse.data.userStats) setUserStats(statsResponse.data.userStats);
      alert('🎉 Focus session completed! Great work!');
    } catch (error) {
      alert('Session completed but failed to save.');
    }
  };

  const startTimer = () => setIsTimerActive(true);
  const pauseTimer = () => setIsTimerActive(false);
  const resetTimer = () => { setIsTimerActive(false); setFocusTime(1 * 60); };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { setError('Please enter email and password'); return; }
    setLoading(true); setError('');
    try {
      const response = await authAPI.login({ email: loginEmail, password: loginPassword });
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.user);
      setUserStats(response.data.user.userStats);
      setSafetySettings(response.data.user.safetySettings);
      setActiveTab('dashboard');
      setLoginEmail(''); setLoginPassword('');
      fetchContentData(); fetchMoodData(); fetchFocusData();
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPassword || !regAge) { setError('Please fill in all fields'); return; }
    if (parseInt(regAge) < 13) { setError('You must be at least 13 years old to register'); return; }
    setLoading(true); setError('');
    try {
      const response = await authAPI.register({ name: regName, email: regEmail, password: regPassword, age: parseInt(regAge) });
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.user);
      setUserStats(response.data.user.userStats);
      setSafetySettings(response.data.user.safetySettings);
      setActiveTab('dashboard');
      setRegName(''); setRegEmail(''); setRegPassword(''); setRegAge('');
      fetchContentData(); fetchMoodData(); fetchFocusData();
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setUserStats({ totalFocusTime: 0, sessionsCompleted: 0, currentStreak: 0, ecosystemLevel: 1, safetyScore: 85 });
    setContentLogs([]); setPlatformUsage({}); setMoodEntries([]); setFocusSessions([]);
    setActiveTab('dashboard');
  };

  const logMood = async (moodValue) => {
    try {
      const response = await moodAPI.logMood({ mood: moodValue, note: '', screenTime: Math.floor(Math.random() * 300) + 60 });
      setMoodEntries(prev => [response.data.mood, ...prev]);
      setTodayMood(moodValue);
      alert('✅ Mood logged successfully!');
    } catch (error) { alert('Failed to log mood. Please try again.'); }
  };

  const logContentUsage = async (platform, category, duration, note = '') => {
    try {
      const response = await contentAPI.logContent({ platform, category, duration, note });
      setContentLogs(prev => [response.data.contentLog, ...prev].slice(0, 50));
      fetchContentData();
      alert(`✅ Logged ${duration} minutes of ${category} content on ${platform}`);
    } catch (error) { alert('Failed to log content. Please try again.'); }
  };

  const updateSafetySettings = async (newSettings) => {
    try {
      await userAPI.updateSafetySettings(newSettings);
      setSafetySettings(newSettings);
    } catch (error) { console.error('Failed to update settings:', error); }
  };

  // ── AI Analyze Handler ─────────────────────────────────────────────────────
  const handleAiAnalyze = async () => {
    if (!aiInput.trim()) { setAiError('Please describe what you are watching or paste a video title/URL.'); return; }
    setAiLoading(true);
    setAiResult(null);
    setAiError('');
    setAiLogged(false);
    try {
      const response = await contentAPI.analyzeContent(aiInput);
      if (response.data.success) {
        setAiResult(response.data.analysis);
      } else {
        setAiError('AI analysis failed. Please try again.');
      }
    } catch (error) {
      setAiError('Could not reach AI service. Make sure your backend is running.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiLogContent = async () => {
    if (!aiResult) return;
    await logContentUsage(aiPlatform, aiResult.category, aiDuration, aiInput);
    setAiLogged(true);
    setAiInput('');
    setAiResult(null);
  };
  // ──────────────────────────────────────────────────────────────────────────

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'high': return 'text-red-500 bg-red-500/20';
      case 'medium': return 'text-orange-500 bg-orange-500/20';
      case 'low': return 'text-green-500 bg-green-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getRiskBorder = (risk) => {
    switch(risk) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-orange-500';
      case 'low': return 'border-green-500';
      default: return 'border-slate-500';
    }
  };

  const getCategoryEmoji = (category) => {
    const map = { educational: '📚', entertainment: '🎬', social: '👥', news: '📰', harmful: '⚠️', inappropriate: '🚫', other: '📱' };
    return map[category] || '📱';
  };

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'high': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'low': return <BellRing className="w-5 h-5 text-blue-500" />;
      default: return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getMoodChartData = () => {
    if (moodEntries.length === 0) return [];
    return moodEntries.slice(0, 7).reverse().map(entry => ({
      date: new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: entry.mood
    }));
  };

  const getFocusChartData = () => {
    const last7Days = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days[date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
    }
    focusSessions.forEach(session => {
      const dateStr = new Date(session.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (last7Days.hasOwnProperty(dateStr)) last7Days[dateStr] += session.duration;
    });
    return Object.entries(last7Days).map(([date, duration]) => ({ date, duration }));
  };

  const getCategoryChartData = () => {
    if (contentLogs.length === 0) return [
      { name: 'Educational', value: 35 }, { name: 'Entertainment', value: 45 },
      { name: 'Social', value: 15 }, { name: 'News', value: 5 }
    ];
    const categories = {};
    contentLogs.forEach(log => { categories[log.category] = (categories[log.category] || 0) + log.duration; });
    return Object.entries(categories).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  };

  const getPlatformChartData = () => {
    if (Object.keys(platformUsage).length === 0) return [];
    return Object.entries(platformUsage).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), time: data.time
    }));
  };

  const bgClass = darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';
  const cardClass = darkMode ? 'bg-slate-800/50 backdrop-blur-sm border border-slate-700' : 'bg-white/80 backdrop-blur-sm border border-purple-200';
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const mutedClass = darkMode ? 'text-slate-400' : 'text-slate-600';
  const inputClass = darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-900 border-slate-300';

  if (!currentUser) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4 transition-colors duration-300`}>
        <div className={`w-full max-w-md ${cardClass} rounded-2xl p-8 shadow-2xl`}>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl">
                <TreePine className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className={`text-3xl font-bold ${textClass} mb-2`}>MindfulTech</h1>
            <p className={mutedClass}>Your Digital Wellness & Safety Companion</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">{error}</div>
          )}

          <div className="flex gap-2 mb-6">
            {['login', 'register'].map(v => (
              <button key={v} onClick={() => setCurrentView(v)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${currentView === v ? 'bg-purple-600 text-white' : `${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {currentView === 'login' ? (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${mutedClass} mb-2`}>Email</label>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg ${inputClass} border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  placeholder="you@example.com" disabled={loading} />
              </div>
              <div>
                <label className={`block text-sm font-medium ${mutedClass} mb-2`}>Password</label>
                <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && !loading && handleLogin()}
                  className={`w-full px-4 py-3 rounded-lg ${inputClass} border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  placeholder="••••••••" disabled={loading} />
              </div>
              <button onClick={handleLogin} disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Full Name', value: regName, setter: setRegName, type: 'text', placeholder: 'John Doe' },
                { label: 'Email', value: regEmail, setter: setRegEmail, type: 'email', placeholder: 'you@example.com' },
                { label: 'Age', value: regAge, setter: setRegAge, type: 'number', placeholder: '18' },
                { label: 'Password', value: regPassword, setter: setRegPassword, type: 'password', placeholder: '••••••••' }
              ].map(field => (
                <div key={field.label}>
                  <label className={`block text-sm font-medium ${mutedClass} mb-2`}>{field.label}</label>
                  <input type={field.type} value={field.value} onChange={e => field.setter(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg ${inputClass} border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                    placeholder={field.placeholder} disabled={loading} />
                </div>
              ))}
              <button onClick={handleRegister} disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          )}

          <button onClick={() => setDarkMode(!darkMode)}
            className={`mt-6 w-full py-2 px-4 rounded-lg ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'} flex items-center justify-center gap-2 hover:scale-105 transition-all`}>
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${cardClass} shadow-lg sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
                <TreePine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${textClass}`}>MindfulTech</h1>
                <p className={`text-sm ${mutedClass}`}>Digital Wellness & Safety</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} hover:scale-110 transition-all`}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <User className="w-5 h-5" />
                <span className={`font-medium ${textClass}`}>{currentUser.name}</span>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'safety', label: 'Content Safety', icon: Shield },
              { id: 'analytics', label: 'Analytics', icon: Activity },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-purple-600 text-white' : `${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'} hover:scale-105`
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── DASHBOARD ─────────────────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Focus', value: `${userStats.totalFocusTime}m`, sub: 'Across all sessions', icon: Clock, color: 'purple' },
                { label: 'Sessions', value: userStats.sessionsCompleted, sub: 'Completed', icon: Target, color: 'green' },
                { label: 'Streak', value: userStats.currentStreak, sub: 'Days in a row', icon: Zap, color: 'orange' },
                { label: 'Safety Score', value: `${userStats.safetyScore}%`, sub: 'Digital wellbeing', icon: Shield, color: 'blue' }
              ].map(card => (
                <div key={card.label} className={`${cardClass} rounded-xl p-6 hover:scale-105 transition-all`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`bg-${card.color}-500/20 p-3 rounded-lg`}>
                      <card.icon className={`w-6 h-6 text-${card.color}-500`} />
                    </div>
                    <span className={`text-sm ${mutedClass}`}>{card.label}</span>
                  </div>
                  <p className={`text-3xl font-bold ${textClass}`}>{card.value}</p>
                  <p className={`text-sm ${mutedClass} mt-1`}>{card.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Focus Timer */}
              <div className={`lg:col-span-2 ${cardClass} rounded-xl p-8`}>
                <h2 className={`text-2xl font-bold ${textClass} mb-6 flex items-center gap-2`}>
                  <Timer className="w-6 h-6 text-purple-500" /> Focus Session
                </h2>
                <div className="flex flex-col items-center">
                  <div className="relative w-64 h-64 mb-8">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="128" cy="128" r="120" stroke={darkMode ? '#334155' : '#e2e8f0'} strokeWidth="8" fill="none" />
                      <circle cx="128" cy="128" r="120" stroke="url(#gradient)" strokeWidth="8" fill="none"
                        strokeDasharray={`${2 * Math.PI * 120}`}
                        strokeDashoffset={`${2 * Math.PI * 120 * (focusTime / (1 * 60))}`}
                        strokeLinecap="round" className="transition-all duration-1000" />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-5xl font-bold ${textClass}`}>{formatTime(focusTime)}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {!isTimerActive ? (
                      <button onClick={startTimer} disabled={focusTime === 0}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        Start Focus
                      </button>
                    ) : (
                      <button onClick={pauseTimer} className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all shadow-lg">
                        Pause
                      </button>
                    )}
                    <button onClick={resetTimer} className={`px-8 py-3 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} ${textClass} rounded-lg font-semibold hover:scale-105 transition-all`}>
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Mood Check-in */}
              <div className={`${cardClass} rounded-xl p-6`}>
                <h2 className={`text-xl font-bold ${textClass} mb-4 flex items-center gap-2`}>
                  <Heart className="w-5 h-5 text-pink-500" /> Mood Check-in
                </h2>
                <p className={`text-sm ${mutedClass} mb-6`}>How are you feeling today?</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[{ emoji: '😊', label: 'Great', value: 5 }, { emoji: '🙂', label: 'Good', value: 4 }, { emoji: '😐', label: 'Okay', value: 3 }, { emoji: '😔', label: 'Low', value: 2 }].map(mood => (
                    <button key={mood.value} onClick={() => logMood(mood.value)}
                      className={`p-4 rounded-lg ${todayMood === mood.value ? 'bg-purple-500 text-white' : darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'} transition-all hover:scale-105`}>
                      <div className="text-3xl mb-1">{mood.emoji}</div>
                      <div className={`text-sm font-medium ${todayMood === mood.value ? 'text-white' : textClass}`}>{mood.label}</div>
                    </button>
                  ))}
                </div>
                {moodEntries.length > 0 && (
                  <div>
                    <h3 className={`text-sm font-semibold ${mutedClass} mb-3`}>Recent Entries</h3>
                    <div className="space-y-2">
                      {moodEntries.slice(0, 3).map(entry => (
                        <div key={entry._id} className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${textClass}`}>
                              {entry.mood === 5 ? '😊 Great' : entry.mood === 4 ? '🙂 Good' : entry.mood === 3 ? '😐 Okay' : '😔 Low'}
                            </span>
                            <span className={`text-xs ${mutedClass}`}>{new Date(entry.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── CONTENT SAFETY ────────────────────────────────────────────────── */}
        {activeTab === 'safety' && (
          <>
            <div className="mb-8">
              <h2 className={`text-3xl font-bold ${textClass} mb-2 flex items-center gap-3`}>
                <Shield className="w-8 h-8 text-purple-500" /> Content Safety Monitor
              </h2>
              <p className={mutedClass}>AI-powered tracking and analysis of your social media content</p>
            </div>

            {/* ── AI ANALYZER CARD ─────────────────────────────────────────── */}
            <div className={`${cardClass} rounded-xl p-6 mb-8 border-2 border-purple-500/40`}>
              <h3 className={`font-bold ${textClass} mb-1 flex items-center gap-2 text-xl`}>
                <Brain className="w-6 h-6 text-purple-400" /> AI Content Analyzer
              </h3>
              <p className={`text-sm ${mutedClass} mb-6`}>
                Describe what you're watching, paste a video title, or type a URL — Gemini AI will analyze and categorize it instantly.
              </p>

              {/* Platform + Duration row */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium ${mutedClass} mb-2`}>Platform</label>
                  <select value={aiPlatform} onChange={e => setAiPlatform(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg ${inputClass} border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}>
                    {['TikTok', 'Instagram', 'YouTube', 'Twitter', 'Facebook', 'Other'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${mutedClass} mb-2`}>Duration: {aiDuration} min</label>
                  <input type="range" min="5" max="300" step="5" value={aiDuration}
                    onChange={e => setAiDuration(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-600 rounded-lg appearance-none cursor-pointer mt-2" />
                  <div className="flex justify-between mt-1">
                    <span className={`text-xs ${mutedClass}`}>5 min</span>
                    <span className={`text-xs ${mutedClass}`}>5 hrs</span>
                  </div>
                </div>
              </div>

              {/* Content Input */}
              <div className="mb-4">
                <label className={`block text-sm font-medium ${mutedClass} mb-2`}>What are you watching / listening to?</label>
                <textarea
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  placeholder={`Examples:\n• "How to build a React app - tutorial"\n• "TikTok prank compilation"\n• "Breaking news: Kenya elections 2026"\n• https://youtube.com/watch?v=...`}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg ${inputClass} border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none`}
                />
              </div>

              {aiError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">{aiError}</div>
              )}

              <button onClick={handleAiAnalyze} disabled={aiLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {aiLoading ? (
                  <><Loader className="w-5 h-5 animate-spin" /> Analyzing with Gemini AI...</>
                ) : (
                  <><Brain className="w-5 h-5" /> Analyze Content</>
                )}
              </button>

              {/* AI Result */}
              {aiResult && (
                <div className={`mt-6 p-5 rounded-xl border-2 ${getRiskBorder(aiResult.riskLevel)} ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-bold ${textClass} text-lg flex items-center gap-2`}>
                      <span className="text-2xl">{getCategoryEmoji(aiResult.category)}</span>
                      AI Analysis Result
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getRiskColor(aiResult.riskLevel)}`}>
                      {aiResult.riskLevel} risk
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-600/50' : 'bg-white'}`}>
                      <div className={`text-xs ${mutedClass} mb-1`}>Category</div>
                      <div className={`font-bold ${textClass} capitalize`}>{aiResult.category}</div>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-600/50' : 'bg-white'}`}>
                      <div className={`text-xs ${mutedClass} mb-1`}>Confidence</div>
                      <div className={`font-bold ${textClass}`}>{Math.round((aiResult.confidence || 0) * 100)}%</div>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-600/50' : 'bg-white'}`}>
                      <div className={`text-xs ${mutedClass} mb-1`}>Harmful Content</div>
                      <div className={`font-bold ${aiResult.harmful ? 'text-red-400' : 'text-green-400'}`}>
                        {aiResult.harmful ? '⚠️ Yes — flagged' : '✅ No'}
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-600/50' : 'bg-white'}`}>
                      <div className={`text-xs ${mutedClass} mb-1`}>Platform</div>
                      <div className={`font-bold ${textClass}`}>{aiPlatform}</div>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-600/50' : 'bg-white'} mb-3`}>
                    <div className={`text-xs ${mutedClass} mb-1`}>AI Reasoning</div>
                    <p className={textClass}>{aiResult.reason}</p>
                  </div>

                  {aiResult.suggestion && (
                    <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-500/40 mb-4">
                      <div className={`text-xs text-purple-400 mb-1 font-semibold`}>💡 Wellness Tip</div>
                      <p className={`text-sm ${textClass}`}>{aiResult.suggestion}</p>
                    </div>
                  )}

                  {aiLogged ? (
                    <div className="p-3 rounded-lg bg-green-500/20 border border-green-500 text-green-400 text-center font-semibold">
                      ✅ Content logged successfully!
                    </div>
                  ) : (
                    <button onClick={handleAiLogContent}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all shadow-lg flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Log {aiDuration} min of {aiResult.category} content on {aiPlatform}
                    </button>
                  )}
                </div>
              )}
            </div>
            {/* ──────────────────────────────────────────────────────────────── */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className={`${cardClass} rounded-xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-bold ${textClass}`}>Safety Status</h3>
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div className="text-center py-6">
                  <div className={`text-5xl font-bold ${textClass} mb-2`}>{userStats.safetyScore}%</div>
                  <p className={mutedClass}>Overall Safety Score</p>
                  <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all" style={{ width: `${userStats.safetyScore}%` }} />
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-2 ${cardClass} rounded-xl p-6`}>
                <h3 className={`font-bold ${textClass} mb-4`}>Platform Usage</h3>
                {Object.keys(platformUsage).length === 0 ? (
                  <div className={`text-center py-8 ${mutedClass}`}>
                    <p>No platform usage data yet.</p>
                    <p className="text-sm mt-2">Use the AI Analyzer above to start logging content.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(platformUsage).map(([platform, data]) => (
                      <div key={platform} className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Eye className="w-5 h-5 text-purple-500" />
                            <span className={`font-semibold ${textClass} capitalize`}>{platform}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(data.risk)}`}>
                            {data.risk?.toUpperCase() || 'LOW'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={mutedClass}>{data.time} minutes</span>
                          <span className={`text-xs ${mutedClass}`}>{data.lastUsed ? new Date(data.lastUsed).toLocaleString() : 'Just now'}</span>
                        </div>
                        <div className="mt-2 h-2 bg-slate-600 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${data.risk === 'high' ? 'bg-red-500' : data.risk === 'medium' ? 'bg-orange-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min((data.time / 300) * 100, 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={`${cardClass} rounded-xl p-6 mb-8`}>
              <h3 className={`font-bold ${textClass} mb-4 flex items-center gap-2`}>
                <AlertTriangle className="w-5 h-5 text-orange-500" /> Recent Safety Alerts
              </h3>
              <div className="space-y-3">
                {contentAlerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold ${textClass}`}>{alert.platform}</span>
                          <span className={`text-xs ${mutedClass}`}>{alert.time}</span>
                        </div>
                        <p className={mutedClass}>{alert.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {contentLogs.length > 0 && (
              <div className={`${cardClass} rounded-xl p-6`}>
                <h3 className={`font-bold ${textClass} mb-4`}>Recent Content Logs</h3>
                <div className="space-y-2">
                  {contentLogs.slice(0, 8).map(log => (
                    <div key={log._id || log.id} className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCategoryEmoji(log.category)}</span>
                          <span className={`font-medium ${textClass}`}>{log.platform}</span>
                          <span className={`text-sm ${mutedClass}`}>• {log.category} • {log.duration}m</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {log.flagged && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          <span className={`text-xs ${mutedClass}`}>{new Date(log.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {log.note && <p className={`text-xs ${mutedClass} mt-1 ml-7 truncate`}>{log.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── ANALYTICS ─────────────────────────────────────────────────────── */}
        {activeTab === 'analytics' && (
          <>
            <div className="mb-8">
              <h2 className={`text-3xl font-bold ${textClass} mb-2 flex items-center gap-3`}>
                <Activity className="w-8 h-8 text-purple-500" /> Analytics & Insights
              </h2>
              <p className={mutedClass}>Understand your digital behavior patterns with visual data</p>
            </div>

            <div className={`${cardClass} rounded-xl p-6 mb-8`}>
              <h3 className={`font-bold ${textClass} mb-4`}>Mood Trend (Last 7 Days)</h3>
              {moodEntries.length > 0 ? (
                <MoodTrendChart data={getMoodChartData()} darkMode={darkMode} />
              ) : (
                <div className={`text-center py-12 ${mutedClass}`}><p>No mood data yet. Start tracking your mood to see trends!</p></div>
              )}
            </div>

            <div className={`${cardClass} rounded-xl p-6 mb-8`}>
              <h3 className={`font-bold ${textClass} mb-4`}>Focus Sessions (Last 7 Days)</h3>
              {focusSessions.length > 0 ? (
                <FocusSessionsChart data={getFocusChartData()} darkMode={darkMode} />
              ) : (
                <div className={`text-center py-12 ${mutedClass}`}><p>No focus sessions yet. Complete your first session to see analytics!</p></div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`${cardClass} rounded-xl p-6`}>
                <h3 className={`font-bold ${textClass} mb-4`}>Content Category Breakdown</h3>
                <ContentCategoryChart data={getCategoryChartData()} darkMode={darkMode} />
              </div>
              <div className={`${cardClass} rounded-xl p-6`}>
                <h3 className={`font-bold ${textClass} mb-4`}>Platform Usage</h3>
                {Object.keys(platformUsage).length > 0 ? (
                  <PlatformUsageChart data={getPlatformChartData()} darkMode={darkMode} />
                ) : (
                  <div className={`text-center py-12 ${mutedClass}`}><p>No platform data yet. Start logging content to see usage!</p></div>
                )}
              </div>
            </div>

            <div className={`${cardClass} rounded-xl p-6`}>
              <h3 className={`font-bold ${textClass} mb-4`}>Weekly Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Focus Time', value: userStats.totalFocusTime, color: 'purple' },
                  { label: 'Sessions Done', value: userStats.sessionsCompleted, color: 'green' },
                  { label: 'Mood Entries', value: moodEntries.length, color: 'orange' },
                  { label: 'Avg Safety', value: `${userStats.safetyScore}%`, color: 'blue' }
                ].map(s => (
                  <div key={s.label} className={`text-center p-4 rounded-lg bg-${s.color}-500/20`}>
                    <div className={`text-2xl font-bold ${textClass}`}>{s.value}</div>
                    <div className={`text-sm ${mutedClass}`}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── SETTINGS ──────────────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <>
            <div className="mb-8">
              <h2 className={`text-3xl font-bold ${textClass} mb-2 flex items-center gap-3`}>
                <Settings className="w-8 h-8 text-purple-500" /> Safety Settings
              </h2>
              <p className={mutedClass}>Configure your content safety preferences</p>
            </div>

            <div className={`${cardClass} rounded-xl p-6 mb-6`}>
              <h3 className={`font-bold ${textClass} mb-4`}>Content Filters</h3>
              <div className="space-y-4">
                {[
                  { key: 'blockHarmfulContent', label: 'Block Harmful Content', desc: 'Automatically filter out potentially harmful content' },
                  { key: 'ageRestrictions', label: 'Age-Appropriate Filtering', desc: 'Filter content based on your age' },
                  { key: 'mentalHealthFilter', label: 'Mental Health Protection', desc: 'Filter content that may impact mental health' },
                  { key: 'parentalControls', label: 'Parental Controls', desc: 'Enable additional monitoring and restrictions' }
                ].map(setting => (
                  <div key={setting.key} className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${textClass}`}>{setting.label}</div>
                        <div className={`text-sm ${mutedClass}`}>{setting.desc}</div>
                      </div>
                      <button
                        onClick={() => updateSafetySettings({ ...safetySettings, [setting.key]: !safetySettings[setting.key] })}
                        className={`relative w-14 h-8 rounded-full transition-all ${safetySettings[setting.key] ? 'bg-purple-600' : 'bg-slate-600'}`}>
                        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all ${safetySettings[setting.key] ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${cardClass} rounded-xl p-6 mb-6`}>
              <h3 className={`font-bold ${textClass} mb-4`}>Screen Time Limit</h3>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={textClass}>Daily Limit</span>
                  <span className={`text-2xl font-bold ${textClass}`}>{safetySettings.screenTimeLimit} min</span>
                </div>
                <input type="range" min="60" max="360" step="30" value={safetySettings.screenTimeLimit}
                  onChange={e => updateSafetySettings({ ...safetySettings, screenTimeLimit: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between mt-2">
                  <span className={`text-xs ${mutedClass}`}>1 hour</span>
                  <span className={`text-xs ${mutedClass}`}>6 hours</span>
                </div>
              </div>
            </div>

            <div className={`${cardClass} rounded-xl p-6`}>
              <h3 className={`font-bold ${textClass} mb-4`}>User Information</h3>
              <div className="space-y-3">
                {[
                  { label: 'Name', value: currentUser.name },
                  { label: 'Email', value: currentUser.email },
                  { label: 'Age', value: `${currentUser.age} years old`, sub: currentUser.age < 18 ? '⚠️ Youth account - Enhanced protections active' : '✓ Adult account' }
                ].map(info => (
                  <div key={info.label} className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                    <div className={`text-sm ${mutedClass} mb-1`}>{info.label}</div>
                    <div className={textClass}>{info.value}</div>
                    {info.sub && <div className={`text-xs ${mutedClass} mt-1`}>{info.sub}</div>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MindfulTechApp;
