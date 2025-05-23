import React from "react";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import AdminPanel from "./pages/AdminPanel";
import Home from "./pages/Home";
import RegisterTeam from "./pages/RegisterTeam";
import Pools from "./pages/Pools";
import Matches from "./pages/Matches";
import Bracket from "./pages/Bracket";

function App() {
  return (
    <Router>
      <div className="p-4 max-w-4xl mx-auto">
      <h1 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
  Tug of War Tournament
</h1>
<nav style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
  <Link to="/">Home</Link>
  <Link to="/register">Register Team</Link>
  <Link to="/pools">Pools</Link>
  <Link to="/matches">Matches</Link>
  <Link to="/bracket">Bracket</Link>
  <Link to="/admin" style={{ color: "red", fontWeight: "bold" }}>Admin</Link> {/* 👈 New link */}
</nav>
<Switch>
          <Route exact path="/" component={Home} />
          <Route path="/register" component={RegisterTeam} />
          <Route path="/pools" component={Pools} />
          <Route path="/matches" component={Matches} />
          <Route path="/bracket" component={Bracket} />
          <Route path="/admin" component={AdminPanel} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
