import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Phone,
  MessageCircle,
  Calendar,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const leadsData = [
  {
    id: 1,
    name: 'María González',
    company: 'Tech Solutions',
    email: 'maria@techsolutions.com',
    phone: '+1234567890',
    stage: 'prospecto',
    priority: 'high',
    lastContact: '2024-01-15',
    source: 'Website'
  },
  {
    id: 2,
    name: 'Carlos Ruiz',
    company: 'Marketing Pro',
    email: 'carlos@marketingpro.com',
    phone: '+1234567891',
    stage: 'contactado',
    priority: 'medium',
    lastContact: '2024-01-14',
    source: 'Referido'
  },
  {
    id: 3,
    name: 'Ana López',
    company: 'Design Studio',
    email: 'ana@designstudio.com',
    phone: '+1234567892',
    stage: 'calificado',
    priority: 'high',
    lastContact: '2024-01-13',
    source: 'LinkedIn'
  },
  {
    id: 4,
    name: 'Pedro Martín',
    company: 'Consulting Group',
    email: 'pedro@consulting.com',
    phone: '+1234567893',
    stage: 'propuesta',
    priority: 'high',
    lastContact: '2024-01-12',
    source: 'Cold Email'
  },
  {
    id: 5,
    name: 'Laura Sánchez',
    company: 'E-commerce Plus',
    email: 'laura@ecommerce.com',
    phone: '+1234567894',
    stage: 'cerrado',
    priority: 'medium',
    lastContact: '2024-01-11',
    source: 'Website'
  }
]

const stages = [
  { id: 'prospecto', name: 'Prospecto', color: 'bg-gray-100' },
  { id: 'contactado', name: 'Contactado', color: 'bg-blue-100' },
  { id: 'calificado', name: 'Calificado', color: 'bg-yellow-100' },
  { id: 'propuesta', name: 'Propuesta', color: 'bg-orange-100' },
  { id: 'cerrado', name: 'Cerrado', color: 'bg-green-100' }
]

export function Leads() {
  const [leads, setLeads] = useState(leadsData)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState('kanban')

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStageColor = (stage) => {
    const stageObj = stages.find(s => s.id === stage)
    return stageObj ? stageObj.color : 'bg-gray-100'
  }

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const LeadCard = ({ lead }) => (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-sm">{lead.name}</h4>
            <p className="text-xs text-muted-foreground">{lead.company}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Phone className="mr-2 h-4 w-4" />
                Llamar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="mr-2 h-4 w-4" />
                Programar Cita
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-2">
          <Badge className={getPriorityColor(lead.priority)}>
            {lead.priority === 'high' ? 'Alta' : lead.priority === 'medium' ? 'Media' : 'Baja'}
          </Badge>
          <p className="text-xs text-muted-foreground">
            Último contacto: {lead.lastContact}
          </p>
          <p className="text-xs text-muted-foreground">
            Fuente: {lead.source}
          </p>
        </div>

        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" className="flex-1">
            <MessageCircle size={14} className="mr-1" />
            Chat
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Calendar size={14} className="mr-1" />
            Cita
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const KanbanView = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {stages.map(stage => (
        <div key={stage.id} className={`${stage.color} rounded-lg p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{stage.name}</h3>
            <Badge variant="secondary">
              {filteredLeads.filter(lead => lead.stage === stage.id).length}
            </Badge>
          </div>
          <div className="space-y-3">
            {filteredLeads
              .filter(lead => lead.stage === stage.id)
              .map(lead => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
          </div>
        </div>
      ))}
    </div>
  )

  const TableView = () => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-medium">Nombre</th>
                <th className="text-left p-4 font-medium">Empresa</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Etapa</th>
                <th className="text-left p-4 font-medium">Prioridad</th>
                <th className="text-left p-4 font-medium">Último Contacto</th>
                <th className="text-left p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">{lead.name}</td>
                  <td className="p-4">{lead.company}</td>
                  <td className="p-4 text-sm text-muted-foreground">{lead.email}</td>
                  <td className="p-4">
                    <Badge className={getStageColor(lead.stage)}>
                      {stages.find(s => s.id === lead.stage)?.name}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge className={getPriorityColor(lead.priority)}>
                      {lead.priority === 'high' ? 'Alta' : lead.priority === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm">{lead.lastContact}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageCircle size={14} />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar size={14} />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Leads</h1>
          <p className="text-muted-foreground">Administra y da seguimiento a tus leads</p>
        </div>
        <Button className="bg-red-500 hover:bg-red-600">
          <Plus size={16} className="mr-2" />
          Nuevo Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Buscar leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter size={16} className="mr-2" />
          Filtros
        </Button>
      </div>

      {/* Views */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList>
          <TabsTrigger value="kanban">Vista Kanban</TabsTrigger>
          <TabsTrigger value="table">Vista Tabla</TabsTrigger>
        </TabsList>
        
        <TabsContent value="kanban" className="mt-6">
          <KanbanView />
        </TabsContent>
        
        <TabsContent value="table" className="mt-6">
          <TableView />
        </TabsContent>
      </Tabs>
    </div>
  )
}

