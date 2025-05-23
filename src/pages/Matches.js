import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Matches() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "matches"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMatches(data);
    });

    return () => unsubscribe();
  }, []);

  const renderMatches = (roundName) => {
    return matches
      .filter(match => match.round === roundName)
      .map((match, idx) => (
        <div key={idx} style={matchCardStyle}>
          <h3>{match.teamA} vs {match.teamB}</h3>
          <p><strong>Time:</strong> {match.time}</p>
          <p><strong>Winner:</strong> {match.winner || "TBD"}</p>
        </div>
      ));
  };

  const uniqueRounds = [...new Set(matches.map(m => m.round))];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px", textAlign: "center" }}>
      <h2>Match Schedule & Results</h2>
      {uniqueRounds.map((round, i) => (
        <div key={i} style={{ marginBottom: "30px" }}>
          <h3>{round.charAt(0).toUpperCase() + round.slice(1)}</h3>
          <div style={gridStyle}>{renderMatches(round)}</div>
        </div>
      ))}
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px"
};

const matchCardStyle = {
  border: "1px solid #ccc",
  borderRadius: "10px",
  padding: "16px",
  backgroundColor: "#f9f9f9",
  textAlign: "left",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
};
