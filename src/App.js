import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzsGcfgCg2SyEZ03QUDvmz3PexTdQoPGc",
  authDomain: "winter-arc-mx.firebaseapp.com",
  projectId: "winter-arc-mx",
  storageBucket: "winter-arc-mx.firebasestorage.app",
  messagingSenderId: "1023523225701",
  appId: "1:1023523225701:web:823c8994a8481c09a0468c",
};
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();

// ─── DATA ───────────────────────────────────────────────────
const LEVELS = [
  { id: 1, name: "Recruit", icon: "❄️", minWorkouts: 0 },
  { id: 2, name: "Cold Warrior", icon: "🥶", minWorkouts: 8 },
  { id: 3, name: "Iron Wolf", icon: "⚔️", minWorkouts: 20 },
  { id: 4, name: "Elite Beast", icon: "🔥", minWorkouts: 40 },
  { id: 5, name: "Winter Arc", icon: "👑", minWorkouts: 70 },
];

const ROUTINES = [
  { id: 1, level: 1, day: "Día 1", name: "Pecho & Tríceps", duration: 45, equipment: "Gym", objetivo: "Fuerza", exercises: [
    { name: "Press de Banca", sets: 4, reps: "10", rest: 90 },
    { name: "Aperturas con Mancuerna", sets: 3, reps: "12", rest: 60 },
    { name: "Fondos en Paralelas", sets: 3, reps: "8", rest: 60 },
    { name: "Extensión de Tríceps", sets: 3, reps: "12", rest: 60 },
  ]},
  { id: 2, level: 1, day: "Día 2", name: "Espalda & Bíceps", duration: 45, equipment: "Gym", objetivo: "Fuerza", exercises: [
    { name: "Jalón al Pecho", sets: 4, reps: "10", rest: 90 },
    { name: "Remo con Barra", sets: 3, reps: "10", rest: 90 },
    { name: "Curl de Bíceps", sets: 3, reps: "12", rest: 60 },
    { name: "Curl Martillo", sets: 3, reps: "12", rest: 60 },
  ]},
  { id: 3, level: 1, day: "Día 3", name: "Piernas & Hombros", duration: 50, equipment: "Gym", objetivo: "Fuerza", exercises: [
    { name: "Sentadilla", sets: 4, reps: "10", rest: 120 },
    { name: "Prensa de Piernas", sets: 3, reps: "12", rest: 90 },
    { name: "Press Militar", sets: 3, reps: "10", rest: 90 },
    { name: "Elevaciones Laterales", sets: 3, reps: "15", rest: 60 },
  ]},
  { id: 4, level: 2, day: "Día 1", name: "Push", duration: 50, equipment: "Gym", objetivo: "Hipertrofia", exercises: [
    { name: "Press Banca Inclinado", sets: 4, reps: "8", rest: 90 },
    { name: "Press Militar con Barra", sets: 4, reps: "8", rest: 90 },
    { name: "Fondos Pecho", sets: 3, reps: "10", rest: 60 },
    { name: "Tríceps en Polea", sets: 3, reps: "12", rest: 60 },
  ]},
  { id: 5, level: 2, day: "Día 2", name: "Pull", duration: 50, equipment: "Gym", objetivo: "Hipertrofia", exercises: [
    { name: "Dominadas", sets: 4, reps: "6", rest: 90 },
    { name: "Remo en Máquina", sets: 4, reps: "10", rest: 90 },
    { name: "Curl con Barra", sets: 3, reps: "10", rest: 60 },
    { name: "Face Pull", sets: 3, reps: "15", rest: 60 },
  ]},
  { id: 6, level: 1, day: "Día 1", name: "Full Body en Casa", duration: 30, equipment: "Casa", objetivo: "Definición", exercises: [
    { name: "Sentadillas", sets: 4, reps: "15", rest: 60 },
    { name: "Lagartijas", sets: 3, reps: "12", rest: 60 },
    { name: "Zancadas", sets: 3, reps: "10", rest: 60 },
    { name: "Plancha", sets: 3, reps: "30s", rest: 45 },
  ]},
];

const PROGRAMS = [
  { id: 1, name: "Rodo Flores: Personal Training", price: 99, originalPrice: 1000, duration: "Acceso de por vida", level: "Todos los niveles", icon: "🔥", description: "Entrena directamente con el método de Rodo Flores. Acceso completo a su sistema de entrenamiento personal con rutinas exclusivas, seguimiento y soporte directo.", included: ["Rutinas personalizadas de Rodo", "Seguimiento de progreso real", "Acceso de por vida", "Actualizaciones incluidas"], weeks: null, badge: "🔥 OFERTA ESPECIAL" },
  { id: 2, name: "Winter Arc: Fuerza Total", price: 0, originalPrice: 499, duration: "8 semanas", level: "Intermedio", icon: "🏋️", description: "El programa definitivo para construir fuerza real. 8 semanas de entrenamiento progresivo diseñado para llevarte al siguiente nivel.", included: ["24 sesiones estructuradas", "Guía de nutrición básica", "Seguimiento de progreso", "Acceso de por vida"], weeks: 8, badge: "🎁 GRATIS" },
  { id: 3, name: "Cold Start: Principiantes", price: 0, originalPrice: 499, duration: "4 semanas", level: "Principiante", icon: "❄️", description: "Empieza desde cero con el método correcto. 4 semanas para construir la base sólida que necesitas.", included: ["12 sesiones para principiantes", "Guía de técnica en video", "Plan de alimentación básico", "Soporte por WhatsApp"], weeks: 4, badge: "🎁 GRATIS" },
  { id: 4, name: "Elite Beast Mode", price: 0, originalPrice: 499, duration: "12 semanas", level: "Avanzado", icon: "👑", description: "Solo para los que están listos para el siguiente nivel. El programa más exigente del método Winter Arc.", included: ["36 sesiones avanzadas", "Periodización detallada", "Nutrición personalizada", "Acceso a comunidad privada"], weeks: 12, badge: "🎁 GRATIS" },
];

