import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './DeveloperInfo.css';

/* ─── Particle Canvas ─────────────────────────────────────── */
const ParticleCanvas = () => {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let W, H;

        const resize = () => {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const onMouse = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
        window.addEventListener('mousemove', onMouse);

        const colors = ['#38bdf8', '#818cf8', '#c084fc', '#34d399', '#f472b6'];
        particlesRef.current = Array.from({ length: 90 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: Math.random() * 0.6 + 0.2,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, W, H);
            const pts = particlesRef.current;
            const mx = mouseRef.current.x, my = mouseRef.current.y;

            pts.forEach(p => {
                // Slight mouse repulsion
                const dx = p.x - mx, dy = p.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    p.vx += dx / dist * 0.08;
                    p.vy += dy / dist * 0.08;
                }
                // Damping
                p.vx *= 0.99; p.vy *= 0.99;
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
                if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            // Connection lines
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = pts[i].color;
                        ctx.globalAlpha = (1 - d / 120) * 0.15;
                        ctx.lineWidth = 0.6;
                        ctx.moveTo(pts[i].x, pts[i].y);
                        ctx.lineTo(pts[j].x, pts[j].y);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                }
            }
            animRef.current = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouse);
        };
    }, []);

    return <canvas ref={canvasRef} className="particle-canvas" />;
};

