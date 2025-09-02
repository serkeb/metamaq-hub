import { useState, useEffect } from 'react'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Search,
  Phone,
  Video,
  MoreVertical,
  Play,
  Pause,
  User,
  Wifi,
  WifiOff
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
import { useSocket } from '../hooks/useSocket'
import { chatApi } from '../services/chatApi'

export function WhatsAppChat() {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [conversationMessages, setConversationMessages] = useState([])
  const [quickReplies, setQuickReplies] = useState([])
  const [loading, setLoading] = useState(true)

  // Hook de WebSocket
  const { 
    isConnected, 
    messages, 
    conversations, 
    setConversations, 
    sendMessage, 
    toggleBot 
  } = useSocket()

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  // Actualizar mensajes cuando cambia la conversación seleccionada
  useEffect(() => {
    if (selectedConversation) {
      loadConversationMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  // Escuchar nuevos mensajes del WebSocket
  useEffect(() => {
    if (messages.length > 0 && selectedConversation) {
      const newMessage = messages[0]
      if (newMessage.conversation_id === selectedConversation.id) {
        setConversationMessages(prev => [newMessage, ...prev])
      }
    }
  }, [messages, selectedConversation])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [conversationsData, quickRepliesData] = await Promise.all([
        chatApi.getConversations(),
        chatApi.getQuickReplies()
      ])
      
      setConversations(conversationsData)
      setQuickReplies(quickRepliesData)
      
      if (conversationsData.length > 0) {
        setSelectedConversation(conversationsData[0])
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadConversationMessages = async (conversationId) => {
    try {
      const messagesData = await chatApi.getConversationMessages(conversationId)
      setConversationMessages(messagesData.messages || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedConversation) {
      try {
        await sendMessage(selectedConversation.contact.phone_number, messageText)
        setMessageText('')
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }
  }

  const handleToggleBot = async () => {
    if (selectedConversation) {
      try {
        await toggleBot(selectedConversation.id)
      } catch (error) {
        console.error('Error toggling bot:', error)
      }
    }
  }

  const insertQuickReply = (reply) => {
    setMessageText(reply.content)
  }

  const filteredConversations = conversations.filter(conv =>
    conv.contact?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.contact?.phone_number?.includes(searchQuery)
  )

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando conversaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Indicador de conexión */}
      <div className="mb-4 flex items-center gap-2">
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

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Panel Izquierdo - Bandeja de Entrada */}
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
                {filteredConversations.map(conv => (
                  <div
                    key={conv.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 border-b ${
                      selectedConversation?.id === conv.id ? 'bg-red-50 border-l-4 border-l-red-500' : ''
                    }`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                          <User size={16} className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">
                            {conv.contact?.name || conv.contact?.phone_number}
                          </h4>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${conv.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-xs text-muted-foreground">
                              {conv.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {conv.unread_count > 0 && (
                        <Badge className="bg-red-500 text-white">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.last_message?.content || 'Sin mensajes'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {conv.last_message_at ? formatTime(conv.last_message_at) : ''}
                    </p>
                  </div>
                ))}
                
                {filteredConversations.length === 0 && (
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
          {selectedConversation ? (
            <Card className="h-full flex flex-col">
              {/* Header del Chat */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {selectedConversation.contact?.name || selectedConversation.contact?.phone_number}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.is_active ? 'En línea' : 'Desconectado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={selectedConversation.bot_paused ? "destructive" : "default"}
                      size="sm"
                      onClick={handleToggleBot}
                      className={selectedConversation.bot_paused ? '' : 'bg-green-600 hover:bg-green-700'}
                    >
                      {selectedConversation.bot_paused ? <Play size={16} /> : <Pause size={16} />}
                      {selectedConversation.bot_paused ? 'Reanudar Bot' : 'Pausar Bot'}
                    </Button>
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
                  {conversationMessages.map(message => (
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
                  
                  {conversationMessages.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay mensajes en esta conversación</p>
                    </div>
                  )}
                </div>
              </CardContent>

              {/* Respuestas Rápidas */}
              {quickReplies.length > 0 && (
                <div className="px-4 py-2 border-t">
                  <div className="flex gap-2 flex-wrap">
                    {quickReplies.slice(0, 5).map((reply) => (
                      <Button
                        key={reply.id}
                        variant="outline"
                        size="sm"
                        onClick={() => insertQuickReply(reply)}
                        className="text-xs"
                      >
                        {reply.title}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

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

        {/* Panel Derecho - Contexto del Lead */}
        <div className="col-span-3">
          {selectedConversation ? (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Información del Lead</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User size={24} className="text-white" />
                  </div>
                  <h3 className="font-semibold">
                    {selectedConversation.contact?.name || 'Sin nombre'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.contact?.phone_number}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                    <p className="text-sm">{selectedConversation.contact?.phone_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estado</label>
                    <Badge className={selectedConversation.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {selectedConversation.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bot</label>
                    <Badge className={selectedConversation.bot_paused ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                      {selectedConversation.bot_paused ? 'Pausado' : 'Activo'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mensajes no leídos</label>
                    <p className="text-sm">{selectedConversation.unread_count}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Último mensaje</label>
                    <p className="text-sm">
                      {selectedConversation.last_message_at ? 
                        new Date(selectedConversation.last_message_at).toLocaleString('es-ES') : 
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
    </div>
  )
}

