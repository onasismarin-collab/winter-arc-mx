import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, getDocs, addDoc } from "firebase/firestore";

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

const G = "#00c864";
const PROTE_COLOR = "#f5a623";

// ── AVATARS ──────────────────────────────────────────────
const AVATARS = [
  { id: "warrior", name: "Warrior", base: "🧑", desc: "El clásico luchador" },
  { id: "beast", name: "Beast", base: "🦁", desc: "Fuerza pura" },
  { id: "wolf", name: "Wolf", base: "🐺", desc: "Frío y calculador" },
  { id: "ninja", name: "Ninja", base: "🥷", desc: "Rápido y preciso" },
  { id: "titan", name: "Titan", base: "⚡", desc: "Poder absoluto" },
];

const AVATAR_MUSCLES = [
  { id: "arms", name: "Brazos", icon: "💪", cost: 50, levels: ["🦴", "💪", "🦵", "🏋️", "🦾"] },
  { id: "chest", name: "Pecho", icon: "🫀", cost: 60, levels: ["🫀", "🔵", "🟢", "🟠", "🔴"] },
  { id: "legs", name: "Piernas", icon: "🦵", cost: 50, levels: ["🦴", "🦵", "🏃", "⚡", "🦿"] },
  { id: "back", name: "Espalda", icon: "🗻", cost: 70, levels: ["🌱", "🌿", "🌲", "🏔️", "🗻"] },
  { id: "abs", name: "Abdomen", icon: "⚡", cost: 55, levels: ["💧", "✨", "⭐", "🌟", "⚡"] },
];

const OUTFITS = [
  { id: "default", name: "Default", emoji: "👕", cost: 0, unlocked: true },
  { id: "frost", name: "Frost Warrior", emoji: "🥶", cost: 100 },
  { id: "fire", name: "Fire Beast", emoji: "🔥", cost: 150 },
  { id: "shadow", name: "Shadow", emoji: "🖤", cost: 200 },
  { id: "champion", name: "Champion", emoji: "👑", cost: 500 },
];

// ── MUSCLES & EXERCISES ──────────────────────────────────
const MUSCLE_GROUPS = [
  { id: "pecho", name: "Pecho", icon: "💪", color: "#e74c3c" },
  { id: "espalda", name: "Espalda", icon: "🗻", color: "#3498db" },
  { id: "piernas", name: "Piernas", icon: "🦵", color: "#2ecc71" },
  { id: "hombros", name: "Hombros", icon: "⚡", color: "#f39c12" },
  { id: "biceps", name: "Bíceps", icon: "💥", color: "#9b59b6" },
  { id: "triceps", name: "Tríceps", icon: "🔱", color: "#1abc9c" },
  { id: "abdomen", name: "Abdomen", icon: "🎯", color: "#e67e22" },
  { id: "gluteos", name: "Glúteos", icon: "🍑", color: "#e91e63" },
];

const EXERCISE_ANIMATIONS = {
  "Press de Banca": { frames: ["🏋️", "💪🏋️", "⬆️🏋️", "💥"], tip: "Baja la barra hasta rozar el pecho. Mantén los codos a 45°." },
  "Aperturas con Mancuerna": { frames: ["🤸", "↔️🤸", "🔄", "✨"], tip: "Brazos ligeramente doblados. Siente el estiramiento en el pecho." },
  "Fondos en Paralelas": { frames: ["🤸‍♂️", "⬇️🤸‍♂️", "⬆️🤸‍♂️", "💪"], tip: "Inclínate hacia adelante para pecho. Recto para tríceps." },
  "Extensión de Tríceps": { frames: ["💪", "⬆️💪", "🔽💪", "✨"], tip: "Codos fijos. Solo mueve el antebrazo." },
  "Jalón al Pecho": { frames: ["🏋️", "⬇️🏋️", "💪🏋️", "✨"], tip: "Jala hacia el esternón. Lleva los codos hacia las caderas." },
  "Remo con Barra": { frames: ["🏋️‍♂️", "⬇️", "⬆️🏋️‍♂️", "💥"], tip: "Espalda recta. Jala el ombligo, no el pecho." },
  "Curl de Bíceps": { frames: ["💪", "⬆️💪", "🔝💪", "✨"], tip: "No balancees el cuerpo. Concentra en el bíceps." },
  "Curl Martillo": { frames: ["🔨", "⬆️🔨", "💪🔨", "✨"], tip: "Agarre neutro. Trabaja bíceps y braquial." },
  "Sentadilla": { frames: ["🧍", "⬇️🧍", "🏋️", "⬆️🏋️"], tip: "Rodillas sobre puntas de pies. Espalda recta. Baja a 90°." },
  "Prensa de Piernas": { frames: ["🦵", "⬇️🦵", "💪🦵", "✨"], tip: "Pies separados al ancho de hombros. No bloquees rodillas." },
  "Press Militar": { frames: ["⬆️💪", "🏋️⬆️", "💥", "✨"], tip: "Core activado. Empuja sobre la cabeza, no adelante." },
  "Elevaciones Laterales": { frames: ["↔️", "⬆️↔️", "🙆", "✨"], tip: "Levanta hasta la altura del hombro. No más." },
  "default": { frames: ["🏋️", "💪", "⬆️", "✨"], tip: "Mantén buena postura y controla el movimiento." },
};

const BASE_EXERCISES = [
  { name: "Press de Banca", muscle: "pecho", sets: 4, reps: "10", rest: 90, prote: 10 },
  { name: "Aperturas con Mancuerna", muscle: "pecho", sets: 3, reps: "12", rest: 60, prote: 8 },
  { name: "Fondos en Paralelas", muscle: "triceps", sets: 3, reps: "8", rest: 60, prote: 8 },
  { name: "Extensión de Tríceps", muscle: "triceps", sets: 3, reps: "12", rest: 60, prote: 7 },
  { name: "Jalón al Pecho", muscle: "espalda", sets: 4, reps: "10", rest: 90, prote: 10 },
  { name: "Remo con Barra", muscle: "espalda", sets: 3, reps: "10", rest: 90, prote: 10 },
  { name: "Curl de Bíceps", muscle: "biceps", sets: 3, reps: "12", rest: 60, prote: 8 },
  { name: "Curl Martillo", muscle: "biceps", sets: 3, reps: "12", rest: 60, prote: 7 },
  { name: "Sentadilla", muscle: "piernas", sets: 4, reps: "10", rest: 120, prote: 12 },
  { name: "Prensa de Piernas", muscle: "piernas", sets: 3, reps: "12", rest: 90, prote: 10 },
  { name: "Press Militar", muscle: "hombros", sets: 3, reps: "10", rest: 90, prote: 10 },
  { name: "Elevaciones Laterales", muscle: "hombros", sets: 3, reps: "15", rest: 60, prote: 7 },
  { name: "Dominadas", muscle: "espalda", sets: 4, reps: "6", rest: 90, prote: 12 },
  { name: "Face Pull", muscle: "hombros", sets: 3, reps: "15", rest: 60, prote: 7 },
  { name: "Press Banca Inclinado", muscle: "pecho", sets: 4, reps: "8", rest: 90, prote: 10 },
  { name: "Sentadillas", muscle: "piernas", sets: 4, reps: "15", rest: 60, prote: 10 },
  { name: "Lagartijas", muscle: "pecho", sets: 3, reps: "12", rest: 60, prote: 7 },
  { name: "Zancadas", muscle: "piernas", sets: 3, reps: "10", rest: 60, prote: 8 },
  { name: "Plancha", muscle: "abdomen", sets: 3, reps: "30s", rest: 45, prote: 7 },
  { name: "Peso Muerto", muscle: "espalda", sets: 4, reps: "8", rest: 120, prote: 14 },
  { name: "Hip Thrust", muscle: "gluteos", sets: 4, reps: "12", rest: 90, prote: 10 },
  { name: "Curl Femoral", muscle: "piernas", sets: 3, reps: "12", rest: 60, prote: 8 },
];

