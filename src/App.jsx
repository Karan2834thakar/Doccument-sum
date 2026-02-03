import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion' // eslint-disable-line no-unused-vars
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
  ChevronRight,
  ShieldCheck,
  Zap,
  Lock,
  MessageSquare,
  BarChart3,
  Search,
  Check,
  X,
  User,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  LogOut
} from 'lucide-react'

function App() {
  const [view, setView] = useState('landing') // 'landing' or 'tool'
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [showDemo, setShowDemo] = useState(false)
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' })
  const [authError, setAuthError] = useState(null)
  const [demoText, setDemoText] = useState('')
  const uploadSectionRef = useRef(null)

  useEffect(() => {
    const savedSession = localStorage.getItem('axon_session')
    if (savedSession) {
      setUser(JSON.parse(savedSession))
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
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    const allowedExtensions = ['.pdf', '.docx', '.txt']
    const fileExtension = selectedFile.name.slice((selectedFile.name.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase()

    if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(`.${fileExtension}`)) {
      setError('Please upload a PDF, DOCX, or TXT file.')
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

    const formData = new FormData()
    formData.append('data', file)

    try {
      const webhookUrl = 'https://karanthakar.app.n8n.cloud/webhook/webhook-test/document-summary?summaryLength=medium&language=English'

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

      try {
        const data = JSON.parse(text)
        const source = data.output || data;
        const extractedSummary = source.summary || source.text || source.output || source.content || source.result;

        setResult({
          summary: extractedSummary || (typeof data === 'string' ? data : 'No summary found.'),
          key_points: source.key_points || []
        })
      } catch {
        setResult({ summary: text, key_points: [] })
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
      setAuthMode('login')
      setShowAuth(true)
      return
    }
    setView('tool')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthError(null)

    try {
      const endpoint = authMode === 'register' ? '/api/register' : '/api/login'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      localStorage.setItem('axon_session', JSON.stringify(data))
      setUser(data)
      setShowAuth(false)
    } catch (err) {
      setAuthError(err.message)
    }
  }

  const handleViewDemo = () => {
    setShowDemo(true)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[130px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[130px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-blue-600/5 blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={`relative z-10 transition-all duration-500 ${showDemo ? 'blur-md scale-95 pointer-events-none' : ''}`}
          >
            {/* Nav */}
            <nav className="fixed top-0 w-full h-20 border-b border-white/5 glass z-50 px-6 backdrop-blur-xl">
              <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-white">Axon<span className="text-indigo-500">.</span></span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                  <a href="#features" className="hover:text-white transition-colors">Features</a>
                  <a href="#process" className="hover:text-white transition-colors">How it works</a>
                  <a href="#security" className="hover:text-white transition-colors">Security</a>
                </div>
                <div className="flex items-center gap-4">
                  {user ? (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <User className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-bold text-slate-200">{user.name}</span>
                      </div>
                      <button
                        onClick={() => { localStorage.removeItem('axon_session'); setUser(null); setView('landing'); }}
                        className="p-2.5 rounded-xl glass hover:bg-red-500/10 hover:text-red-400 transition-all"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAuthMode('login'); setShowAuth(true); }}
                      className="px-6 py-2.5 rounded-xl glass hover:bg-white/10 text-white font-bold transition-all"
                    >
                      Login
                    </button>
                  )}
                  <button
                    onClick={scrollToTool}
                    className="px-6 py-2.5 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
                  >
                    {user ? 'Open Tool' : 'Get Started'}
                  </button>
                </div>
              </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-44 pb-20 px-6 min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-indigo-400 text-sm font-medium"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Next-Gen Document Intelligence</span>
              </motion.div>

              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[1] bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
              >
                Stop Reading. <br /> Start <span className="text-indigo-500 italic">Knowing.</span>
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed"
              >
                The world's fastest document summarization engine.
                Turn complex reports into executive insights in milleseconds.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-5"
              >
                <button
                  onClick={scrollToTool}
                  className="h-16 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black transition-all shadow-2xl shadow-indigo-600/30 flex items-center gap-3 active:scale-95"
                >
                  <span className="text-xl">Upload Document</span>
                  <ArrowRight className="w-6 h-6" />
                </button>
                <button
                  onClick={handleViewDemo}
                  className="h-16 px-10 rounded-2xl glass hover:bg-white/10 text-white font-bold transition-all flex items-center gap-3 active:scale-95"
                >
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  <span>View Demo</span>
                </button>
              </motion.div>

              {/* Hero Decorative Elements */}
              <div className="mt-20 w-full max-w-5xl relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 blur opacity-20 animate-pulse"></div>
                <div className="relative glass-light rounded-[32px] overflow-hidden border border-white/20 aspect-[16/9] md:aspect-[21/9] flex items-center justify-center p-8">
                  <div className="grid grid-cols-3 gap-6 w-full opacity-40">
                    <div className="h-4 bg-slate-900 rounded-full w-3/4"></div>
                    <div className="h-4 bg-slate-900 rounded-full w-full"></div>
                    <div className="h-4 bg-slate-900 rounded-full w-1/2"></div>
                    <div className="h-4 bg-slate-900 rounded-full w-full col-span-2"></div>
                    <div className="h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl col-span-3"></div>
                  </div>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/50"
                  >
                    <FileText className="w-12 h-12 text-white" />
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 italic tracking-tight">Powerful Core Features</h2>
                <p className="text-slate-500 max-w-xl mx-auto">Engineered for quality, speed, and uncompromising privacy.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <BrainCircuit className="w-8 h-8" />,
                    title: "Nueron-Link AI",
                    desc: "Uses contextual understanding to maintain document tone and intent.",
                    color: "text-indigo-400"
                  },
                  {
                    icon: <Zap className="w-8 h-8" />,
                    title: "Instant Processing",
                    desc: "Parallelized cloud execution allows for 100+ page summaries in under 5 seconds.",
                    color: "text-yellow-400"
                  },
                  {
                    icon: <ShieldCheck className="w-8 h-8" />,
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
                    className="group glass p-10 rounded-[40px] border-white/5 hover:border-indigo-500/30 transition-all hover:-translate-y-2"
                  >
                    <div className={`mb-6 w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 ${feat.color} group-hover:scale-110 transition-transform`}>
                      {feat.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white tracking-tight leading-none">{feat.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-lg">{feat.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Process Section */}
            <section id="process" className="py-32 bg-slate-900/40 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#6366f1 0.5px, transparent 0.5px)", backgroundSize: "32px 32px" }}></div>

              <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-20">
                  <div className="flex-1 space-y-8">
                    <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight italic">How We Distill <br /> Information</h2>

                    <div className="space-y-12">
                      {[
                        { step: "01", title: "Upload & Ingest", desc: "Select your files. We support PDF, DOCX, and TXT seamlessly." },
                        { step: "02", title: "AI Analysis", desc: "Our engine maps the structure, tone, and key arguments of the text." },
                        { step: "03", title: "Insight Generation", desc: "The core summary and key insights are generated in real-time." }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-6 items-start">
                          <div className="text-3xl font-black text-indigo-500/30 font-mono pt-1">{item.step}</div>
                          <div>
                            <h4 className="text-2xl font-bold text-white mb-2">{item.title}</h4>
                            <p className="text-slate-400 text-lg leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 w-full max-w-lg aspect-square relative">
                    <div className="absolute inset-0 bg-indigo-600/20 blur-[100px]"></div>
                    <div className="relative h-full glass rounded-[60px] border border-white/10 flex items-center justify-center group overflow-hidden">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 opacity-10 border-[1px] border-dashed border-indigo-400 rounded-full m-10"
                      ></motion.div>
                      <Cpu className="w-32 h-32 text-indigo-600 group-hover:scale-125 transition-transform duration-500" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section id="security" className="py-32 px-6">
              <div className="max-w-4xl mx-auto glass p-12 md:p-20 rounded-[50px] border-indigo-500/20 relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl"></div>
                <Lock className="w-16 h-16 text-indigo-400 mx-auto mb-8" />
                <h2 className="text-4xl font-bold mb-6 text-white italic">Bank-Grade Security</h2>
                <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
                  Your documents are end-to-end encrypted. We leverage SOC2 compliant processing
                  environments to ensure your intellectual property remains private.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6 opacity-60">
                  <span className="flex items-center gap-2 font-bold text-xs tracking-widest uppercase text-slate-500">
                    <Check className="w-4 h-4 text-emerald-500" /> AES-256 Encryption
                  </span>
                  <span className="flex items-center gap-2 font-bold text-xs tracking-widest uppercase text-slate-500">
                    <Check className="w-4 h-4 text-emerald-500" /> TLS 1.3 Transmission
                  </span>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 px-6">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 opacity-40 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold tracking-tight text-white">Axon © 2026</span>
                </div>
                <div className="flex gap-10 text-sm font-medium">
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
            className="relative z-10 max-w-4xl mx-auto pt-40 pb-20 px-6 min-h-screen"
            ref={uploadSectionRef}
          >
            {/* Tool Nav Overlay */}
            <div className="fixed top-0 left-0 w-full h-20 px-6 z-40 pointer-events-none">
              <div className="max-w-7xl mx-auto h-full flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setView('landing')}>
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-indigo-500" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-white hidden sm:block">Axon</span>
                </div>
                <button
                  onClick={() => setView('landing')}
                  className="h-10 px-5 rounded-xl border border-white/5 glass hover:bg-white/10 text-slate-400 text-sm font-bold transition-all flex items-center gap-2 active:scale-95"
                >
                  <span>Back to Home</span>
                </button>
              </div>
            </div>

            <div className="parallax-inner space-y-12">
              <div className="text-center md:text-left">
                <h2 className="text-5xl font-black text-white mb-4 tracking-tighter italic">AI Analysis Hub</h2>
                <p className="text-slate-500 text-lg">Upload document to extract executive summaries and core insights.</p>
              </div>

              <div className="grid grid-cols-1 gap-10 group/space">
                {/* Upload Card */}
                <motion.div
                  className={`glass p-8 rounded-[48px] border-white/5 shadow-3xl transition-all duration-700 relative overflow-hidden ${!file ? 'md:p-12' : 'md:p-8'}`}
                  layout
                >
                  <AnimatePresence mode="wait">
                    {!result ? (
                      <motion.div
                        key="upload-ui"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                      >
                        <label
                          htmlFor="dropzone-file"
                          className={`relative flex flex-col items-center justify-center w-full min-h-[320px] border-2 border-dashed rounded-[32px] cursor-pointer transition-all ${file ? 'border-indigo-500 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10' : 'border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 hover:border-slate-700'
                            }`}
                        >
                          {loading && (
                            <div className="absolute inset-0 bg-indigo-600/5 rounded-[32px] overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent animate-scan" style={{ height: '50%' }}></div>
                            </div>
                          )}

                          <div className="flex flex-col items-center justify-center p-8 text-center">
                            <motion.div
                              animate={loading ? {
                                scale: [1, 1.15, 1],
                                opacity: [1, 0.5, 1],
                                rotate: [0, 5, -5, 0]
                              } : {}}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className={`w-24 h-24 mb-6 rounded-3xl flex items-center justify-center border-2 transition-all shadow-2xl ${file ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-600/30' : 'bg-slate-900 text-slate-600 border-white/5'
                                }`}
                            >
                              {loading ? <Cpu className="w-12 h-12" /> : file ? <CheckCircle className="w-12 h-12" /> : <FileUp className="w-12 h-12" />}
                            </motion.div>

                            {file ? (
                              <div className="space-y-2">
                                <p className="text-2xl font-black text-white italic">{file.name}</p>
                                <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for AI</p>
                              </div>
                            ) : (
                              <>
                                <p className="text-2xl mb-3 text-white font-bold tracking-tight italic">
                                  Drop your intelligence here
                                </p>
                                <p className="text-slate-500 font-medium">PDF, DOCX, TXT files accepted</p>
                              </>
                            )}
                          </div>
                          <input
                            id="dropzone-file"
                            type="file"
                            className="hidden"
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileChange}
                            disabled={loading}
                          />
                        </label>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleUpload}
                          disabled={!file || loading}
                          className={`group w-full h-20 rounded-[24px] font-black text-xl transition-all flex items-center justify-center gap-4 overflow-hidden relative ${!file || loading
                            ? 'bg-slate-900 border border-white/5 text-slate-700 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/30'
                            }`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          {loading ? (
                            <>
                              <BrainCircuit className="w-8 h-8 animate-spin" />
                              <span className="italic">Engaging Nueron Model...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-7 h-7" />
                              <span className="italic uppercase tracking-wider">Execute Summary</span>
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
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center shadow-inner border border-emerald-500/30">
                            <CheckCircle className="w-8 h-8" />
                          </div>
                          <div className="text-left">
                            <p className="text-3xl font-black text-white italic leading-none mb-2">Analysis Complete</p>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest truncate max-w-[200px]">{file.name}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setFile(null); setResult(null); setError(null); }}
                          className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 text-sm italic transition-all active:scale-95"
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
                      className="bg-red-500/10 border border-red-500/20 p-6 rounded-[32px] flex items-start gap-6 text-red-500"
                    >
                      <AlertCircle className="w-8 h-8 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xl font-black mb-1 italic uppercase tracking-tighter">System Error 09x</p>
                        <p className="text-lg leading-relaxed font-medium opacity-80">{error}</p>
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
                      className="grid grid-cols-1 gap-10"
                    >
                      <div className="glass p-10 md:p-14 rounded-[48px] border-white/5 relative shadow-3xl">
                        <div className="flex items-center gap-4 mb-10 overflow-hidden">
                          <div className="w-1 h-3 bg-indigo-500"></div>
                          <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Executive Summary</h3>
                        </div>
                        <p className="text-2xl text-slate-200 leading-[1.6] font-medium opacity-90 relative z-10">
                          {result.summary}
                        </p>
                        <div className="absolute bottom-10 right-10 opacity-5 pointer-events-none">
                          <FileText className="w-40 h-40" />
                        </div>
                      </div>

                      {result.key_points && result.key_points.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {result.key_points.map((point, i) => (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.15 }}
                              key={i}
                              className="group/item glass p-8 rounded-[40px] border-white/5 hover:border-indigo-500/40 transition-all flex flex-col justify-between h-full bg-indigo-500/5"
                            >
                              <div>
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-indigo-400 font-black text-xl mb-6 group-hover/item:scale-110 transition-transform">
                                  {i + 1}
                                </div>
                                <p className="text-xl text-slate-300 leading-snug font-medium italic">{point}</p>
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/60"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl glass rounded-[48px] overflow-hidden border-white/20 shadow-2xl flex flex-col md:flex-row h-[80vh]"
            >
              <button
                onClick={() => setShowDemo(false)}
                className="absolute top-8 right-8 w-12 h-12 rounded-full glass hover:bg-white/10 flex items-center justify-center text-white z-10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Sidebar Info */}
              <div className="md:w-1/3 bg-indigo-600/10 p-10 flex flex-col justify-between border-r border-white/5">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-indigo-600/40">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-white italic mb-4 leading-tight">Product <br /> Preview</h3>
                  <p className="text-slate-400 text-lg leading-relaxed mb-8">
                    Explore how Axon handles complex financial documents instantly.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-400 font-bold text-sm">
                    <CheckCircle className="w-5 h-5" />
                    <span>Neural Engine v2 Enabled</span>
                  </div>
                  <div className="flex items-center gap-3 text-indigo-400 font-bold text-sm">
                    <Zap className="w-5 h-5" />
                    <span>Instant Latency</span>
                  </div>
                </div>
              </div>

              {/* Demo Content Area (Scrollable) */}
              <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                <div className="space-y-12">
                  <div className="space-y-4">
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-500">Source Document</p>
                    <div className="p-6 rounded-3xl bg-slate-900 border border-white/5 relative group">
                      <div className="absolute top-4 right-4 text-slate-700 font-mono text-[10px]">PDF_PREVIEW_42</div>
                      <p className="text-slate-300 font-serif leading-relaxed line-clamp-4">
                        The fiscal roadmap for Q4 2024 and 2025 demonstrates a significant pivot towards sustainability-linked debt instruments. With an initial capital injection of $500M, the consortium aims to reduce operational carbon footprints by 22% while maintaining a dividend yield of 4.5%...
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-500">AI Logic Flow</p>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4 text-white">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">1</div>
                        <p className="font-bold italic">Contextual Map Extraction</p>
                      </div>
                      <div className="h-12 w-0.5 bg-indigo-500/20 ml-5"></div>
                      <div className="flex items-center gap-4 text-white">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">2</div>
                        <p className="font-bold italic">Nuance weighting & deduplication</p>
                      </div>
                      <div className="h-12 w-0.5 bg-indigo-500/20 ml-5"></div>
                      <div className="flex items-center gap-4 text-white">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">3</div>
                        <p className="font-bold italic">Executive Summary Generation</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/10">
                    <h4 className="text-2xl font-black text-white italic mb-6">Generated Insight</h4>
                    <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 mb-8 min-h-[120px]">
                      <p className="text-xl text-slate-200 leading-relaxed font-medium italic border-l-4 border-indigo-500 pl-6 py-2">
                        {demoText || <span className="opacity-20">Analysing logic patterns...</span>}
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="inline-block w-1.5 h-6 bg-indigo-500 ml-1 translate-y-1"
                        />
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        "Projected 15% revenue increase driven by global expansion.",
                        "Operational cost reduction of $4.2M through automation.",
                        "Strategic shift to AI-first customer experience model.",
                        "Capital expenditure allocated for R&D in sustainable tech."
                      ].map((point, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex gap-4 items-start">
                          <span className="w-6 h-6 shrink-0 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                          <p className="text-slate-400 text-sm font-medium">{point}</p>
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
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-2xl bg-slate-950/80"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md glass rounded-[40px] overflow-hidden border-white/10 shadow-3xl p-10"
            >
              <button
                onClick={() => { setShowAuth(false); setAuthError(null); }}
                className="absolute top-8 right-8 w-10 h-10 rounded-full glass hover:bg-white/10 flex items-center justify-center text-slate-400 z-10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-[20px] bg-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-600/40">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-black text-white italic tracking-tight mb-2">
                  {authMode === 'login' ? 'Welcome Back' : 'Join Axon'}
                </h3>
                <p className="text-slate-400 font-medium">
                  {authMode === 'login' ? 'Access your intelligence hub' : 'Start your journey with neural analysis'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                {authMode === 'register' && (
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        className="w-full h-14 pl-12 pr-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white placeholder:text-slate-700 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full h-14 pl-12 pr-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white placeholder:text-slate-700 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full h-14 pl-12 pr-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white placeholder:text-slate-700 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    />
                  </div>
                </div>

                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-500 text-sm font-bold bg-red-500/10 p-4 rounded-xl border border-red-500/20"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{authError}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full h-16 rounded-[20px] bg-white text-slate-950 font-black text-lg hover:bg-slate-200 transition-all shadow-xl shadow-white/5 active:scale-95"
                >
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="mt-8 text-center text-slate-500 text-sm font-medium">
                {authMode === 'login' ? (
                  <>Don't have an account? <button onClick={() => { setAuthMode('register'); setAuthError(null); }} className="text-indigo-400 font-bold hover:underline">Register now</button></>
                ) : (
                  <>Already have an account? <button onClick={() => { setAuthMode('login'); setAuthError(null); }} className="text-indigo-400 font-bold hover:underline">Sign in</button></>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
