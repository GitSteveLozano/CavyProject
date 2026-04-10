import { useState, useEffect } from 'react'
import { TH } from './lib/theme'
import { PROJECTS } from './lib/data'
import { Sidebar, MobileHeader } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { ProjectDetail } from './components/ProjectDetail'
import { NewTakeoff } from './components/NewTakeoff'
import { TimeTracking } from './components/TimeTracking'
import { Settings } from './components/Settings'

export default function App() {
  // If returning from QBO OAuth redirect, land on Settings
  const qboParam = new URLSearchParams(window.location.search).get('qbo')
  const [view, setView]             = useState(qboParam ? "settings" : "dashboard")
  const [selectedProject, setProj]  = useState(null)
  const [sidebarOpen, setSidebar]   = useState(false)

  useEffect(() => {
    if (qboParam) {
      setView("settings")
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = (v) => { setView(v); setProj(null) }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: TH.bg, color: TH.text, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Sidebar
        current={view === "project" ? "dashboard" : view}
        onChange={navigate}
        open={sidebarOpen}
        onClose={() => setSidebar(false)}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <MobileHeader onToggle={() => setSidebar(o => !o)} />
        <main style={{ flex: 1, overflowY: "auto" }}>
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
          {view === "settings" && <Settings />}
        </main>
      </div>
    </div>
  )
}
