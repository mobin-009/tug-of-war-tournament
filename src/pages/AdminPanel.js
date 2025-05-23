// AdminPanel.js – Final integrated version
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import bcrypt from "bcryptjs";
import {
  collection,
  query,
  getDocs,
  where,
  onSnapshot,
  updateDoc,
  addDoc,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [activeTab, setActiveTab] = useState("rules");
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({});
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [poolCount, setPoolCount] = useState(2);
  const [poolMessage, setPoolMessage] = useState("");
  const [matchGenMessage, setMatchGenMessage] = useState("");
  const [rules, setRules] = useState({ maxPlayers: 7, weightLimit: 600 });
  const [configMessage, setConfigMessage] = useState("");

  const handleLogin = async () => {
    try {
      const q = query(collection(db, "admins"), where("username", "==", inputUsername));
      const snap = await getDocs(q);
      if (snap.empty) return alert("Admin not found");
      const adminData = snap.docs[0].data();
      const isMatch = await bcrypt.compare(inputPassword, adminData.passwordHash);
      if (!isMatch) return alert("Incorrect password");
      setAuthenticated(true);
      localStorage.setItem("isAdmin", "true");
    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed");
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem("isAdmin");
  };

  useEffect(() => {
    if (!authenticated) return;
    const unsubMatches = onSnapshot(collection(db, "matches"), (snap) => setMatches(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))));
    const unsubTeams = onSnapshot(collection(db, "teams"), (snap) => setTeams(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))));
    return () => { unsubMatches(); unsubTeams(); };
  }, [authenticated]);

  const exportMatches = (round) => {
    const filtered = matches.filter((m) => m.round === round);
    const headers = ["Team A", "Team B", "Round", "Pool", "Time", "Winner"];
    const rows = filtered.map((m) => [m.teamA, m.teamB, m.round, m.pool || "", m.time, m.winner || "TBD"]);
    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${round}-matches.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const distributePools = async () => {
    if (poolCount < 1 || poolCount > teams.length) return alert("Invalid pool count");
    const shuffled = [...teams];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const poolLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    await Promise.all(shuffled.map((t, i) => updateDoc(doc(db, "teams", t.id), { pool: poolLetters[i % poolCount] })));
    setPoolMessage(`✅ ${teams.length} teams distributed into ${poolCount} pools.`);
  };

  const generatePoolMatches = async () => {
    const snapshot = await getDocs(collection(db, "teams"));
    const poolGroups = {};
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (!data.pool) return;
      if (!poolGroups[data.pool]) poolGroups[data.pool] = [];
      poolGroups[data.pool].push(data.name);
    });
    const newMatches = [];
    for (const pool in poolGroups) {
      const teamsInPool = poolGroups[pool];
      for (let i = 0; i < teamsInPool.length; i++) {
        for (let j = i + 1; j < teamsInPool.length; j++) {
          newMatches.push({ teamA: teamsInPool[i], teamB: teamsInPool[j], round: "pool", pool, winner: "", time: "" });
        }
      }
    }
    await Promise.all(newMatches.map(m => addDoc(collection(db, "matches"), m)));
    setMatchGenMessage(`✅ ${newMatches.length} pool matches created.`);
  };

  const handleChange = (e, matchId) => {
    setFormData({ ...formData, [matchId]: { ...formData[matchId], [e.target.name]: e.target.value } });
  };

  const saveMatch = async (matchId) => {
    const data = formData[matchId];
    if (!data) return;
    await updateDoc(doc(db, "matches", matchId), data);
    setEditingMatchId(null);
  };

  const handleSaveRules = async (e) => {
    e.preventDefault();
    await setDoc(doc(db, "tournamentConfig", "current"), rules);
    setConfigMessage("✅ Rules saved");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "rules":
        return (
          <div>
            <h3>🏁 Tournament Rules</h3>
            <form onSubmit={handleSaveRules}>
              <label>Max Players <input type="number" value={rules.maxPlayers} onChange={(e) => setRules({ ...rules, maxPlayers: Number(e.target.value) })} style={inputStyle} /></label><br />
              <label>Weight Limit <input type="number" value={rules.weightLimit} onChange={(e) => setRules({ ...rules, weightLimit: Number(e.target.value) })} style={inputStyle} /></label><br />
              <button type="submit" style={primaryBtn}>💾 Save</button>
            </form>
            {configMessage && <p>{configMessage}</p>}
          </div>
        );
      case "teams":
        return (
          <div>
            <h3>📊 Team Pools</h3>
            <label>Pools: <input type="number" value={poolCount} onChange={(e) => setPoolCount(Number(e.target.value))} style={inputStyle} /></label>
            <button onClick={distributePools} style={primaryBtn}>Distribute</button>
            {poolMessage && <p>{poolMessage}</p>}
          </div>
        );
      case "matches":
        return (
          <div>
            <h3>🧩 Match Generator</h3>
            <button onClick={generatePoolMatches} style={primaryBtn}>Generate Pool Matches</button>
            {matchGenMessage && <p>{matchGenMessage}</p>}
          </div>
        );
      case "results":
        return (
          <div>
            <h3>✏️ Edit Results</h3>
            {matches.map((m) => (
              <div key={m.id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 10 }}>
                <p>{m.teamA} vs {m.teamB}</p>
                {editingMatchId === m.id ? (
                  <>
                    <input name="time" value={formData[m.id]?.time || m.time || ""} onChange={(e) => handleChange(e, m.id)} style={inputStyle} />
                    <select name="winner" value={formData[m.id]?.winner || m.winner || ""} onChange={(e) => handleChange(e, m.id)} style={inputStyle}>
                      <option value="">Select Winner</option>
                      <option value={m.teamA}>{m.teamA}</option>
                      <option value={m.teamB}>{m.teamB}</option>
                    </select>
                    <button onClick={() => saveMatch(m.id)} style={primaryBtn}>Save</button>
                  </>
                ) : (
                  <>
                    <p>Winner: {m.winner || "TBD"}</p>
                    <p>Time: {m.time || "TBD"}</p>
                    <button onClick={() => setEditingMatchId(m.id)} style={primaryBtn}>Edit</button>
                  </>
                )}
              </div>
            ))}
          </div>
        );
      case "export":
        return (
          <div>
            <h3>📥 Export Match Data</h3>
            <button onClick={() => exportMatches("pool")} style={exportBtn}>⬇️ Export Pool Matches</button>
            <button onClick={() => exportMatches("quarterfinal")} style={exportBtn}>⬇️ Export Quarterfinals</button>
            <button onClick={() => exportMatches("semifinal")} style={exportBtn}>⬇️ Export Semifinals</button>
            <button onClick={() => exportMatches("final")} style={exportBtn}>⬇️ Export Final</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: 20 }}>
      {!authenticated ? (
        <div style={{ textAlign: "center" }}>
          <h2>Admin Login</h2>
          <input type="text" placeholder="Username" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} style={inputStyle} />
          <button onClick={handleLogin} style={primaryBtn}>🔐 Login</button>
        </div>
      ) : (
        <>
          <h2>🛠 Admin Panel</h2>
          <button onClick={handleLogout} style={dangerBtn}>🚪 Logout</button>
          <div style={{ margin: "20px 0" }}>
            <button onClick={() => setActiveTab("rules")} style={activeTab === "rules" ? activeBtn : tabBtn}>🏁 Rules</button>
            <button onClick={() => setActiveTab("teams")} style={activeTab === "teams" ? activeBtn : tabBtn}>📊 Teams</button>
            <button onClick={() => setActiveTab("matches")} style={activeTab === "matches" ? activeBtn : tabBtn}>🧩 Matches</button>
            <button onClick={() => setActiveTab("results")} style={activeTab === "results" ? activeBtn : tabBtn}>✏️ Results</button>
            <button onClick={() => setActiveTab("export")} style={activeTab === "export" ? activeBtn : tabBtn}>📥 Export</button>
          </div>
          {renderTab()}
        </>
      )}
    </div>
  );
}

const inputStyle = { padding: "8px", width: "100%", margin: "6px 0" };
const primaryBtn = { padding: "8px 16px", background: "#007bff", color: "#fff", border: "none", borderRadius: "4px" };
const dangerBtn = { ...primaryBtn, background: "#dc3545" };
const tabBtn = { ...primaryBtn, background: "#6c757d", marginRight: "10px" };
const activeBtn = { ...primaryBtn, background: "#343a40", marginRight: "10px" };
const exportBtn = { ...primaryBtn, background: "#17a2b8", marginRight: "10px", marginTop: "10px" };
