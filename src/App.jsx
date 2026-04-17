import React, { useState, useEffect } from 'react';
import { Moon, Sun, User, LogOut, Timer, Heart, TrendingUp, Target, Award, Users, BarChart3, Clock, Zap, TreePine, Shield, AlertTriangle, CheckCircle, XCircle, Activity, Eye, BellRing, Settings } from 'lucide-react';
import { MoodTrendChart, FocusSessionsChart, PlatformUsageChart } from './components/Charts';

const MindfulTechApp = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [focusTime, setFocusTime] = useState(25 * 60);
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
  
  // Content Safety States
  const [contentLogs, setContentLogs] = useState([]);
  const [platformUsage, setPlatformUsage] = useState({
    tiktok: { time: 145, risk: 'medium', lastUsed: '2 hours ago' },
    instagram: { time: 89, risk: 'low', lastUsed: '4 hours ago' },
    youtube: { time: 203, risk: 'high', lastUsed: '30 mins ago' },
    twitter: { time: 67, risk: 'medium', lastUsed: '1 hour ago' },
    facebook: { time: 34, risk: 'low', lastUsed: '5 hours ago' }
  });
  const [contentAlerts, setContentAlerts] = useState([
    { id: 1, type: 'warning', platform: 'YouTube', content: 'Extended viewing of negative news content', time: '15 mins ago', severity: 'medium' },
    { id: 2, type: 'danger', platform: 'TikTok', content: 'Content flagged as potentially harmful', time: '1 hour ago', severity: 'high' },
    { id: 3, type: 'info', platform: 'Instagram', content: 'Screen time limit approaching', time: '2 hours ago', severity: 'low' }
  ]);
  const [contentCategories, setContentCategories] = useState({
    harmful: 5,
    educational: 15,
    explicit: 2,
    entertaining: 25,
    news: 10,
    social_media: 30,
    productive: 8,
    neutral: 5
  });

  // Content Analysis States
  const [analysisInput, setAnalysisInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [safetySettings, setSafetySettings] = useState({
    blockHarmfulContent: true,
    ageRestrictions: true,
    mentalHealthFilter: true,
    screenTimeLimit: 180,
    parentalControls: false
  });

  useEffect(() => {
    let interval;
    if (isTimerActive && focusTime > 0) {
      interval = setInterval(() => {
        setFocusTime(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const handleTimerComplete = () => {
    setIsTimerActive(false);
    const sessionDuration = 25;
    const newSession = {
      id: Date.now(),
      duration: sessionDuration,
      timestamp: new Date().toISOString(),
      completed: true
    };
    
    setFocusSessions(prev => [...prev, newSession]);
    setUserStats(prev => ({
      ...prev,
      totalFocusTime: prev.totalFocusTime + sessionDuration,
      sessionsCompleted: prev.sessionsCompleted + 1,
      currentStreak: prev.currentStreak + 1,
      ecosystemLevel: Math.floor((prev.totalFocusTime + sessionDuration) / 100) + 1
    }));
    
    alert('🎉 Focus session completed! Great work!');
  };

  const startTimer = () => {
    setIsTimerActive(true);
  };

  const pauseTimer = () => {
    setIsTimerActive(false);
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setFocusTime(25 * 60);
  };

  const handleLogin = () => {
    if (loginEmail && loginPassword) {
      setCurrentUser({
        id: 1,
        name: loginEmail.split('@')[0],
        email: loginEmail,
        age: 20,
        joinDate: new Date().toISOString()
      });
      setActiveTab('dashboard');
      setLoginEmail('');
      setLoginPassword('');
    }
  };

  const handleRegister = () => {
    if (regName && regEmail && regPassword && regAge) {
      setCurrentUser({
        id: 1,
        name: regName,
        email: regEmail,
        age: parseInt(regAge),
        joinDate: new Date().toISOString()
      });
      setActiveTab('dashboard');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegAge('');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const logMood = (mood) => {
    const entry = {
      id: Date.now(),
      mood: mood,
      timestamp: new Date().toISOString(),
      screenTime: Math.floor(Math.random() * 300) + 60
    };
    
    setMoodEntries(prev => [...prev, entry]);
    setTodayMood(mood);
  };

  const handleAnalyzeContent = async () => {
    if (!analysisInput.trim()) return;
    
    setAnalyzing(true);
    try {
      const result = await contentAPI.analyzeContent({ contentInput: analysisInput });
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisResult({ category: 'error', reason: 'Analysis failed. Please try again.' });
    } finally {
      setAnalyzing(false);
    }
  };

  const logContentUsage = (platform, category, duration) => {
    const log = {
      id: Date.now(),
      platform,
      category,
      duration,
      timestamp: new Date().toISOString(),
      flagged: category === 'harmful' || category === 'inappropriate'
    };
    setContentLogs(prev => [log, ...prev].slice(0, 10));
  };

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

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'high': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'low': return <BellRing className="w-5 h-5 text-blue-500" />;
      default: return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const bgClass = darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';
  const cardClass = darkMode ? 'bg-slate-800/50 backdrop-blur-sm border border-slate-700' : 'bg-white/80 backdrop-blur-sm border border-purple-200';
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const mutedClass = darkMode ? 'text-slate-400' : 'text-slate-600';

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

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setCurrentView('login')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                currentView === 'login'
                  ? 'bg-purple-600 text-white'
                  : `${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setCurrentView('register')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                currentView === 'register'
                  ? 'bg-purple-600 text-white'
                  : `${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`
              }`}
            >
              Register
            </button>
          </div>

          {currentView === 'login' ? (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${mutedClass} mb-2`}>Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg ${
                    darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-900 border-slate-300'
                  } border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${mutedClass} mb-2`}>Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className={`w-full px-4 py-3 rounded-lg ${
                    darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-900 border-slate-300'
                  } border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${mutedClass} mb-2`}>Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg ${
                    darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-900 border-slate-300'
                  } border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${mutedClass} mb-2`}>Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg ${
                    darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-900 border-slate-300'
                  } border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${mutedClass} mb-2`}>Age</label>
                <input
                  type="number"
                  value={regAge}
                  onChange={(e) => setRegAge(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg ${
                    darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-900 border-slate-300'
                  } border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  placeholder="18"
                  min="13"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${mutedClass} mb-2`}>Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                  className={`w-full px-4 py-3 rounded-lg ${
                    darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-900 border-slate-300'
                  } border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                />
              </div>
              <button
                onClick={handleRegister}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
              >
                Create Account
              </button>
            </div>
          )}

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`mt-6 w-full py-2 px-4 rounded-lg ${
              darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
            } flex items-center justify-center gap-2 hover:scale-105 transition-all`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
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
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} hover:scale-110 transition-all`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <User className="w-5 h-5" />
                <span className={`font-medium ${textClass}`}>{currentUser.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'safety', label: 'Content Safety', icon: Shield },
              { id: 'analysis', label: 'Content Analysis', icon: Eye },
              { id: 'analytics', label: 'Analytics', icon: Activity },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : `${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'} hover:scale-105`
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`${cardClass} rounded-xl p-6 hover:scale-105 transition-all`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-500/20 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-purple-500" />
                  </div>
                  <span className={`text-sm ${mutedClass}`}>Total Focus</span>
                </div>
                <p className={`text-3xl font-bold ${textClass}`}>{userStats.totalFocusTime}m</p>
                <p className={`text-sm ${mutedClass} mt-1`}>Across all sessions</p>
              </div>

              <div className={`${cardClass} rounded-xl p-6 hover:scale-105 transition-all`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500/20 p-3 rounded-lg">
                    <Target className="w-6 h-6 text-green-500" />
                  </div>
                  <span className={`text-sm ${mutedClass}`}>Sessions</span>
                </div>
                <p className={`text-3xl font-bold ${textClass}`}>{userStats.sessionsCompleted}</p>
                <p className={`text-sm ${mutedClass} mt-1`}>Completed</p>
              </div>

              <div className={`${cardClass} rounded-xl p-6 hover:scale-105 transition-all`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-500/20 p-3 rounded-lg">
                    <Zap className="w-6 h-6 text-orange-500" />
                  </div>
                  <span className={`text-sm ${mutedClass}`}>Streak</span>
                </div>
                <p className={`text-3xl font-bold ${textClass}`}>{userStats.currentStreak}</p>
                <p className={`text-sm ${mutedClass} mt-1`}>Days in a row</p>
              </div>

              <div className={`${cardClass} rounded-xl p-6 hover:scale-105 transition-all`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className={`text-sm ${mutedClass}`}>Safety Score</span>
                </div>
                <p className={`text-3xl font-bold ${textClass}`}>{userStats.safetyScore}%</p>
                <p className={`text-sm ${mutedClass} mt-1`}>Digital wellbeing</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className={`lg:col-span-2 ${cardClass} rounded-xl p-8`}>
                <h2 className={`text-2xl font-bold ${textClass} mb-6 flex items-center gap-2`}>
                  <Timer className="w-6 h-6 text-purple-500" />
                  Focus Session
                </h2>
                
                <div className="flex flex-col items-center">
                  <div className="relative w-64 h-64 mb-8">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke={darkMode ? '#334155' : '#e2e8f0'}
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 120}`}
                        strokeDashoffset={`${2 * Math.PI * 120 * (focusTime / (25 * 60))}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-5xl font-bold ${textClass}`}>{formatTime(focusTime)}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {!isTimerActive ? (
                      <button
                        onClick={startTimer}
                        disabled={focusTime === 0}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Start Focus
                      </button>
                    ) : (
                      <button
                        onClick={pauseTimer}
                        className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all shadow-lg"
                      >
                        Pause
                      </button>
                    )}
                    <button
                      onClick={resetTimer}
                      className={`px-8 py-3 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} ${textClass} rounded-lg font-semibold hover:scale-105 transition-all`}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className={`${cardClass} rounded-xl p-6`}>
                <h2 className={`text-xl font-bold ${textClass} mb-4 flex items-center gap-2`}>
                  <Heart className="w-5 h-5 text-pink-500" />
                  Mood Check-in
                </h2>
                
                <p className={`text-sm ${mutedClass} mb-6`}>How are you feeling today?</p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { emoji: '😊', label: 'Great', value: 5 },
                    { emoji: '🙂', label: 'Good', value: 4 },
                    { emoji: '😐', label: 'Okay', value: 3 },
                    { emoji: '😔', label: 'Low', value: 2 }
                  ].map(mood => (
                    <button
                      key={mood.value}
                      onClick={() => logMood(mood.value)}
                      className={`p-4 rounded-lg ${
                        todayMood === mood.value
                          ? 'bg-purple-500 text-white'
                          : darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'
                      } transition-all hover:scale-105`}
                    >
                      <div className="text-3xl mb-1">{mood.emoji}</div>
                      <div className={`text-sm font-medium ${todayMood === mood.value ? 'text-white' : textClass}`}>
                        {mood.label}
                      </div>
                    </button>
                  ))}
                </div>

                {moodEntries.length > 0 && (
                  <div>
                    <h3 className={`text-sm font-semibold ${mutedClass} mb-3`}>Recent Entries</h3>
                    <div className="space-y-2">
                      {moodEntries.slice(-3).reverse().map(entry => (
                        <div key={entry.id} className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${textClass}`}>
                              {entry.mood === 5 ? '😊 Great' : entry.mood === 4 ? '🙂 Good' : entry.mood === 3 ? '😐 Okay' : '😔 Low'}
                            </span>
                            <span className={`text-xs ${mutedClass}`}>
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* <div className={`${cardClass} rounded-xl p-6`}>
              <h2 className={`text-xl font-bold ${textClass} mb-4 flex items-center gap-2`}>
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Content Category Breakdown
              </h2>
              <ContentCategoryChart data={contentCategories} darkMode={darkMode} />
            </div> */}
          </>
        )}

        {activeTab === 'safety' && (
          <>
            <div className="mb-8">
              <h2 className={`text-3xl font-bold ${textClass} mb-2 flex items-center gap-3`}>
                <Shield className="w-8 h-8 text-purple-500" />
                Content Safety Monitor
              </h2>
              <p className={mutedClass}>Real-time tracking of your social media usage and content safety</p>
            </div>

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
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
                      style={{ width: `${userStats.safetyScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-2 ${cardClass} rounded-xl p-6`}>
                <h3 className={`font-bold ${textClass} mb-4`}>Platform Usage Today</h3>
                <div className="space-y-4">
                  {Object.entries(platformUsage).map(([platform, data]) => (
                    <div key={platform} className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Eye className="w-5 h-5 text-purple-500" />
                          <span className={`font-semibold ${textClass} capitalize`}>{platform}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(data.risk)}`}>
                          {data.risk.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={mutedClass}>{data.time} minutes</span>
                        <span className={`text-xs ${mutedClass}`}>{data.lastUsed}</span>
                      </div>
                      <div className="mt-2 h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            data.risk === 'high' ? 'bg-red-500' : 
                            data.risk === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((data.time / 300) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`${cardClass} rounded-xl p-6 mb-8`}>
              <h3 className={`font-bold ${textClass} mb-4 flex items-center gap-2`}>
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Recent Safety Alerts
              </h3>
              <div className="space-y-3">
                {contentAlerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'} hover:scale-102 transition-all`}>
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

            <div className={`${cardClass} rounded-xl p-6`}>
              <h3 className={`font-bold ${textClass} mb-4`}>Log Content Usage</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => logContentUsage('TikTok', 'entertainment', 30)}
                  className="p-4 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all"
                >
                  <div className="font-semibold mb-1">TikTok</div>
                  <div className="text-xs">Log 30 min</div>
                </button>
                <button
                  onClick={() => logContentUsage('Instagram', 'social', 20)}
                  className="p-4 rounded-lg bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-all"
                >
                  <div className="font-semibold mb-1">Instagram</div>
                  <div className="text-xs">Log 20 min</div>
                </button>
                <button
                  onClick={() => logContentUsage('YouTube', 'educational', 45)}
                  className="p-4 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                >
                  <div className="font-semibold mb-1">YouTube</div>
                  <div className="text-xs">Log 45 min</div>
                </button>
              </div>
              
              {contentLogs.length > 0 && (
                <div className="mt-6">
                  <h4 className={`text-sm font-semibold ${mutedClass} mb-3`}>Recent Logs</h4>
                  <div className="space-y-2">
                    {contentLogs.slice(0, 5).map(log => (
                      <div key={log.id} className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`font-medium ${textClass}`}>{log.platform}</span>
                            <span className={mutedClass}> • {log.category} • {log.duration}m</span>
                          </div>
                          {log.flagged && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'analysis' && (
          <>
            <div className="mb-8">
              <h2 className={`text-3xl font-bold ${textClass} mb-2 flex items-center gap-3`}>
                <Eye className="w-8 h-8 text-purple-500" />
                Content Analysis
              </h2>
              <p className={mutedClass}>Analyze content for safety and categorization</p>
            </div>

            <div className={`${cardClass} rounded-xl p-6 mb-6`}>
              <h3 className={`font-bold ${textClass} mb-4`}>Analyze Content</h3>
              <textarea
                value={analysisInput}
                onChange={(e) => setAnalysisInput(e.target.value)}
                placeholder="Enter content to analyze..."
                className={`w-full p-4 rounded-lg ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-900 border-slate-300'} border focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none`}
                rows={6}
              />
              <button
                onClick={handleAnalyzeContent}
                disabled={!analysisInput.trim() || analyzing}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? 'Analyzing...' : 'Analyze Content'}
              </button>
            </div>

            {analysisResult && (
              <div className={`${cardClass} rounded-xl p-6`}>
                <h3 className={`font-bold ${textClass} mb-4`}>Analysis Result</h3>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${textClass}`}>Category</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        analysisResult.category === 'harmful' ? 'bg-red-500/20 text-red-400' :
                        analysisResult.category === 'educational' ? 'bg-green-500/20 text-green-400' :
                        analysisResult.category === 'entertaining' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {analysisResult.category.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${textClass}`}>Confidence</span>
                      <span className={mutedClass}>{(analysisResult.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                    <div className={`font-medium ${textClass} mb-2`}>Reason</div>
                    <p className={mutedClass}>{analysisResult.reason}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            <div className="mb-8">
              <h2 className={`text-3xl font-bold ${textClass} mb-2 flex items-center gap-3`}>
                <Activity className="w-8 h-8 text-purple-500" />
                Analytics & Insights
              </h2>
              <p className={mutedClass}>Understand your digital behavior patterns</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`${cardClass} rounded-xl p-6`}>
                <h3 className={`font-bold ${textClass} mb-4`}>Content Category Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { category: 'Educational', percentage: 35, color: 'bg-green-500' },
                    { category: 'Entertainment', percentage: 45, color: 'bg-purple-500' },
                    { category: 'Social', percentage: 15, color: 'bg-blue-500' },
                    { category: 'News', percentage: 5, color: 'bg-orange-500' }
                  ].map(item => (
                    <div key={item.category}>
                      <div className="flex justify-between mb-2">
                        <span className={textClass}>{item.category}</span>
                        <span className={mutedClass}>{item.percentage}%</span>
                      </div>
                      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} transition-all`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${cardClass} rounded-xl p-6`}>
                <h3 className={`font-bold ${textClass} mb-4`}>Mental Health Risk Assessment</h3>
                <div className="space-y-4">
                  {[
                    { risk: 'Exposure to Negative Content', level: 'Medium', value: 45, color: 'orange' },
                    { risk: 'Excessive Screen Time', level: 'High', value: 70, color: 'red' },
                    { risk: 'Poor Sleep Correlation', level: 'Low', value: 25, color: 'green' },
                    { risk: 'Mood Impact', level: 'Medium', value: 50, color: 'orange' }
                  ].map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm ${textClass}`}>{item.risk}</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          item.color === 'red' ? 'bg-red-500/20 text-red-400' :
                          item.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {item.level}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            item.color === 'red' ? 'bg-red-500' :
                            item.color === 'orange' ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`${cardClass} rounded-xl p-6`}>
              <h3 className={`font-bold ${textClass} mb-4`}>Weekly Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-purple-500/20">
                  <div className={`text-2xl font-bold ${textClass}`}>538</div>
                  <div className={`text-sm ${mutedClass}`}>Total Minutes</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-500/20">
                  <div className={`text-2xl font-bold ${textClass}`}>12</div>
                  <div className={`text-sm ${mutedClass}`}>Safe Days</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-orange-500/20">
                  <div className={`text-2xl font-bold ${textClass}`}>8</div>
                  <div className={`text-sm ${mutedClass}`}>Warnings</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-500/20">
                  <div className={`text-2xl font-bold ${textClass}`}>85%</div>
                  <div className={`text-sm ${mutedClass}`}>Avg Safety</div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <div className="mb-8">
              <h2 className={`text-3xl font-bold ${textClass} mb-2 flex items-center gap-3`}>
                <Settings className="w-8 h-8 text-purple-500" />
                Safety Settings
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
                        onClick={() => setSafetySettings(prev => ({...prev, [setting.key]: !prev[setting.key]}))}
                        className={`relative w-14 h-8 rounded-full transition-all ${
                          safetySettings[setting.key] ? 'bg-purple-600' : 'bg-slate-600'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all ${
                          safetySettings[setting.key] ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* <div className={`${cardClass} rounded-xl p-6 mb-6`}>
              <h3 className={`font-bold ${textClass} mb-4`}>Screen Time Limit</h3>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={textClass}>Daily Limit</span>
                  <span className={`text-2xl font-bold ${textClass}`}>{safetySettings.screenTimeLimit} min</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="360"
                  step="30"
                  value={safetySettings.screenTimeLimit}
                  onChange={(e) => setSafetySettings(prev => ({...prev, screenTimeLimit: parseInt(e.target.value)}))}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2">
                  <span className={`text-xs ${mutedClass}`}>1 hour</span>
                  <span className={`text-xs ${mutedClass}`}>6 hours</span>
                </div>
              </div>
            </div> */}

            <div className={`${cardClass} rounded-xl p-6`}>
              <h3 className={`font-bold ${textClass} mb-4`}>User Information</h3>
              <div className="space-y-3">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                  <div className={`text-sm ${mutedClass} mb-1`}>Name</div>
                  <div className={textClass}>{currentUser.name}</div>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                  <div className={`text-sm ${mutedClass} mb-1`}>Email</div>
                  <div className={textClass}>{currentUser.email}</div>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                  <div className={`text-sm ${mutedClass} mb-1`}>Age</div>
                  <div className={textClass}>{currentUser.age} years old</div>
                  <div className={`text-xs ${mutedClass} mt-1`}>
                    {currentUser.age < 18 ? '⚠️ Youth account - Enhanced protections active' : '✓ Adult account'}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MindfulTechApp;