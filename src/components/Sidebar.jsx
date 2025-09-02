import { useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Users, label: 'Leads', id: 'leads' },
  { icon: MessageSquare, label: 'Chatwoot', id: 'chatwoot' },
  { icon: Calendar, label: 'Calendario', id: 'calendar' },
  { icon: Settings, label: 'Configuración', id: 'settings' },
]

export function Sidebar({ activeModule, onModuleChange, collapsed, onToggleCollapse }) {
  return (
    <div className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    } flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-xl font-bold text-red-500">MetaMAQ</h1>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeModule === item.id
            
            return (
              <li key={item.id}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  } ${collapsed ? 'px-2' : 'px-3'}`}
                  onClick={() => onModuleChange(item.id)}
                >
                  <Icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

