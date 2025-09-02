import { useState } from 'react'
import { 
  Search, 
  Bell, 
  User, 
  Sun, 
  Moon,
  ChevronDown,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const moduleNames = {
  dashboard: 'Dashboard',
  leads: 'Gestión de Leads',
  whatsapp: 'WhatsApp Chat Center',
  calendar: 'Calendario y Tareas',
  settings: 'Configuración'
}

export function Header({ activeModule, darkMode, onToggleDarkMode }) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
      {/* Module Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-semibold text-foreground">
          {moduleNames[activeModule] || 'MetaMAQ Hub'}
        </h2>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium">Admin</span>
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onToggleDarkMode}>
              {darkMode ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Modo Oscuro</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

