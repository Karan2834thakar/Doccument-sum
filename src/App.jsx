import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion' // eslint-disable-line no-unused-vars
import * as Yup from 'yup'
import { useFormik } from 'formik'
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Cpu,
  FileUp,
  BrainCircuit,
  Terminal,
  ShieldCheck,
  Zap,
  Check,
  X,
  User,
  LogOut,
  Lock,
  History,
  Trash2,
  Download,
  MessageSquare,
  Send
} from 'lucide-react'
import { authAPI, summaryAPI } from './api'
import Model3D from './components/Model3D'
const cleanResponseText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return rawText;
  let clean = rawText.trim();
  if (clean.startsWith('(() =>') || clean.startsWith('(function')) {
    const returnMatch = clean.match(/return\s+([^;]+);?\s*}\s*\)\s*\(\s*\)$/s);
    if (returnMatch) {
      clean = returnMatch[1].trim();
      if ((clean.startsWith('"') && clean.endsWith('"')) ||
        (clean.startsWith("'") && clean.endsWith("'")) ||
        (clean.startsWith('`') && clean.endsWith('`'))) {
        clean = clean.slice(1, -1);
      }
    }
  }
  clean = clean.replace(/<(div|p|br|hr|h[1-6]|li)[^>]*>/gi, '\n');
  clean = clean.replace(/<[^>]*>/g, '');
  clean = clean.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  clean = clean.replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\t/g, '  ');
  return clean.trim();
};

const formatJsonAsText = (obj, indent = '') => {
  if (!obj || typeof obj !== 'object') return String(obj || '');
  let result = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'status' || key === 'processed_at') continue;
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (Array.isArray(value)) {
      if (value.length > 0) {
        result.push(`${indent}${label}:`);
        value.forEach((item) => {
          if (typeof item === 'object') {
            result.push(formatJsonAsText(item, indent + '  '));
          } else {
            result.push(`${indent}  • ${item}`);
          }
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      result.push(`${indent}${label}:`);
      result.push(formatJsonAsText(value, indent + '  '));
    } else if (value) {
      result.push(`${indent}${label}: ${value}`);
    }
  }
  return result.join('\n');
};

const findDeepestValue = (obj, targetKeys) => {
  if (!obj || typeof obj !== 'object') return null;
  for (const key of targetKeys) {
    if (obj[key] && typeof obj[key] === 'string' && obj[key].trim().length > 10) return obj[key];
  }
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === 'object') {
      const found = findDeepestValue(obj[key], targetKeys);
      if (found) return found;
    }
  }
  return null;
};

const findDeepestArray = (obj, targetKeys) => {
  if (!obj || typeof obj !== 'object') return null;
  for (const key of targetKeys) {
    if (Array.isArray(obj[key]) && obj[key].length > 0) return obj[key];
  }
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === 'object') {
      const found = findDeepestArray(obj[key], targetKeys);
      if (found) return found;
    }
  }
  return null;
};