const TESTIMONIALS = [
  { name: "Carlos M.", result: "Bajé 8kg en 2 meses", text: "El método Winter Arc cambió mi forma de entrenar. Los resultados hablan solos.", stars: 5 },
  { name: "Ana G.", result: "+15kg en press de banca", text: "Nunca pensé que podría levantar tanto. El progreso es real y constante.", stars: 5 },
  { name: "Luis R.", result: "De 0 a entrenar 5 días/sem", text: "El sistema de niveles me mantiene motivado. No puedo parar.", stars: 5 },
];

// ─── STYLES ─────────────────────────────────────────────────
const S = {
  card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(126,200,227,0.15)", borderRadius: 16, padding: 20, marginBottom: 16 },
  input: { background: "#111827", border: "1px solid #1e3a5f", color: "#fff", padding: "14px 20px", borderRadius: 12, fontSize: 15, width: "100%", marginBottom: 12, outline: "none", boxSizing: "border-box" },
  btn: { background: "linear-gradient(135deg, #1a3a5c, #2563a8)", border: "none", color: "#fff", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%" },
  btnOutline: { background: "none", border: "1px solid #334455", color: "#8899aa", padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%" },
  page: { minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "'Segoe UI', sans-serif", maxWidth: 480, margin: "0 auto", paddingBottom: 80 },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [screen, setScreen] = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboarding, setOnboarding] = useState({ objetivo: "", nivel: "", equipo: "" });
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [nombre, setNombre] = useState("");
  const [authError, setAuthError] = useState(""); const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [activeExercise, setActiveExercise] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [timerSecs, setTimerSecs] = useState(0); const [timerOn, setTimerOn] = useState(false);
  const [weights, setWeights] = useState({});
  const [filterObj, setFilterObj] = useState("Todos"); const [filterEq, setFilterEq] = useState("Todos");
  const [coachTab, setCoachTab] = useState("rutinas");
  const [allUsers, setAllUsers] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async u => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          const d = snap.data();
          setUserData(d);
          if (!d.onboardingDone) setScreen("onboarding");
          else setScreen("app");
        }
      } else { setUser(null); setUserData(null); setScreen("landing"); }
    });
  }, []);

  useEffect(() => {
    if (timerOn) {
      intervalRef.current = setInterval(() => setTimerSecs(s => { if (s <= 1) { clearInterval(intervalRef.current); setTimerOn(false); return 0; } return s - 1; }), 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [timerOn]);

  const loadAllUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleRegister = async () => {
    if (!nombre.trim()) { setAuthError("Ingresa tu nombre"); return; }
    setLoading(true); setAuthError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), { nombre, email, completedWorkouts: 0, streak: 0, lastWorkout: null, onboardingDone: false, objetivo: "", nivel: "", equipo: "", role: "user", createdAt: new Date().toISOString() });
      setUserData({ nombre, completedWorkouts: 0, streak: 0, onboardingDone: false, role: "user" });
      setScreen("onboarding");
    } catch (e) { setAuthError(e.code === "auth/email-already-in-use" ? "Correo ya registrado" : e.code === "auth/weak-password" ? "Mínimo 6 caracteres" : "Error al registrarse"); }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true); setAuthError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const d = snap.data(); setUserData(d);
      setScreen(d.onboardingDone ? "app" : "onboarding");
    } catch (e) { setAuthError("Correo o contraseña incorrectos"); }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true); setAuthError("");
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const ref = doc(db, "users", cred.user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { nombre: cred.user.displayName || "Warrior", email: cred.user.email, completedWorkouts: 0, streak: 0, lastWorkout: null, onboardingDone: false, objetivo: "", nivel: "", equipo: "", role: "user", createdAt: new Date().toISOString() });
        setUserData({ nombre: cred.user.displayName, completedWorkouts: 0, streak: 0, onboardingDone: false, role: "user" });
        setScreen("onboarding");
      } else { const d = snap.data(); setUserData(d); setScreen(d.onboardingDone ? "app" : "onboarding"); }
    } catch (e) { setAuthError("Error con Google"); }
    setLoading(false);
  };

  const finishOnboarding = async () => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { ...onboarding, onboardingDone: true });
    setUserData(d => ({ ...d, ...onboarding, onboardingDone: true }));
    setScreen("app");
  };

  const completeWorkout = async () => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { completedWorkouts: increment(1), lastWorkout: new Date().toISOString() });
    const snap = await getDoc(doc(db, "users", user.uid));
    setUserData(snap.data());
    setSelectedRoutine(null); setActiveTab("home");
  };

  const handleLogout = async () => { await signOut(auth); setScreen("landing"); };
  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const cw = userData?.completedWorkouts || 0;
  const streak = userData?.streak || 0;
  const curLvl = LEVELS.slice().reverse().find(l => cw >= l.minWorkouts) || LEVELS[0];
  const nextLvl = LEVELS.find(l => l.minWorkouts > cw);
  const pct = nextLvl ? Math.round(((cw - curLvl.minWorkouts) / (nextLvl.minWorkouts - curLvl.minWorkouts)) * 100) : 100;
  const lvlRoutines = ROUTINES.filter(r => r.level === curLvl.id);
  const isCoach = userData?.role === "coach" || userData?.role === "admin";

  // ── LANDING ──────────────────────────────────────────────
  if (screen === "landing") return (
    <div style={{ background: "#0a0a0f", color: "#fff", fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #0a0a0f 0%, #0d1b2a 60%, #0a0a0f 100%)", padding: "60px 24px 48px", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>❄️</div>
        <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: 2, background: "linear-gradient(90deg, #7ec8e3, #fff, #a8d8ea)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>WINTER ARC</div>
        <div style={{ fontSize: 14, letterSpacing: 6, color: "#7ec8e3", fontWeight: 700, marginBottom: 20 }}>MX</div>
        <div style={{ fontSize: 18, color: "#ccd6e0", maxWidth: 320, margin: "0 auto 12px", lineHeight: 1.6, fontWeight: 600 }}>El método que transforma tu cuerpo mientras todos duermen.</div>
        <div style={{ color: "#8899aa", fontSize: 14, maxWidth: 300, margin: "0 auto 36px", lineHeight: 1.7 }}>Rutinas estructuradas, progreso real y un sistema de niveles que te mantiene avanzando cada semana.</div>
        <button onClick={() => setScreen("auth")} style={{ ...S.btn, width: "auto", padding: "18px 48px", borderRadius: 50, fontSize: 17, letterSpacing: 1, marginBottom: 12 }}>COMENZAR AHORA ❄️</button>
        <div style={{ color: "#556677", fontSize: 12 }}>Acceso único · Sin suscripción mensual</div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#1a3a5c", margin: "0 0 32px" }}>
        {[["500+", "Warriors"], ["5", "Niveles"], ["30+", "Rutinas"]].map(([v, l], i) => (
          <div key={i} style={{ background: "#0a0a0f", padding: "20px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#7ec8e3" }}>{v}</div>
            <div style={{ fontSize: 11, color: "#556677" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Niveles */}
      <div style={{ padding: "0 24px 32px" }}>
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 6, textAlign: "center" }}>Sistema de Niveles</div>
        <div style={{ color: "#8899aa", fontSize: 13, textAlign: "center", marginBottom: 20 }}>Sube de nivel completando entrenamientos reales</div>
        {LEVELS.map(l => (
          <div key={l.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 32 }}>{l.icon}</div>
            <div>
              <div style={{ fontWeight: 700 }}>{l.name}</div>
              <div style={{ color: "#7ec8e3", fontSize: 12 }}>{l.minWorkouts === 0 ? "Inicio" : `${l.minWorkouts} entrenos`}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Programas preview */}
      <div style={{ padding: "0 24px 32px" }}>
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 6, textAlign: "center" }}>Programas Premium</div>
        <div style={{ color: "#8899aa", fontSize: 13, textAlign: "center", marginBottom: 20 }}>Planes estructurados para resultados reales</div>
        {PROGRAMS.map(p => (
          <div key={p.id} style={{ ...S.card }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ fontSize: 28 }}>{p.icon}</div>
              <div style={{ background: "linear-gradient(135deg, #1a3a5c, #2563a8)", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>${p.price} MXN</div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{p.name}</div>
            <div style={{ color: "#8899aa", fontSize: 13, marginBottom: 12 }}>{p.duration} · {p.level}</div>
            <button onClick={() => setScreen("auth")} style={{ ...S.btn, padding: "10px", fontSize: 13 }}>Ver programa</button>
          </div>
        ))}
      </div>

      {/* Testimonios */}
      <div style={{ padding: "0 24px 32px" }}>
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 20, textAlign: "center" }}>Lo que dicen los Warriors</div>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} style={{ ...S.card }}>
            <div style={{ color: "#FFD700", marginBottom: 8, fontSize: 14 }}>{"★".repeat(t.stars)}</div>
            <div style={{ color: "#ccd6e0", fontSize: 14, marginBottom: 12, lineHeight: 1.6 }}>"{t.text}"</div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</div>
            <div style={{ color: "#7ec8e3", fontSize: 12 }}>{t.result}</div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ padding: "0 24px 32px" }}>
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 20, textAlign: "center" }}>Preguntas Frecuentes</div>
        {[
          ["¿Qué incluye el acceso?", "Acceso completo a todas las rutinas incluidas, sistema de progreso, seguimiento de niveles y comunidad."],
          ["¿Necesito equipo especial?", "Tenemos rutinas para gym y para casa. Tú eliges según tu equipo disponible."],
          ["¿Cuánto dura el acceso?", "Es de por vida. Pagas una sola vez y tienes acceso para siempre."],
          ["¿Los programas premium están incluidos?", "Las rutinas base sí. Los programas premium estructurados son compra adicional."],
        ].map(([q, a], i) => (
          <div key={i} style={{ ...S.card }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{q}</div>
            <div style={{ color: "#8899aa", fontSize: 13, lineHeight: 1.6 }}>{a}</div>
          </div>
        ))}
      </div>

      {/* CTA Final */}
      <div style={{ padding: "32px 24px 48px", textAlign: "center", background: "linear-gradient(160deg, #0d1b2a, #0a0a0f)" }}>
        <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>¿Listo para tu Winter Arc? ❄️</div>
        <div style={{ color: "#8899aa", fontSize: 14, marginBottom: 24 }}>Únete a cientos de warriors que ya están transformando su cuerpo.</div>
        <button onClick={() => setScreen("auth")} style={{ ...S.btn, padding: "18px 48px", width: "auto", borderRadius: 50, fontSize: 16 }}>EMPIEZA HOY</button>
        <div style={{ color: "#334455", fontSize: 11, marginTop: 12 }}>Al usar esta plataforma aceptas los términos y condiciones. Consulta con un médico antes de iniciar cualquier programa de ejercicio.</div>
      </div>
    </div>
  );

  // ── AUTH ─────────────────────────────────────────────────
  if (screen === "auth") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a0a0f, #0d1b2a)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", color: "#fff", padding: 24 }}>
      <div onClick={() => setScreen("landing")} style={{ alignSelf: "flex-start", color: "#7ec8e3", cursor: "pointer", marginBottom: 24, fontSize: 14 }}>← Volver</div>
      <div style={{ fontSize: 40 }}>{authMode === "login" ? "🔐" : "❄️"}</div>
      <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4, letterSpacing: 2 }}>{authMode === "login" ? "INICIAR SESIÓN" : "REGISTRO"}</div>
      <div style={{ color: "#7ec8e3", marginBottom: 28, fontSize: 13 }}>{authMode === "login" ? "Bienvenido de vuelta" : "Comienza tu Winter Arc"}</div>
      <div style={{ width: "100%", maxWidth: 320 }}>
        {authMode === "register" && <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" style={S.input} />}
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Correo electrónico" type="email" style={S.input} />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" type="password" style={S.input} />
        {authError && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{authError}</div>}
        <button onClick={authMode === "login" ? handleLogin : handleRegister} disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Cargando..." : authMode === "login" ? "ENTRAR" : "CREAR CUENTA"}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#1e3a5f" }} /><span style={{ color: "#556677", fontSize: 12 }}>o</span><div style={{ flex: 1, height: 1, background: "#1e3a5f" }} />
        </div>
        <button onClick={handleGoogle} disabled={loading} style={{ ...S.btn, background: "#fff", color: "#222", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🔵</span> Continuar con Google
        </button>
        <div style={{ textAlign: "center", marginTop: 16, color: "#556677", fontSize: 13 }}>
          {authMode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
          <span onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }} style={{ color: "#7ec8e3", cursor: "pointer", marginLeft: 6, fontWeight: 700 }}>
            {authMode === "login" ? "Regístrate" : "Inicia sesión"}
          </span>
        </div>
      </div>
    </div>
  );

  // ── ONBOARDING ───────────────────────────────────────────
  if (screen === "onboarding") {
    const steps = [
      { q: "¿Cuál es tu objetivo principal?", key: "objetivo", opts: ["Ganar músculo", "Perder grasa", "Ganar fuerza", "Mejorar condición"] },
      { q: "¿Cuál es tu nivel actual?", key: "nivel", opts: ["Principiante", "Intermedio", "Avanzado"] },
      { q: "¿Con qué equipo cuentas?", key: "equipo", opts: ["Gym completo", "Pesas en casa", "Sin equipo", "Mixto"] },
    ];
    const step = steps[onboardingStep];
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a0a0f, #0d1b2a)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", color: "#fff", padding: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
        <div style={{ fontSize: 12, color: "#7ec8e3", letterSpacing: 2, marginBottom: 8 }}>PASO {onboardingStep + 1} DE {steps.length}</div>
        <div style={{ fontSize: 22, fontWeight: 900, textAlign: "center", marginBottom: 32, maxWidth: 300 }}>{step.q}</div>
        <div style={{ width: "100%", maxWidth: 320 }}>
          {step.opts.map(opt => (
            <button key={opt} onClick={() => {
              setOnboarding(o => ({ ...o, [step.key]: opt }));
              if (onboardingStep < steps.length - 1) setOnboardingStep(s => s + 1);
              else { setOnboarding(o => { const updated = { ...o, [step.key]: opt }; setTimeout(() => finishOnboarding(), 100); return updated; }); }
            }} style={{ ...S.card, width: "100%", textAlign: "left", cursor: "pointer", border: onboarding[step.key] === opt ? "1px solid #7ec8e3" : "1px solid rgba(126,200,227,0.15)", marginBottom: 12, padding: "16px 20px", fontWeight: 600, fontSize: 15, color: "#fff", display: "block" }}>
              {opt}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
          {steps.map((_, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i <= onboardingStep ? "#7ec8e3" : "#1e3a5f" }} />)}
        </div>
      </div>
    );
  }

  // ── EXERCISE DETAIL ──────────────────────────────────────
  if (activeExercise) {
    const ex = activeExercise;
    const currentSet = weights[`${ex.name}-currentSet`] || 0;
    const completedSets = weights[`${ex.name}-completed`] || [];
    const isResting = timerSecs > 0 || timerOn;
    const allDone = completedSets.length >= ex.sets;

    const handleCompleteSet = () => {
      const kg = weights[`${ex.name}-input`] || "0";
      const newCompleted = [...completedSets, { set: currentSet + 1, kg, reps: ex.reps }];
      setWeights(w => ({ ...w, [`${ex.name}-completed`]: newCompleted, [`${ex.name}-currentSet`]: currentSet + 1, [`${ex.name}-input`]: "" }));
      if (newCompleted.length < ex.sets) { setTimerSecs(ex.rest); setTimerOn(true); }
    };

    return (
      <div style={{ ...S.page, background: "linear-gradient(180deg, #0a0a0f 0%, #0d1b2a 100%)" }}>
        <div style={{ padding: 24 }}>
          <button onClick={() => { setActiveExercise(null); setTimerOn(false); setTimerSecs(0); }} style={{ background: "none", border: "none", color: "#7ec8e3", fontSize: 14, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Volver</button>

          {/* Exercise header */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 72, marginBottom: 8, animation: "pulse 2s infinite" }}>🏋️</div>
            <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>{ex.name}</div>
            <div style={{ color: "#8899aa", fontSize: 13 }}>{ex.sets} series · {ex.reps} reps · {ex.rest}s descanso</div>
          </div>

          {/* Series progress dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 28 }}>
            {Array.from({ length: ex.sets }).map((_, i) => (
              <div key={i} style={{
                width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700,
                background: i < completedSets.length ? "linear-gradient(135deg, #0a4a2a, #00c864)" : i === completedSets.length ? "linear-gradient(135deg, #1a3a5c, #2563a8)" : "rgba(255,255,255,0.05)",
                border: i === completedSets.length ? "2px solid #7ec8e3" : "2px solid transparent",
                color: i < completedSets.length ? "#fff" : i === completedSets.length ? "#fff" : "#334455",
                transition: "all 0.4s ease",
                transform: i === completedSets.length ? "scale(1.15)" : "scale(1)"
              }}>
                {i < completedSets.length ? "✓" : i + 1}
              </div>
            ))}
          </div>

          {/* All done */}
          {allDone ? (
            <div style={{ ...S.card, textAlign: "center", background: "linear-gradient(135deg, #0a4a2a, #0d2a1a)", border: "1px solid #00c864" }}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>🎉</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#00c864", marginBottom: 8 }}>¡Ejercicio completado!</div>
              <div style={{ color: "#8899aa", fontSize: 13, marginBottom: 16 }}>Completaste {ex.sets} series</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
                {completedSets.map((s, i) => (
                  <div key={i} style={{ background: "rgba(0,200,100,0.1)", border: "1px solid rgba(0,200,100,0.3)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#00c864" }}>
                    S{s.set}: {s.kg}kg × {s.reps}
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveExercise(null)} style={{ ...S.btn, background: "linear-gradient(135deg, #0a4a2a, #00c864)" }}>← Volver a la rutina</button>
            </div>
          ) : isResting ? (
            /* REST TIMER */
            <div style={{ ...S.card, textAlign: "center", background: "linear-gradient(135deg, #0d1b2a, #1a2a3a)", border: "1px solid #2563a8" }}>
              <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 12, letterSpacing: 2 }}>DESCANSANDO</div>
              <div style={{ fontSize: 72, fontWeight: 900, color: timerSecs <= 10 ? "#ef4444" : "#7ec8e3", marginBottom: 8, transition: "color 0.3s" }}>{fmt(timerSecs)}</div>
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 50, height: 6, marginBottom: 16 }}>
                <div style={{ background: timerSecs <= 10 ? "#ef4444" : "linear-gradient(90deg, #2563a8, #7ec8e3)", borderRadius: 50, height: 6, width: `${(timerSecs / ex.rest) * 100}%`, transition: "width 1s linear, background 0.3s" }} />
              </div>
              <div style={{ color: "#8899aa", fontSize: 13, marginBottom: 16 }}>Serie {completedSets.length + 1} de {ex.sets} viene</div>
              <button onClick={() => { setTimerOn(false); setTimerSecs(0); }} style={{ ...S.btnOutline, width: "auto", padding: "10px 24px" }}>Saltar descanso →</button>
            </div>
          ) : (
            /* ACTIVE SET */
            <div>
              <div style={{ ...S.card, background: "linear-gradient(135deg, #0d1b2a, #1a2a1a)", border: "1px solid rgba(0,200,100,0.3)" }}>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 13, color: "#00c864", fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>SERIE {completedSets.length + 1} DE {ex.sets}</div>
                  <div style={{ fontSize: 32, fontWeight: 900 }}>{ex.reps} reps</div>
                </div>

                {/* Completed sets summary */}
                {completedSets.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "#556677", marginBottom: 8 }}>SERIES ANTERIORES</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {completedSets.map((s, i) => (
                        <div key={i} style={{ background: "rgba(0,200,100,0.08)", border: "1px solid rgba(0,200,100,0.2)", borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "#00c864" }}>
                          S{s.set}: {s.kg}kg
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weight input */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 8 }}>¿Cuánto peso usaste?</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => { const v = parseFloat(weights[`${ex.name}-input`] || 0); setWeights(w => ({ ...w, [`${ex.name}-input`]: Math.max(0, v - 2.5).toString() })); }} style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid #1e3a5f", color: "#fff", fontSize: 22, cursor: "pointer" }}>−</button>
                    <input
                      type="number" placeholder="0"
                      value={weights[`${ex.name}-input`] || ""}
                      onChange={e => setWeights(w => ({ ...w, [`${ex.name}-input`]: e.target.value }))}
                      style={{ flex: 1, background: "#111827", border: "2px solid #00c864", color: "#fff", padding: "16px", borderRadius: 12, fontSize: 28, fontWeight: 900, outline: "none", textAlign: "center" }}
                    />
                    <button onClick={() => { const v = parseFloat(weights[`${ex.name}-input`] || 0); setWeights(w => ({ ...w, [`${ex.name}-input`]: (v + 2.5).toString() })); }} style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(0,200,100,0.1)", border: "1px solid #00c864", color: "#00c864", fontSize: 22, cursor: "pointer" }}>+</button>
                  </div>
                  <div style={{ textAlign: "center", color: "#556677", fontSize: 12, marginTop: 6 }}>kg</div>
                </div>

                <button onClick={handleCompleteSet} style={{ ...S.btn, background: "linear-gradient(135deg, #0a4a2a, #00c864)", fontSize: 16, padding: "16px" }}>
                  ✓ Serie {completedSets.length + 1} completada
                </button>
              </div>
            </div>
          )}

          {/* CSS animations */}
          <style>{`
            @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
            @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          `}</style>
        </div>
      </div>
    );
  }

  // ── ROUTINE DETAIL ───────────────────────────────────────
  if (selectedRoutine) return (
    <div style={S.page}>
      <div style={{ padding: 24 }}>
        <button onClick={() => setSelectedRoutine(null)} style={{ background: "none", border: "none", color: "#7ec8e3", fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0 }}>← Volver</button>
        <div style={{ fontSize: 12, color: "#7ec8e3", fontWeight: 700, marginBottom: 4 }}>{selectedRoutine.day}</div>
        <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>{selectedRoutine.name}</div>
        <div style={{ color: "#8899aa", fontSize: 13, marginBottom: 24 }}>{selectedRoutine.duration} min · {selectedRoutine.equipment} · {selectedRoutine.objetivo}</div>
        {selectedRoutine.exercises.map((ex, i) => (
          <div key={i} onClick={() => setActiveExercise(ex)} style={{ ...S.card, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
            <div><div style={{ fontWeight: 700, marginBottom: 4 }}>{ex.name}</div><div style={{ color: "#7ec8e3", fontSize: 13 }}>{ex.sets} series × {ex.reps} reps</div></div>
            <div style={{ color: "#556677", fontSize: 20 }}>›</div>
          </div>
        ))}
        <button onClick={completeWorkout} style={S.btn}>✅ Marcar como Completado</button>
      </div>
    </div>
  );

  // ── PROGRAM DETAIL ───────────────────────────────────────
  if (selectedProgram) return (
    <div style={S.page}>
      <div style={{ padding: 24 }}>
        <button onClick={() => setSelectedProgram(null)} style={{ background: "none", border: "none", color: "#7ec8e3", fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0 }}>← Volver</button>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 64 }}>{selectedProgram.icon}</div>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>{selectedProgram.name}</div>
          <div style={{ color: "#8899aa", fontSize: 13 }}>{selectedProgram.duration} · {selectedProgram.level}</div>
        </div>
        <div style={S.card}>
          <div style={{ color: "#ccd6e0", fontSize: 14, lineHeight: 1.7 }}>{selectedProgram.description}</div>
        </div>
        <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 12 }}>INCLUYE</div>
        {selectedProgram.included.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
            <div style={{ color: "#7ec8e3" }}>✓</div>
            <div style={{ color: "#ccd6e0", fontSize: 14 }}>{item}</div>
          </div>
        ))}
        <div style={{ ...S.card, textAlign: "center", marginTop: 16 }}>
          {selectedProgram.badge && <div style={{ background: selectedProgram.price === 0 ? "rgba(0,200,100,0.15)" : "rgba(255,100,0,0.15)", border: `1px solid ${selectedProgram.price === 0 ? "#00c864" : "#ff6400"}`, borderRadius: 20, padding: "4px 16px", fontSize: 13, fontWeight: 700, color: selectedProgram.price === 0 ? "#00c864" : "#ff6400", display: "inline-block", marginBottom: 12 }}>{selectedProgram.badge}</div>}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 4 }}>
            <div style={{ fontSize: 18, color: "#556677", textDecoration: "line-through" }}>${selectedProgram.originalPrice} MXN</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: selectedProgram.price === 0 ? "#00c864" : "#7ec8e3" }}>{selectedProgram.price === 0 ? "GRATIS" : `${selectedProgram.price} MXN`}</div>
          </div>
          <div style={{ color: "#8899aa", fontSize: 12, marginBottom: 16 }}>Pago único · Acceso de por vida</div>
          <button style={{ ...S.btn, background: selectedProgram.price === 0 ? "linear-gradient(135deg, #0a4a2a, #00c864)" : "linear-gradient(135deg, #1a3a5c, #2563a8)" }}>{selectedProgram.price === 0 ? "Obtener Gratis 🎁" : "Comprar Programa 🔥"}</button>
        </div>
      </div>
    </div>
  );

  // ── MAIN APP ─────────────────────────────────────────────
  const tabs = [
    { id: "home", icon: "🏠", label: "Inicio" },
    { id: "library", icon: "💪", label: "Rutinas" },
    { id: "programs", icon: "🏆", label: "Programas" },
    { id: "progress", icon: "📈", label: "Progreso" },
    { id: "profile", icon: "👤", label: "Perfil" },
  ];

  const filteredRoutines = ROUTINES.filter(r => {
    const objOk = filterObj === "Todos" || r.objetivo === filterObj;
    const eqOk = filterEq === "Todos" || r.equipment === filterEq;
    return objOk && eqOk;
  });

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: "#556677", letterSpacing: 2, fontWeight: 700 }}>WINTER ARC MX</div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>❄️ Hola, {userData?.nombre?.split(" ")[0] || "Warrior"}</div>
        </div>
        <div style={{ background: "rgba(126,200,227,0.1)", border: "1px solid rgba(126,200,227,0.3)", borderRadius: 20, padding: "6px 14px", fontSize: 12, color: "#7ec8e3", fontWeight: 700 }}>
          {curLvl.icon} {curLvl.name}
        </div>
      </div>

      <div style={{ padding: "0 24px" }}>

        {/* HOME */}
        {activeTab === "home" && (
          <div style={{ marginTop: 24 }}>
            <div style={{ background: "linear-gradient(135deg, #0d1b2a, #1a3a5c)", border: "1px solid rgba(126,200,227,0.3)", borderRadius: 20, padding: 24, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div><div style={{ fontSize: 11, color: "#7ec8e3", letterSpacing: 1, marginBottom: 4 }}>NIVEL ACTUAL</div><div style={{ fontSize: 22, fontWeight: 900 }}>{curLvl.icon} {curLvl.name}</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: "#7ec8e3", marginBottom: 4 }}>RACHA</div><div style={{ fontSize: 22, fontWeight: 900 }}>🔥 {streak}d</div></div>
              </div>
              {nextLvl && (<>
                <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 8 }}>Próximo: {nextLvl.icon} {nextLvl.name} — {cw}/{nextLvl.minWorkouts}</div>
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 50, height: 8 }}>
                  <div style={{ background: "linear-gradient(90deg, #2563a8, #7ec8e3)", borderRadius: 50, height: 8, width: `${pct}%`, transition: "width 0.5s" }} />
                </div>
                <div style={{ textAlign: "right", fontSize: 11, color: "#7ec8e3", marginTop: 4 }}>{pct}%</div>
              </>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[{ l: "Entrenos", v: cw, i: "💪" }, { l: "Racha", v: `${streak}d`, i: "🔥" }].map((s, i) => (
                <div key={i} style={{ ...S.card, margin: 0, textAlign: "center" }}>
                  <div style={{ fontSize: 28 }}>{s.i}</div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: "#8899aa" }}>{s.l}</div>
                </div>
              ))}
            </div>
            {lvlRoutines[0] && (
              <div style={S.card}>
                <div style={{ fontSize: 12, color: "#7ec8e3", fontWeight: 700, marginBottom: 12 }}>HOY TE TOCA</div>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{lvlRoutines[0].name}</div>
                <div style={{ color: "#8899aa", fontSize: 13, marginBottom: 16 }}>{lvlRoutines[0].exercises.length} ejercicios · {lvlRoutines[0].duration} min</div>
                <button onClick={() => setSelectedRoutine(lvlRoutines[0])} style={{ ...S.btn, width: "auto", padding: "12px 24px", borderRadius: 50 }}>Iniciar ❄️</button>
              </div>
            )}
            <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 12, marginTop: 8 }}>PROGRAMAS PREMIUM</div>
            {PROGRAMS.slice(0, 2).map(p => (
              <div key={p.id} onClick={() => setSelectedProgram(p)} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <div><div style={{ fontSize: 22 }}>{p.icon}</div><div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div><div style={{ color: "#7ec8e3", fontSize: 12 }}>${p.price} MXN</div></div>
                <div style={{ color: "#556677", fontSize: 20 }}>›</div>
              </div>
            ))}
          </div>
        )}

        {/* LIBRARY */}
        {activeTab === "library" && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 16 }}>Biblioteca de Rutinas</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {["Todos", "Fuerza", "Hipertrofia", "Definición"].map(f => (
                <button key={f} onClick={() => setFilterObj(f)} style={{ background: filterObj === f ? "#2563a8" : "rgba(255,255,255,0.05)", border: `1px solid ${filterObj === f ? "#2563a8" : "#1e3a5f"}`, color: "#fff", padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer" }}>{f}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {["Todos", "Gym", "Casa"].map(f => (
                <button key={f} onClick={() => setFilterEq(f)} style={{ background: filterEq === f ? "#1a3a5c" : "rgba(255,255,255,0.03)", border: `1px solid ${filterEq === f ? "#7ec8e3" : "#1e3a5f"}`, color: filterEq === f ? "#7ec8e3" : "#8899aa", padding: "5px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer" }}>{f}</button>
              ))}
            </div>
            {filteredRoutines.map(r => (
              <div key={r.id} onClick={() => setSelectedRoutine(r)} style={{ ...S.card, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#7ec8e3", fontWeight: 700, marginBottom: 4 }}>{r.day} · Nivel {r.level}</div>
                  <div style={{ fontSize: 17, fontWeight: 900 }}>{r.name}</div>
                  <div style={{ color: "#8899aa", fontSize: 12, marginTop: 4 }}>{r.duration} min · {r.equipment} · {r.objetivo}</div>
                </div>
                <div style={{ color: "#334455", fontSize: 20 }}>›</div>
              </div>
            ))}
            {filteredRoutines.length === 0 && <div style={{ textAlign: "center", color: "#556677", marginTop: 40 }}>No hay rutinas con esos filtros</div>}
          </div>
        )}

        {/* PROGRAMS */}
        {activeTab === "programs" && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>Programas Premium</div>
            <div style={{ color: "#8899aa", fontSize: 13, marginBottom: 20 }}>Planes estructurados para resultados reales</div>
            {PROGRAMS.map(p => (
              <div key={p.id} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 36 }}>{p.icon}</div>
                  <div style={{ background: "linear-gradient(135deg, #1a3a5c, #2563a8)", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700, height: "fit-content" }}>${p.price} MXN</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{p.name}</div>
                <div style={{ color: "#8899aa", fontSize: 12, marginBottom: 12 }}>{p.duration} · {p.level}</div>
                <div style={{ color: "#ccd6e0", fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>{p.description}</div>
                <button onClick={() => setSelectedProgram(p)} style={{ ...S.btn, padding: "12px" }}>Ver detalles →</button>
              </div>
            ))}
          </div>
        )}

        {/* PROGRESS */}
        {activeTab === "progress" && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>Tu Progreso</div>
            <div style={{ ...S.card, textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: "#7ec8e3" }}>{cw}</div>
              <div style={{ color: "#8899aa", fontSize: 14 }}>Entrenamientos completados</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[{ l: "Nivel", v: curLvl.id }, { l: "Racha", v: `${streak}d` }, { l: "Faltan", v: nextLvl ? nextLvl.minWorkouts - cw : "MAX" }].map((s, i) => (
                <div key={i} style={{ ...S.card, margin: 0, textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#7ec8e3" }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: "#8899aa" }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 16 }}>CAMINO A WINTER ARC 👑</div>
              {LEVELS.map(l => (
                <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ fontSize: 22, opacity: cw >= l.minWorkouts ? 1 : 0.3 }}>{l.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, opacity: cw >= l.minWorkouts ? 1 : 0.4 }}>{l.name}</div>
                    <div style={{ background: "#111827", borderRadius: 50, height: 4, marginTop: 4 }}>
                      <div style={{ background: "linear-gradient(90deg, #2563a8, #7ec8e3)", borderRadius: 50, height: 4, width: `${Math.min(100, (cw / (l.minWorkouts || 1)) * 100)}%` }} />
                    </div>
                  </div>
                  {cw >= l.minWorkouts && <div style={{ color: "#7ec8e3" }}>✓</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div style={{ marginTop: 24 }}>
            <div style={{ ...S.card, textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>👤</div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>{userData?.nombre}</div>
              <div style={{ color: "#8899aa", fontSize: 13, marginTop: 4 }}>{userData?.email}</div>
              <div style={{ color: "#7ec8e3", fontSize: 14, marginTop: 8 }}>{curLvl.icon} {curLvl.name}</div>
            </div>
            <div style={S.card}>
              <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 12 }}>TU PERFIL</div>
              {[["Objetivo", userData?.objetivo], ["Nivel", userData?.nivel], ["Equipo", userData?.equipo]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ color: "#8899aa", fontSize: 13 }}>{k}</span>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{v || "No definido"}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 12 }}>LOGROS</div>
            {LEVELS.map(l => (
              <div key={l.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 16, opacity: cw >= l.minWorkouts ? 1 : 0.3 }}>
                <div style={{ fontSize: 28 }}>{l.icon}</div>
                <div><div style={{ fontWeight: 700 }}>{l.name}</div><div style={{ color: "#8899aa", fontSize: 12 }}>{l.minWorkouts} entrenos</div></div>
                {cw >= l.minWorkouts && <div style={{ marginLeft: "auto", color: "#7ec8e3" }}>✓</div>}
              </div>
            ))}
            {isCoach && (
              <button onClick={() => setActiveTab("coach")} style={{ ...S.btn, background: "linear-gradient(135deg, #1a3a5c, #0d4a2a)", marginBottom: 12 }}>
                🎯 Panel de Coach
              </button>
            )}
            <button onClick={handleLogout} style={{ ...S.btnOutline }}>Cerrar Sesión</button>
          </div>
        )}

        {/* COACH PANEL */}
        {activeTab === "coach" && isCoach && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <button onClick={() => setActiveTab("profile")} style={{ background: "none", border: "none", color: "#7ec8e3", fontSize: 14, cursor: "pointer", padding: 0 }}>←</button>
              <div style={{ fontSize: 20, fontWeight: 900 }}>Panel de Coach 🎯</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {["rutinas", "usuarios", "metricas"].map(t => (
                <button key={t} onClick={() => { setCoachTab(t); if (t === "usuarios") loadAllUsers(); }} style={{ flex: 1, background: coachTab === t ? "#2563a8" : "rgba(255,255,255,0.05)", border: "none", color: "#fff", padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}>{t}</button>
              ))}
            </div>

            {coachTab === "rutinas" && (
              <div>
                <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 12 }}>RUTINAS ACTIVAS ({ROUTINES.length})</div>
                {ROUTINES.map(r => (
                  <div key={r.id} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.name}</div>
                      <div style={{ color: "#8899aa", fontSize: 12 }}>Nivel {r.level} · {r.exercises.length} ejercicios · {r.duration} min</div>
                    </div>
                    <div style={{ color: "#7ec8e3", fontSize: 12 }}>✓ Activa</div>
                  </div>
                ))}
                <button style={{ ...S.btn, background: "rgba(255,255,255,0.05)", border: "1px solid #1e3a5f", marginTop: 8 }}>+ Agregar Rutina</button>
              </div>
            )}

            {coachTab === "usuarios" && (
              <div>
                <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 12 }}>USUARIOS REGISTRADOS ({allUsers.length})</div>
                {allUsers.length === 0 && <div style={{ color: "#556677", textAlign: "center", marginTop: 20 }}>Cargando usuarios...</div>}
                {allUsers.map(u => (
                  <div key={u.id} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{u.nombre}</div>
                      <div style={{ color: "#8899aa", fontSize: 12 }}>{u.email}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#7ec8e3", fontSize: 13, fontWeight: 700 }}>{u.completedWorkouts || 0} entrenos</div>
                      <div style={{ color: "#556677", fontSize: 11 }}>{LEVELS.slice().reverse().find(l => (u.completedWorkouts || 0) >= l.minWorkouts)?.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {coachTab === "metricas" && (
              <div>
                <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 12 }}>MÉTRICAS</div>
                {[
                  { l: "Usuarios totales", v: allUsers.length || "—", i: "👥" },
                  { l: "Rutinas activas", v: ROUTINES.length, i: "💪" },
                  { l: "Programas premium", v: PROGRAMS.length, i: "🏆" },
                  { l: "Niveles disponibles", v: LEVELS.length, i: "❄️" },
                ].map((m, i) => (
                  <div key={i} style={{ ...S.card, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ fontSize: 32 }}>{m.i}</div>
                    <div><div style={{ fontSize: 22, fontWeight: 900, color: "#7ec8e3" }}>{m.v}</div><div style={{ color: "#8899aa", fontSize: 13 }}>{m.l}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "rgba(10,10,15,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(126,200,227,0.1)", display: "flex" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, background: "none", border: "none", color: activeTab === t.id ? "#7ec8e3" : "#334455", padding: "10px 0", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: 16 }}>
            <span>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}