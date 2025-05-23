// Home.js – Match Summary with Banner
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import banner from "../images/tug-of-war-banner.png"; // Make sure this path matches your project

export default function Home() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "matches"), (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMatches(data);
    });
    return () => unsub();
  }, []);

  const now = new Date();

  const formatTime = (time) => {
    if (!time) return "TBD";
    const t = new Date(time);
    return t.toLocaleString();
  };

  const categorized = {
    upcoming: [],
    live: [],
    completed: []
  };

  matches.forEach((m) => {
    const matchTime = m.time ? new Date(m.time) : null;
    const isCompleted = !!m.winner;

    if (isCompleted) {
      categorized.completed.push(m);
    } else if (matchTime && matchTime <= now && now - matchTime < 3600000) {
      categorized.live.push(m);
    } else {
      categorized.upcoming.push(m);
    }
  });

  const renderMatches = (list) => (
    <div style={gridStyle}>
      {list.map((m) => (
        <div key={m.id} style={cardStyle}>
          <h4>{m.teamA} vs {m.teamB}</h4>
          <p><strong>Time:</strong> {formatTime(m.time)}</p>
          {m.winner && <p><strong>Winner:</strong> {m.winner}</p>}
          {!m.winner && <p><strong>Winner:</strong> TBD</p>}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
      <img src={banner} alt="Tug of War" style={{ width: "100%", borderRadius: "10px", marginBottom: 20 }} />
      <h2 style={{ textAlign: "center" }}>🏆 Match Summary</h2>

      <section>
        <h3>🟢 Upcoming Matches</h3>
        {categorized.upcoming.length > 0 ? renderMatches(categorized.upcoming) : <p>No upcoming matches.</p>}
      </section>

      <section>
        <h3>🟡 Live Matches</h3>
        {categorized.live.length > 0 ? renderMatches(categorized.live) : <p>No live matches at the moment.</p>}
      </section>

      <section>
        <h3>✅ Completed Matches</h3>
        {categorized.completed.length > 0 ? renderMatches(categorized.completed) : <p>No matches completed yet.</p>}
      </section>
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "16px",
  marginTop: "10px",
  marginBottom: "30px"
};

const cardStyle = {
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "16px",
  backgroundColor: "#fff"
};