function App() {
  const [view, setView] = useState('landing') // 'landing' or 'tool'
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [showDemo, setShowDemo] = useState(false)
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [authView, setAuthView] = useState('login') // 'login', 'signup', 'forgot', 'reset'
  const [resetToken, setResetToken] = useState(null)
  const [resetTokenFromAPI, setResetTokenFromAPI] = useState(null)
  const [authError, setAuthError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [demoText, setDemoText] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [summaries, setSummaries] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [isChatting, setIsChatting] = useState(false)
  const [currentSummaryId, setCurrentSummaryId] = useState(null)
  const uploadSectionRef = useRef(null)

  // Diagnostic Log
  useEffect(() => {
    console.log('App State Update:', {
      hasUser: !!user,
      view,
      currentSummaryId,
      hasResult: !!result,
      chatHistoryCount: chatHistory.length
    });
  }, [user, view, currentSummaryId, result, chatHistory]);

  // Validation Schemas
  const loginSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Password too short').required('Password required')
  })

  const registerSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'At least 6 characters').required('Password required')
  })

  const forgotSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required')
  })

  const resetSchema = Yup.object({
    password: Yup.string().min(6, 'At least 6 characters').required('Password required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm your password')
  })

  const authForm = useFormik({
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    validationSchema: authView === 'signup' ? registerSchema : authView === 'forgot' ? forgotSchema : authView === 'reset' ? resetSchema : loginSchema,
    onSubmit: async (values) => {
      setAuthError(null)
      setSuccessMessage(null)
      setLoading(true)
      try {
        let res;
        if (authView === 'login') {
          res = await authAPI.login(values.email, values.password)
        } else if (authView === 'signup') {
          res = await authAPI.register(values.name, values.email, values.password)
        } else if (authView === 'forgot') {
          const res = await authAPI.forgotPassword(values.email)
          setSuccessMessage(res.message)
          setResetTokenFromAPI(res.resetToken)
          setLoading(false)
          return
        } else if (authView === 'reset') {
          await authAPI.resetPassword(resetToken, values.password)
          setSuccessMessage('Password updated! You can now login.')
          setAuthView('login')
          setLoading(false)
          return
        }

        localStorage.setItem('token', res.token)
        localStorage.setItem('user', JSON.stringify(res.user))
        setUser(res.user)
        setShowAuth(false)
        authForm.resetForm()
      } catch (err) {
        setAuthError(err.message)
      } finally {
        setLoading(false)
      }
    }
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }

    // Handle Reset Password Route
    const path = window.location.pathname
    if (path.startsWith('/reset-password/')) {
      const token = path.split('/').pop()
      setResetToken(token)
      setAuthView('reset')
      setShowAuth(true)
      // Clean up URL
      window.history.replaceState({}, document.title, "/")
    }
  }, [])

  useEffect(() => {
    if (showDemo) {
      setDemoText('')
      const fullText = `"The document outlines a 15% growth strategy for the upcoming fiscal year, driven by expansion into emerging markets and optimization of existing operational workflows. Key focus is on AI-integrated customer service and a $4.2M reduction in overhead via automation."`
      let i = 0
      const timer = setInterval(() => {
        setDemoText(fullText.slice(0, i))
        i++
        if (i > fullText.length) clearInterval(timer)
      }, 15)
      return () => clearInterval(timer)
    }
  }, [showDemo])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/plain',
      'text/csv'
    ]
    const allowedExtensions = ['.pdf', '.txt', '.csv', '.xlsx', '.xls']
    const fileExtension = selectedFile.name.slice((selectedFile.name.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase()

    if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(`.${fileExtension}`)) {
      setError('Please upload a PDF, TXT, CSV, or XLSX file.')
      setFile(null)
      return
    }

    setFile(selectedFile)
    setError(null)
    setResult(null)
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setCurrentSummaryId(null)

    const formData = new FormData()
    formData.append('data', file)

    try {
      const webhookUrl = 'https://n8n.srv1202847.hstgr.cloud/webhook/62728a15-7788-41dd-baf0-d57dbf1fed42'

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}. Please check your n8n workflow logs.`)
      }

      const text = await response.text()
      if (!text) {
        throw new Error('The n8n workflow finished but returned no data.')
      }

      if (text.trim().startsWith('<') || text.trim().startsWith('The page')) {
        setResult({ summary: "System received an unexpected response. Please verify your n8n workflow is active.", key_points: [] })
        return
      }

      const summaryKeys = ['summary', 'professional_summary', 'professionalSummary', 'overview', 'description', 'text', 'output', 'content', 'result', 'message', 'document_summary'];
      const pointKeys = ['key_points', 'points', 'highlights', 'insights', 'result', 'keyPoints'];

      let data;
      let isJson = false;
      let finalSummary = '';
      let finalKeyPoints = [];

      try {
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
          data = JSON.parse(text);
          isJson = true;
        } else {
          console.warn('Response is not JSON, treating as raw string.');
          data = text;
        }

        if (isJson) {
          if (Array.isArray(data)) data = data[0] || {}
          if (data.json && typeof data.json === 'object') data = data.json

          const rawSummary = findDeepestValue(data, summaryKeys);
          const extractedKeyPoints = findDeepestArray(data, pointKeys);

          if (rawSummary) {
            finalSummary = cleanResponseText(rawSummary);
          } else if (typeof data === 'string') {
            finalSummary = cleanResponseText(data);
          } else {
            finalSummary = formatJsonAsText(data);
          }
          finalKeyPoints = extractedKeyPoints || [];
        } else {
          finalSummary = cleanResponseText(text);
        }

        const summaryData = {
          summary: finalSummary || 'Analysis complete.',
          key_points: finalKeyPoints
        };

        setResult(summaryData);

        // Save to backend if logged in
        if (user) {
          try {
            console.log('📡 Attempting to save summary to cloud...');
            const saved = await summaryAPI.save(file.name, file.type || 'document', summaryData.summary, summaryData.key_points, text)

            const newId = saved.summary?._id || saved.summary?.id || saved.id || saved._id;
            if (newId) {
              console.log('✅ Summary saved successfully. ID:', newId);
              setCurrentSummaryId(newId);
            } else {
              console.warn('⚠️ Summary saved but ID was not found in response:', saved);
              setError('Analysis complete, but failed to retrieve cloud ID. Chat may be limited.');
            }
          } catch (saveErr) {
            console.error('Failed to save summary:', saveErr)
            if (saveErr.message === 'UNAUTHORIZED') {
              handleLogout();
              setShowAuth(true);
              setError('Your session has expired. Please login again to save your history.');
            } else {
              setError(`Analysis complete, but failed to save to cloud: ${saveErr.message}. Chat may be unavailable.`)
            }
          }
        } else {
          console.warn('No user logged in, summary will not be saved to cloud.');
          setError('Please login to save your analysis and enable chat features.')
        }
      } catch (err) {
        console.error('Processing error in handleUpload:', err);
        setError(`Error processing analysis: ${err.message}`);
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const scrollToTool = () => {
    if (!user) {
      setShowAuth(true)
      return
    }
    setView('tool')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setView('landing')
  }

  const fetchHistory = async () => {
    setLoadingHistory(true)
    try {
      const res = await summaryAPI.getAll()
      setSummaries(res.summaries)
    } catch (err) {
      console.error('History fetch error:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const deleteSummary = async (id) => {
    try {
      await summaryAPI.delete(id)
      setSummaries(summaries.filter(s => s._id !== id))
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const handleViewDemo = () => {
    setShowDemo(true)
  }

  const handleDownload = () => {
    if (!currentSummaryId) return;
    window.open(summaryAPI.download(currentSummaryId), '_blank');
  }

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();

    // Explicitly log the click event
    console.log('🔥 handleSendMessage TRIGGERED');
    console.log('--- Context ---');
    console.log('Message:', chatMessage);
    console.log('Summary ID:', currentSummaryId);
    console.log('Is Chatting:', isChatting);
    console.log('User:', user?.name);

    if (!chatMessage || !chatMessage.trim()) {
      console.warn('Empty message, ignoring.');
      return;
    }

    if (!currentSummaryId) {
      console.error('CRITICAL: No currentSummaryId found!');
      setChatHistory(prev => [...prev, {
        role: 'error',
        content: 'System Error: No document reference found. Please try re-uploading the file.'
      }]);
      return;
    }

    if (isChatting) {
      console.warn('Already chatting, ignoring click.');
      return;
    }

    const userMsg = { role: 'user', content: chatMessage.trim() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setIsChatting(true);

    try {
      console.log('📡 Sending request to backend...');
      const res = await summaryAPI.chat(currentSummaryId, userMsg.content);
      console.log('✅ Received response from backend:', res);
      setChatHistory(prev => [...prev, { role: 'ai', content: res.reply }]);
    } catch (err) {
      console.error('❌ Chat API Failure:', err);
      if (err.message === 'UNAUTHORIZED') {
        handleLogout();
        setShowAuth(true);
        setChatHistory(prev => [...prev, { role: 'error', content: 'Your session has expired. Please login again.' }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'error', content: err.message || 'The server failed to respond. Please check your connection.' }]);
      }
    } finally {
      setIsChatting(false);
      console.log('🏁 Chat flow complete.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[130px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[130px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-blue-600/5 blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Unified Nav */}
      <nav className={`fixed top-0 left-0 w-full z-50 px-4 md:px-10 h-20 md:h-24 glass backdrop-blur-xl border-b border-white/5 transition-all duration-500 ${showDemo ? 'blur-md pointer-events-none' : ''}`}>
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-indigo-500" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-white">Axon</span>
          </div>

          {/* Desktop Navigation Links */}
          {view === 'landing' && (
            <div className="hidden lg:flex items-center gap-8">
              {[
                { name: 'Features', id: 'features' },
                { name: 'Process', id: 'process' },
                { name: 'Security', id: 'security' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    const el = document.getElementById(item.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <div className="flex items-center gap-2 md:gap-4">
                <button
                  onClick={() => { fetchHistory(); setShowHistory(true); }}
                  className="p-2 md:p-2.5 rounded-xl glass hover:bg-white/10 text-slate-400 hover:text-indigo-400 transition-all"
                  title="View History"
                >
                  <History className="w-5 h-5" />
                </button>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-bold text-slate-200">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 md:p-2.5 rounded-xl glass hover:bg-red-500/10 hover:text-red-400 transition-all font-bold"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 md:hidden" />
                  <span className="hidden md:block text-[10px] uppercase tracking-widest">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl glass hover:bg-white/10 text-white font-bold transition-all text-sm md:text-base"
              >
                Login
              </button>
            )}
            {view === 'landing' ? (
              <button
                onClick={scrollToTool}
                className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10 text-sm md:text-base active:scale-95"
              >
                {user ? (window.innerWidth < 640 ? 'Tool' : 'Open Tool') : 'Start'}
              </button>
            ) : (
              <button
                onClick={() => setView('landing')}
                className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl border border-white/5 glass hover:bg-white/10 text-slate-400 text-sm font-bold transition-all flex items-center gap-2 active:scale-95"
              >
                <span>Home</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={`relative z-10 transition-all duration-500 ${showDemo ? 'blur-md scale-95 pointer-events-none' : ''}`}
          >

            {/* Hero Section */}
            <section className="relative pt-28 md:pt-40 pb-16 md:pb-20 px-4 md:px-6 min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">

              {/* Central Visualization Area - Moved Up */}
              <div className="w-full max-w-4xl h-[200px] xs:h-[250px] md:h-[350px] relative mb-4 md:mb-6">
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <Model3D modelUrl="/models/model.obj" />
                </div>
              </div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="mb-6 md:mb-8 inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full glass border border-white/10 text-indigo-400 text-xs md:text-sm font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 md:w-4 h-4 animate-pulse" />
                <span>Next-Gen Document Intelligence</span>
              </motion.div>

              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl xs:text-5xl md:text-7xl lg:text-8xl font-black mb-6 md:mb-8 tracking-tighter leading-[1.1] md:leading-[1.05] px-4 md:px-0"
              >
                <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">Stop Reading.</span>
                <span className="block">
                  Start <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-gradient-x italic">Knowing.</span>
                </span>
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-base md:text-xl text-slate-400 max-w-2xl mb-10 md:mb-12 leading-relaxed px-4 md:px-0"
              >
                The world's fastest document summarization engine.
                Turn complex reports into executive insights in milleseconds.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 md:gap-5"
              >
                <button
                  onClick={scrollToTool}
                  className="h-14 md:h-16 px-8 md:px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 active:scale-95 text-lg md:text-xl"
                >
                  <span>Upload Document</span>
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button
                  onClick={handleViewDemo}
                  className="h-14 md:h-16 px-8 md:px-10 rounded-2xl glass hover:bg-white/10 text-white font-bold transition-all flex items-center justify-center gap-3 active:scale-95 text-base md:text-lg"
                >
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  <span>View Demo</span>
                </button>
              </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto">
              <div className="text-center mb-16 md:mb-20">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 italic tracking-tight">Powerful Core Features</h2>
                <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base px-4">Engineered for quality, speed, and uncompromising privacy.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {[
                  {
                    icon: <BrainCircuit className="w-6 h-6 md:w-8 md:h-8" />,
                    title: "Nueron-Link AI",
                    desc: "Uses contextual understanding to maintain document tone and intent.",
                    color: "text-indigo-400"
                  },
                  {
                    icon: <Zap className="w-6 h-6 md:w-8 md:h-8" />,
                    title: "Instant Processing",
                    desc: "Parallelized cloud execution allows for 100+ page summaries in under 5 seconds.",
                    color: "text-yellow-400"
                  },
                  {
                    icon: <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />,
                    title: "Privacy First",
                    desc: "Your data is processed in a stateless environment. Nothing stays on our servers.",
                    color: "text-emerald-400"
                  }
                ].map((feat, i) => (
                  <motion.div
                    key={i}
                    whileInView={{ y: [40, 0], opacity: [0, 1] }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group glass p-8 md:p-10 rounded-3xl md:rounded-[40px] border-white/5 hover:border-indigo-500/30 transition-all hover:-translate-y-2"
                  >
                    <div className={`mb-6 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 ${feat.color} group-hover:scale-110 transition-transform`}>
                      {feat.icon}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-white tracking-tight leading-none">{feat.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-base md:text-lg">{feat.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Process Section */}
            <section id="process" className="py-20 md:py-32 bg-slate-900/40 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#6366f1 0.5px, transparent 0.5px)", backgroundSize: "32px 32px" }}></div>

              <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                  <div className="flex-1 space-y-6 md:space-y-8">
                    <h2 className="text-3xl md:text-5xl font-black mb-6 md:mb-8 leading-tight italic">How We Distill <br className="hidden md:block" /> Information</h2>

                    <div className="space-y-8 md:space-y-12">
                      {[
                        { step: "01", title: "Upload & Ingest", desc: "Select your files. We support PDF, DOCX, and TXT seamlessly." },
                        { step: "02", title: "AI Analysis", desc: "Our engine maps the structure, tone, and key arguments of the text." },
                        { step: "03", title: "Insight Generation", desc: "The core summary and key insights are generated in real-time." }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4 md:gap-6 items-start">
                          <div className="text-2xl md:text-3xl font-black text-indigo-500/30 font-mono pt-1">{item.step}</div>
                          <div>
                            <h4 className="text-xl md:text-2xl font-bold text-white mb-2">{item.title}</h4>
                            <p className="text-slate-400 text-base md:text-lg leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 w-full max-w-sm md:max-w-lg aspect-square relative">
                    <div className="absolute inset-0 bg-indigo-600/20 blur-[60px] md:blur-[100px]"></div>
                    <div className="relative h-full glass rounded-[40px] md:rounded-[60px] border border-white/10 flex items-center justify-center group overflow-hidden">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 opacity-10 border-[1px] border-dashed border-indigo-400 rounded-full m-8 md:m-10"
                      ></motion.div>
                      <Cpu className="w-20 h-20 md:w-32 md:h-32 text-indigo-600 group-hover:scale-125 transition-transform duration-500" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section id="security" className="py-20 md:py-32 px-4 md:px-6">
              <div className="max-w-4xl mx-auto glass p-10 md:p-20 rounded-[40px] md:rounded-[50px] border-indigo-500/20 relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl text-center"></div>
                <Lock className="w-12 h-12 md:w-16 md:h-16 text-indigo-400 mx-auto mb-6 md:mb-8" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-white italic">Bank-Grade Security</h2>
                <p className="text-lg md:text-xl text-slate-400 mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto">
                  Your documents are end-to-end encrypted. We leverage SOC2 compliant processing
                  environments to ensure your intellectual property remains private.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 opacity-60">
                  <span className="flex items-center gap-2 font-bold text-[10px] md:text-xs tracking-widest uppercase text-slate-500">
                    <Check className="w-4 h-4 text-emerald-500" /> AES-256 Encryption
                  </span>
                  <span className="flex items-center gap-2 font-bold text-[10px] md:text-xs tracking-widest uppercase text-slate-500">
                    <Check className="w-4 h-4 text-emerald-500" /> TLS 1.3 Transmission
                  </span>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="py-12 md:py-20 border-t border-white/5 px-4 md:px-6">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 opacity-40 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold tracking-tight text-white">Axon © 2026</span>
                </div>
                <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-xs md:text-sm font-medium">
                  <button onClick={() => alert('API Docs coming soon!')} className="hover:text-white transition-colors">API Docs</button>
                  <button onClick={() => alert('Privacy Policy coming soon!')} className="hover:text-white transition-colors">Privacy Policy</button>
                  <button onClick={() => alert('Terms of Service coming soon!')} className="hover:text-white transition-colors">Terms of Service</button>
                </div>
              </div>
            </footer>
          </motion.div>
        ) : (
          <motion.div
            key="tool"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 100 }}
            className="relative z-10 max-w-4xl mx-auto pt-32 md:pt-40 pb-16 md:pb-20 px-4 md:px-6 min-h-screen"
            ref={uploadSectionRef}
          >

            <div className="parallax-inner space-y-8 md:space-y-12">
              <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter italic">AI Analysis Hub</h2>
                <p className="text-slate-500 text-base md:text-lg">Upload document to extract executive summaries and core insights.</p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:gap-10 group/space">
                {/* Upload Card */}
                <motion.div
                  className={`glass p-6 md:p-8 rounded-[32px] md:rounded-[48px] border-white/5 shadow-3xl transition-all duration-700 relative overflow-hidden ${!file ? 'md:p-12' : 'md:p-8'}`}
                  layout
                >
                  <AnimatePresence mode="wait">
                    {!result ? (
                      <motion.div
                        key="upload-ui"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6 md:space-y-8"
                      >
                        <label
                          htmlFor="dropzone-file"
                          className={`relative flex flex-col items-center justify-center w-full min-h-[280px] md:min-h-[320px] border-2 border-dashed rounded-[24px] md:rounded-[32px] cursor-pointer transition-all ${file ? 'border-indigo-500 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10' : 'border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 hover:border-slate-700'
                            }`}
                        >
                          {loading && (
                            <div className="absolute inset-0 bg-indigo-600/5 rounded-[24px] md:rounded-[32px] overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent animate-scan" style={{ height: '50%' }}></div>
                            </div>
                          )}

                          <div className="flex flex-col items-center justify-center p-6 md:p-8 text-center">
                            <motion.div
                              animate={loading ? {
                                scale: [1, 1.15, 1],
                                opacity: [1, 0.5, 1],
                                rotate: [0, 5, -5, 0]
                              } : {}}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className={`w-16 h-16 md:w-24 md:h-24 mb-4 md:mb-6 rounded-2xl md:rounded-3xl flex items-center justify-center border-2 transition-all shadow-2xl ${file ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-600/30' : 'bg-slate-900 text-slate-600 border-white/5'
                                }`}
                            >
                              {loading ? <Cpu className="w-8 h-8 md:w-12 md:h-12" /> : file ? <CheckCircle className="w-8 h-8 md:w-12 md:h-12" /> : <FileUp className="w-8 h-8 md:w-12 md:h-12" />}
                            </motion.div>

                            {file ? (
                              <div className="space-y-2">
                                <p className="text-xl md:text-2xl font-black text-white italic truncate max-w-[200px] md:max-w-md">{file.name}</p>
                                <p className="text-[10px] md:text-sm font-bold text-indigo-400 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for AI</p>
                              </div>
                            ) : (
                              <>
                                <p className="text-xl md:text-2xl mb-2 md:mb-3 text-white font-bold tracking-tight italic">
                                  Drop your intelligence here
                                </p>
                                <p className="text-slate-500 text-xs md:text-sm font-medium">PDF, TXT, CSV, XLSX files accepted</p>
                              </>
                            )}
                          </div>
                          <input
                            id="dropzone-file"
                            type="file"
                            className="hidden"
                            accept=".pdf,.txt,.csv,.xlsx,.xls"
                            onChange={handleFileChange}
                            disabled={loading}
                          />
                        </label>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleUpload}
                          disabled={!file || loading}
                          className={`group w-full h-16 md:h-20 rounded-[20px] md:rounded-[24px] font-black text-lg md:text-xl transition-all flex items-center justify-center gap-3 md:gap-4 overflow-hidden relative ${!file || loading
                            ? 'bg-slate-900 border border-white/5 text-slate-700 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/30'
                            }`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          {loading ? (
                            <>
                              <BrainCircuit className="w-6 h-6 md:w-8 md:h-8 animate-spin" />
                              <span className="italic text-base md:text-lg">Engaging Neuron Model...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-6 h-6 md:w-7 md:h-7" />
                              <span className="italic uppercase tracking-wider text-base md:text-lg">Execute Summary</span>
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="success-ui"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col sm:flex-row items-center justify-between gap-6"
                      >
                        <div className="flex items-center gap-4 md:gap-6">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-inner border border-emerald-500/30">
                            <CheckCircle className="w-6 h-6 md:w-8 md:h-8" />
                          </div>
                          <div className="text-left">
                            <p className="text-xl md:text-3xl font-black text-white italic leading-none mb-1 md:mb-2">Analysis Complete</p>
                            <p className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest truncate max-w-[150px] md:max-w-[200px]">{file.name}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setFile(null); setResult(null); setError(null); }}
                          className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 text-xs md:text-sm italic transition-all active:scale-95"
                        >
                          New Upload
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Error Display */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-red-500/10 border border-red-500/20 p-5 md:p-6 rounded-[24px] md:rounded-[32px] flex items-start gap-4 md:gap-6 text-red-500"
                    >
                      <AlertCircle className="w-6 h-6 md:w-8 md:h-8 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-lg md:text-xl font-black mb-1 italic uppercase tracking-tighter">System Error 09x</p>
                        <p className="text-sm md:text-lg leading-relaxed font-medium opacity-80">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Results View */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 gap-8 md:gap-10"
                    >
                      <div className="glass p-8 md:p-14 rounded-[32px] md:rounded-[48px] border-white/5 relative shadow-3xl">
                        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10 overflow-hidden">
                          <div className="w-1 h-3 bg-indigo-500"></div>
                          <h3 className="text-xl md:text-3xl font-black text-white italic tracking-tighter uppercase">Executive Summary</h3>
                          <button
                            onClick={handleDownload}
                            className="ml-auto p-2 rounded-xl glass hover:bg-indigo-500/20 text-indigo-400 transition-all flex items-center gap-2"
                            title="Download PDF"
                          >
                            <Download className="w-5 h-5" />
                            <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Download</span>
                          </button>
                        </div>
                        <p className="text-lg md:text-2xl text-slate-200 leading-relaxed md:leading-[1.6] font-medium opacity-90 relative z-10 whitespace-pre-wrap">
                          {result.summary}
                        </p>
                        <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 opacity-5 pointer-events-none">
                          <FileText className="w-24 h-24 md:w-40 md:h-40" />
                        </div>
                      </div>

                      {/* Chat Interface */}
                      <div className="glass p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-white/5 bg-slate-900/30">
                        <div className="flex items-center gap-3 mb-6">
                          <MessageSquare className="w-6 h-6 text-indigo-400" />
                          <h3 className="text-lg md:text-xl font-black text-white italic tracking-tight">Chat with Document</h3>
                        </div>

                        <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                          {chatHistory.length === 0 ? (
                            <p className="text-slate-500 text-sm font-medium text-center py-10 italic">
                              Ask me anything about this document...
                            </p>
                          ) : (
                            chatHistory.map((msg, i) => (
                              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                  ? 'bg-indigo-600 text-white rounded-tr-none'
                                  : msg.role === 'error'
                                    ? 'bg-red-500/20 text-red-500 border border-red-500/20'
                                    : 'bg-white/5 text-slate-300 border border-white/5 rounded-tl-none'
                                  }`}>
                                  {msg.content}
                                </div>
                              </div>
                            ))
                          )}
                          {isChatting && (
                            <div className="flex justify-start">
                              <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none flex gap-1">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                              </div>
                            </div>
                          )}
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
                          <input
                            type="text"
                            placeholder="What's the main goal of this report?"
                            className="w-full h-14 pl-6 pr-14 bg-slate-900 border border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            disabled={isChatting || loading || !currentSummaryId}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (!isChatting && chatMessage.trim() && !loading && currentSummaryId) {
                                  handleSendMessage(e);
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              console.log('Button clicked');
                              handleSendMessage(e);
                            }}
                            disabled={isChatting || !chatMessage.trim() || loading || !currentSummaryId}
                            className={`absolute right-2 top-2 w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all z-20 ${isChatting || !chatMessage.trim() || loading || !currentSummaryId
                              ? 'bg-slate-800 opacity-50 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95 cursor-pointer'
                              }`}
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </form>
                      </div>

                      {result.key_points && result.key_points.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          {result.key_points.map((point, i) => (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.15 }}
                              key={i}
                              className="group/item glass p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-white/5 hover:border-indigo-500/40 transition-all flex flex-col justify-between h-full bg-indigo-500/5"
                            >
                              <div>
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-indigo-400 font-black text-lg md:text-xl mb-4 md:mb-6 group-hover/item:scale-110 transition-transform">
                                  {i + 1}
                                </div>
                                <p className="text-lg md:text-xl text-slate-300 leading-snug font-medium italic">{point}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Modal Overlay */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-slate-950/60"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl glass rounded-[32px] md:rounded-[48px] overflow-hidden border-white/20 shadow-2xl flex flex-col md:flex-row h-[85vh] md:h-[80vh]"
            >
              <button
                onClick={() => setShowDemo(false)}
                className="absolute top-4 right-4 md:top-8 md:right-8 w-10 h-10 md:w-12 md:h-12 border-white/5 rounded-full glass hover:bg-white/10 flex items-center justify-center text-white z-20 transition-colors"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              {/* Sidebar Info */}
              <div className="w-full md:w-1/3 bg-indigo-600/10 p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5">
                <div>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 md:mb-6 shadow-xl shadow-indigo-600/40">
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white italic mb-2 md:mb-4 leading-tight">Product <br className="hidden md:block" /> Preview</h3>
                  <p className="text-slate-400 text-sm md:text-lg leading-relaxed mb-4 md:mb-8">
                    Explore how Axon handles complex financial documents instantly.
                  </p>
                </div>
                <div className="hidden sm:flex flex-col gap-3 md:gap-4">
                  <div className="flex items-center gap-3 text-emerald-400 font-bold text-xs md:text-sm">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Neural Engine v2 Enabled</span>
                  </div>
                  <div className="flex items-center gap-3 text-indigo-400 font-bold text-xs md:text-sm">
                    <Zap className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Instant Latency</span>
                  </div>
                </div>
              </div>

              {/* Demo Content Area (Scrollable) */}
              <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
                <div className="space-y-8 md:space-y-12">
                  <div className="space-y-3 md:space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Source Document</p>
                    <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-slate-900 border border-white/5 relative group">
                      <div className="absolute top-2 right-4 text-slate-700 font-mono text-[8px] md:text-[10px]">PDF_PREVIEW_42</div>
                      <p className="text-slate-300 font-serif text-sm md:text-base leading-relaxed line-clamp-4 md:line-clamp-none">
                        The fiscal roadmap for Q4 2024 and 2025 demonstrates a significant pivot towards sustainability-linked debt instruments. With an initial capital injection of $500M, the consortium aims to reduce operational carbon footprints by 22% while maintaining a dividend yield of 4.5%...
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">AI Logic Flow</p>
                    <div className="flex flex-col gap-3 md:gap-4">
                      <div className="flex items-center gap-3 md:gap-4 text-white">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-sm md:text-base">1</div>
                        <p className="font-bold italic text-sm md:text-base">Contextual Map Extraction</p>
                      </div>
                      <div className="h-8 md:h-12 w-0.5 bg-indigo-500/20 ml-4 md:ml-5"></div>
                      <div className="flex items-center gap-3 md:gap-4 text-white">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-sm md:text-base">2</div>
                        <p className="font-bold italic text-sm md:text-base">Nuance weighting & deduplication</p>
                      </div>
                      <div className="h-8 md:h-12 w-0.5 bg-indigo-500/20 ml-4 md:ml-5"></div>
                      <div className="flex items-center gap-3 md:gap-4 text-white">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-sm md:text-base">3</div>
                        <p className="font-bold italic text-sm md:text-base">Executive Summary Generation</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 md:pt-8 border-t border-white/10">
                    <h4 className="text-xl md:text-2xl font-black text-white italic mb-4 md:mb-6">Generated Insight</h4>
                    <div className="bg-white/5 rounded-2xl md:rounded-[32px] p-6 md:p-8 border border-white/5 mb-6 md:mb-8 min-h-[100px] md:min-h-[120px]">
                      <p className="text-lg md:text-xl text-slate-200 leading-relaxed font-medium italic border-l-4 border-indigo-500 pl-4 md:pl-6 py-1 md:py-2">
                        {demoText || <span className="opacity-20 text-sm md:text-base">Analysing logic patterns...</span>}
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="inline-block w-1 md:w-1.5 h-5 md:h-6 bg-indigo-500 ml-1 translate-y-1"
                        />
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {[
                        "Projected 15% revenue increase driven by global expansion.",
                        "Operational cost reduction of $4.2M through automation.",
                        "Strategic shift to AI-first customer experience model.",
                        "Capital expenditure allocated for R&D in sustainable tech."
                      ].map((point, i) => (
                        <div key={i} className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3 md:gap-4 items-start">
                          <span className="w-5 h-5 md:w-6 md:h-6 shrink-0 rounded-lg bg-indigo-600 flex items-center justify-center text-[8px] md:text-[10px] font-black">{i + 1}</span>
                          <p className="text-slate-400 text-xs md:text-sm font-medium">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-2xl bg-slate-950/80"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md glass rounded-3xl md:rounded-[40px] overflow-hidden border-white/10 shadow-3xl p-8 md:p-10 max-h-[95vh] overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => { setShowAuth(false); setAuthError(null); }}
                className="absolute top-6 right-6 md:top-8 md:right-8 w-8 h-8 md:w-10 md:h-10 border-white/5 rounded-full glass hover:bg-white/10 flex items-center justify-center text-slate-400 z-10 transition-colors"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              <div className="text-center mb-8 md:mb-10">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[20px] bg-indigo-600 flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-2xl shadow-indigo-600/40">
                  <User className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tight mb-2">
                  {authView === 'login' ? 'Welcome Back' :
                    authView === 'signup' ? 'Create Account' :
                      authView === 'forgot' ? 'Forgot Password' : 'Reset Password'}
                </h3>
                <p className="text-slate-400 text-sm font-medium">
                  {authView === 'login' ? 'Login to access your summaries' :
                    authView === 'signup' ? 'Register to save your analysis history' :
                      authView === 'forgot' ? 'Enter your email to receive a reset link' : 'Enter your new password below'}
                </p>
              </div>

              <form onSubmit={authForm.handleSubmit} className="space-y-3 md:space-y-4">
                {authView === 'signup' && (
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        name="name"
                        type="text"
                        placeholder="Karan Thakar"
                        className={`w-full h-11 md:h-12 pl-12 pr-4 bg-slate-900/50 border ${authForm.errors.name && authForm.touched.name ? 'border-red-500/50' : 'border-white/5'} rounded-xl text-white placeholder:text-slate-700 focus:border-indigo-500/50 outline-none transition-all text-sm`}
                        {...authForm.getFieldProps('name')}
                      />
                    </div>
                    {authForm.errors.name && authForm.touched.name && <p className="text-[10px] text-red-500 ml-4 font-bold">{authForm.errors.name}</p>}
                  </div>
                )}

                {(authView === 'login' || authView === 'signup' || authView === 'forgot') && (
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Email Address</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        name="email"
                        type="email"
                        placeholder="karan@example.com"
                        className={`w-full h-11 md:h-12 pl-12 pr-4 bg-slate-900/50 border ${authForm.errors.email && authForm.touched.email ? 'border-red-500/50' : 'border-white/5'} rounded-xl text-white placeholder:text-slate-700 focus:border-indigo-500/50 outline-none transition-all text-sm`}
                        {...authForm.getFieldProps('email')}
                      />
                    </div>
                    {authForm.errors.email && authForm.touched.email && <p className="text-[10px] text-red-500 ml-4 font-bold">{authForm.errors.email}</p>}
                  </div>
                )}

                {(authView === 'login' || authView === 'signup' || authView === 'reset') && (
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className={`w-full h-11 md:h-12 pl-12 pr-4 bg-slate-900/50 border ${authForm.errors.password && authForm.touched.password ? 'border-red-500/50' : 'border-white/5'} rounded-xl text-white placeholder:text-slate-700 focus:border-indigo-500/50 outline-none transition-all text-sm`}
                        {...authForm.getFieldProps('password')}
                      />
                    </div>
                    {authForm.errors.password && authForm.touched.password && <p className="text-[10px] text-red-500 ml-4 font-bold">{authForm.errors.password}</p>}
                  </div>
                )}

                {authView === 'reset' && (
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className={`w-full h-11 md:h-12 pl-12 pr-4 bg-slate-900/50 border ${authForm.errors.confirmPassword && authForm.touched.confirmPassword ? 'border-red-500/50' : 'border-white/5'} rounded-xl text-white placeholder:text-slate-700 focus:border-indigo-500/50 outline-none transition-all text-sm`}
                        {...authForm.getFieldProps('confirmPassword')}
                      />
                    </div>
                    {authForm.errors.confirmPassword && authForm.touched.confirmPassword && <p className="text-[10px] text-red-500 ml-4 font-bold">{authForm.errors.confirmPassword}</p>}
                  </div>
                )}

                {authView === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setAuthView('forgot')}
                      className="text-[10px] font-bold text-slate-500 hover:text-indigo-400"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-500 text-[10px] md:text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{authError}</span>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-3 text-emerald-500 text-[10px] md:text-xs font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{successMessage}</span>
                    </div>
                    {resetTokenFromAPI && (
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = `${window.location.origin}/reset-password/${resetTokenFromAPI}`;
                        }}
                        className="w-full py-2 bg-emerald-500 text-slate-950 rounded-lg font-black uppercase tracking-tighter hover:bg-emerald-400 transition-all text-[10px]"
                      >
                        Click here to Reset Password
                      </button>
                    )}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 md:h-14 rounded-xl bg-white text-slate-950 font-black text-sm md:text-md hover:bg-indigo-50 transition-all shadow-xl shadow-white/5 active:scale-95 disabled:opacity-50 mt-2 md:mt-4"
                >
                  {loading ? 'Processing...' :
                    authView === 'login' ? 'Login to Axon' :
                      authView === 'signup' ? 'Create Account' :
                        authView === 'forgot' ? 'Send Reset Link' : 'Update Password'}
                </button>

                <p className="text-center text-xs md:text-sm text-slate-500 pt-2">
                  {authView === 'login' ? "Don't have an account? " :
                    authView === 'signup' ? "Already have an account? " : ""}

                  {authView === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setAuthView('signup'); setAuthError(null); }}
                      className="text-indigo-400 font-bold hover:underline"
                    >
                      Sign Up
                    </button>
                  )}

                  {authView === 'signup' && (
                    <button
                      type="button"
                      onClick={() => { setAuthView('login'); setAuthError(null); }}
                      className="text-indigo-400 font-bold hover:underline"
                    >
                      Login
                    </button>
                  )}

                  {(authView === 'forgot' || authView === 'reset') && (
                    <button
                      type="button"
                      onClick={() => { setAuthView('login'); setAuthError(null); }}
                      className="text-indigo-400 font-bold hover:underline"
                    >
                      Back to Login
                    </button>
                  )}
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* History Modal Overlay */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 backdrop-blur-2xl bg-slate-950/80"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl glass rounded-3xl md:rounded-[40px] overflow-hidden border-white/10 shadow-3xl p-6 md:p-10 flex flex-col max-h-[85vh]"
            >
              <button
                onClick={() => setShowHistory(false)}
                className="absolute top-6 right-6 md:top-8 md:right-8 w-8 h-8 md:w-10 md:h-10 border-white/5 rounded-full glass hover:bg-white/10 flex items-center justify-center text-slate-400 z-10 transition-colors"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <History className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-white italic tracking-tight">Analysis History</h3>
                  <p className="text-slate-500 text-[10px] md:text-sm font-medium">Manage your past executive summaries</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {loadingHistory ? (
                  <div className="h-40 flex items-center justify-center">
                    <BrainCircuit className="w-8 h-8 md:w-10 md:h-10 text-indigo-500/50 animate-spin" />
                  </div>
                ) : summaries.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-slate-600 gap-4">
                    <FileText className="w-10 h-10 md:w-12 md:h-12 opacity-20" />
                    <p className="font-bold italic text-sm md:text-base">No history found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:gap-4">
                    {summaries.map((s) => (
                      <motion.div
                        layout
                        key={s._id}
                        className="group glass p-4 md:p-6 rounded-2xl md:rounded-3xl border-white/5 hover:border-indigo-500/30 transition-all bg-white/[0.02]"
                      >
                        <div className="flex justify-between items-start gap-3 md:gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-[8px] md:text-[10px] font-black uppercase">
                                {s.fileType || 'Doc'}
                              </span>
                              <h4 className="font-black text-white italic text-sm md:text-base truncate max-w-[150px] md:max-w-xs">{s.fileName}</h4>
                              <span className="text-slate-600 text-[8px] md:text-[10px] ml-1 md:ml-2">
                                {new Date(s.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-400 text-xs md:text-sm italic line-clamp-2 mb-3">
                              {s.summary}
                            </p>
                            <button
                              onClick={() => {
                                setResult({ summary: s.summary, key_points: s.keyPoints });
                                setCurrentSummaryId(s._id);
                                setChatHistory([]); // Clear chat for new document
                                setView('tool');
                                setShowHistory(false);
                              }}
                              className="text-[10px] md:text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group/btn"
                            >
                              View Full Analysis
                              <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          </div>
                          <button
                            onClick={() => deleteSummary(s._id)}
                            className="p-1.5 md:p-2 rounded-lg md:rounded-xl glass text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all sm:opacity-0 sm:group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  )
}

export default App
