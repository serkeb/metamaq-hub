import { useState } from 'react'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Search,
  Phone,
  Video,
  MoreVertical,
  User,
  Wifi,
  WifiOff,
  QrCode,
  RefreshCw,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWhatsAppDirect } from '../hooks/useWhatsAppDirect'

export function WhatsAppDirect() {
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const {
    isConnected,
    instanceStatus,
    chats,
    selectedChat,
    chatMessages,
    loading,
    checkInstanceStatus,
    logoutInstance,
    refreshChats,
    sendMessage,
    selectChat
  } = useWhatsAppDirect()

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedChat) {
      try {
        await sendMessage(selectedChat.phone_number, messageText)
        setMessageText('')
      } catch (error) {
        console.error('Error sending message:', error)
        alert('Error al enviar mensaje')
      }
    }
  }

  const handleLogout = async () => {
    if (confirm('¿Estás seguro de que quieres desconectar WhatsApp?')) {
      await logoutInstance()
    }
  }

  const filteredChats = chats.filter(chat =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.phone_number?.includes(searchQuery)
  )

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = () => {
    switch (instanceStatus) {
      case 'connected':
        return <CheckCircle className="text-green-500" size={16} />
      case 'disconnected':
        return <XCircle className="text-red-500" size={16} />
      default:
        return <AlertCircle className="text-yellow-500" size={16} />
    }
  }

  const getStatusText = () => {
    switch (instanceStatus) {
      case 'connected':
        return 'WhatsApp conectado'
      case 'disconnected':
        return 'WhatsApp desconectado'
      default:
        return 'Estado desconocido'
    }
  }

  return (
    <div className="p-6">
      {/* Header con estado de conexión */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="text-green-500" size={16} />
              <span className="text-sm text-green-600">Conectado en tiempo real</span>
            </>
          ) : (
            <>
              <WifiOff className="text-red-500" size={16} />
              <span className="text-sm text-red-600">Desconectado</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm">{getStatusText()}</span>
        </div>
      </div>

      {/* Panel de control de WhatsApp */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode size={20} />
            Control de WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={checkInstanceStatus}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Verificar Estado
            </Button>
            
            <Button 
              onClick={refreshChats}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualizar Chats
            </Button>
            
            {instanceStatus === 'connected' && (
              <Button 
                onClick={handleLogout}
                disabled={loading}
                variant="destructive"
              >
                <LogOut size={16} />
                Desconectar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interfaz de chat principal */}
      {instanceStatus === 'connected' ? (
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-300px)]">
          {/* Panel Izquierdo - Lista de Chats */}
          <div className="col-span-3">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Conversaciones</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Buscar conversaciones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {filteredChats.map(chat => (
                    <div
                      key={chat.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 border-b ${
                        selectedChat?.id === chat.id ? 'bg-red-50 border-l-4 border-l-red-500' : ''
                      }`}
                      onClick={() => selectChat(chat)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                            {chat.profile_picture ? (
                              <img 
                                src={chat.profile_picture} 
                                alt={chat.name} 
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User size={16} className="text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">
                              {chat.name || chat.phone_number}
                            </h4>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${chat.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className="text-xs text-muted-foreground">
                                {chat.is_active ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </div>
                        </div>
                        {chat.unread_count > 0 && (
                          <Badge className="bg-red-500 text-white">
                            {chat.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.last_message?.content || 'Sin mensajes'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {chat.last_message_at ? formatTime(chat.last_message_at) : ''}
                      </p>
                    </div>
                  ))}
                  
                  {filteredChats.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <p>No hay conversaciones disponibles</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Central - Conversación */}
          <div className="col-span-6">
            {selectedChat ? (
              <Card className="h-full flex flex-col">
                {/* Header del Chat */}
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                        {selectedChat.profile_picture ? (
                          <img 
                            src={selectedChat.profile_picture} 
                            alt={selectedChat.name} 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User size={16} className="text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {selectedChat.name || selectedChat.phone_number}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedChat.is_active ? 'En línea' : 'Desconectado'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Phone size={16} />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video size={16} />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                          <DropdownMenuItem>Silenciar</DropdownMenuItem>
                          <DropdownMenuItem>Bloquear</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                {/* Mensajes */}
                <CardContent className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {chatMessages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.is_from_me ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.is_from_me
                              ? 'bg-red-500 text-white'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.is_from_me ? 'text-red-100' : 'text-muted-foreground'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {chatMessages.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No hay mensajes en esta conversación</p>
                      </div>
                    )}
                  </div>
                </CardContent>

                {/* Input de Mensaje */}
                <div className="p-4 border-t">
                  <div className="flex items-end gap-2">
                    <Button variant="outline" size="sm">
                      <Paperclip size={16} />
                    </Button>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Escribe un mensaje..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="min-h-[40px] max-h-[120px] resize-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Smile size={16} />
                    </Button>
                    <Button 
                      onClick={handleSendMessage}
                      className="bg-red-500 hover:bg-red-600"
                      size="sm"
                      disabled={!messageText.trim()}
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>Selecciona una conversación para comenzar</p>
                </div>
              </Card>
            )}
          </div>

          {/* Panel Derecho - Información del Chat */}
          <div className="col-span-3">
            {selectedChat ? (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Información del Chat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      {selectedChat.profile_picture ? (
                        <img 
                          src={selectedChat.profile_picture} 
                          alt={selectedChat.name} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User size={24} className="text-white" />
                      )}
                    </div>
                    <h3 className="font-semibold">
                      {selectedChat.name || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedChat.phone_number}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                      <p className="text-sm">{selectedChat.phone_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Estado</label>
                      <Badge className={selectedChat.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {selectedChat.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Mensajes no leídos</label>
                      <p className="text-sm">{selectedChat.unread_count}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Último mensaje</label>
                      <p className="text-sm">
                        {selectedChat.last_message_at ? 
                          new Date(selectedChat.last_message_at).toLocaleString('es-ES') : 
                          'Sin mensajes'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="w-full bg-red-500 hover:bg-red-600 mb-2">
                      Ver Detalles Completos
                    </Button>
                    <Button variant="outline" className="w-full">
                      Programar Cita
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>Selecciona una conversación para ver detalles</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <QrCode size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">WhatsApp no conectado</h3>
          <p className="text-muted-foreground mb-6">
            La instancia de WhatsApp no está conectada. Verifica el estado de tu instancia "emiser" en Evolution API.
          </p>
          <Button 
            onClick={checkInstanceStatus}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Verificar Estado
          </Button>
        </div>
      )}
    </div>
  )
}

