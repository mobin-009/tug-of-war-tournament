import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Pools() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "teams"), (snapshot) => {
      const teamList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeams(teamList);
    });

    return () => unsubscribe();
  }, []);

  const grouped = teams.reduce((acc, team) => {
    const pool = team.pool || "Unassigned";
    acc[pool] = acc[pool] || [];
    acc[pool].push(team.name);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px", textAlign: "center" }}>
      <h2>Pools</h2>
      {Object.entries(grouped).map(([poolName, teamList]) => (
        <div key={poolName} style={{ marginBottom: "30px", textAlign: "left" }}>
          <h3 style={{ borderBottom: "2px solid #ddd", paddingBottom: "4px" }}>
            Pool {poolName}
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px"
            }}
          >
            {teamList.map((team, idx) => (
              <div key={idx} style={cardStyle}>
                {team}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const cardStyle = {
  padding: "14px",
  backgroundColor: "#f4f4f4",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
};
