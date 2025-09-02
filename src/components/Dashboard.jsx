import { useState } from 'react'
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const kpiData = [
  {
    title: 'Leads Nuevos',
    value: '24',
    change: '+12%',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    title: 'Citas Programadas',
    value: '8',
    change: '+5%',
    icon: Calendar,
    color: 'text-green-600'
  },
  {
    title: 'Mensajes Enviados',
    value: '156',
    change: '+23%',
    icon: MessageSquare,
    color: 'text-purple-600'
  },
  {
    title: 'Conversiones',
    value: '12',
    change: '+8%',
    icon: TrendingUp,
    color: 'text-red-600'
  }
]

const recentActivity = [
  {
    id: 1,
    type: 'lead',
    message: 'Nuevo lead: María González',
    time: 'Hace 5 min',
    status: 'new'
  },
  {
    id: 2,
    type: 'message',
    message: 'Mensaje enviado a Carlos Ruiz',
    time: 'Hace 12 min',
    status: 'sent'
  },
  {
    id: 3,
    type: 'appointment',
    message: 'Cita programada con Ana López',
    time: 'Hace 25 min',
    status: 'scheduled'
  },
  {
    id: 4,
    type: 'task',
    message: 'Tarea completada: Seguimiento cliente',
    time: 'Hace 1 hora',
    status: 'completed'
  }
]

const todayTasks = [
  {
    id: 1,
    title: 'Llamar a lead caliente',
    priority: 'high',
    completed: false
  },
  {
    id: 2,
    title: 'Enviar propuesta a cliente',
    priority: 'medium',
    completed: false
  },
  {
    id: 3,
    title: 'Revisar métricas semanales',
    priority: 'low',
    completed: true
  },
  {
    id: 4,
    title: 'Actualizar base de datos',
    priority: 'medium',
    completed: false
  }
]

const pipelineData = [
  { stage: 'Prospecto', count: 45, color: 'bg-gray-400' },
  { stage: 'Contactado', count: 32, color: 'bg-blue-400' },
  { stage: 'Calificado', count: 18, color: 'bg-yellow-400' },
  { stage: 'Propuesta', count: 12, color: 'bg-orange-400' },
  { stage: 'Cerrado', count: 8, color: 'bg-green-400' }
]

export function Dashboard() {
  const [tasks, setTasks] = useState(todayTasks)

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </p>
                    <p className="text-3xl font-bold">{kpi.value}</p>
                    <p className="text-sm text-green-600 font-medium">
                      {kpi.change} vs mes anterior
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 ${kpi.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline de Ventas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              Embudo de Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineData.map((stage, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${stage.color}`}></div>
                    <span className="font-medium">{stage.stage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{stage.count}</span>
                    <span className="text-sm text-muted-foreground">leads</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mis Tareas Hoy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              Mis Tareas Hoy
            </div>
            <Button size="sm" className="bg-red-500 hover:bg-red-600">
              <Plus size={16} className="mr-2" />
              Nueva Tarea
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <div className="flex-1">
                  <span className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </span>
                </div>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

