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
  { id: 1, name: "Rodo Flores: Personal Training", price: 99, originalPrice: 1000, duration: "Acceso de por vida", level: "Todos los niveles", icon: "🔥", description: "Entrena directamente con el método de Rodo Flores. Acceso completo a su sistema de entrenamiento personal con rutinas exclusivas, seguimiento y soporte directo.", included: ["Rutinas personalizadas de Rodo", "Seguimiento de progreso real", "Acceso de por vida", "Actualizaciones incluidas"], badge: "🔥 OFERTA ESPECIAL" },
  { id: 2, name: "Winter Arc: Fuerza Total", price: 0, originalPrice: 499, duration: "8 semanas", level: "Intermedio", icon: "🏋️", description: "El programa definitivo para construir fuerza real. 8 semanas de entrenamiento progresivo.", included: ["24 sesiones estructuradas", "Guía de nutrición básica", "Seguimiento de progreso", "Acceso de por vida"], badge: "🎁 GRATIS" },
  { id: 3, name: "Cold Start: Principiantes", price: 0, originalPrice: 499, duration: "4 semanas", level: "Principiante", icon: "❄️", description: "Empieza desde cero con el método correcto. 4 semanas para construir la base sólida.", included: ["12 sesiones para principiantes", "Guía de técnica", "Plan de alimentación básico", "Soporte por WhatsApp"], badge: "🎁 GRATIS" },
  { id: 4, name: "Elite Beast Mode", price: 0, originalPrice: 499, duration: "12 semanas", level: "Avanzado", icon: "👑", description: "El programa más exigente del método Winter Arc. Solo para los que están listos.", included: ["36 sesiones avanzadas", "Periodización detallada", "Nutrición personalizada", "Comunidad privada"], badge: "🎁 GRATIS" },
];

const TESTIMONIALS = [
  { name: "Carlos M.", result: "Bajé 8kg en 2 meses", text: "El método Winter Arc cambió mi forma de entrenar. Los resultados hablan solos.", stars: 5 },
  { name: "Ana G.", result: "+15kg en press de banca", text: "Nunca pensé que podría levantar tanto. El progreso es real y constante.", stars: 5 },
  { name: "Luis R.", result: "De 0 a entrenar 5 días/sem", text: "El sistema de niveles me mantiene motivado. No puedo parar.", stars: 5 },
];

