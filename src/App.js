import { useState, useEffect, useRef } from "react";

const VALID_CODES = ["WINTERMX01", "WINTERMX02", "WINTERMX03"];

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

const SAMPLE_PROGRESS = [
  { date: "Sem 1", peso: 60 },
  { date: "Sem 2", peso: 65 },
  { date: "Sem 3", peso: 70 },
  { date: "Sem 4", peso: 72 },
  { date: "Sem 5", peso: 75 },
  { date: "Sem 6", peso: 80 },
];

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [activeExercise, setActiveExercise] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedWorkouts, setCompletedWorkouts] = useState(3);
  const [streak, setStreak] = useState(5);
  const [weights, setWeights] = useState({});
  const intervalRef = useRef(null);

  const currentLevel = LEVELS.slice().reverse().find(l => completedWorkouts >= l.minWorkouts) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.minWorkouts > completedWorkouts);
  const progressToNext = nextLevel
    ? Math.round(((completedWorkouts - currentLevel.minWorkouts) / (nextLevel.minWorkouts - currentLevel.minWorkouts)) * 100)
    : 100;

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

  const handleAccess = () => {
    if (VALID_CODES.includes(code.toUpperCase())) {
      setScreen("app");
    } else {
      setError("Código inválido. Verifica tu compra.");
    }
  };

  const startTimer = (secs) => { setTimerSeconds(secs); setTimerRunning(true); };
  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const levelRoutines = ROUTINES.filter(r => r.level === currentLevel.id);

  const cardStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(126,200,227,0.15)", borderRadius: 16, padding: 20, marginBottom: 16 };

  if (screen === "splash") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a0a0f 0%, #0d1b2a 50%, #0a0a0f 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", color: "#fff", padding: 24 }}>
      <div style={{ fontSize: 64, marginBottom: 8 }}>❄️</div>
      <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: 2, textAlign: "center", background: "linear-gradient(90deg, #7ec8e3, #ffffff, #a8d8ea)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>WINTER ARC</div>
      <div style={{ fontSize: 16, letterSpacing: 6, color: "#7ec8e3", marginBottom: 48, fontWeight: 700 }}>MX</div>
      <div style={{ color: "#8899aa", fontSize: 14, textAlign: "center", marginBottom: 48, maxWidth: 280, lineHeight: 1.6 }}>La temporada más fría trae la versión más fuerte de ti.</div>
      <button onClick={() => setScreen("login")} style={{ background: "linear-gradient(135deg, #1a3a5c, #2563a8)", border: "1px solid #3a7bd5", color: "#fff", padding: "16px 48px", borderRadius: 50, fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>COMENZAR ❄️</button>
    </div>
  );

  if (screen === "login") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a0a0f, #0d1b2a)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", color: "#fff", padding: 24 }}>
      <div style={{ fontSize: 48 }}>🔐</div>
      <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, letterSpacing: 2 }}>ACCESO</div>
      <div style={{ color: "#7ec8e3", marginBottom: 32, fontSize: 13, textAlign: "center" }}>Ingresa tu código de acceso para comenzar tu Winter Arc</div>
      <input
        value={code} onChange={e => { setCode(e.target.value); setError(""); }}
        placeholder="Ej: WINTERMX01"
        style={{ background: "#111827", border: "1px solid #1e3a5f", color: "#fff", padding: "14px 20px", borderRadius: 12, fontSize: 16, width: "100%", maxWidth: 300, marginBottom: 12, textAlign: "center", letterSpacing: 2, outline: "none", boxSizing: "border-box" }}
      />
      {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{error}</div>}
      <button onClick={handleAccess} style={{ background: "linear-gradient(135deg, #1a3a5c, #2563a8)", border: "none", color: "#fff", padding: "14px 48px", borderRadius: 50, fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", maxWidth: 300 }}>ENTRAR</button>
      <div style={{ marginTop: 24, color: "#445566", fontSize: 12, textAlign: "center" }}>¿No tienes código? Adquiere tu acceso con tu coach.</div>
      <div style={{ marginTop: 12, color: "#334455", fontSize: 11 }}>Demo: usa WINTERMX01</div>
    </div>
  );

  const tabs = [
    { id: "home", icon: "🏠", label: "Inicio" },
    { id: "routines", icon: "💪", label: "Rutinas" },
    { id: "progress", icon: "📈", label: "Progreso" },
    { id: "profile", icon: "👤", label: "Perfil" },
  ];

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
              <input
                type="number" placeholder="kg"
                value={weights[`${ex.name}-${i}`] || ""}
                onChange={e => setWeights(w => ({ ...w, [`${ex.name}-${i}`]: e.target.value }))}
                style={{ background: "#111827", border: "1px solid #1e3a5f", color: "#fff", padding: "8px 12px", borderRadius: 8, width: 70, fontSize: 14, outline: "none" }}
              />
              <span style={{ color: "#556677", fontSize: 12 }}>× {ex.reps}</span>
            </div>
          </div>
        ))}
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#8899aa", marginBottom: 12 }}>⏱ Descanso recomendado: {ex.rest}s</div>
          {timerSeconds > 0 || timerRunning ? (
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, color: timerSeconds < 10 ? "#ef4444" : "#7ec8e3" }}>{formatTime(timerSeconds)}</div>
              <button onClick={() => { setTimerRunning(false); setTimerSeconds(0); }} style={{ marginTop: 12, background: "none", border: "1px solid #334455", color: "#8899aa", padding: "8px 20px", borderRadius: 20, cursor: "pointer", fontSize: 13 }}>Cancelar</button>
            </div>
          ) : (
            <button onClick={() => startTimer(ex.rest)} style={{ background: "linear-gradient(135deg, #1a3a5c, #2563a8)", border: "none", color: "#fff", padding: "12px 32px", borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Iniciar Descanso ⏱</button>
          )}
        </div>
      </div>
    );
  }

  if (selectedRoutine) {
    return (
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
        <button onClick={() => { setCompletedWorkouts(c => c + 1); setSelectedRoutine(null); setActiveTab("home"); }} style={{ width: "100%", background: "linear-gradient(135deg, #1a3a5c, #2563a8)", border: "none", color: "#fff", padding: "16px", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>
          ✅ Marcar como Completado
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "'Segoe UI', sans-serif", maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>
      <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: "#556677", letterSpacing: 2, fontWeight: 700 }}>WINTER ARC MX</div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>❄️ Bienvenido</div>
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
              {[
                { label: "Entrenos Totales", value: completedWorkouts, icon: "💪" },
                { label: "Racha Actual", value: `${streak} días`, icon: "🔥" },
              ].map((s, i) => (
                <div key={i} style={{ ...cardStyle, margin: 0, textAlign: "center" }}>
                  <div style={{ fontSize: 28 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#8899aa" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ ...cardStyle }}>
              <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 12 }}>HOY TE TOCA</div>
              {levelRoutines[0] && (
                <div onClick={() => setSelectedRoutine(levelRoutines[0])} style={{ cursor: "pointer" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{levelRoutines[0].name}</div>
                  <div style={{ color: "#8899aa", fontSize: 13, marginBottom: 16 }}>{levelRoutines[0].exercises.length} ejercicios · ~45 min</div>
                  <button style={{ background: "linear-gradient(135deg, #1a3a5c, #2563a8)", border: "none", color: "#fff", padding: "12px 24px", borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                    Iniciar Entrenamiento ❄️
                  </button>
                </div>
              )}
            </div>
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
            <div style={{ ...cardStyle }}>
              <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 16 }}>PESO EN PRESS DE BANCA (kg)</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
                {SAMPLE_PROGRESS.map((d, i) => {
                  const max = Math.max(...SAMPLE_PROGRESS.map(x => x.peso));
                  const h = (d.peso / max) * 100;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 10, color: "#7ec8e3" }}>{d.peso}</div>
                      <div style={{ width: "100%", background: "linear-gradient(0deg, #1a3a5c, #7ec8e3)", borderRadius: "4px 4px 0 0", height: `${h}%`, minHeight: 4 }} />
                      <div style={{ fontSize: 9, color: "#556677" }}>{d.date}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { label: "Entrenos", value: completedWorkouts },
                { label: "Nivel", value: currentLevel.id },
                { label: "Racha", value: `${streak}d` },
              ].map((s, i) => (
                <div key={i} style={{ ...cardStyle, margin: 0, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#7ec8e3" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#8899aa" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div style={{ marginTop: 24 }}>
            <div style={{ ...cardStyle, textAlign: "center" }}>
              <div style={{ fontSize: 64, marginBottom: 8 }}>👤</div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>Tu Perfil</div>
              <div style={{ color: "#7ec8e3", fontSize: 14, marginTop: 4 }}>{currentLevel.icon} {currentLevel.name}</div>
            </div>
            <div style={{ fontSize: 13, color: "#7ec8e3", fontWeight: 700, marginBottom: 12 }}>TUS LOGROS</div>
            {LEVELS.map(l => (
              <div key={l.id} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16, opacity: completedWorkouts >= l.minWorkouts ? 1 : 0.3 }}>
                <div style={{ fontSize: 32 }}>{l.icon}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{l.name}</div>
                  <div style={{ color: "#8899aa", fontSize: 12 }}>{l.minWorkouts} entrenos completados</div>
                </div>
                {completedWorkouts >= l.minWorkouts && <div style={{ marginLeft: "auto", color: "#7ec8e3" }}>✓</div>}
              </div>
            ))}
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
