import { useState } from 'react'
import { TH } from './lib/theme'
import { PROJECTS } from './lib/data'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { ProjectDetail } from './components/ProjectDetail'
import { NewTakeoff } from './components/NewTakeoff'
import { TimeTracking } from './components/TimeTracking'

export default function App() {
  const [view, setView]             = useState("dashboard")
  const [selectedProject, setProj]  = useState(null)

  const navigate = (v) => { setView(v); setProj(null) }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: TH.bg, color: TH.text, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Sidebar current={view === "project" ? "dashboard" : view} onChange={navigate} />
      <main style={{ flex: 1, overflowY: "auto", minHeight: "100vh" }}>
        {view === "dashboard" && (
          <Dashboard
            projects={PROJECTS}
            onSelect={p => { setProj(p); setView("project") }}
            onNewTakeoff={() => setView("takeoff")}
          />
        )}
        {view === "project" && selectedProject && (
          <ProjectDetail project={selectedProject} onBack={() => navigate("dashboard")} />
        )}
        {view === "takeoff" && <NewTakeoff onBack={() => navigate("dashboard")} />}
        {view === "time" && <TimeTracking />}
      </main>
    </div>
  )
}
