import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { Leads } from './components/Leads'
import { WhatsAppDirect } from './components/WhatsAppDirect'
import { ChatwootAPI } from './components/ChatwootAPI'
import './App.css'

function App() {
  const [activeModule, setActiveModule] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // Aplicar tema oscuro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />
      case 'leads':
        return <Leads />
      case 'whatsapp':
        return <WhatsAppDirect />
      case 'chatwoot':
        return <ChatwootAPI />
      case 'calendar':
        return (
          <div className="p-6">
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-4">Calendario y Tareas</h2>
              <p className="text-muted-foreground">Módulo en desarrollo - Integración con Cal.com</p>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="p-6">
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-4">Configuración</h2>
              <p className="text-muted-foreground">Panel de configuración - Solo para Admin de Cliente</p>
            </div>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          activeModule={activeModule}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  )
}

export default App

