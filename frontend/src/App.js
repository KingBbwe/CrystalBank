import React, { useState } from "react";
import GMPortal from "./components/GMPortal";
import PlayerDashboard from "./components/PlayerDashboard";
import "./App.css"; // Optional: Add custom styles if needed

function App() {
    const [view, setView] = useState("player"); // Switch between "player" and "gm"

    const handleViewChange = (view) => {
        setView(view);
    };

    return (
        <div className="app-container">
            <header>
                <h1>The Crystal Bank</h1>
                <nav>
                    <button onClick={() => handleViewChange("player")}>Player Dashboard</button>
                    <button onClick={() => handleViewChange("gm")}>GM Portal</button>
                </nav>
            </header>
            <main>
                {view === "player" ? <PlayerDashboard /> : <GMPortal />}
            </main>
            <footer>
                <p>&copy; 2024 The Chronicles of Auld Ewe</p>
            </footer>
        </div>
    );
}

export default App;
