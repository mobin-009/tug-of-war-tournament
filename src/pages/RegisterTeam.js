// RegisterTeam.js – Form with Player Details and Top 7 Selection
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";

export default function RegisterTeam() {
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState([{ name: "", age: "", weight: "", selected: false }]);
  const [tournamentRules, setTournamentRules] = useState({ maxPlayers: 7, weightLimit: 600 });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchRules = async () => {
      const configSnap = await getDoc(doc(db, "tournamentConfig", "current"));
      if (configSnap.exists()) setTournamentRules(configSnap.data());
    };
    fetchRules();
  }, []);

  const handlePlayerChange = (index, field, value) => {
    const updated = [...players];
    updated[index][field] = value;
    setPlayers(updated);
  };

  const addPlayer = () => {
    setPlayers([...players, { name: "", age: "", weight: "", selected: false }]);
  };

  const toggleSelected = (index) => {
    const updated = [...players];
    updated[index].selected = !updated[index].selected;
    setPlayers(updated);
  };

  const selectedPlayers = players.filter(p => p.selected);
  const totalWeight = selectedPlayers.reduce((sum, p) => sum + Number(p.weight || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName) return alert("Team name is required.");
    if (selectedPlayers.length !== tournamentRules.maxPlayers) return alert(`Please select exactly ${tournamentRules.maxPlayers} players.`);
    if (totalWeight > tournamentRules.weightLimit) return alert("Selected players exceed weight limit.");

    try {
      await addDoc(collection(db, "teams"), {
        name: teamName,
        players,
        selectedPlayers: selectedPlayers.map(p => ({ name: p.name, weight: p.weight }))
      });
      setMessage("✅ Team registered successfully!");
      setTeamName("");
      setPlayers([{ name: "", age: "", weight: "", selected: false }]);
    } catch (err) {
      console.error("Registration error:", err);
      alert("Failed to register team");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h2>Register Your Team</h2>
      <form onSubmit={handleSubmit}>
        <label>Team Name:
          <input value={teamName} onChange={e => setTeamName(e.target.value)} style={inputStyle} />
        </label>
        <br /><br />
        <h4>Players</h4>
        {players.map((p, idx) => (
          <div key={idx} style={playerCard}>
            <input placeholder="Name" value={p.name} onChange={(e) => handlePlayerChange(idx, "name", e.target.value)} style={inputStyle} />
            <input type="number" placeholder="Age" value={p.age} onChange={(e) => handlePlayerChange(idx, "age", e.target.value)} style={inputStyle} />
            <input type="number" placeholder="Weight (kg)" value={p.weight} onChange={(e) => handlePlayerChange(idx, "weight", e.target.value)} style={inputStyle} />
            <label>
              <input type="checkbox" checked={p.selected} onChange={() => toggleSelected(idx)} /> Top 7
            </label>
          </div>
        ))}
        <button type="button" onClick={addPlayer} style={secondaryBtn}>➕ Add Player</button>
        <p><strong>Selected Players:</strong> {selectedPlayers.length} / {tournamentRules.maxPlayers}</p>
        <p><strong>Total Weight:</strong> {totalWeight} kg / {tournamentRules.weightLimit} kg</p>
        <br />
        <button type="submit" style={primaryBtn}>📨 Submit Team</button>
        {message && <p style={{ color: "green" }}>{message}</p>}
      </form>
    </div>
  );
}

const inputStyle = { marginRight: 10, padding: 6, marginBottom: 10 };
const playerCard = { marginBottom: 12, padding: 10, border: "1px solid #ccc", borderRadius: 6 };
const primaryBtn = { padding: "8px 16px", background: "#28a745", color: "white", border: "none", borderRadius: "4px" };
const secondaryBtn = { padding: "6px 12px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", marginTop: 10 };