/* ─── 3-D Tilt Card ──────────────────────────────────────── */
const TiltCard = ({ children, className = '', intensity = 12 }) => {
    const ref = useRef(null);
    const frameRef = useRef(null);

    const onMove = useCallback((e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const rx = ((e.clientY - cy) / (rect.height / 2)) * -intensity;
        const ry = ((e.clientX - cx) / (rect.width / 2)) * intensity;
        cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(() => {
            el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.03,1.03,1.03)`;
        });
    }, [intensity]);

    const onLeave = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        cancelAnimationFrame(frameRef.current);
        el.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1)';
        el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        setTimeout(() => { if (el) el.style.transition = ''; }, 650);
    }, []);

    return (
        <div ref={ref} className={`tilt-card ${className}`}
            onMouseMove={onMove} onMouseLeave={onLeave}>
            {children}
        </div>
    );
};

/* ─── Scroll-reveal wrapper ──────────────────────────────── */
const Reveal = ({ children, delay = 0, direction = 'up' }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
        }, { threshold: 0.12 });
        if (el) obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const dirMap = { up: 'translateY(50px)', left: 'translateX(-50px)', right: 'translateX(50px)', scale: 'scale(0.8)' };

    return (
        <div ref={ref} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : (dirMap[direction] || dirMap.up),
            transition: `opacity 0.75s ease ${delay}ms, transform 0.75s cubic-bezier(0.23,1,0.32,1) ${delay}ms`,
        }}>
            {children}
        </div>
    );
};

/* ─── Animated counter ───────────────────────────────────── */
const Counter = ({ end, suffix = '' }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !started.current) {
                started.current = true;
                const dur = 1800;
                const step = 16;
                const total = Math.ceil(dur / step);
                let cur = 0;
                const t = setInterval(() => {
                    cur++;
                    setCount(Math.round(end * (cur / total)));
                    if (cur >= total) clearInterval(t);
                }, step);
            }
        }, { threshold: 0.5 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [end]);

    return <span ref={ref}>{count}{suffix}</span>;
};

/* ─── Projects data ─────────────────────────────────────── */
const projects = [
  {
    id: 9,
    name: 'KSK Vasu & Co',
    description: 'Corporate web presence for a business client. Responsive layout with structured service sections and contact flow.',
    tech: ['HTML', 'CSS'],
    github: 'https://github.com/Nithinhelloweb/KSK-VASU-Co',
    live: 'https://kskvasu.co.in',
    badge: 'Live',
  },
  {
    id: 1,
    name: 'FacultySphere',
    description: 'AI-powered attendance management using real-time face detection and recognition. Flask backend with OpenCV + MediaPipe pipeline, Flutter mobile app for live monitoring.',
    tech: ['Python', 'Flask', 'OpenCV', 'MediaPipe', 'Dart', 'Flutter'],
    github: 'https://github.com/nithin1112006/VisionGate',
    live: 'https://visiongate-web.onrender.com/',
    badge: 'Featured',
  },
  {
    id: 2,
    name: 'StaySync',
    description: 'Real-time hotel room state synchronization backend. Live dashboard for room availability, booking status, and multi-property management.',
    tech: ['Node.js', 'JavaScript', 'HTML', 'CSS'],
    github: 'https://github.com/Nithinhelloweb/staysync',
    live: 'https://staysync-qacg.onrender.com/',
    badge: 'Featured',
  },
  {
    id: 3,
    name: 'CGPA / SGPA Calculator',
    description: 'Deployed academic progress tool for engineering students. Supports grade calculation, semester tracking, and CGPA projection — actively used by students at Sri Shakthi Institute.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    github: 'https://github.com/Nithinhelloweb/CGPA',
    live: 'https://cgpa-rv1.onrender.com/',
    badge: 'Live',
  },
  {
    id: 5,
    name: 'Da Ristorante API',
    description: 'RESTful API backend for restaurant operations — menu management, order handling, and table reservations. Built with full TypeScript type safety.',
    tech: ['TypeScript', 'Node.js', 'REST API'],
    github: 'https://github.com/nithin1112006/da-ristorante-api',
    live: null,
    badge: null,
  },
  {
    id: 6,
    name: 'ChatApp',
    description: 'Real-time browser-based chat application with live messaging, user sessions, and instant delivery.',
    tech: ['JavaScript', 'HTML', 'CSS'],
    github: 'https://github.com/nithin1112006/chatapp',
    live: null,
    badge: null,
  },
  {
    id: 7,
    name: 'Music App',
    description: 'Browser-based music player with playlist management, playback controls, and a clean audio interface.',
    tech: ['JavaScript', 'HTML', 'CSS'],
    github: 'https://github.com/nithin1112006/Music_app',
    live: null,
    badge: null,
  },
  {
    id: 11,
    name: 'Data Analyst Agent',
    description: 'AI-powered data analyst agent built with FastAPI and Docker. Accepts natural language questions via API, processes them intelligently, and returns structured answers — containerized for production deployment.',
    tech: ['Python', 'FastAPI', 'Docker', 'LLM'],
    github: 'https://github.com/2007860/project2',
    live: null,
    badge: 'AI Tool',
  },
  {
    id: 12,
    name: 'Virtual TA',
    description: 'Intelligent virtual teaching assistant powered by a Jupyter Notebook pipeline. Scrapes, processes, and analyzes real-world data (US Senate dataset) to answer student queries programmatically.',
    tech: ['Python', 'Jupyter Notebook', 'Data Analysis'],
    github: 'https://github.com/2007860/virtual_TA',
    live: null,
    badge: null,
  },
  {
    id: 13,
    name: 'Retail Analysis',
    description: 'Data analysis pipeline for retail business insights. Computes correlation results across product and sales data, outputting structured JSON reports for decision-making.',
    tech: ['Python', 'Data Analysis', 'JSON'],
    github: 'https://github.com/2007860/retail-analysis',
    live: null,
    badge: null,
  },
  {
    id: 15,
    name: 'GitHub Actions CI Workflow',
    description: 'Custom GitHub Actions workflow setup for automating CI pipelines. Configured via YAML with multi-step job definitions for build and test automation.',
    tech: ['GitHub Actions', 'YAML', 'CI/CD'],
    github: 'https://github.com/2007860/action',
    live: null,
    badge: null,
  },
];

const badgeColors = {
  Featured: { bg: 'rgba(56,189,248,0.15)', border: 'rgba(56,189,248,0.4)', color: '#38bdf8' },
  Live:     { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.4)', color: '#34d399' },
  'AI Tool':{ bg: 'rgba(192,132,252,0.15)', border: 'rgba(192,132,252,0.4)', color: '#c084fc' },
};

/* ─── Skills data ────────────────────────────────────────── */
const skillCategories = [
    {
        title: 'Frontend', icon: '🖥️', color: '#38bdf8',
        skills: ['ReactJS', 'HTML5', 'CSS3', 'JavaScript', 'Flutter', 'ElectronJS', 'Responsive Design'],
    },
    {
        title: 'Backend', icon: '⚙️', color: '#818cf8',
        skills: ['Node.js', 'Express.js', 'Flask', 'Django', 'REST APIs'],
    },
    {
        title: 'Database', icon: '🗄️', color: '#34d399',
        skills: ['MongoDB', 'DynamoDB', 'Azure SQL', 'AstraDB', 'PostgreSQL'],
    },
    {
        title: 'Languages', icon: '💻', color: '#f472b6',
        skills: ['C Programming', 'Java', 'Python'],
    },
    {
        title: 'Design & Tools', icon: '🎨', color: '#c084fc',
        skills: ['Figma', 'Git', 'GitHub', 'VS Code', 'AntiGravity AI'],
    },
    {
        title: 'Hosting', icon: '🚀', color: '#fb923c',
        skills: ['Firebase', 'Vercel', 'Render', 'Netlify', 'GitHub Pages'],
    },
];

/* ─── Main Component ─────────────────────────────────────── */
const DeveloperInfo = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeSkill, setActiveSkill] = useState(null);
    const [copied, setCopied] = useState(false);
    const audioRef = useRef(null);
    const formRef = useRef();
    const heroRef = useRef(null);

    // Sync browser banner / tab bar colour with the dark portfolio theme
    useEffect(() => {
        const meta = document.querySelector('meta[name="theme-color"]');
        const prev = meta ? meta.getAttribute('content') : '#ffffff';
        if (meta) meta.setAttribute('content', '#020817');
        return () => { if (meta) meta.setAttribute('content', '#ffffff'); };
    }, []);

    // Parallax on hero scroll
    useEffect(() => {
        const onScroll = () => {
            if (heroRef.current) {
                heroRef.current.style.transform = `translateY(${window.scrollY * 0.25}px)`;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.1;
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
    }, []);

    const toggleMusic = () => {
        if (!audioRef.current) return;
        if (isPlaying) { audioRef.current.pause(); }
        else { audioRef.current.play().catch(() => {}); }
        setIsPlaying(p => !p);
    };

    const handleChange = (e) => {
        setSendError('');
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCopyEmail = () => {
        navigator.clipboard.writeText('nithinkvn.kvn@gmail.com');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const subject = encodeURIComponent(`📬 Portfolio Contact from ${formData.name}`);
        const body = encodeURIComponent(
            `Hi Nithinprabu,\n\n${formData.message}\n\nBest regards,\n${formData.name}\n${formData.email}`
        );
        
        // Open native mail app with mailto parameters
        window.location.href = `mailto:nithinkvn.kvn@gmail.com?subject=${subject}&body=${body}`;
        
        setIsSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="dev-root">
            <ParticleCanvas />

            {/* Ambient orbs */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
            <div className="orb orb-4" />

            {/* ── NAV ── */}
            <nav className="dev-nav glass-nav">
                <Link to="/" className="nav-back">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                    Back to App
                </Link>
                <div className="nav-brand">
                    <span className="nav-dot" />
                    NITHINPRABU.DEV
                </div>
                <button className="music-btn" onClick={toggleMusic}>
                    {isPlaying ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    )}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    {isPlaying && <span className="music-bars"><span /><span /><span /><span /></span>}
                </button>
                <audio ref={audioRef} src="/images/bgmusic.mp3" loop />
            </nav>

            {/* ── HERO ── */}
            <section className="dev-hero">
                <div className="hero-parallax" ref={heroRef}>
                    <Reveal>
                        <div className="hero-avatar-wrap">
                            <div className="avatar-rings">
                                <span className="ring ring-1" />
                                <span className="ring ring-2" />
                                <span className="ring ring-3" />
                            </div>
                            <img src="/images/sqratio.jpeg" alt="NITHINPRABU V" className="hero-avatar" />
                            <span className="avatar-badge">🟢 Open to Work</span>
                        </div>
                    </Reveal>

                    <Reveal delay={120}>
                        <p className="hero-greeting">👋 Hey there! Welcome to my Portfolio</p>
                    </Reveal>

                    <Reveal delay={200}>
                        <h1 className="hero-name">
                            {'NITHINPRABU V'.split('').map((c, i) => (
                                <span key={i} className="char" style={{ '--i': i }}>{c === ' ' ? '\u00A0' : c}</span>
                            ))}
                        </h1>
                    </Reveal>

                    <Reveal delay={300}>
                        <div className="hero-typewriter-wrap">
                            <span className="hero-role">Student Web Developer &amp; Tech Enthusiast</span>
                        </div>
                    </Reveal>

                    <Reveal delay={400}>
                        <p className="hero-bio">
                            Driven by curiosity and passion for technology, I constantly strive to learn, innovate,
                            and push myself to achieve excellence in every project I build.
                        </p>
                    </Reveal>

                    <Reveal delay={500}>
                        <div className="hero-ctas">
                            <a href="#contact" className="btn-primary">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 13 19.79 19.79 0 0 1 1.15 4.36 2 2 0 0 1 3.12 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z" /></svg>
                                Let's Connect
                            </a>
                            <a href="#skills" className="btn-outline">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                                View Skills
                            </a>
                            <a href="#projects" className="btn-outline">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                My Projects
                            </a>
                        </div>
                    </Reveal>

                    {/* Scroll cue */}
                    <div className="scroll-cue">
                        <span>scroll</span>
                        <div className="scroll-line" />
                    </div>
                </div>
            </section>

            {/* ── STATS STRIP ── */}
            <section className="stats-strip">
                {[
                    { end: 2, suffix: '+', label: 'Years of Learning' },
                    { end: 10, suffix: '+', label: 'Projects Built' },
                    { end: 2, suffix: '', label: 'Degrees Pursuing' },
                    { end: 6, suffix: '+', label: 'Tech Stacks' },
                ].map((s, i) => (
                    <Reveal key={i} delay={i * 80} direction="scale">
                        <TiltCard className="stat-tile">
                            <div className="stat-num"><Counter end={s.end} suffix={s.suffix} /></div>
                            <div className="stat-label">{s.label}</div>
                        </TiltCard>
                    </Reveal>
                ))}
            </section>

            {/* ── ABOUT ── */}
            <section className="section about-section">
                <Reveal>
                    <div className="section-label">About Me</div>
                    <h2 className="section-title">A Dedicated Learner <span className="grad-text">&amp; Creator</span></h2>
                </Reveal>
                <div className="about-grid">
                    <Reveal direction="left" delay={100}>
                        <div className="about-text-card glass-card">
                            <div className="about-icon">💡</div>
                            <h3>Who am I?</h3>
                            <p>
                                Hello! I'm <strong>Nithinprabu V</strong>, a passionate technology enthusiast pursuing dual degrees
                                in Computer Science and Data Science. My journey has been fueled by an insatiable curiosity
                                to understand how things work and a desire to build meaningful solutions.
                            </p>
                            <p>
                                Whether it's crafting beautiful web applications, exploring data science, or designing
                                intuitive interfaces — I approach every challenge with creativity and dedication.
                            </p>
                            <div className="about-badges">
                                {['React Developer', 'Full-Stack', 'Data Scientist', 'UI/UX Designer', 'Cloud Computing'].map(b => (
                                    <span key={b} className="badge">{b}</span>
                                ))}
                            </div>
                        </div>
                    </Reveal>
                    <Reveal direction="right" delay={200}>
                        <div className="about-visual">
                            <TiltCard className="code-card glass-card">
                                <div className="code-header">
                                    <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
                                    <span className="code-title">profile.json</span>
                                </div>
                                <pre className="code-body">{`{
  "name": "Nithinprabu V",
  "role": "Full-Stack Developer",
  "passion": "Building Cool Things",
  "location": "Tamil Nadu, India",
  "education": [
    "B.E CSE @ Sri Shakthi",
    "BS DS @ IIT Madras"
  ],
  "available": true
}`}</pre>
                            </TiltCard>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── EDUCATION ── */}
            <section className="section education-section">
                <Reveal>
                    <div className="section-label">Education</div>
                    <h2 className="section-title">Academic <span className="grad-text">Background</span></h2>
                </Reveal>
                <div className="edu-timeline">
                    {[
                        {
                            logo: '/images/iitmlogo.png', degree: 'BS Data Science & Programming',
                            school: 'IIT Madras', period: '2024 – Present', color: '#38bdf8',
                            desc: 'Pursuing a comprehensive degree in Data Science and Programming from one of India\'s premier technical institutions. Deep insights into data analysis, machine learning, and programming.',
                            tags: ['Data Science', 'ML', 'Python', 'Statistics', 'PyTorch', 'Deep Learning'],
                        },
                        {
                            logo: '/images/logo.png', degree: 'B.E Computer Science & Engineering',
                            school: 'Sri Shakthi Institute of Engineering & Technology', period: '2024 – 2028', color: '#818cf8',
                            desc: 'Building a strong foundation in computer science, software development, and engineering principles. Hands-on experience with multiple programming paradigms and modern technologies.',
                            tags: ['CSE', 'Web Dev', 'DSA', 'DBMS', 'App Dev' , 'Docker'],
                        },
                    ].map((edu, i) => (
                        <Reveal key={i} delay={i * 150} direction={i % 2 === 0 ? 'left' : 'right'}>
                            <TiltCard className="edu-card glass-card" intensity={6}>
                                <div className="edu-accent" style={{ background: edu.color }} />
                                <div className="edu-top">
                                    <div className="edu-logo-wrap" style={{ borderColor: edu.color + '40' }}>
                                        <img src={edu.logo} alt={edu.school} />
                                    </div>
                                    <div className="edu-meta">
                                        <h3>{edu.degree}</h3>
                                        <h4 style={{ color: edu.color }}>{edu.school}</h4>
                                        <span className="edu-period">{edu.period}</span>
                                    </div>
                                </div>
                                <p className="edu-desc">{edu.desc}</p>
                                <div className="edu-tags">
                                    {edu.tags.map(t => <span key={t} className="edu-tag" style={{ borderColor: edu.color + '50', color: edu.color }}>{t}</span>)}
                                </div>
                            </TiltCard>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ── SKILLS ── */}
            <section id="skills" className="section skills-section">
                <Reveal>
                    <div className="section-label">Skills</div>
                    <h2 className="section-title">Technologies <span className="grad-text">&amp; Tools</span></h2>
                </Reveal>
                <div className="skills-grid">
                    {skillCategories.map((cat, i) => (
                        <Reveal key={cat.title} delay={i * 80} direction="scale">
                            <TiltCard
                                className={`skill-card glass-card ${activeSkill === cat.title ? 'skill-active' : ''}`}
                                intensity={8}
                                onClick={() => setActiveSkill(activeSkill === cat.title ? null : cat.title)}
                            >
                                <div className="skill-card-glow" style={{ background: cat.color }} />
                                <div className="skill-icon-wrap" style={{ background: cat.color + '20', border: `1px solid ${cat.color}40` }}>
                                    <span className="skill-emoji">{cat.icon}</span>
                                </div>
                                <h3 className="skill-title" style={{ color: cat.color }}>{cat.title}</h3>
                                <div className="skill-pills">
                                    {cat.skills.map((s, j) => (
                                        <span key={s} className="skill-pill"
                                            style={{
                                                background: cat.color + '15',
                                                borderColor: cat.color + '40',
                                                color: cat.color,
                                                animationDelay: `${j * 60}ms`,
                                            }}>
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </TiltCard>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ── PROJECTS ── */}
            <section id="projects" className="section projects-section">
                <Reveal>
                    <div className="section-label">Projects</div>
                    <h2 className="section-title">What I've <span className="grad-text">Built</span></h2>
                    <p className="projects-intro">A collection of real-world projects spanning AI, full-stack web, APIs, and more.</p>
                </Reveal>

                <div className="projects-grid">
                    {projects.map((project, i) => {
                        const bc = badgeColors[project.badge] || null;
                        return (
                            <Reveal key={project.id} delay={i * 60} direction="scale">
                                <div className={`project-card glass-card ${project.badge === 'Featured' || project.badge === 'Live' ? 'project-card--highlight' : ''}`}>
                                    {/* Top accent line */}
                                    <div className="project-card__accent" />

                                    {/* Header row */}
                                    <div className="project-card__header">
                                        <div className="project-card__icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                <rect x="2" y="3" width="20" height="14" rx="2"/>
                                                <line x1="8" y1="21" x2="16" y2="21"/>
                                                <line x1="12" y1="17" x2="12" y2="21"/>
                                            </svg>
                                        </div>
                                        {bc && (
                                            <span className="project-badge" style={{ background: bc.bg, borderColor: bc.border, color: bc.color }}>
                                                {project.badge === 'Live' && <span className="badge-dot" style={{ background: bc.color }} />}
                                                {project.badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className="project-card__name">{project.name}</h3>

                                    {/* Description */}
                                    <p className="project-card__desc">{project.description}</p>

                                    {/* Tech pills */}
                                    <div className="project-card__tech">
                                        {project.tech.map(t => (
                                            <span key={t} className="project-tech-pill">{t}</span>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    {project.live && (
                                        <div className="project-card__actions">
                                            <a href={project.live} target="_blank" rel="noopener noreferrer" className="project-btn project-btn--live">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                                    <polyline points="15 3 21 3 21 9"/>
                                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                                </svg>
                                                Live Demo
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </section>

            {/* ── CONTACT ── */}
            <section id="contact" className="section contact-section">
                <Reveal>
                    <div className="section-label">Contact</div>
                    <h2 className="section-title">Let's <span className="grad-text">Connect</span></h2>
                    <p className="contact-intro">I'm always excited to collaborate. Whether you have a project idea, a question, or just want to say hi — my inbox is open!</p>
                </Reveal>

                <div className="contact-grid">
                    {/* Info */}
                    <Reveal direction="left" delay={100}>
                        <div className="contact-info-panel glass-card">
                            <h3>Get In Touch</h3>
                            <div className="contact-links">
                                <button onClick={handleCopyEmail} className="contact-link-card" style={{ background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                                    <div className="cl-icon email-icon">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                    </div>
                                    <div className="cl-text">
                                        <span className="cl-label">{copied ? 'Copied to Clipboard!' : 'Email'}</span>
                                        <span className="cl-value">nithinkvn.kvn@gmail.com</span>
                                    </div>
                                    <svg className="cl-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 5H19V16M19 5L5 19" /></svg>
                                </button>
                                <a href="https://www.linkedin.com/in/nithin-prabu-21b415338" target="_blank" rel="noopener noreferrer" className="contact-link-card linkedin">
                                    <div className="cl-icon linkedin-icon">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                                    </div>
                                    <div className="cl-text">
                                        <span className="cl-label">LinkedIn</span>
                                        <span className="cl-value">Nithin Prabu</span>
                                    </div>
                                    <svg className="cl-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
                                </a>
                            </div>

                            <div className="availability-badge">
                                <span className="avail-dot" />
                                Curious to Work with different Personalities
                            </div>

                            <div className="dev-quote">
                                Dream is not that which you see while sleeping; it is something that does not let you sleep.
                                <span className="quote-author">— Dr. APJ Abdul Kalam</span>
                            </div>
                        </div>
                    </Reveal>

                    {/* Form */}
                    <Reveal direction="right" delay={200}>
                        <div className="contact-form-card glass-card">
                            {isSubmitted ? (
                                <div className="success-state">
                                    <div className="success-ring">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    </div>
                                    <h3>Email Draft Ready! ✉️</h3>
                                    <p>Your mail application should have opened. If not, feel free to copy my address directly.</p>
                                    <button onClick={() => setIsSubmitted(false)} className="btn-outline small">Open Form Again</button>
                                </div>
                            ) : (
                                <form ref={formRef} onSubmit={handleSubmit} className="contact-form">
                                    <h3>Send a Message</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="dev-name">Your Name</label>
                                            <div className="input-wrap">
                                                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                <input id="dev-name" name="name" type="text" value={formData.name}
                                                    onChange={handleChange} placeholder="Nithinprabu" required />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="dev-email">Email Address</label>
                                            <div className="input-wrap">
                                                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                                <input id="dev-email" name="email" type="email" value={formData.email}
                                                    onChange={handleChange} placeholder="you@example.com" required />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="dev-message">Your Message</label>
                                        <div className="input-wrap textarea-wrap">
                                            <textarea id="dev-message" name="message" value={formData.message}
                                                onChange={handleChange} placeholder="Hello, I'd love to collaborate on..." rows="5" required />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-primary full">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg> Send Email
                                    </button>
                                </form>
                            )}
                        </div>
                    </Reveal>
                </div>
            </section>
            {/* ── FOOTER ── */}
            <footer className="dev-footer">
                <div className="dev-footer__inner">
                    <div className="dev-footer__left">
                        <span className="dev-footer__brand">
                            <span className="nav-dot" />
                            NITHINPRABU.DEV
                        </span>
                        <p className="dev-footer__copy">© {new Date().getFullYear()} Nithinprabu V. All rights reserved.</p>
                    </div>
                    <div className="dev-footer__links">
                        <a href="https://www.linkedin.com/in/nithin-prabu-21b415338" target="_blank" rel="noopener noreferrer" className="dev-footer__link" aria-label="LinkedIn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>
                        <a href="mailto:nithinkvn.kvn@gmail.com" className="dev-footer__link" aria-label="Email">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </a>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default DeveloperInfo;