const LEVELS = [
  { id: 1, name: "Recruit", icon: "❄️", minWorkouts: 0 },
  { id: 2, name: "Cold Warrior", icon: "🥶", minWorkouts: 8 },
  { id: 3, name: "Iron Wolf", icon: "⚔️", minWorkouts: 20 },
  { id: 4, name: "Elite Beast", icon: "🔥", minWorkouts: 40 },
  { id: 5, name: "Winter Arc", icon: "👑", minWorkouts: 70 },
];

const S = {
  card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(126,200,227,0.15)", borderRadius: 16, padding: 20, marginBottom: 16 },
  gcard: { background: "rgba(0,200,100,0.06)", border: "1px solid rgba(0,200,100,0.2)", borderRadius: 16, padding: 20, marginBottom: 16 },
  input: { background: "#111827", border: "1px solid #1e3a5f", color: "#fff", padding: "14px 20px", borderRadius: 12, fontSize: 15, width: "100%", marginBottom: 12, outline: "none", boxSizing: "border-box" },
  btn: { background: "linear-gradient(135deg, #1a3a5c, #2563a8)", border: "none", color: "#fff", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", boxSizing: "border-box" },
  gbtn: { background: `linear-gradient(135deg, #0a4a2a, ${G})`, border: "none", color: "#fff", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", boxSizing: "border-box" },
  pbtn: { background: `linear-gradient(135deg, #7a3f00, ${PROTE_COLOR})`, border: "none", color: "#fff", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", boxSizing: "border-box" },
  btnOutline: { background: "none", border: "1px solid #334455", color: "#8899aa", padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", boxSizing: "border-box" },
  page: { minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "'Segoe UI', sans-serif", maxWidth: 480, margin: "0 auto", paddingBottom: 80 },
};

const CSS = `
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes glow { 0%,100%{box-shadow:0 0 8px rgba(0,200,100,0.3)} 50%{box-shadow:0 0 22px rgba(0,200,100,0.6)} }
  @keyframes pglow { 0%,100%{box-shadow:0 0 8px rgba(245,166,35,0.3)} 50%{box-shadow:0 0 22px rgba(245,166,35,0.7)} }
  @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes coinPop { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-60px) scale(1.5)} }
  @keyframes splashFadeIn { 0%{opacity:0;transform:scale(0.85)} 60%{opacity:1;transform:scale(1.05)} 100%{opacity:1;transform:scale(1)} }
  @keyframes splashOut { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.1)} }
  @keyframes confettiFall { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
  @keyframes celebPop { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.2);opacity:1} 100%{transform:scale(1);opacity:1} }
  @keyframes shimmer { 0%,100%{opacity:0.7} 50%{opacity:1} }
  .fadeUp { animation: fadeUp 0.4s ease forwards; }
  .pulse { animation: pulse 2s infinite; }
  .glow { animation: glow 2s infinite; }
  .pglow { animation: pglow 1.5s infinite; }
  .bounce { animation: bounce 1s infinite; }
`;

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [screen, setScreen] = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboarding, setOnboarding] = useState({ objetivo: "", nivel: "", equipo: "", avatar: "" });
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [nombre, setNombre] = useState("");
  const [authError, setAuthError] = useState(""); const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [activeExercise, setActiveExercise] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [timerSecs, setTimerSecs] = useState(0); const [timerOn, setTimerOn] = useState(false);
  const [setWeightsState, setSetWeightsState] = useState({});
  const [animFrame, setAnimFrame] = useState(0);
  const [coinPops, setCoinPops] = useState([]);
  const [customExercises, setCustomExercises] = useState([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newEx, setNewEx] = useState({ name: "", muscle: "pecho", sets: 3, reps: "10", rest: 60 });
  const [showAvatarShop, setShowAvatarShop] = useState(false);
  const [avatarShopTab, setAvatarShopTab] = useState("muscles");
  const [workoutDone, setWorkoutDone] = useState(false);
  const [proteEarned, setProteEarned] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const [splashOut, setSplashOut] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const intervalRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async u => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          const d = snap.data(); setUserData(d);
          setTimeout(() => setSplashOut(true), 800);
          setTimeout(() => setShowSplash(false), 1200);
          if (!d.onboardingDone) setScreen("onboarding"); else setScreen("app");
        }
      } else {
        setUser(null); setUserData(null); setScreen("landing");
        setTimeout(() => setSplashOut(true), 800);
        setTimeout(() => setShowSplash(false), 1200);
      }
    });
  }, []);

  useEffect(() => {
    if (timerOn) {
      intervalRef.current = setInterval(() => setTimerSecs(s => { if (s <= 1) { clearInterval(intervalRef.current); setTimerOn(false); return 0; } return s - 1; }), 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [timerOn]);

  useEffect(() => {
    if (activeExercise) {
      animRef.current = setInterval(() => setAnimFrame(f => (f + 1) % 4), 600);
      return () => clearInterval(animRef.current);
    }
  }, [activeExercise]);

  const spawnCoin = (amount) => {
    const id = Date.now();
    setCoinPops(p => [...p, { id, amount }]);
    setTimeout(() => setCoinPops(p => p.filter(c => c.id !== id)), 1200);
  };

  const handleRegister = async () => {
    if (!nombre.trim()) { setAuthError("Ingresa tu nombre"); return; }
    setLoading(true); setAuthError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), { nombre, email, completedWorkouts: 0, streak: 0, lastWorkout: null, onboardingDone: false, objetivo: "", nivel: "", equipo: "", avatar: "warrior", outfit: "default", prote: 0, muscleUpgrades: {}, role: "user", createdAt: new Date().toISOString() });
      setUserData({ nombre, completedWorkouts: 0, streak: 0, onboardingDone: false, role: "user", prote: 0, avatar: "warrior", outfit: "default", muscleUpgrades: {} });
      setScreen("onboarding");
    } catch (e) { setAuthError(e.code === "auth/email-already-in-use" ? "Correo ya registrado" : e.code === "auth/weak-password" ? "Mínimo 6 caracteres" : "Error"); }
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
        await setDoc(ref, { nombre: cred.user.displayName || "Warrior", email: cred.user.email, completedWorkouts: 0, streak: 0, lastWorkout: null, onboardingDone: false, objetivo: "", nivel: "", equipo: "", avatar: "warrior", outfit: "default", prote: 0, muscleUpgrades: {}, role: "user", createdAt: new Date().toISOString() });
        setUserData({ nombre: cred.user.displayName, completedWorkouts: 0, streak: 0, onboardingDone: false, role: "user", prote: 0, avatar: "warrior", outfit: "default", muscleUpgrades: {} });
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

  const earnProte = async (amount) => {
    if (!user) return;
    spawnCoin(amount);
    await updateDoc(doc(db, "users", user.uid), { prote: increment(amount) });
    setUserData(d => ({ ...d, prote: (d.prote || 0) + amount }));
  };

  const completeSet = (ex) => {
    const completedSets = setWeightsState[`${ex.name}-completed`] || [];
    const currentKg = setWeightsState[`${ex.name}-input`] || "0";
    const newCompleted = [...completedSets, { set: completedSets.length + 1, kg: currentKg, reps: ex.reps }];
    setSetWeightsState(w => ({ ...w, [`${ex.name}-completed`]: newCompleted, [`${ex.name}-input`]: "" }));
    earnProte(ex.prote || 8);
    if (newCompleted.length < ex.sets) { setTimerSecs(ex.rest); setTimerOn(true); }
  };

  const completeWorkout = async () => {
    if (!user) return;
    const bonus = 20;
    setProteEarned(bonus);
    setWorkoutDone(true);
    await updateDoc(doc(db, "users", user.uid), { completedWorkouts: increment(1), lastWorkout: new Date().toISOString(), prote: increment(bonus) });
    const snap = await getDoc(doc(db, "users", user.uid));
    setUserData(snap.data());
    setTimeout(() => { setWorkoutDone(false); setActiveTab("home"); }, 3000);
  };

  const upgradeMusclePart = async (muscleId) => {
    if (!user || !userData) return;
    const muscle = AVATAR_MUSCLES.find(m => m.id === muscleId);
    const currentLevel = (userData.muscleUpgrades || {})[muscleId] || 0;
    if (currentLevel >= 4) return;
    if ((userData.prote || 0) < muscle.cost) return;
    const newUpgrades = { ...(userData.muscleUpgrades || {}), [muscleId]: currentLevel + 1 };
    await updateDoc(doc(db, "users", user.uid), { prote: increment(-muscle.cost), muscleUpgrades: newUpgrades });
    setUserData(d => ({ ...d, prote: (d.prote || 0) - muscle.cost, muscleUpgrades: newUpgrades }));
  };

  const buyOutfit = async (outfitId) => {
    if (!user || !userData) return;
    const outfit = OUTFITS.find(o => o.id === outfitId);
    if (!outfit || (userData.prote || 0) < outfit.cost) return;
    const owned = userData.ownedOutfits || ["default"];
    if (owned.includes(outfitId)) {
      await updateDoc(doc(db, "users", user.uid), { outfit: outfitId });
      setUserData(d => ({ ...d, outfit: outfitId }));
    } else {
      const newOwned = [...owned, outfitId];
      await updateDoc(doc(db, "users", user.uid), { prote: increment(-outfit.cost), ownedOutfits: newOwned, outfit: outfitId });
      setUserData(d => ({ ...d, prote: (d.prote || 0) - outfit.cost, ownedOutfits: newOwned, outfit: outfitId }));
    }
  };

  const addCustomExercise = () => {
    if (!newEx.name.trim()) return;
    const ex = { ...newEx, id: Date.now(), prote: 8, custom: true };
    setCustomExercises(c => [...c, ex]);
    setNewEx({ name: "", muscle: "pecho", sets: 3, reps: "10", rest: 60 });
    setShowAddExercise(false);
  };

  const handleLogout = async () => { await signOut(auth); setScreen("landing"); };
  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const cw = userData?.completedWorkouts || 0;
  const prote = userData?.prote || 0;
  const curLvl = LEVELS.slice().reverse().find(l => cw >= l.minWorkouts) || LEVELS[0];
  const nextLvl = LEVELS.find(l => l.minWorkouts > cw);
  const pct = nextLvl ? Math.round(((cw - curLvl.minWorkouts) / (nextLvl.minWorkouts - curLvl.minWorkouts)) * 100) : 100;
  const isCoach = userData?.role === "coach" || userData?.role === "admin";
  const currentAvatar = AVATARS.find(a => a.id === userData?.avatar) || AVATARS[0];
  const currentOutfit = OUTFITS.find(o => o.id === userData?.outfit) || OUTFITS[0];
  const allExercises = [...BASE_EXERCISES, ...customExercises];

  const renderAvatar = (size = 80) => {
    const upgrades = userData?.muscleUpgrades || {};
    const outfit = currentOutfit.emoji;
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <div style={{ fontSize: size, lineHeight: 1 }}>{currentAvatar.base}</div>
        <div style={{ position: "absolute", bottom: -4, right: -4, fontSize: size * 0.35 }}>{outfit}</div>
        {Object.entries(upgrades).map(([k, v]) => v > 0 && (
          <div key={k} style={{ position: "absolute", top: 0, left: -8, fontSize: 12, background: "rgba(0,200,100,0.8)", borderRadius: 8, padding: "1px 4px" }}>
            {AVATAR_MUSCLES.find(m => m.id === k)?.levels[v - 1]}
          </div>
        ))}
      </div>
    );
  };

  // ── SPLASH SCREEN ────────────────────────────────────────
  if (showSplash) return (
    <div style={{ position: "fixed", inset: 0, background: "linear-gradient(160deg, #0a0a0f, #0d2a1a)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999, fontFamily: "'Segoe UI', sans-serif",
      animation: splashOut ? "splashOut 0.4s ease forwards" : "splashFadeIn 0.8s ease forwards" }}>
      <style>{CSS}</style>
      <div style={{ fontSize: 80, animation: "pulse 1s ease infinite", marginBottom: 16 }}>❄️</div>
      <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: 3, background: `linear-gradient(90deg, #7ec8e3, #fff, ${G})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 1.2s ease infinite" }}>WINTER ARC</div>
      <div style={{ fontSize: 13, letterSpacing: 6, color: G, fontWeight: 700, marginTop: 4 }}>MX</div>
    </div>
  );

  // ── WORKOUT DONE CELEBRATION ──────────────────────────────
  if (workoutDone) {
    const confettiColors = [G, PROTE_COLOR, "#7ec8e3", "#fff", "#ff6b6b", "#a29bfe"];
    const confettiPieces = Array.from({ length: 30 }).map((_, i) => ({
      id: i, color: confettiColors[i % confettiColors.length],
      left: `${Math.random() * 100}%`, delay: `${Math.random() * 0.8}s`,
      duration: `${1.5 + Math.random() * 1.5}s`, size: `${6 + Math.random() * 8}px`,
      shape: Math.random() > 0.5 ? "50%" : "2px",
    }));
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0a0f, #0d2a1a)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", color: "#fff", textAlign: "center", padding: 24, overflow: "hidden", position: "relative" }}>
        <style>{CSS}</style>
        {/* Confetti */}
        {confettiPieces.map(c => (
          <div key={c.id} style={{ position: "absolute", top: -20, left: c.left, width: c.size, height: c.size, background: c.color, borderRadius: c.shape, animation: `confettiFall ${c.duration} ${c.delay} ease-in forwards`, pointerEvents: "none" }} />
        ))}
        <div style={{ animation: "celebPop 0.6s ease forwards", marginBottom: 16 }}>
          <div style={{ fontSize: 90 }}>🏆</div>
        </div>
        <div style={{ animation: "celebPop 0.6s 0.2s ease both", fontSize: 28, fontWeight: 900, color: G, marginBottom: 8 }}>¡Día completado!</div>
        <div style={{ animation: "celebPop 0.6s 0.3s ease both", color: "#8899aa", fontSize: 15, marginBottom: 20 }}>Warrior, eres imparable 💪</div>
        <div style={{ animation: "celebPop 0.6s 0.4s ease both" }}>
          <div className="pglow" style={{ background: "rgba(245,166,35,0.15)", border: `2px solid ${PROTE_COLOR}`, borderRadius: 20, padding: "14px 32px", fontSize: 20, fontWeight: 900, color: PROTE_COLOR }}>
            🪙 +{proteEarned} Prote bonus
          </div>
        </div>
      </div>
    );
  }

  // ── LANDING ──────────────────────────────────────────────
  if (screen === "landing") return (
    <div style={{ background: "#0a0a0f", color: "#fff", fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh" }}>
      <style>{CSS}</style>
      <div style={{ background: "linear-gradient(160deg, #0a0a0f, #0d1b2a)", padding: "60px 24px 48px", textAlign: "center" }}>
        <div className="pulse" style={{ fontSize: 60, marginBottom: 8 }}>❄️</div>
        <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: 2, background: `linear-gradient(90deg, #7ec8e3, #fff, ${G})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>WINTER ARC</div>
        <div style={{ fontSize: 14, letterSpacing: 6, color: G, fontWeight: 700, marginBottom: 20 }}>MX</div>
        <div style={{ color: "#ccd6e0", fontSize: 16, maxWidth: 300, margin: "0 auto 12px", lineHeight: 1.6, fontWeight: 600 }}>Entrena. Gana Prote. Evoluciona tu avatar.</div>
        <div style={{ color: "#8899aa", fontSize: 13, maxWidth: 280, margin: "0 auto 36px", lineHeight: 1.7 }}>El único gym donde tu personaje crece junto contigo.</div>
        <button onClick={() => setScreen("auth")} style={{ ...S.gbtn, width: "auto", padding: "18px 48px", borderRadius: 50, fontSize: 17 }}>COMENZAR ❄️</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#0d2a1a", margin: "0 0 32px" }}>
        {[["🏋️", "Entrena"], ["🪙", "Gana Prote"], ["👤", "Evoluciona"]].map(([i, l], idx) => (
          <div key={idx} style={{ background: "#0a0a0f", padding: "20px 8px", textAlign: "center", margin: 1 }}>
            <div style={{ fontSize: 28 }}>{i}</div>
            <div style={{ fontSize: 11, color: "#556677", marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 24px 48px", textAlign: "center" }}>
        <button onClick={() => setScreen("auth")} style={{ ...S.gbtn, padding: "18px 48px", width: "auto", borderRadius: 50 }}>EMPIEZA HOY</button>
      </div>
    </div>
  );

  // ── AUTH ─────────────────────────────────────────────────
  if (screen === "auth") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a0a0f, #0d1b2a)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", color: "#fff", padding: 24 }}>
      <style>{CSS}</style>
      <div onClick={() => setScreen("landing")} style={{ alignSelf: "flex-start", color: "#7ec8e3", cursor: "pointer", marginBottom: 24, fontSize: 14 }}>← Volver</div>
      <div className="pulse" style={{ fontSize: 40 }}>{authMode === "login" ? "🔐" : "❄️"}</div>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{authMode === "login" ? "INICIAR SESIÓN" : "REGISTRO"}</div>
      <div style={{ color: G, marginBottom: 24, fontSize: 13 }}>{authMode === "login" ? "Bienvenido de vuelta" : "Comienza tu Winter Arc"}</div>
      <div style={{ width: "100%", maxWidth: 320 }}>
        {authMode === "register" && <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" style={S.input} />}
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Correo" type="email" style={S.input} />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" type="password" style={S.input} />
        {authError && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{authError}</div>}
        <button onClick={authMode === "login" ? handleLogin : handleRegister} disabled={loading} style={{ ...S.gbtn, opacity: loading ? 0.7 : 1 }}>{loading ? "Cargando..." : authMode === "login" ? "ENTRAR" : "CREAR CUENTA"}</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#1e3a5f" }} /><span style={{ color: "#556677", fontSize: 12 }}>o</span><div style={{ flex: 1, height: 1, background: "#1e3a5f" }} />
        </div>
        <button onClick={handleGoogle} disabled={loading} style={{ ...S.btn, background: "#fff", color: "#222", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span>🔵</span> Continuar con Google
        </button>
        <div style={{ textAlign: "center", marginTop: 14, color: "#556677", fontSize: 13 }}>
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
      { q: "Elige tu avatar", key: "avatar", type: "avatar" },
      { q: "¿Cuál es tu objetivo?", key: "objetivo", opts: ["Ganar músculo", "Perder grasa", "Ganar fuerza", "Mejorar condición"] },
      { q: "¿Cuál es tu nivel?", key: "nivel", opts: ["Principiante", "Intermedio", "Avanzado"] },
      { q: "¿Con qué equipo cuentas?", key: "equipo", opts: ["Gym completo", "Pesas en casa", "Sin equipo", "Mixto"] },
    ];
    const step = steps[onboardingStep];
    const advance = (val) => {
      const updated = { ...onboarding, [step.key]: val };
      setOnboarding(updated);
      if (onboardingStep < steps.length - 1) setOnboardingStep(s => s + 1);
      else finishOnboarding(updated);
    };
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a0a0f, #0d2a1a)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", color: "#fff", padding: 24 }}>
        <style>{CSS}</style>
        <div style={{ fontSize: 11, color: G, letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>PASO {onboardingStep + 1} DE {steps.length}</div>
        <div style={{ fontSize: 22, fontWeight: 900, textAlign: "center", marginBottom: 28, maxWidth: 300 }}>{step.q}</div>
        <div style={{ width: "100%", maxWidth: 340 }}>
          {step.type === "avatar" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {AVATARS.map((av, i) => (
                <button key={av.id} className="fadeUp" onClick={() => advance(av.id)} style={{ background: onboarding.avatar === av.id ? "rgba(0,200,100,0.1)" : "rgba(255,255,255,0.04)", border: `2px solid ${onboarding.avatar === av.id ? G : "rgba(126,200,227,0.15)"}`, borderRadius: 16, padding: 16, cursor: "pointer", textAlign: "center", animationDelay: `${i * 0.08}s` }}>
                  <div style={{ fontSize: 44, marginBottom: 8 }}>{av.base}</div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{av.name}</div>
                  <div style={{ color: "#8899aa", fontSize: 11 }}>{av.desc}</div>
                </button>
              ))}
            </div>
          ) : (
            step.opts.map((opt, i) => (
              <button key={opt} className="fadeUp" onClick={() => advance(opt)} style={{ ...S.card, width: "100%", textAlign: "left", cursor: "pointer", border: `1px solid ${onboarding[step.key] === opt ? G : "rgba(126,200,227,0.15)"}`, marginBottom: 10, padding: "14px 20px", fontWeight: 600, fontSize: 15, color: onboarding[step.key] === opt ? G : "#fff", display: "block", animationDelay: `${i * 0.07}s`, background: onboarding[step.key] === opt ? "rgba(0,200,100,0.08)" : "rgba(255,255,255,0.04)", boxSizing: "border-box" }}>
                {opt}
              </button>
            ))
          )}
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
    const anim = EXERCISE_ANIMATIONS[ex.name] || EXERCISE_ANIMATIONS["default"];
    const completedSets = setWeightsState[`${ex.name}-completed`] || [];
    const currentKg = setWeightsState[`${ex.name}-input`] || "";
    const isResting = timerSecs > 0 || timerOn;
    const allDone = completedSets.length >= ex.sets;
    const muscleGroup = MUSCLE_GROUPS.find(m => m.id === ex.muscle);

    return (
      <div style={{ ...S.page, background: "linear-gradient(180deg, #0a0a0f, #0d1b0a)" }}>
        <style>{CSS}</style>
        {/* Coin pop animations */}
        <div style={{ position: "fixed", top: 80, right: 20, zIndex: 999, pointerEvents: "none" }}>
          {coinPops.map(c => (
            <div key={c.id} style={{ animation: "coinPop 1.2s ease forwards", color: PROTE_COLOR, fontWeight: 900, fontSize: 18, textAlign: "center" }}>
              +{c.amount} 🪙
            </div>
          ))}
        </div>
        <div style={{ padding: "20px 20px 0" }}>
          <button onClick={() => { setActiveExercise(null); setTimerOn(false); setTimerSecs(0); }} style={{ background: "none", border: "none", color: "#7ec8e3", fontSize: 14, cursor: "pointer", padding: 0 }}>← Volver</button>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", padding: "16px 20px 0" }}>
          <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 8 }}>{anim.frames[animFrame]}</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{ex.name}</div>
          {muscleGroup && <div style={{ display: "inline-block", background: `${muscleGroup.color}22`, border: `1px solid ${muscleGroup.color}66`, borderRadius: 20, padding: "3px 12px", fontSize: 12, color: muscleGroup.color, marginBottom: 8 }}>{muscleGroup.icon} {muscleGroup.name}</div>}
          <div style={{ color: "#8899aa", fontSize: 13, marginBottom: 12 }}>{ex.sets} series · {ex.reps} reps · {ex.rest}s descanso</div>
          {/* Tip */}
          <div style={{ background: "rgba(245,166,35,0.08)", border: `1px solid rgba(245,166,35,0.25)`, borderRadius: 12, padding: "10px 16px", marginBottom: 16, fontSize: 12, color: "#f5c842", lineHeight: 1.5, textAlign: "left" }}>
            💡 {anim.tip}
          </div>
          {/* Prote reward */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(245,166,35,0.1)", border: `1px solid rgba(245,166,35,0.3)`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: PROTE_COLOR, fontWeight: 700, marginBottom: 16 }}>
            🪙 +{ex.prote || 8} Prote por serie
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16, padding: "0 20px" }}>
          {Array.from({ length: ex.sets }).map((_, i) => (
            <div key={i} style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900,
              background: i < completedSets.length ? `linear-gradient(135deg, #0a4a2a, ${G})` : i === completedSets.length && !allDone ? "linear-gradient(135deg, #1a3a5c, #2563a8)" : "rgba(255,255,255,0.05)",
              border: i === completedSets.length && !allDone ? `2px solid ${G}` : "2px solid transparent",
              transform: i === completedSets.length && !allDone ? "scale(1.2)" : "scale(1)",
              transition: "all 0.4s", boxShadow: i === completedSets.length && !allDone ? `0 0 12px rgba(0,200,100,0.5)` : "none"
            }}>
              {i < completedSets.length ? "✓" : i + 1}
            </div>
          ))}
        </div>

        <div style={{ padding: "0 20px" }}>
          {allDone ? (
            <div className="fadeUp" style={{ background: "linear-gradient(135deg, #0a4a2a, #0d2a1a)", border: `1px solid ${G}`, borderRadius: 20, padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 8 }}>🎉</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: G, marginBottom: 8 }}>¡Ejercicio completado!</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                {completedSets.map((s, i) => (
                  <div key={i} style={{ background: "rgba(0,200,100,0.1)", border: `1px solid rgba(0,200,100,0.3)`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: G, fontWeight: 700 }}>
                    S{s.set}: {s.kg}kg × {s.reps}
                  </div>
                ))}
              </div>
              <div style={{ color: PROTE_COLOR, fontWeight: 700, fontSize: 14, marginBottom: 16 }}>🪙 +{(ex.prote || 8) * ex.sets} Prote ganados</div>
              <button onClick={() => setActiveExercise(null)} style={S.gbtn}>← Siguiente ejercicio</button>
            </div>
          ) : isResting ? (
            <div className="glow" style={{ background: "linear-gradient(135deg, #0d1b2a, #1a2a3a)", border: "1px solid #2563a8", borderRadius: 20, padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 12, letterSpacing: 2 }}>⏱ DESCANSANDO</div>
              <div style={{ fontSize: 72, fontWeight: 900, color: timerSecs <= 10 ? "#ef4444" : "#7ec8e3", lineHeight: 1, marginBottom: 12, transition: "color 0.3s" }}>{fmt(timerSecs)}</div>
              <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 50, height: 8, marginBottom: 12 }}>
                <div style={{ background: timerSecs <= 10 ? "#ef4444" : `linear-gradient(90deg, #2563a8, ${G})`, borderRadius: 50, height: 8, width: `${(timerSecs / ex.rest) * 100}%`, transition: "width 1s linear, background 0.3s" }} />
              </div>
              <div style={{ color: "#8899aa", fontSize: 13, marginBottom: 16 }}>Serie {completedSets.length + 1} de {ex.sets} viene</div>
              <button onClick={() => { setTimerOn(false); setTimerSecs(0); }} style={{ ...S.btnOutline, width: "auto", padding: "10px 28px", borderRadius: 50 }}>Saltar →</button>
            </div>
          ) : (
            <div className="fadeUp" style={{ background: "linear-gradient(135deg, #0d1b0a, #0a2a1a)", border: `1px solid rgba(0,200,100,0.35)`, borderRadius: 20, padding: "20px 16px" }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: G, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>SERIE {completedSets.length + 1} DE {ex.sets}</div>
                <div style={{ fontSize: 36, fontWeight: 900 }}>{ex.reps} <span style={{ fontSize: 18, color: "#8899aa" }}>reps</span></div>
              </div>
              {completedSets.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: "#556677", marginBottom: 6 }}>SERIES ANTERIORES</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {completedSets.map((s, i) => <div key={i} style={{ background: "rgba(0,200,100,0.08)", border: `1px solid rgba(0,200,100,0.2)`, borderRadius: 20, padding: "3px 10px", fontSize: 12, color: G, fontWeight: 700 }}>S{s.set}: {s.kg}kg</div>)}
                  </div>
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 8 }}>¿Cuánto peso usaste?</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => { const v = parseFloat(currentKg || 0); setSetWeightsState(w => ({ ...w, [`${ex.name}-input`]: Math.max(0, v - 2.5).toString() })); }}
                    style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid #1e3a5f", color: "#fff", fontSize: 22, cursor: "pointer", flexShrink: 0 }}>−</button>
                  <input type="number" placeholder="0" value={currentKg}
                    onChange={e => setSetWeightsState(w => ({ ...w, [`${ex.name}-input`]: e.target.value }))}
                    style={{ flex: 1, background: "#111827", border: `2px solid ${G}`, color: "#fff", padding: "12px 8px", borderRadius: 12, fontSize: 28, fontWeight: 900, outline: "none", textAlign: "center", minWidth: 0 }} />
                  <button onClick={() => { const v = parseFloat(currentKg || 0); setSetWeightsState(w => ({ ...w, [`${ex.name}-input`]: (v + 2.5).toString() })); }}
                    style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(0,200,100,0.15)", border: `1px solid ${G}`, color: G, fontSize: 22, cursor: "pointer", flexShrink: 0 }}>+</button>
                </div>
                <div style={{ textAlign: "center", color: "#556677", fontSize: 11, marginTop: 4 }}>kilogramos</div>
              </div>
              <button onClick={() => completeSet(ex)} style={{ ...S.gbtn, fontSize: 15, padding: "14px" }}>
                ✓ Serie {completedSets.length + 1} completada · 🪙+{ex.prote || 8}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── WORKOUT DONE ─────────────────────────────────────────
  if (workoutDone) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0a0f, #0d2a1a)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", color: "#fff", textAlign: "center", padding: 24 }}>
      <style>{CSS}</style>
      <div className="bounce" style={{ fontSize: 80, marginBottom: 16 }}>🏆</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: G, marginBottom: 8 }}>¡Día completado!</div>
      <div style={{ color: "#8899aa", fontSize: 15, marginBottom: 16 }}>Sigue así, Warrior 💪</div>
      <div className="pglow" style={{ background: "rgba(245,166,35,0.1)", border: `1px solid ${PROTE_COLOR}`, borderRadius: 20, padding: "12px 28px", fontSize: 18, fontWeight: 900, color: PROTE_COLOR }}>
        🪙 +{proteEarned} Prote bonus de día
      </div>
    </div>
  );

  // ── AVATAR SHOP ──────────────────────────────────────────
  if (showAvatarShop) return (
    <div style={S.page}>
      <style>{CSS}</style>
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={() => setShowAvatarShop(false)} style={{ background: "none", border: "none", color: "#7ec8e3", fontSize: 14, cursor: "pointer", padding: 0 }}>← Volver</button>
          <div className="pglow" style={{ background: "rgba(245,166,35,0.1)", border: `1px solid ${PROTE_COLOR}`, borderRadius: 20, padding: "6px 14px", fontSize: 14, color: PROTE_COLOR, fontWeight: 900 }}>🪙 {prote} Prote</div>
        </div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="pulse" style={{ fontSize: 80 }}>{renderAvatar(80)}</div>
          <div style={{ fontSize: 18, fontWeight: 900, marginTop: 8 }}>{currentAvatar.name}</div>
          <div style={{ color: "#8899aa", fontSize: 13 }}>{currentOutfit.emoji} {currentOutfit.name}</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["muscles", "outfits"].map(t => (
            <button key={t} onClick={() => setAvatarShopTab(t)} style={{ flex: 1, background: avatarShopTab === t ? G : "rgba(255,255,255,0.05)", border: "none", color: avatarShopTab === t ? "#000" : "#fff", padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}>
              {t === "muscles" ? "💪 Músculos" : "👕 Outfits"}
            </button>
          ))}
        </div>

        {avatarShopTab === "muscles" && AVATAR_MUSCLES.map((m, i) => {
          const lvl = (userData?.muscleUpgrades || {})[m.id] || 0;
          const canAfford = prote >= m.cost;
          const maxed = lvl >= 4;
          return (
            <div key={m.id} className="fadeUp" style={{ ...S.card, animationDelay: `${i * 0.07}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 32 }}>{m.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{m.name}</div>
                    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                      {Array.from({ length: 4 }).map((_, j) => <div key={j} style={{ width: 16, height: 6, borderRadius: 3, background: j < lvl ? G : "#1e3a5f" }} />)}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 24 }}>{lvl > 0 ? m.levels[lvl - 1] : "🦴"}</div>
              </div>
              <button onClick={() => upgradeMusclePart(m.id)} disabled={!canAfford || maxed}
                style={{ ...S.gbtn, opacity: (!canAfford || maxed) ? 0.4 : 1, padding: "10px", fontSize: 13 }}>
                {maxed ? "✓ Máximo nivel" : `Mejorar · 🪙 ${m.cost} Prote`}
              </button>
            </div>
          );
        })}

        {avatarShopTab === "outfits" && OUTFITS.map((o, i) => {
          const owned = (userData?.ownedOutfits || ["default"]).includes(o.id);
          const isActive = userData?.outfit === o.id;
          const canAfford = prote >= o.cost;
          return (
            <div key={o.id} className="fadeUp" style={{ ...S.card, border: isActive ? `1px solid ${G}` : "1px solid rgba(126,200,227,0.15)", animationDelay: `${i * 0.07}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 40 }}>{o.emoji}</div>
                  <div><div style={{ fontWeight: 700 }}>{o.name}</div><div style={{ color: isActive ? G : "#8899aa", fontSize: 12 }}>{isActive ? "✓ Activo" : owned ? "En tu colección" : `🪙 ${o.cost} Prote`}</div></div>
                </div>
              </div>
              <button onClick={() => buyOutfit(o.id)} disabled={(!owned && !canAfford)}
                style={{ ...(isActive ? S.btnOutline : S.gbtn), opacity: (!owned && !canAfford) ? 0.4 : 1, padding: "10px", fontSize: 13 }}>
                {isActive ? "Usando" : owned ? "Equipar" : `Comprar · 🪙 ${o.cost}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── MAIN APP ─────────────────────────────────────────────
  const tabs = [
    { id: "home", icon: "🏠", label: "Inicio" },
    { id: "library", icon: "💪", label: "Rutinas" },
    { id: "progress", icon: "📈", label: "Progreso" },
    { id: "profile", icon: "👤", label: "Perfil" },
  ];

  const exercisesByMuscle = selectedMuscles.length > 0
    ? allExercises.filter(e => selectedMuscles.includes(e.muscle))
    : allExercises;

  return (
    <div style={S.page}>
      <style>{CSS}</style>
      {/* Coin pops global */}
      <div style={{ position: "fixed", top: 80, right: 20, zIndex: 999, pointerEvents: "none" }}>
        {coinPops.map(c => (
          <div key={c.id} style={{ animation: "coinPop 1.2s ease forwards", color: PROTE_COLOR, fontWeight: 900, fontSize: 18 }}>+{c.amount} 🪙</div>
        ))}
      </div>

      {/* Header */}
      <div style={{ padding: "16px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 36 }}>{renderAvatar(36)}</div>
          <div>
            <div style={{ fontSize: 11, color: "#556677", letterSpacing: 1, fontWeight: 700 }}>WINTER ARC MX</div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>{userData?.nombre?.split(" ")[0] || "Warrior"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="pglow" style={{ background: "rgba(245,166,35,0.1)", border: `1px solid rgba(245,166,35,0.4)`, borderRadius: 20, padding: "5px 12px", fontSize: 13, color: PROTE_COLOR, fontWeight: 900 }}>🪙 {prote}</div>
          <div style={{ background: "rgba(0,200,100,0.1)", border: `1px solid rgba(0,200,100,0.3)`, borderRadius: 20, padding: "5px 10px", fontSize: 11, color: G, fontWeight: 700 }}>{curLvl.icon} {curLvl.name}</div>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>

        {/* HOME */}
        {activeTab === "home" && (
          <div style={{ marginTop: 20 }}>
            <div className="fadeUp" style={{ background: "linear-gradient(135deg, #0d1b0a, #0a2a1a)", border: `1px solid rgba(0,200,100,0.3)`, borderRadius: 20, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div><div style={{ fontSize: 11, color: G, letterSpacing: 1, marginBottom: 4 }}>NIVEL</div><div style={{ fontSize: 20, fontWeight: 900 }}>{curLvl.icon} {curLvl.name}</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: PROTE_COLOR, marginBottom: 4 }}>PROTE</div><div style={{ fontSize: 20, fontWeight: 900, color: PROTE_COLOR }}>🪙 {prote}</div></div>
              </div>
              {nextLvl && (<>
                <div style={{ fontSize: 11, color: "#8899aa", marginBottom: 6 }}>Próximo: {nextLvl.icon} {nextLvl.name} — {cw}/{nextLvl.minWorkouts}</div>
                <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 50, height: 8 }}>
                  <div style={{ background: `linear-gradient(90deg, #0a4a2a, ${G})`, borderRadius: 50, height: 8, width: `${pct}%`, transition: "width 0.8s" }} />
                </div>
              </>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[{ l: "Entrenos", v: cw, i: "💪", c: G }, { l: "Racha", v: `${userData?.streak || 0}d`, i: "🔥", c: "#ff9f43" }, { l: "Prote", v: prote, i: "🪙", c: PROTE_COLOR }].map((s, i) => (
                <div key={i} className="fadeUp" style={{ ...S.gcard, margin: 0, textAlign: "center", padding: 14, animationDelay: `${i * 0.1}s` }}>
                  <div style={{ fontSize: 22 }}>{s.i}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: "#8899aa" }}>{s.l}</div>
                </div>
              ))}
            </div>
            {/* Avatar card */}
            <div className="fadeUp" style={{ ...S.card, display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }} onClick={() => setShowAvatarShop(true)}>
              <div style={{ fontSize: 56 }}>{renderAvatar(56)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{currentAvatar.name} {currentOutfit.emoji}</div>
                <div style={{ color: "#8899aa", fontSize: 12, marginBottom: 8 }}>Mejora tu avatar con Prote</div>
                <div style={{ color: PROTE_COLOR, fontSize: 12, fontWeight: 700 }}>🪙 Tienda del avatar →</div>
              </div>
            </div>
            {/* Today routines */}
            <div style={{ fontSize: 13, color: G, fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>SELECCIONA MÚSCULOS HOY 💪</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {MUSCLE_GROUPS.map(m => (
                <button key={m.id} onClick={() => setSelectedMuscles(s => s.includes(m.id) ? s.filter(x => x !== m.id) : [...s, m.id])}
                  style={{ background: selectedMuscles.includes(m.id) ? `${m.color}33` : "rgba(255,255,255,0.04)", border: `1px solid ${selectedMuscles.includes(m.id) ? m.color : "#1e3a5f"}`, color: selectedMuscles.includes(m.id) ? m.color : "#8899aa", padding: "6px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: selectedMuscles.includes(m.id) ? 700 : 400, transition: "all 0.2s" }}>
                  {m.icon} {m.name}
                </button>
              ))}
            </div>
            {selectedMuscles.length > 0 && (
              <div style={{ ...S.gcard }}>
                <div style={{ fontSize: 12, color: G, fontWeight: 700, marginBottom: 10 }}>EJERCICIOS PARA HOY ({exercisesByMuscle.length})</div>
                {exercisesByMuscle.map((ex, i) => {
                  const done = (setWeightsState[`${ex.name}-completed`] || []).length >= ex.sets;
                  return (
                    <div key={i} onClick={() => !done && setActiveExercise(ex)}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < exercisesByMuscle.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", cursor: done ? "default" : "pointer", opacity: done ? 0.85 : 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? `linear-gradient(135deg, #0a4a2a, ${G})` : "rgba(255,255,255,0.05)", border: `1px solid ${done ? G : "#1e3a5f"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                          {done ? "✓" : i + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: done ? G : "#fff", textDecoration: done ? "line-through" : "none" }}>{ex.name}</div>
                          <div style={{ color: "#8899aa", fontSize: 11 }}>{ex.sets}×{ex.reps}
                            {done && <span style={{ color: G, marginLeft: 8, fontWeight: 700 }}>· Completado ✓</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: done ? G : PROTE_COLOR, fontSize: 12, fontWeight: 700 }}>{done ? `🪙 +${(ex.prote || 8) * ex.sets}` : `🪙${ex.prote}`}</div>
                        {!done && <div style={{ color: G, fontSize: 16 }}>›</div>}
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 12, color: "#8899aa" }}>
                    {exercisesByMuscle.filter(ex => (setWeightsState[`${ex.name}-completed`] || []).length >= ex.sets).length}/{exercisesByMuscle.length} completados
                  </div>
                  <button onClick={() => setActiveTab("library")} style={{ background: "none", border: `1px solid ${G}`, color: G, padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Ver todos →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LIBRARY */}
        {activeTab === "library" && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 900 }}>Biblioteca</div>
              <button onClick={() => setShowAddExercise(true)} style={{ background: "rgba(0,200,100,0.1)", border: `1px solid ${G}`, color: G, padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Agregar</button>
            </div>

            {/* Add custom exercise modal */}
            {showAddExercise && (
              <div className="fadeUp" style={{ ...S.gcard, marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: G, marginBottom: 12 }}>Nuevo ejercicio personalizado</div>
                <input value={newEx.name} onChange={e => setNewEx(n => ({ ...n, name: e.target.value }))} placeholder="Nombre del ejercicio" style={{ ...S.input, marginBottom: 8 }} />
                <select value={newEx.muscle} onChange={e => setNewEx(n => ({ ...n, muscle: e.target.value }))} style={{ ...S.input, marginBottom: 8 }}>
                  {MUSCLE_GROUPS.map(m => <option key={m.id} value={m.id}>{m.icon} {m.name}</option>)}
                </select>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  <input type="number" value={newEx.sets} onChange={e => setNewEx(n => ({ ...n, sets: parseInt(e.target.value) || 3 }))} placeholder="Series" style={{ ...S.input, marginBottom: 0 }} />
                  <input value={newEx.reps} onChange={e => setNewEx(n => ({ ...n, reps: e.target.value }))} placeholder="Reps" style={{ ...S.input, marginBottom: 0 }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <button onClick={addCustomExercise} style={{ ...S.gbtn, padding: "10px", fontSize: 13 }}>Guardar</button>
                  <button onClick={() => setShowAddExercise(false)} style={{ ...S.btnOutline, padding: "10px", fontSize: 13 }}>Cancelar</button>
                </div>
              </div>
            )}

            {/* Muscle filter */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              <button onClick={() => setSelectedMuscles([])} style={{ background: selectedMuscles.length === 0 ? G : "rgba(255,255,255,0.05)", border: `1px solid ${selectedMuscles.length === 0 ? G : "#1e3a5f"}`, color: selectedMuscles.length === 0 ? "#000" : "#fff", padding: "5px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontWeight: 700 }}>Todos</button>
              {MUSCLE_GROUPS.map(m => (
                <button key={m.id} onClick={() => setSelectedMuscles(s => s.includes(m.id) ? s.filter(x => x !== m.id) : [...s, m.id])}
                  style={{ background: selectedMuscles.includes(m.id) ? `${m.color}33` : "rgba(255,255,255,0.04)", border: `1px solid ${selectedMuscles.includes(m.id) ? m.color : "#1e3a5f"}`, color: selectedMuscles.includes(m.id) ? m.color : "#8899aa", padding: "5px 10px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontWeight: selectedMuscles.includes(m.id) ? 700 : 400, transition: "all 0.2s" }}>
                  {m.icon} {m.name}
                </button>
              ))}
            </div>

            {/* Exercises grouped by muscle */}
            {(selectedMuscles.length > 0 ? MUSCLE_GROUPS.filter(m => selectedMuscles.includes(m.id)) : MUSCLE_GROUPS).map(muscle => {
              const exs = allExercises.filter(e => e.muscle === muscle.id);
              if (exs.length === 0) return null;
              return (
                <div key={muscle.id} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ fontSize: 20 }}>{muscle.icon}</div>
                    <div style={{ fontWeight: 700, color: muscle.color }}>{muscle.name}</div>
                    <div style={{ fontSize: 11, color: "#556677" }}>({exs.length})</div>
                  </div>
                  {exs.map((ex, i) => (
                    <div key={i} className="fadeUp" onClick={() => setActiveExercise(ex)} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: 10, border: ex.custom ? `1px solid rgba(245,166,35,0.3)` : "1px solid rgba(126,200,227,0.15)", animationDelay: `${i * 0.05}s` }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{ex.name} {ex.custom && <span style={{ color: PROTE_COLOR, fontSize: 10 }}>✦ custom</span>}</div>
                        <div style={{ color: "#8899aa", fontSize: 12, marginTop: 2 }}>{ex.sets} series · {ex.reps} reps</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: PROTE_COLOR, fontSize: 12, fontWeight: 700 }}>🪙{ex.prote || 8}</div>
                        <div style={{ color: G, fontSize: 18 }}>›</div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            <button onClick={completeWorkout} style={{ ...S.gbtn, marginTop: 8 }}>✅ Completar día +🪙20 bonus</button>
          </div>
        )}

        {/* PROGRESS */}
        {activeTab === "progress" && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 16 }}>Tu Progreso</div>
            <div className="glow fadeUp" style={{ ...S.gcard, textAlign: "center", padding: 28 }}>
              <div style={{ fontSize: 52, fontWeight: 900, color: G }}>{cw}</div>
              <div style={{ color: "#8899aa", fontSize: 13 }}>Entrenamientos completados</div>
            </div>
            <div className="pglow fadeUp" style={{ ...S.card, textAlign: "center", padding: 20, border: `1px solid rgba(245,166,35,0.3)`, marginBottom: 16 }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: PROTE_COLOR }}>🪙 {prote}</div>
              <div style={{ color: "#8899aa", fontSize: 13 }}>Prote acumulado</div>
            </div>
            <div style={S.card}>
              <div style={{ fontSize: 13, color: G, fontWeight: 700, marginBottom: 14 }}>CAMINO A WINTER ARC 👑</div>
              {LEVELS.map((l, i) => (
                <div key={l.id} className="fadeUp" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, animationDelay: `${i * 0.08}s` }}>
                  <div style={{ fontSize: 22, opacity: cw >= l.minWorkouts ? 1 : 0.3 }}>{l.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: cw >= l.minWorkouts ? "#fff" : "#556677" }}>{l.name}</div>
                    <div style={{ background: "#111827", borderRadius: 50, height: 6, marginTop: 4 }}>
                      <div style={{ background: cw >= l.minWorkouts ? `linear-gradient(90deg, #0a4a2a, ${G})` : "#1e3a5f", borderRadius: 50, height: 6, width: `${Math.min(100, (cw / Math.max(l.minWorkouts, 1)) * 100)}%`, transition: "width 0.8s" }} />
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
          <div style={{ marginTop: 20 }}>
            <div className="fadeUp" style={{ ...S.gcard, textAlign: "center" }}>
              <div className="pulse" style={{ fontSize: 72, marginBottom: 8, display: "inline-block" }}>{renderAvatar(72)}</div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>{userData?.nombre}</div>
              <div style={{ color: G, fontSize: 14, marginTop: 4, fontWeight: 700 }}>{curLvl.icon} {curLvl.name}</div>
              <div style={{ color: PROTE_COLOR, fontSize: 14, marginTop: 4, fontWeight: 700 }}>🪙 {prote} Prote</div>
              <button onClick={() => setShowAvatarShop(true)} style={{ ...S.pbtn, marginTop: 16, padding: "10px", fontSize: 13 }}>🪙 Tienda del avatar</button>
            </div>
            <div style={S.card}>
              <div style={{ fontSize: 13, color: G, fontWeight: 700, marginBottom: 12 }}>TU PERFIL</div>
              {[["Avatar", `${currentAvatar.base} ${currentAvatar.name}`], ["Outfit", `${currentOutfit.emoji} ${currentOutfit.name}`], ["Objetivo", userData?.objetivo], ["Nivel", userData?.nivel], ["Equipo", userData?.equipo]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ color: "#8899aa", fontSize: 13 }}>{k}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: G }}>{v || "—"}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: G, fontWeight: 700, marginBottom: 12 }}>MÚSCULOS DEL AVATAR</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {AVATAR_MUSCLES.map((m, i) => {
                const lvl = (userData?.muscleUpgrades || {})[m.id] || 0;
                return (
                  <div key={m.id} className="fadeUp" style={{ ...S.card, textAlign: "center", margin: 0, animationDelay: `${i * 0.07}s` }}>
                    <div style={{ fontSize: 28 }}>{lvl > 0 ? m.levels[lvl - 1] : m.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{m.name}</div>
                    <div style={{ display: "flex", gap: 3, justifyContent: "center", marginTop: 6 }}>
                      {Array.from({ length: 4 }).map((_, j) => <div key={j} style={{ width: 14, height: 5, borderRadius: 3, background: j < lvl ? G : "#1e3a5f" }} />)}
                    </div>
                  </div>
                );
              })}
            </div>
            {isCoach && <button onClick={() => setActiveTab("coach")} style={{ ...S.gbtn, marginBottom: 12 }}>🎯 Panel de Coach</button>}
            <button onClick={handleLogout} style={S.btnOutline}>Cerrar Sesión</button>
          </div>
        )}

        {/* COACH */}
        {activeTab === "coach" && isCoach && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <button onClick={() => setActiveTab("profile")} style={{ background: "none", border: "none", color: G, fontSize: 14, cursor: "pointer", padding: 0 }}>←</button>
              <div style={{ fontSize: 20, fontWeight: 900 }}>Panel de Coach 🎯</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {["usuarios", "metricas"].map(t => (
                <button key={t} onClick={() => { setActiveTab(t === "usuarios" ? "coach" : "coach"); if (t === "usuarios") { getDocs(collection(db, "users")).then(s => setAllUsers(s.docs.map(d => ({ id: d.id, ...d.data() })))); } }} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${G}`, color: "#fff", padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}>{t}</button>
              ))}
            </div>
            <button onClick={() => getDocs(collection(db, "users")).then(s => setAllUsers(s.docs.map(d => ({ id: d.id, ...d.data() }))))} style={{ ...S.gbtn, padding: "10px", fontSize: 13, marginBottom: 16 }}>Cargar usuarios</button>
            {allUsers.map((u, i) => (
              <div key={u.id} className="fadeUp" style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", animationDelay: `${i * 0.06}s` }}>
                <div><div style={{ fontWeight: 700 }}>{u.nombre}</div><div style={{ color: "#8899aa", fontSize: 12 }}>{u.email}</div></div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: G, fontSize: 12, fontWeight: 700 }}>{u.completedWorkouts || 0} entrenos</div>
                  <div style={{ color: PROTE_COLOR, fontSize: 11 }}>🪙{u.prote || 0}</div>
                </div>
              </div>
            ))}
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