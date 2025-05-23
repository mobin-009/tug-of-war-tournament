import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase";

export default function Bracket() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "matches"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      setMatches(data);
    });

    return () => unsubscribe();
  }, []);

  const renderMatches = (round) =>
    matches
      .filter((m) => m.round === round)
      .map((match, i) => (
        <div key={i} style={matchBoxStyle}>
          <strong>{match.teamA}</strong> vs {match.teamB}<br />
          🏅 Winner: <strong style={{ color: "#4caf50" }}>{match.winner || "TBD"}</strong><br />
          🕒 {match.time}
        </div>
      ));

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px", textAlign: "center" }}>
      <h2 style={{ textAlign: "left" }}>Quarterfinals</h2>
      <div style={gridStyle}>{renderMatches("quarterfinal")}</div>

      <h2 style={{ textAlign: "left" }}>Semifinals</h2>
      <div style={gridStyle}>{renderMatches("semifinal")}</div>

      <h2 style={{ textAlign: "left" }}>Final</h2>
      <div style={gridStyle}>{renderMatches("final")}</div>
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
  marginBottom: "30px"
};

const matchBoxStyle = {
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "12px",
  backgroundColor: "#f9f9f9",
  textAlign: "left",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
};