const G = "#00c864";
const S = {
  card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(126,200,227,0.15)", borderRadius: 16, padding: 20, marginBottom: 16 },
  gcard: { background: "rgba(0,200,100,0.06)", border: "1px solid rgba(0,200,100,0.2)", borderRadius: 16, padding: 20, marginBottom: 16 },
  input: { background: "#111827", border: "1px solid #1e3a5f", color: "#fff", padding: "14px 20px", borderRadius: 12, fontSize: 15, width: "100%", marginBottom: 12, outline: "none", boxSizing: "border-box" },
  btn: { background: "linear-gradient(135deg, #1a3a5c, #2563a8)", border: "none", color: "#fff", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", boxSizing: "border-box" },
  gbtn: { background: `linear-gradient(135deg, #0a4a2a, ${G})`, border: "none", color: "#fff", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", boxSizing: "border-box" },
  btnOutline: { background: "none", border: "1px solid #334455", color: "#8899aa", padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", boxSizing: "border-box" },
  page: { minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "'Segoe UI', sans-serif", maxWidth: 480, margin: "0 auto", paddingBottom: 80 },
};

const CSS = `
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes glow { 0%,100%{box-shadow:0 0 8px rgba(0,200,100,0.3)} 50%{box-shadow:0 0 20px rgba(0,200,100,0.6)} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .fadeUp { animation: fadeUp 0.4s ease forwards; }
  .pulse { animation: pulse 2s infinite; }
  .glow { animation: glow 2s infinite; }
`;

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
  const [setWeightsState, setSetWeightsState] = useState({});
  const [filterObj, setFilterObj] = useState("Todos"); const [filterEq, setFilterEq] = useState("Todos");
  const [coachTab, setCoachTab] = useState("rutinas");
  const [allUsers, setAllUsers] = useState([]);
  const [workoutDone, setWorkoutDone] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async u => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          const d = snap.data(); setUserData(d);
          if (!d.onboardingDone) setScreen("onboarding"); else setScreen("app");
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

  const finishOnboarding = async (finalData) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { ...finalData, onboardingDone: true });
    setUserData(d => ({ ...d, ...finalData, onboardingDone: true }));
    setScreen("app");
  };

  const completeWorkout = async () => {
    if (!user) return;
    setWorkoutDone(true);
    await updateDoc(doc(db, "users", user.uid), { completedWorkouts: increment(1), lastWorkout: new Date().toISOString() });
    const snap = await getDoc(doc(db, "users", user.uid));
    setUserData(snap.data());
    setTimeout(() => { setWorkoutDone(false); setSelectedRoutine(null); setActiveTab("home"); }, 2500);
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
      <style>{CSS}</style>
      <div style={{ background: "linear-gradient(160deg, #0a0a0f 0%, #0d1b2a 60%, #0a0a0f 100%)", padding: "60px 24px 48px", textAlign: "center" }}>
        <div className="pulse" style={{ fontSize: 60, marginBottom: 8 }}>❄️</div>
        <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: 2, background: "linear-gradient(90deg, #7ec8e3, #fff, #00c864)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>WINTER ARC</div>
        <div style={{ fontSize: 14, letterSpacing: 6, color: G, fontWeight: 700, marginBottom: 20 }}>MX</div>
        <div style={{ fontSize: 18, color: "#ccd6e0", maxWidth: 320, margin: "0 auto 12px", lineHeight: 1.6, fontWeight: 600 }}>El método que transforma tu cuerpo mientras todos duermen.</div>
        <div style={{ color: "#8899aa", fontSize: 14, maxWidth: 300, margin: "0 auto 36px", lineHeight: 1.7 }}>Rutinas estructuradas, progreso real y un sistema de niveles que te mantiene avanzando.</div>
        <button onClick={() => setScreen("auth")} style={{ ...S.gbtn, width: "auto", padding: "18px 48px", borderRadius: 50, fontSize: 17, letterSpacing: 1, marginBottom: 12 }}>COMENZAR AHORA ❄️</button>
        <div style={{ color: "#556677", fontSize: 12 }}>Acceso único · Sin suscripción mensual</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#0d2a1a", margin: "0 0 32px" }}>
        {[["500+", "Warriors"], ["5", "Niveles"], ["30+", "Rutinas"]].map(([v, l], i) => (
          <div key={i} style={{ background: "#0a0a0f", padding: "20px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: G }}>{v}</div>
            <div style={{ fontSize: 11, color: "#556677" }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 24px 32px" }}>
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 6, textAlign: "center" }}>Sistema de Niveles</div>
        <div style={{ color: "#8899aa", fontSize: 13, textAlign: "center", marginBottom: 20 }}>Sube de nivel completando entrenamientos reales</div>
        {LEVELS.map((l, i) => (
          <div key={l.id} className="fadeUp" style={{ ...S.card, display: "flex", alignItems: "center", gap: 16, animationDelay: `${i * 0.1}s` }}>
            <div style={{ fontSize: 32 }}>{l.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{l.name}</div>
              <div style={{ color: "#7ec8e3", fontSize: 12 }}>{l.minWorkouts === 0 ? "Nivel inicial" : `${l.minWorkouts} entrenos`}</div>
            </div>
            {i < 2 && <div style={{ background: "rgba(0,200,100,0.1)", border: `1px solid ${G}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, color: G }}>Incluido</div>}
          </div>
        ))}
      </div>
      <div style={{ padding: "0 24px 32px" }}>
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 20, textAlign: "center" }}>Lo que dicen los Warriors</div>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} style={{ ...S.gcard }}>
            <div style={{ color: "#FFD700", marginBottom: 8 }}>{"★".repeat(t.stars)}</div>
            <div style={{ color: "#ccd6e0", fontSize: 14, marginBottom: 12, lineHeight: 1.6 }}>"{t.text}"</div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name} <span style={{ color: G, fontSize: 12 }}>· {t.result}</span></div>
          </div>
        ))}
      </div>
      <div style={{ padding: "32px 24px 48px", textAlign: "center", background: "linear-gradient(160deg, #0d2a1a, #0a0a0f)" }}>
        <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>¿Listo para tu Winter Arc? ❄️</div>
        <div style={{ color: "#8899aa", fontSize: 14, marginBottom: 24 }}>Únete a cientos de warriors que ya están transformando su cuerpo.</div>
        <button onClick={() => setScreen("auth")} style={{ ...S.gbtn, padding: "18px 48px", width: "auto", borderRadius: 50, fontSize: 16 }}>EMPIEZA HOY</button>
        <div style={{ color: "#334455", fontSize: 11, marginTop: 12 }}>Al usar esta plataforma aceptas los términos y condiciones.</div>
      </div>
    </div>
  );

  // ── AUTH ─────────────────────────────────────────────────
  if (screen === "auth") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a0a0f, #0d1b2a)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", color: "#fff", padding: 24 }}>
      <style>{CSS}</style>
      <div onClick={() => setScreen("landing")} style={{ alignSelf: "flex-start", color: "#7ec8e3", cursor: "pointer", marginBottom: 24, fontSize: 14 }}>← Volver</div>
      <div className="pulse" style={{ fontSize: 40 }}>{authMode === "login" ? "🔐" : "❄️"}</div>
      <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4, letterSpacing: 2 }}>{authMode === "login" ? "INICIAR SESIÓN" : "REGISTRO"}</div>
      <div style={{ color: G, marginBottom: 28, fontSize: 13 }}>{authMode === "login" ? "Bienvenido de vuelta" : "Comienza tu Winter Arc"}</div>
      <div style={{ width: "100%", maxWidth: 320 }}>
        {authMode === "register" && <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" style={S.input} />}
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Correo electrónico" type="email" style={S.input} />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" type="password" style={S.input} />
        {authError && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{authError}</div>}
        <button onClick={authMode === "login" ? handleLogin : handleRegister} disabled={loading} style={{ ...S.gbtn, opacity: loading ? 0.7 : 1 }}>
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
          <span onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }} style={{ color: G, cursor: "pointer", marginLeft: 6, fontWeight: 700 }}>
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
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a0a0f, #0d2a1a)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", color: "#fff", padding: 24 }}>
        <style>{CSS}</style>
        <div className="pulse" style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
        <div style={{ fontSize: 12, color: G, letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>PASO {onboardingStep + 1} DE {steps.length}</div>
        <div style={{ fontSize: 22, fontWeight: 900, textAlign: "center", marginBottom: 32, maxWidth: 300 }}>{step.q}</div>
        <div style={{ width: "100%", maxWidth: 320 }}>
          {step.opts.map((opt, i) => (
            <button key={opt} className="fadeUp" onClick={() => {
              const updated = { ...onboarding, [step.key]: opt };
              setOnboarding(updated);
              if (onboardingStep < steps.length - 1) setOnboardingStep(s => s + 1);
              else finishOnboarding(updated);
            }} style={{ ...S.card, width: "100%", textAlign: "left", cursor: "pointer", border: `1px solid ${onboarding[step.key] === opt ? G : "rgba(126,200,227,0.15)"}`, marginBottom: 12, padding: "16px 20px", fontWeight: 600, fontSize: 15, color: onboarding[step.key] === opt ? G : "#fff", display: "block", animationDelay: `${i * 0.08}s`, background: onboarding[step.key] === opt ? "rgba(0,200,100,0.08)" : "rgba(255,255,255,0.04)" }}>
              {opt}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
          {steps.map((_, i) => <div key={i} style={{ width: i <= onboardingStep ? 24 : 8, height: 8, borderRadius: 4, background: i <= onboardingStep ? G : "#1e3a5f", transition: "all 0.3s" }} />)}
        </div>
      </div>
    );
  }

  // ── EXERCISE PLAYER ──────────────────────────────────────
  if (activeExercise) {
    const ex = activeExercise;
    const completedSets = setWeightsState[`${ex.name}-completed`] || [];
    const currentKg = setWeightsState[`${ex.name}-input`] || "";
    const isResting = timerSecs > 0 || timerOn;
    const allDone = completedSets.length >= ex.sets;

    const handleCompleteSet = () => {
      const kg = currentKg || "0";
      const newCompleted = [...completedSets, { set: completedSets.length + 1, kg, reps: ex.reps }];
      setSetWeightsState(w => ({ ...w, [`${ex.name}-completed`]: newCompleted, [`${ex.name}-input`]: "" }));
      if (newCompleted.length < ex.sets) { setTimerSecs(ex.rest); setTimerOn(true); }
    };

    return (
      <div style={{ ...S.page, background: "linear-gradient(180deg, #0a0a0f 0%, #0d1b0a 100%)" }}>
        <style>{CSS}</style>
        <div style={{ padding: "24px 20px" }}>
          <button onClick={() => { setActiveExercise(null); setTimerOn(false); setTimerSecs(0); }} style={{ background: "none", border: "none", color: "#7ec8e3", fontSize: 14, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Volver</button>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div className="pulse" style={{ fontSize: 64, marginBottom: 8 }}>🏋️</div>
            <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{ex.name}</div>
            <div style={{ color: "#8899aa", fontSize: 13 }}>{ex.sets} series · {ex.reps} reps · {ex.rest}s descanso</div>
          </div>

          {/* Progress dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
            {Array.from({ length: ex.sets }).map((_, i) => (
              <div key={i} style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900,
                background: i < completedSets.length ? `linear-gradient(135deg, #0a4a2a, ${G})` : i === completedSets.length && !allDone ? "linear-gradient(135deg, #1a3a5c, #2563a8)" : "rgba(255,255,255,0.05)",
                border: i === completedSets.length && !allDone ? `2px solid ${G}` : "2px solid transparent",
                color: i < completedSets.length || i === completedSets.length ? "#fff" : "#334455",
                transform: i === completedSets.length && !allDone ? "scale(1.2)" : "scale(1)",
                transition: "all 0.4s ease",
                boxShadow: i === completedSets.length && !allDone ? `0 0 12px rgba(0,200,100,0.4)` : "none"
              }}>
                {i < completedSets.length ? "✓" : i + 1}
              </div>
            ))}
          </div>

          {allDone ? (
            <div className="fadeUp" style={{ background: "linear-gradient(135deg, #0a4a2a, #0d2a1a)", border: `1px solid ${G}`, borderRadius: 20, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: G, marginBottom: 8 }}>¡Ejercicio completado!</div>
              <div style={{ color: "#8899aa", fontSize: 13, marginBottom: 20 }}>Completaste {ex.sets} series</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 20 }}>
                {completedSets.map((s, i) => (
                  <div key={i} style={{ background: "rgba(0,200,100,0.1)", border: `1px solid rgba(0,200,100,0.3)`, borderRadius: 20, padding: "6px 14px", fontSize: 13, color: G, fontWeight: 700 }}>
                    S{s.set}: {s.kg}kg × {s.reps}
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveExercise(null)} style={S.gbtn}>← Siguiente ejercicio</button>
            </div>
          ) : isResting ? (
            <div className="fadeUp glow" style={{ background: "linear-gradient(135deg, #0d1b2a, #1a2a3a)", border: "1px solid #2563a8", borderRadius: 20, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 16, letterSpacing: 2 }}>⏱ DESCANSANDO</div>
              <div style={{ fontSize: 80, fontWeight: 900, color: timerSecs <= 10 ? "#ef4444" : "#7ec8e3", lineHeight: 1, marginBottom: 16, transition: "color 0.3s" }}>{fmt(timerSecs)}</div>
              <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 50, height: 8, marginBottom: 16 }}>
                <div style={{ background: timerSecs <= 10 ? "#ef4444" : `linear-gradient(90deg, #2563a8, ${G})`, borderRadius: 50, height: 8, width: `${(timerSecs / ex.rest) * 100}%`, transition: "width 1s linear, background 0.3s" }} />
              </div>
              <div style={{ color: "#8899aa", fontSize: 13, marginBottom: 20 }}>Serie {completedSets.length + 1} de {ex.sets} viene</div>
              <button onClick={() => { setTimerOn(false); setTimerSecs(0); }} style={{ ...S.btnOutline, width: "auto", padding: "10px 28px", borderRadius: 50 }}>Saltar descanso →</button>
            </div>
          ) : (
            <div className="fadeUp" style={{ background: "linear-gradient(135deg, #0d1b0a, #0a2a1a)", border: `1px solid rgba(0,200,100,0.35)`, borderRadius: 20, padding: "24px 20px" }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: G, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>SERIE {completedSets.length + 1} DE {ex.sets}</div>
                <div style={{ fontSize: 40, fontWeight: 900 }}>{ex.reps} <span style={{ fontSize: 20, color: "#8899aa" }}>reps</span></div>
              </div>

              {completedSets.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#556677", marginBottom: 8, letterSpacing: 1 }}>SERIES ANTERIORES</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {completedSets.map((s, i) => (
                      <div key={i} style={{ background: "rgba(0,200,100,0.08)", border: `1px solid rgba(0,200,100,0.25)`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: G, fontWeight: 700 }}>
                        S{s.set}: {s.kg}kg
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 10 }}>¿Cuánto peso usaste?</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => { const v = parseFloat(currentKg || 0); setSetWeightsState(w => ({ ...w, [`${ex.name}-input`]: Math.max(0, v - 2.5).toString() })); }}
                    style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid #1e3a5f", color: "#fff", fontSize: 24, cursor: "pointer", flexShrink: 0 }}>−</button>
                  <input type="number" placeholder="0"
                    value={currentKg}
                    onChange={e => setSetWeightsState(w => ({ ...w, [`${ex.name}-input`]: e.target.value }))}
                    style={{ flex: 1, background: "#111827", border: `2px solid ${G}`, color: "#fff", padding: "14px 10px", borderRadius: 12, fontSize: 32, fontWeight: 900, outline: "none", textAlign: "center", minWidth: 0 }}
                  />
                  <button onClick={() => { const v = parseFloat(currentKg || 0); setSetWeightsState(w => ({ ...w, [`${ex.name}-input`]: (v + 2.5).toString() })); }}
                    style={{ width: 48, height: 48, borderRadius: "50%", background: `rgba(0,200,100,0.15)`, border: `1px solid ${G}`, color: G, fontSize: 24, cursor: "pointer", flexShrink: 0 }}>+</button>
                </div>
                <div style={{ textAlign: "center", color: "#556677", fontSize: 12, marginTop: 6 }}>kilogramos</div>
              </div>

              <button onClick={handleCompleteSet} style={{ ...S.gbtn, fontSize: 16, padding: "16px 20px" }}>
                ✓ Serie {completedSets.length + 1} completada
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── WORKOUT DONE OVERLAY ─────────────────────────────────
  if (workoutDone) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0a0f, #0d2a1a)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", color: "#fff", textAlign: "center", padding: 24 }}>
      <style>{CSS}</style>
      <div className="pulse" style={{ fontSize: 80, marginBottom: 16 }}>🏆</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: G, marginBottom: 8 }}>¡Entrenamiento completado!</div>
      <div style={{ color: "#8899aa", fontSize: 15 }}>Sigue así, Warrior 💪</div>
      <div style={{ marginTop: 24, color: G, fontSize: 14 }}>+1 entrenamiento · Progresando...</div>
    </div>
  );

  // ── ROUTINE DETAIL ───────────────────────────────────────
  if (selectedRoutine) return (
    <div style={S.page}>
      <style>{CSS}</style>
      <div style={{ padding: 24 }}>
        <button onClick={() => setSelectedRoutine(null)} style={{ background: "none", border: "none", color: "#7ec8e3", fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0 }}>← Volver</button>
        <div style={{ fontSize: 12, color: G, fontWeight: 700, marginBottom: 4 }}>{selectedRoutine.day}</div>
        <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>{selectedRoutine.name}</div>
        <div style={{ color: "#8899aa", fontSize: 13, marginBottom: 24 }}>{selectedRoutine.duration} min · {selectedRoutine.equipment} · {selectedRoutine.objetivo}</div>
        {selectedRoutine.exercises.map((ex, i) => (
          <div key={i} className="fadeUp" onClick={() => setActiveExercise(ex)} style={{ ...S.card, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", animationDelay: `${i * 0.07}s` }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{ex.name}</div>
              <div style={{ color: G, fontSize: 13 }}>{ex.sets} series · {ex.reps} reps</div>
            </div>
            <div style={{ color: G, fontSize: 22 }}>›</div>
          </div>
        ))}
        <button onClick={completeWorkout} style={{ ...S.gbtn, marginTop: 8 }}>✅ Marcar como Completado</button>
      </div>
    </div>
  );

  // ── PROGRAM DETAIL ───────────────────────────────────────
  if (selectedProgram) return (
    <div style={S.page}>
      <style>{CSS}</style>
      <div style={{ padding: 24 }}>
        <button onClick={() => setSelectedProgram(null)} style={{ background: "none", border: "none", color: "#7ec8e3", fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0 }}>← Volver</button>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="pulse" style={{ fontSize: 64 }}>{selectedProgram.icon}</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>{selectedProgram.name}</div>
          <div style={{ color: "#8899aa", fontSize: 13 }}>{selectedProgram.duration} · {selectedProgram.level}</div>
        </div>
        <div style={S.card}><div style={{ color: "#ccd6e0", fontSize: 14, lineHeight: 1.7 }}>{selectedProgram.description}</div></div>
        <div style={{ fontSize: 13, color: G, fontWeight: 700, marginBottom: 12 }}>INCLUYE</div>
        {selectedProgram.included.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
            <div style={{ color: G, fontSize: 16, fontWeight: 900 }}>✓</div>
            <div style={{ color: "#ccd6e0", fontSize: 14 }}>{item}</div>
          </div>
        ))}
        <div style={{ ...S.gcard, textAlign: "center", marginTop: 8 }}>
          {selectedProgram.badge && <div style={{ background: selectedProgram.price === 0 ? "rgba(0,200,100,0.15)" : "rgba(255,100,0,0.15)", border: `1px solid ${selectedProgram.price === 0 ? G : "#ff6400"}`, borderRadius: 20, padding: "4px 16px", fontSize: 13, fontWeight: 700, color: selectedProgram.price === 0 ? G : "#ff6400", display: "inline-block", marginBottom: 12 }}>{selectedProgram.badge}</div>}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 4 }}>
            <div style={{ fontSize: 16, color: "#556677", textDecoration: "line-through" }}>${selectedProgram.originalPrice} MXN</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: selectedProgram.price === 0 ? G : "#7ec8e3" }}>{selectedProgram.price === 0 ? "GRATIS" : `$${selectedProgram.price} MXN`}</div>
          </div>
          <div style={{ color: "#8899aa", fontSize: 12, marginBottom: 16 }}>Pago único · Acceso de por vida</div>
          <button style={{ ...S.gbtn }}>{selectedProgram.price === 0 ? "Obtener Gratis 🎁" : "Comprar Programa 🔥"}</button>
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
  const filteredRoutines = ROUTINES.filter(r => (filterObj === "Todos" || r.objetivo === filterObj) && (filterEq === "Todos" || r.equipment === filterEq));

  return (
    <div style={S.page}>
      <style>{CSS}</style>
      {/* Header */}
      <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: "#556677", letterSpacing: 2, fontWeight: 700 }}>WINTER ARC MX</div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>❄️ Hola, {userData?.nombre?.split(" ")[0] || "Warrior"}</div>
        </div>
        <div style={{ background: "rgba(0,200,100,0.1)", border: `1px solid rgba(0,200,100,0.3)`, borderRadius: 20, padding: "6px 14px", fontSize: 12, color: G, fontWeight: 700 }}>
          {curLvl.icon} {curLvl.name}
        </div>
      </div>

      <div style={{ padding: "0 24px" }}>
        {/* HOME */}
        {activeTab === "home" && (
          <div style={{ marginTop: 24 }}>
            <div className="fadeUp" style={{ background: "linear-gradient(135deg, #0d1b0a, #0a2a1a)", border: `1px solid rgba(0,200,100,0.3)`, borderRadius: 20, padding: 24, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div><div style={{ fontSize: 11, color: G, letterSpacing: 1, marginBottom: 4 }}>NIVEL ACTUAL</div><div style={{ fontSize: 22, fontWeight: 900 }}>{curLvl.icon} {curLvl.name}</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: G, marginBottom: 4 }}>RACHA</div><div style={{ fontSize: 22, fontWeight: 900 }}>🔥 {streak}d</div></div>
              </div>
              {nextLvl && (<>
                <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 8 }}>Próximo: {nextLvl.icon} {nextLvl.name} — {cw}/{nextLvl.minWorkouts}</div>
                <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 50, height: 8 }}>
                  <div style={{ background: `linear-gradient(90deg, #0a4a2a, ${G})`, borderRadius: 50, height: 8, width: `${pct}%`, transition: "width 0.8s ease" }} />
                </div>
                <div style={{ textAlign: "right", fontSize: 11, color: G, marginTop: 4 }}>{pct}%</div>
              </>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[{ l: "Entrenos", v: cw, i: "💪", c: G }, { l: "Racha", v: `${streak}d`, i: "🔥", c: "#ff9f43" }].map((s, i) => (
                <div key={i} className="fadeUp" style={{ ...S.gcard, margin: 0, textAlign: "center", animationDelay: `${i * 0.1}s` }}>
                  <div style={{ fontSize: 28 }}>{s.i}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: "#8899aa" }}>{s.l}</div>
                </div>
              ))}
            </div>
            {lvlRoutines[0] && (
              <div className="fadeUp" style={{ ...S.gcard }}>
                <div style={{ fontSize: 12, color: G, fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>HOY TE TOCA 💪</div>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{lvlRoutines[0].name}</div>
                <div style={{ color: "#8899aa", fontSize: 13, marginBottom: 16 }}>{lvlRoutines[0].exercises.length} ejercicios · {lvlRoutines[0].duration} min</div>
                <button onClick={() => setSelectedRoutine(lvlRoutines[0])} style={{ ...S.gbtn, width: "auto", padding: "12px 28px", borderRadius: 50 }}>Iniciar ❄️</button>
              </div>
            )}
            <div style={{ fontSize: 13, color: G, fontWeight: 700, marginBottom: 12, marginTop: 8, letterSpacing: 1 }}>PROGRAMAS PREMIUM</div>
            {PROGRAMS.slice(0, 2).map((p, i) => (
              <div key={p.id} className="fadeUp" onClick={() => setSelectedProgram(p)} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", animationDelay: `${i * 0.1}s` }}>
                <div><div style={{ fontSize: 22 }}>{p.icon}</div><div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div><div style={{ color: G, fontSize: 12 }}>{p.price === 0 ? "GRATIS" : `$${p.price} MXN`}</div></div>
                <div style={{ color: G, fontSize: 22 }}>›</div>
              </div>
            ))}
          </div>
        )}

        {/* LIBRARY */}
        {activeTab === "library" && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 16 }}>Biblioteca de Rutinas</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              {["Todos", "Fuerza", "Hipertrofia", "Definición"].map(f => (
                <button key={f} onClick={() => setFilterObj(f)} style={{ background: filterObj === f ? G : "rgba(255,255,255,0.05)", border: `1px solid ${filterObj === f ? G : "#1e3a5f"}`, color: filterObj === f ? "#000" : "#fff", padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: filterObj === f ? 700 : 400, transition: "all 0.2s" }}>{f}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {["Todos", "Gym", "Casa"].map(f => (
                <button key={f} onClick={() => setFilterEq(f)} style={{ background: filterEq === f ? "rgba(0,200,100,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${filterEq === f ? G : "#1e3a5f"}`, color: filterEq === f ? G : "#8899aa", padding: "5px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer", transition: "all 0.2s" }}>{f}</button>
              ))}
            </div>
            {filteredRoutines.map((r, i) => (
              <div key={r.id} className="fadeUp" onClick={() => setSelectedRoutine(r)} style={{ ...S.card, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", animationDelay: `${i * 0.06}s` }}>
                <div>
                  <div style={{ fontSize: 11, color: G, fontWeight: 700, marginBottom: 4 }}>{r.day} · Nivel {r.level}</div>
                  <div style={{ fontSize: 17, fontWeight: 900 }}>{r.name}</div>
                  <div style={{ color: "#8899aa", fontSize: 12, marginTop: 4 }}>{r.duration} min · {r.equipment} · {r.objetivo}</div>
                </div>
                <div style={{ color: G, fontSize: 22 }}>›</div>
              </div>
            ))}
          </div>
        )}

        {/* PROGRAMS */}
        {activeTab === "programs" && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>Programas Premium</div>
            <div style={{ color: "#8899aa", fontSize: 13, marginBottom: 20 }}>Planes estructurados para resultados reales</div>
            {PROGRAMS.map((p, i) => (
              <div key={p.id} className="fadeUp" style={{ ...S.gcard, animationDelay: `${i * 0.1}s` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 36 }}>{p.icon}</div>
                  <div style={{ textAlign: "right" }}>
                    {p.badge && <div style={{ background: p.price === 0 ? "rgba(0,200,100,0.15)" : "rgba(255,100,0,0.15)", border: `1px solid ${p.price === 0 ? G : "#ff6400"}`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: p.price === 0 ? G : "#ff6400", marginBottom: 4 }}>{p.badge}</div>}
                    <div style={{ fontSize: 12, color: "#556677", textDecoration: "line-through" }}>${p.originalPrice} MXN</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: p.price === 0 ? G : "#7ec8e3" }}>{p.price === 0 ? "GRATIS" : `$${p.price} MXN`}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{p.name}</div>
                <div style={{ color: "#8899aa", fontSize: 12, marginBottom: 12 }}>{p.duration} · {p.level}</div>
                <button onClick={() => setSelectedProgram(p)} style={{ ...S.gbtn, padding: "12px" }}>Ver detalles →</button>
              </div>
            ))}
          </div>
        )}

        {/* PROGRESS */}
        {activeTab === "progress" && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>Tu Progreso</div>
            <div className="fadeUp glow" style={{ ...S.gcard, textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 56, fontWeight: 900, color: G }}>{cw}</div>
              <div style={{ color: "#8899aa", fontSize: 14 }}>Entrenamientos completados</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[{ l: "Nivel", v: curLvl.id }, { l: "Racha", v: `${streak}d` }, { l: "Faltan", v: nextLvl ? nextLvl.minWorkouts - cw : "MAX" }].map((s, i) => (
                <div key={i} className="fadeUp" style={{ ...S.gcard, margin: 0, textAlign: "center", animationDelay: `${i * 0.1}s` }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: G }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: "#8899aa" }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{ fontSize: 13, color: G, fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>CAMINO A WINTER ARC 👑</div>
              {LEVELS.map((l, i) => (
                <div key={l.id} className="fadeUp" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, animationDelay: `${i * 0.08}s` }}>
                  <div style={{ fontSize: 22, opacity: cw >= l.minWorkouts ? 1 : 0.3 }}>{l.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: cw >= l.minWorkouts ? "#fff" : "#556677" }}>{l.name}</div>
                    <div style={{ background: "#111827", borderRadius: 50, height: 6, marginTop: 4 }}>
                      <div style={{ background: cw >= l.minWorkouts ? `linear-gradient(90deg, #0a4a2a, ${G})` : "#1e3a5f", borderRadius: 50, height: 6, width: `${Math.min(100, (cw / Math.max(l.minWorkouts, 1)) * 100)}%`, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                  {cw >= l.minWorkouts && <div style={{ color: G, fontWeight: 900 }}>✓</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div style={{ marginTop: 24 }}>
            <div className="fadeUp" style={{ ...S.gcard, textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>👤</div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>{userData?.nombre}</div>
              <div style={{ color: "#8899aa", fontSize: 13, marginTop: 4 }}>{userData?.email}</div>
              <div style={{ color: G, fontSize: 14, marginTop: 8, fontWeight: 700 }}>{curLvl.icon} {curLvl.name}</div>
            </div>
            <div style={S.card}>
              <div style={{ fontSize: 13, color: G, fontWeight: 700, marginBottom: 12 }}>TU PERFIL</div>
              {[["Objetivo", userData?.objetivo], ["Nivel", userData?.nivel], ["Equipo", userData?.equipo]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ color: "#8899aa", fontSize: 13 }}>{k}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: G }}>{v || "No definido"}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: G, fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>LOGROS</div>
            {LEVELS.map((l, i) => (
              <div key={l.id} className="fadeUp" style={{ ...S.card, display: "flex", alignItems: "center", gap: 16, opacity: cw >= l.minWorkouts ? 1 : 0.3, animationDelay: `${i * 0.08}s` }}>
                <div style={{ fontSize: 28 }}>{l.icon}</div>
                <div><div style={{ fontWeight: 700 }}>{l.name}</div><div style={{ color: "#8899aa", fontSize: 12 }}>{l.minWorkouts} entrenos</div></div>
                {cw >= l.minWorkouts && <div style={{ marginLeft: "auto", color: G, fontWeight: 900, fontSize: 18 }}>✓</div>}
              </div>
            ))}
            {isCoach && <button onClick={() => setActiveTab("coach")} style={{ ...S.gbtn, marginBottom: 12 }}>🎯 Panel de Coach</button>}
            <button onClick={handleLogout} style={S.btnOutline}>Cerrar Sesión</button>
          </div>
        )}

        {/* COACH PANEL */}
        {activeTab === "coach" && isCoach && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <button onClick={() => setActiveTab("profile")} style={{ background: "none", border: "none", color: G, fontSize: 14, cursor: "pointer", padding: 0 }}>←</button>
              <div style={{ fontSize: 20, fontWeight: 900 }}>Panel de Coach 🎯</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {["rutinas", "usuarios", "metricas"].map(t => (
                <button key={t} onClick={() => { setCoachTab(t); if (t === "usuarios") loadAllUsers(); }} style={{ flex: 1, background: coachTab === t ? G : "rgba(255,255,255,0.05)", border: "none", color: coachTab === t ? "#000" : "#fff", padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s" }}>{t}</button>
              ))}
            </div>
            {coachTab === "rutinas" && (
              <div>
                <div style={{ fontSize: 13, color: G, fontWeight: 700, marginBottom: 12 }}>RUTINAS ACTIVAS ({ROUTINES.length})</div>
                {ROUTINES.map((r, i) => (
                  <div key={r.id} className="fadeUp" style={{ ...S.gcard, display: "flex", justifyContent: "space-between", alignItems: "center", animationDelay: `${i * 0.06}s` }}>
                    <div><div style={{ fontWeight: 700 }}>{r.name}</div><div style={{ color: "#8899aa", fontSize: 12 }}>Nivel {r.level} · {r.exercises.length} ejercicios · {r.duration} min</div></div>
                    <div style={{ color: G, fontSize: 12, fontWeight: 700 }}>✓</div>
                  </div>
                ))}
                <button style={{ ...S.gbtn, marginTop: 8 }}>+ Agregar Rutina</button>
              </div>
            )}
            {coachTab === "usuarios" && (
              <div>
                <div style={{ fontSize: 13, color: G, fontWeight: 700, marginBottom: 12 }}>USUARIOS ({allUsers.length})</div>
                {allUsers.length === 0 && <div style={{ color: "#556677", textAlign: "center", marginTop: 20 }}>Cargando...</div>}
                {allUsers.map((u, i) => (
                  <div key={u.id} className="fadeUp" style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", animationDelay: `${i * 0.06}s` }}>
                    <div><div style={{ fontWeight: 700 }}>{u.nombre}</div><div style={{ color: "#8899aa", fontSize: 12 }}>{u.email}</div></div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: G, fontSize: 13, fontWeight: 700 }}>{u.completedWorkouts || 0} entrenos</div>
                      <div style={{ color: "#556677", fontSize: 11 }}>{LEVELS.slice().reverse().find(l => (u.completedWorkouts || 0) >= l.minWorkouts)?.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {coachTab === "metricas" && (
              <div>
                {[{ l: "Usuarios totales", v: allUsers.length || "—", i: "👥" }, { l: "Rutinas activas", v: ROUTINES.length, i: "💪" }, { l: "Programas", v: PROGRAMS.length, i: "🏆" }, { l: "Niveles", v: LEVELS.length, i: "❄️" }].map((m, i) => (
                  <div key={i} className="fadeUp" style={{ ...S.gcard, display: "flex", alignItems: "center", gap: 16, animationDelay: `${i * 0.1}s` }}>
                    <div style={{ fontSize: 32 }}>{m.i}</div>
                    <div><div style={{ fontSize: 24, fontWeight: 900, color: G }}>{m.v}</div><div style={{ color: "#8899aa", fontSize: 13 }}>{m.l}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "rgba(10,10,10,0.97)", backdropFilter: "blur(20px)", borderTop: `1px solid rgba(0,200,100,0.15)`, display: "flex" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, background: "none", border: "none", color: activeTab === t.id ? G : "#334455", padding: "10px 0", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: 16, transition: "color 0.2s" }}>
            <span>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}