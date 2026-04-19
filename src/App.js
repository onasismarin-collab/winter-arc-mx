import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzsGcfgCg2SyEZ03QUDvmz3PexTdQoPGc",
  authDomain: "winter-arc-mx.firebaseapp.com",
  projectId: "winter-arc-mx",
  storageBucket: "winter-arc-mx.firebasestorage.app",
  messagingSenderId: "1023523225701",
  appId: "1:1023523225701:web:823c8994a8481c09a0468c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const LEVELS = [
  { id: 1, name: "Recruit", icon: "❄️", minWorkouts: 0 },
  { id: 2, name: "Cold Warrior", icon: "🥶", minWorkouts: 8 },
  { id: 3, name: "Iron Wolf", icon: "⚔️", minWorkouts: 20 },
  { id: 4, name: "Elite Beast", icon: "🔥", minWorkouts: 40 },
  { id: 5, name: "Winter Arc", icon: "👑", minWorkouts: 70 },
];

const ROUTINES = [
  {
    id: 1, level: 1, day: "Día 1", name: "Pecho & Tríceps",
    exercises: [
      { name: "Press de Banca", sets: 4, reps: "10", rest: 90 },
      { name: "Aperturas con Mancuerna", sets: 3, reps: "12", rest: 60 },
      { name: "Fondos en Paralelas", sets: 3, reps: "8", rest: 60 },
      { name: "Extensión de Tríceps", sets: 3, reps: "12", rest: 60 },
    ]
  },
  {
    id: 2, level: 1, day: "Día 2", name: "Espalda & Bíceps",
    exercises: [
      { name: "Jalón al Pecho", sets: 4, reps: "10", rest: 90 },
      { name: "Remo con Barra", sets: 3, reps: "10", rest: 90 },
      { name: "Curl de Bíceps", sets: 3, reps: "12", rest: 60 },
      { name: "Curl Martillo", sets: 3, reps: "12", rest: 60 },
    ]
  },
  {
    id: 3, level: 1, day: "Día 3", name: "Piernas & Hombros",
    exercises: [
      { name: "Sentadilla", sets: 4, reps: "10", rest: 120 },
      { name: "Prensa de Piernas", sets: 3, reps: "12", rest: 90 },
      { name: "Press Militar", sets: 3, reps: "10", rest: 90 },
      { name: "Elevaciones Laterales", sets: 3, reps: "15", rest: 60 },
    ]
  },
  {
    id: 4, level: 2, day: "Día 1", name: "Push (Pecho/Hombro/Tríceps)",
    exercises: [
      { name: "Press de Banca Inclinado", sets: 4, reps: "8", rest: 90 },
      { name: "Press Militar con Barra", sets: 4, reps: "8", rest: 90 },
      { name: "Fondos Pecho", sets: 3, reps: "10", rest: 60 },
      { name: "Tríceps en Polea", sets: 3, reps: "12", rest: 60 },
    ]
  },
  {
    id: 5, level: 2, day: "Día 2", name: "Pull (Espalda/Bíceps)",
    exercises: [
      { name: "Dominadas", sets: 4, reps: "6", rest: 90 },
      { name: "Remo en Máquina", sets: 4, reps: "10", rest: 90 },
      { name: "Curl con Barra", sets: 3, reps: "10", rest: 60 },
      { name: "Face Pull", sets: 3, reps: "15", rest: 60 },
    ]
  },
];

const cardStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(126,200,227,0.15)", borderRadius: 16, padding: 20, marginBottom: 16 };
const inputStyle = { background: "#111827", border: "1px solid #1e3a5f", color: "#fff", padding: "14px 20px", borderRadius: 12, fontSize: 15, width: "100%", marginBottom: 12, outline: "none", boxSizing: "border-box" };
const btnPrimary = { background: "linear-gradient(135deg, #1a3a5c, #2563a8)", border: "none", color: "#fff", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%" };

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [screen, setScreen] = useState("splash");
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [activeExercise, setActiveExercise] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [weights, setWeights] = useState({});
  const intervalRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          setUserData(snap.data());
          setScreen("app");
        }
      } else {
        setUser(null);
        setUserData(null);
        setScreen("splash");
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds(s => {
          if (s <= 1) { clearInterval(intervalRef.current); setTimerRunning(false); return 0; }
          return s - 1;
        });
      }, 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [timerRunning]);

  const handleRegister = async () => {
    if (!nombre.trim()) { setAuthError("Ingresa tu nombre"); return; }
    setLoading(true); setAuthError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), {
        nombre, email,
        completedWorkouts: 0,
        streak: 0,
        lastWorkout: null,
        createdAt: new Date().toISOString(),
      });
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      setUserData(snap.data());
      setScreen("app");
    } catch (e) {
      setAuthError(e.code === "auth/email-already-in-use" ? "Este correo ya está registrado" : e.code === "auth/weak-password" ? "La contraseña debe tener al menos 6 caracteres" : "Error al registrarse");
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true); setAuthError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      setUserData(snap.data());
      setScreen("app");
    } catch (e) {
      setAuthError("Correo o contraseña incorrectos");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true); setAuthError("");
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const ref = doc(db, "users", cred.user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          nombre: cred.user.displayName || "Warrior",
          email: cred.user.email,
          completedWorkouts: 0,
          streak: 0,
          lastWorkout: null,
          createdAt: new Date().toISOString(),
        });
      }
      const updated = await getDoc(ref);
      setUserData(updated.data());
      setScreen("app");
    } catch (e) {
      setAuthError("Error al iniciar con Google");
    }
    setLoading(false);
  };

  const handleLogout = async () => { await signOut(auth); setScreen("splash"); };

  const completeWorkout = async () => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, { completedWorkouts: increment(1), lastWorkout: new Date().toISOString() });
    const snap = await getDoc(ref);
    setUserData(snap.data());
    setSelectedRoutine(null);
    setActiveTab("home");
  };

  const completedWorkouts = userData?.completedWorkouts || 0;
  const streak = userData?.streak || 0;
  const currentLevel = LEVELS.slice().reverse().find(l => completedWorkouts >= l.minWorkouts) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.minWorkouts > completedWorkouts);
  const progressToNext = nextLevel ? Math.round(((completedWorkouts - currentLevel.minWorkouts) / (nextLevel.minWorkouts - currentLevel.minWorkouts)) * 100) : 100;
  const levelRoutines = ROUTINES.filter(r => r.level === currentLevel.id);
  const formatTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // SPLASH
  if (screen === "splash") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a0a0f 0%, #0d1b2a 50%, #0a0a0f 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", color: "#fff", padding: 24 }}>
      <div style={{ fontSize: 64, marginBottom: 8 }}>❄️</div>
      <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: 2, textAlign: "center", background: "linear-gradient(90deg, #7ec8e3, #ffffff, #a8d8ea)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>WINTER ARC</div>
      <div style={{ fontSize: 16, letterSpacing: 6, color: "#7ec8e3", marginBottom: 48, fontWeight: 700 }}>MX</div>
      <div style={{ color: "#8899aa", fontSize: 14, textAlign: "center", marginBottom: 48, maxWidth: 280, lineHeight: 1.6 }}>La temporada más fría trae la versión más fuerte de ti.</div>
      <button onClick={() => setScreen("auth")} style={{ ...btnPrimary, width: "auto", padding: "16px 48px", borderRadius: 50, fontSize: 16, letterSpacing: 1 }}>COMENZAR ❄️</button>
    </div>
  );

  // AUTH
  if (screen === "auth") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a0a0f, #0d1b2a)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", color: "#fff", padding: 24 }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>{authMode === "login" ? "🔐" : "❄️"}</div>
      <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4, letterSpacing: 2 }}>{authMode === "login" ? "INICIAR SESIÓN" : "REGISTRO"}</div>
      <div style={{ color: "#7ec8e3", marginBottom: 28, fontSize: 13 }}>{authMode === "login" ? "Bienvenido de vuelta" : "Comienza tu Winter Arc"}</div>
      <div style={{ width: "100%", maxWidth: 320 }}>
        {authMode === "register" && (
          <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" style={inputStyle} />
        )}
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Correo electrónico" type="email" style={inputStyle} />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña (mín. 6 caracteres)" type="password" style={inputStyle} />
        {authError && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{authError}</div>}
        <button onClick={authMode === "login" ? handleLogin : handleRegister} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Cargando..." : authMode === "login" ? "ENTRAR" : "CREAR CUENTA"}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#1e3a5f" }} />
          <span style={{ color: "#556677", fontSize: 12 }}>o</span>
          <div style={{ flex: 1, height: 1, background: "#1e3a5f" }} />
        </div>
        <button onClick={handleGoogle} disabled={loading} style={{ ...btnPrimary, background: "#fff", color: "#222", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: loading ? 0.7 : 1 }}>
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

  // EXERCISE DETAIL
  if (activeExercise) {
    const ex = activeExercise;
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "'Segoe UI', sans-serif", padding: 24, maxWidth: 480, margin: "0 auto" }}>
        <button onClick={() => { setActiveExercise(null); setTimerRunning(false); setTimerSeconds(0); }} style={{ background: "none", border: "none", color: "#7ec8e3", fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0 }}>← Volver</button>
        <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>{ex.name}</div>
        <div style={{ color: "#7ec8e3", marginBottom: 24, fontSize: 13 }}>{ex.sets} series × {ex.reps} reps</div>
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <div style={{ fontSize: 80, marginBottom: 8 }}>🏋️</div>
          <div style={{ color: "#8899aa", fontSize: 13 }}>Animación del ejercicio</div>
        </div>
        {Array.from({ length: ex.sets }).map((_, i) => (
          <div key={i} style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ color: "#7ec8e3", fontWeight: 700 }}>Serie {i + 1}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="number" placeholder="kg"
                value={weights[`${ex.name}-${i}`] || ""}
                onChange={e => setWeights(w => ({ ...w, [`${ex.name}-${i}`]: e.target.value }))}
                style={{ background: "#111827", border: "1px solid #1e3a5f", color: "#fff", padding: "8px 12px", borderRadius: 8, width: 70, fontSize: 14, outline: "none" }}
              />
              <span style={{ color: "#556677", fontSize: 12 }}>× {ex.reps}</span>
            </div>
          </div>
        ))}
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#8899aa", marginBottom: 12 }}>⏱ Descanso: {ex.rest}s</div>
          {timerSeconds > 0 || timerRunning ? (
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, color: timerSeconds < 10 ? "#ef4444" : "#7ec8e3" }}>{formatTime(timerSeconds)}</div>
              <button onClick={() => { setTimerRunning(false); setTimerSeconds(0); }} style={{ marginTop: 12, background: "none", border: "1px solid #334455", color: "#8899aa", padding: "8px 20px", borderRadius: 20, cursor: "pointer", fontSize: 13 }}>Cancelar</button>
            </div>
          ) : (
            <button onClick={() => { setTimerSeconds(ex.rest); setTimerRunning(true); }} style={{ ...btnPrimary, width: "auto", padding: "12px 32px", borderRadius: 50 }}>Iniciar Descanso ⏱</button>
          )}
        </div>
      </div>
    );
  }

  // ROUTINE DETAIL
  if (selectedRoutine) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "'Segoe UI', sans-serif", padding: 24, maxWidth: 480, margin: "0 auto" }}>
      <button onClick={() => setSelectedRoutine(null)} style={{ background: "none", border: "none", color: "#7ec8e3", fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0 }}>← Volver</button>
      <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 4 }}>{selectedRoutine.day}</div>
      <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 24 }}>{selectedRoutine.name}</div>
      {selectedRoutine.exercises.map((ex, i) => (
        <div key={i} onClick={() => setActiveExercise(ex)} style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{ex.name}</div>
            <div style={{ color: "#7ec8e3", fontSize: 13 }}>{ex.sets} series × {ex.reps} reps</div>
          </div>
          <div style={{ color: "#556677", fontSize: 20 }}>›</div>
        </div>
      ))}
      <button onClick={completeWorkout} style={{ ...btnPrimary, marginTop: 8 }}>✅ Marcar como Completado</button>
    </div>
  );

  // MAIN APP
  const tabs = [
    { id: "home", icon: "🏠", label: "Inicio" },
    { id: "routines", icon: "💪", label: "Rutinas" },
    { id: "progress", icon: "📈", label: "Progreso" },
    { id: "profile", icon: "👤", label: "Perfil" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "'Segoe UI', sans-serif", maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>
      <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: "#556677", letterSpacing: 2, fontWeight: 700 }}>WINTER ARC MX</div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>❄️ Hola, {userData?.nombre || "Warrior"}</div>
        </div>
        <div style={{ background: "rgba(126,200,227,0.1)", border: "1px solid rgba(126,200,227,0.3)", borderRadius: 20, padding: "6px 14px", fontSize: 13, color: "#7ec8e3", fontWeight: 700 }}>
          {currentLevel.icon} {currentLevel.name}
        </div>
      </div>

      <div style={{ padding: "0 24px" }}>

        {activeTab === "home" && (
          <div style={{ marginTop: 24 }}>
            <div style={{ background: "linear-gradient(135deg, #0d1b2a, #1a3a5c)", border: "1px solid rgba(126,200,227,0.3)", borderRadius: 20, padding: 24, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#7ec8e3", letterSpacing: 1, marginBottom: 4 }}>NIVEL ACTUAL</div>
                  <div style={{ fontSize: 24, fontWeight: 900 }}>{currentLevel.icon} {currentLevel.name}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "#7ec8e3", marginBottom: 4 }}>RACHA</div>
                  <div style={{ fontSize: 24, fontWeight: 900 }}>🔥 {streak} días</div>
                </div>
              </div>
              {nextLevel && (
                <>
                  <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 8 }}>Próximo: {nextLevel.icon} {nextLevel.name} — {completedWorkouts}/{nextLevel.minWorkouts} entrenos</div>
                  <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 50, height: 8 }}>
                    <div style={{ background: "linear-gradient(90deg, #2563a8, #7ec8e3)", borderRadius: 50, height: 8, width: `${progressToNext}%`, transition: "width 0.5s" }} />
                  </div>
                  <div style={{ textAlign: "right", fontSize: 11, color: "#7ec8e3", marginTop: 4 }}>{progressToNext}%</div>
                </>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[{ label: "Entrenos Totales", value: completedWorkouts, icon: "💪" }, { label: "Racha Actual", value: `${streak} días`, icon: "🔥" }].map((s, i) => (
                <div key={i} style={{ ...cardStyle, margin: 0, textAlign: "center" }}>
                  <div style={{ fontSize: 28 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#8899aa" }}>{s.label}</div>
                </div>
              ))}
            </div>
            {levelRoutines[0] && (
              <div style={cardStyle}>
                <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 12 }}>HOY TE TOCA</div>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{levelRoutines[0].name}</div>
                <div style={{ color: "#8899aa", fontSize: 13, marginBottom: 16 }}>{levelRoutines[0].exercises.length} ejercicios · ~45 min</div>
                <button onClick={() => setSelectedRoutine(levelRoutines[0])} style={{ ...btnPrimary, width: "auto", padding: "12px 24px", borderRadius: 50 }}>Iniciar Entrenamiento ❄️</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "routines" && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>Tus Rutinas</div>
            <div style={{ color: "#7ec8e3", fontSize: 13, marginBottom: 20 }}>Nivel: {currentLevel.icon} {currentLevel.name}</div>
            {levelRoutines.map(r => (
              <div key={r.id} onClick={() => setSelectedRoutine(r)} style={{ ...cardStyle, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#7ec8e3", fontWeight: 700, marginBottom: 4 }}>{r.day}</div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{r.name}</div>
                  <div style={{ color: "#8899aa", fontSize: 12, marginTop: 4 }}>{r.exercises.length} ejercicios</div>
                </div>
                <div style={{ color: "#334455", fontSize: 20 }}>›</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "progress" && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>Tu Progreso</div>
            <div style={{ ...cardStyle, textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: "#7ec8e3" }}>{completedWorkouts}</div>
              <div style={{ color: "#8899aa", fontSize: 14 }}>Entrenamientos completados</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[{ label: "Nivel", value: currentLevel.id }, { label: "Racha", value: `${streak}d` }, { label: "Próximo", value: nextLevel ? `${nextLevel.minWorkouts - completedWorkouts}` : "MAX" }].map((s, i) => (
                <div key={i} style={{ ...cardStyle, margin: 0, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#7ec8e3" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#8899aa" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ ...cardStyle, marginTop: 16 }}>
              <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 16 }}>CAMINO AL SIGUIENTE NIVEL</div>
              {LEVELS.map(l => (
                <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, opacity: completedWorkouts >= l.minWorkouts ? 1 : 0.3 }}>
                  <div style={{ fontSize: 20 }}>{l.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{l.name}</div>
                    <div style={{ fontSize: 11, color: "#8899aa" }}>{l.minWorkouts} entrenos</div>
                  </div>
                  {completedWorkouts >= l.minWorkouts && <div style={{ color: "#7ec8e3", fontSize: 16 }}>✓</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div style={{ marginTop: 24 }}>
            <div style={{ ...cardStyle, textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>👤</div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>{userData?.nombre}</div>
              <div style={{ color: "#7ec8e3", fontSize: 13, marginTop: 4 }}>{userData?.email}</div>
              <div style={{ color: "#7ec8e3", fontSize: 14, marginTop: 8 }}>{currentLevel.icon} {currentLevel.name}</div>
            </div>
            <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 12 }}>TUS LOGROS</div>
            {LEVELS.map(l => (
              <div key={l.id} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16, opacity: completedWorkouts >= l.minWorkouts ? 1 : 0.3 }}>
                <div style={{ fontSize: 32 }}>{l.icon}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{l.name}</div>
                  <div style={{ color: "#8899aa", fontSize: 12 }}>{l.minWorkouts} entrenos</div>
                </div>
                {completedWorkouts >= l.minWorkouts && <div style={{ marginLeft: "auto", color: "#7ec8e3" }}>✓</div>}
              </div>
            ))}
            <button onClick={handleLogout} style={{ ...btnPrimary, background: "rgba(255,255,255,0.05)", border: "1px solid #334455", marginTop: 8 }}>Cerrar Sesión</button>
          </div>
        )}

      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "rgba(10,10,15,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(126,200,227,0.1)", display: "flex" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, background: "none", border: "none", color: activeTab === t.id ? "#7ec8e3" : "#334455", padding: "12px 0", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: 18 }}>
            <span>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}