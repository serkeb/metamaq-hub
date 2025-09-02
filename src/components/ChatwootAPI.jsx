import { useState, useEffect } from 'react'
import { MessageSquare, Send, RefreshCw, User, Clock, CheckCircle, AlertCircle, Tag, Phone, Mail, Globe, Settings, Edit2, Save, X, Plus } from 'lucide-react'

const BACKEND_URL = 'https://ovvwfgqkbhezcsegrdtz.supabase.co/functions/v1/chatwoot-api-proxy'

export function ChatwootAPI() {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [error, setError] = useState(null)
  const [showContactDetails, setShowContactDetails] = useState(false)
  const [editingContact, setEditingContact] = useState(false)
  const [editedContact, setEditedContact] = useState({})
  const [availableLabels, setAvailableLabels] = useState([])
  const [newLabel, setNewLabel] = useState('')
  const [showLabelManager, setShowLabelManager] = useState(false)

  // Verificar estado de conexión
  const checkConnectionStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chatwoot/account/status`)
      const data = await response.json()
      
      if (data.success) {
        setConnectionStatus('connected')
        setError(null)
      } else {
        setConnectionStatus('error')
        setError(data.error)
      }
    } catch (err) {
      setConnectionStatus('error')
      setError('No se puede conectar con el backend de Chatwoot')
    }
  }

  // Cargar conversaciones
  const loadConversations = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${BACKEND_URL}/api/chatwoot/conversations`)
      const data = await response.json()
      
      if (data.success) {
        setConversations(data.conversations)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al cargar conversaciones')
    } finally {
      setLoading(false)
    }
  }

  // Cargar mensajes de una conversación
  const loadMessages = async (conversationId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chatwoot/conversations/${conversationId}/messages`)
      const data = await response.json()
      
      if (data.success) {
        setMessages(data.messages)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al cargar mensajes')
    }
  }

  // Cargar etiquetas disponibles
  const loadAvailableLabels = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chatwoot/labels`)
      const data = await response.json()
      
      if (data.success) {
        setAvailableLabels(data.labels)
      }
    } catch (err) {
      console.error('Error al cargar etiquetas:', err)
      // No mostrar error al usuario, las etiquetas son opcionales
      setAvailableLabels([])
    }
  }

  // Enviar mensaje
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await fetch(`${BACKEND_URL}/api/chatwoot/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage,
          message_type: 'outgoing'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setNewMessage('')
        // Recargar mensajes para mostrar el nuevo mensaje
        await loadMessages(selectedConversation.id)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al enviar mensaje')
    }
  }

  // Actualizar estado del bot
  const updateBotStatus = async (contactId, botStatus) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chatwoot/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          custom_attributes: {
            ...selectedConversation.contact.custom_attributes,
            bot: botStatus
          }
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Actualizar la conversación seleccionada
        setSelectedConversation(prev => ({
          ...prev,
          contact: {
            ...prev.contact,
            custom_attributes: {
              ...prev.contact.custom_attributes,
              bot: botStatus
            }
          }
        }))
        
        // Actualizar la lista de conversaciones
        setConversations(prev => prev.map(conv => 
          conv.contact.id === contactId 
            ? { 
                ...conv, 
                contact: {
                  ...conv.contact,
                  custom_attributes: {
                    ...conv.contact.custom_attributes,
                    bot: botStatus
                  }
                }
              }
            : conv
        ))
        
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al actualizar estado del bot')
    }
  }

  // Actualizar contacto
  const updateContact = async () => {
    if (!selectedConversation || !editedContact) return

    try {
      const response = await fetch(`${BACKEND_URL}/api/chatwoot/contacts/${selectedConversation.contact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedContact)
      })

      const data = await response.json()
      
      if (data.success) {
        // Actualizar la conversación seleccionada con los nuevos datos
        setSelectedConversation(prev => ({
          ...prev,
          contact: { ...prev.contact, ...editedContact }
        }))
        
        // Actualizar la lista de conversaciones
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, contact: { ...conv.contact, ...editedContact } }
            : conv
        ))
        
        setEditingContact(false)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al actualizar contacto')
    }
  }

  // Agregar etiqueta a conversación
  const addLabelToConversation = async (label) => {
    if (!selectedConversation) return

    try {
      const response = await fetch(`${BACKEND_URL}/api/chatwoot/conversations/${selectedConversation.id}/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          labels: [label]
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Actualizar la conversación con la nueva etiqueta
        const updatedLabels = [...(selectedConversation.labels || []), label]
        setSelectedConversation(prev => ({
          ...prev,
          labels: updatedLabels
        }))
        
        // Actualizar la lista de conversaciones
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, labels: updatedLabels }
            : conv
        ))
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al agregar etiqueta')
    }
  }

  // Remover etiqueta de conversación
  const removeLabelFromConversation = async (label) => {
    if (!selectedConversation) return

    try {
      const response = await fetch(`${BACKEND_URL}/api/chatwoot/conversations/${selectedConversation.id}/labels`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          labels: [label]
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Actualizar la conversación removiendo la etiqueta
        const updatedLabels = (selectedConversation.labels || []).filter(l => l !== label)
        setSelectedConversation(prev => ({
          ...prev,
          labels: updatedLabels
        }))
        
        // Actualizar la lista de conversaciones
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, labels: updatedLabels }
            : conv
        ))
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al remover etiqueta')
    }
  }

  // Crear nueva etiqueta
  const createNewLabel = async () => {
    if (!newLabel.trim()) return

    try {
      const response = await fetch(`${BACKEND_URL}/api/chatwoot/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newLabel,
          color: '#1f93ff'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setAvailableLabels(prev => [...prev, data.label])
        setNewLabel('')
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al crear etiqueta')
    }
  }

  // Seleccionar conversación
  const selectConversation = (conversation) => {
    setSelectedConversation(conversation)
    setEditedContact({
      name: conversation.contact.name || '',
      email: conversation.contact.email || '',
      phone_number: conversation.contact.phone_number || '',
      custom_attributes: conversation.contact.custom_attributes || {}
    })
    loadMessages(conversation.id)
    setShowContactDetails(false)
    setEditingContact(false)
  }

  // Formatear fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    
    // Si es un timestamp Unix (número), convertir a milisegundos
    const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp)
    
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Renderizar atributos personalizados editables
  const renderEditableCustomAttributes = () => {
    const attributes = editedContact.custom_attributes || {}
    
    return (
      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
          <Settings className="h-3 w-3" />
          Atributos Personalizados
        </h4>
        <div className="space-y-2">
          {Object.entries(attributes).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs font-medium capitalize w-16">{key}:</span>
              {editingContact ? (
                <input
                  type="text"
                  value={String(value)}
                  onChange={(e) => setEditedContact(prev => ({
                    ...prev,
                    custom_attributes: {
                      ...prev.custom_attributes,
                      [key]: e.target.value
                    }
                  }))}
                  className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              ) : (
                <span className="text-xs text-muted-foreground">{String(value)}</span>
              )}
            </div>
          ))}
          
          {editingContact && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <input
                type="text"
                placeholder="humano"
                value={editedContact.newAttributeKey || ''}
                onChange={(e) => setEditedContact(prev => ({
                  ...prev,
                  newAttributeKey: e.target.value
                }))}
                className="w-16 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="true"
                value={editedContact.newAttributeValue || ''}
                onChange={(e) => setEditedContact(prev => ({
                  ...prev,
                  newAttributeValue: e.target.value
                }))}
                className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={() => {
                  if (editedContact.newAttributeKey && editedContact.newAttributeValue) {
                    setEditedContact(prev => ({
                      ...prev,
                      custom_attributes: {
                        ...prev.custom_attributes,
                        [prev.newAttributeKey]: prev.newAttributeValue
                      },
                      newAttributeKey: '',
                      newAttributeValue: ''
                    }))
                  }
                }}
                className="p-1 text-primary hover:bg-primary/10 rounded"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Renderizar etiquetas editables
  const renderEditableLabels = (labels) => {
    return (
      <div className="mt-2">
        <div className="flex flex-wrap gap-1 mb-2">
          {(labels || []).map((label, index) => (
            <span 
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full group"
            >
              <Tag className="h-3 w-3" />
              {label}
              <button
                onClick={() => removeLabelFromConversation(label)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
              >
                <X className="h-2 w-2" />
              </button>
            </span>
          ))}
        </div>
        
        {showLabelManager && (
          <div className="space-y-2 p-2 bg-muted/30 rounded">
            <div className="flex gap-1 flex-wrap">
              {availableLabels.filter(label => !(labels || []).includes(label.title)).map((label) => (
                <button
                  key={label.id}
                  onClick={() => addLabelToConversation(label.title)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  + {label.title}
                </button>
              ))}
            </div>
            
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="Nueva etiqueta (ej: humano)"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={createNewLabel}
                className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Crear
              </button>
            </div>
          </div>
        )}
        
        <button
          onClick={() => {
            setShowLabelManager(!showLabelManager)
            if (!showLabelManager) loadAvailableLabels()
          }}
          className="text-xs text-primary hover:underline mt-1"
        >
          {showLabelManager ? 'Ocultar' : 'Gestionar etiquetas'}
        </button>
      </div>
    )
  }

  // Efectos
  useEffect(() => {
    checkConnectionStatus()
    loadConversations()
    loadAvailableLabels()
  }, [])

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Chatwoot - Centro de Conversaciones</h1>
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-muted-foreground">
                {connectionStatus === 'connected' ? 'Conectado' : 
                 connectionStatus === 'error' ? 'Error de conexión' : 'Conectando...'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            checkConnectionStatus()
            loadConversations()
          }}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Actualizar"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border-b">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r bg-card overflow-y-auto resize-x min-w-[250px] max-w-[600px]" style={{resize: 'horizontal'}}>
          <div className="p-4 border-b">
            <h2 className="font-semibold">Conversaciones</h2>
            <p className="text-sm text-muted-foreground">{conversations.length} conversaciones</p>
          </div>
          
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => selectConversation(conversation)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    {conversation.contact.avatar ? (
                      <img 
                        src={conversation.contact.avatar} 
                        alt={conversation.contact.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">
                        {conversation.contact.name || conversation.contact.phone_number || 'Sin nombre'}
                      </h3>
                      <div className={`w-2 h-2 rounded-full ${
                        conversation.status === 'open' ? 'bg-green-500' :
                        conversation.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs opacity-75">
                      {conversation.contact.phone_number && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{conversation.contact.phone_number}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 opacity-50" />
                      <span className="text-xs opacity-75">
                        {formatDate(conversation.last_activity_at)}
                      </span>
                    </div>

                    {/* Etiquetas en la lista */}
                    {conversation.labels && conversation.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {conversation.labels.slice(0, 2).map((label, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center gap-1 px-1 py-0.5 bg-primary/20 text-primary text-xs rounded"
                          >
                            <Tag className="h-2 w-2" />
                            {label}
                          </span>
                        ))}
                        {conversation.labels.length > 2 && (
                          <span className="text-xs opacity-75">+{conversation.labels.length - 2}</span>
                        )}
                      </div>
                    )}

                    {/* Indicador de atributos personalizados */}
                    {conversation.contact.custom_attributes && Object.keys(conversation.contact.custom_attributes).length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Settings className="h-3 w-3 opacity-50" />
                        <span className="text-xs opacity-75">
                          {Object.keys(conversation.contact.custom_attributes).length} atributos
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      {selectedConversation.contact.avatar ? (
                        <img 
                          src={selectedConversation.contact.avatar} 
                          alt={selectedConversation.contact.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">
                        {selectedConversation.contact.name || selectedConversation.contact.phone_number || 'Sin nombre'}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {selectedConversation.contact.phone_number && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{selectedConversation.contact.phone_number}</span>
                          </div>
                        )}
                        {selectedConversation.contact.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{selectedConversation.contact.email}</span>
                          </div>
                        )}
                        {selectedConversation.contact.availability_status && (
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${
                              selectedConversation.contact.availability_status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                            }`} />
                            <span className="capitalize">{selectedConversation.contact.availability_status}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bot Control Buttons */}
                  <div className="flex items-center gap-2">
                    {selectedConversation.contact.custom_attributes?.bot && (
                      <button
                        onClick={() => updateBotStatus(selectedConversation.contact.id, selectedConversation.contact.custom_attributes.bot === 'on' ? 'off' : 'on')}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          selectedConversation.contact.custom_attributes.bot === 'on'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {selectedConversation.contact.custom_attributes.bot === 'on' ? 'Pausar bot' : 'Reanudar bot'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => setShowContactDetails(!showContactDetails)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Ver detalles del contacto"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Etiquetas de la conversación */}
                {renderEditableLabels(selectedConversation.labels)}
              </div>

              <div className="flex-1 flex">
                {/* Messages */}
                <div className={`${showContactDetails ? 'w-2/3' : 'w-full'} flex flex-col h-full`}>
                  {/* Messages Container with Fixed Height and Scroll */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50" style={{maxHeight: 'calc(100vh - 300px)', minHeight: '400px'}}>
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No hay mensajes en esta conversación
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isOutgoing = message.message_type === 1 || message.message_type === 'outgoing'
                        const senderName = message.sender?.name || (isOutgoing ? 'Agente' : selectedConversation?.contact?.name || 'Cliente')
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-3`}
                          >
                            <div className={`max-w-xs lg:max-w-md ${isOutgoing ? 'order-2' : 'order-1'}`}>
                              {/* Sender Name */}
                              <div className={`text-xs text-gray-600 mb-1 ${isOutgoing ? 'text-right' : 'text-left'}`}>
                                {senderName}
                              </div>
                              
                              {/* Message Bubble */}
                              <div
                                className={`px-4 py-3 rounded-lg shadow-sm ${
                                  isOutgoing
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none border'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                
                                {/* Message Footer */}
                                <div className={`flex items-center gap-1 mt-2 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                                  <span className={`text-xs ${isOutgoing ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {formatDate(message.created_at)}
                                  </span>
                                  {isOutgoing && (
                                    <CheckCircle className="h-3 w-3 text-blue-100" />
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                              isOutgoing 
                                ? 'bg-blue-500 text-white order-1 mr-2' 
                                : 'bg-gray-300 text-gray-700 order-2 ml-2'
                            }`}>
                              {senderName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Message Input - Always Visible */}
                  <div className="p-6 border-t bg-white shadow-lg border-2 border-gray-200">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-4 py-4 text-base border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 shadow-sm"
                        style={{minHeight: '56px'}}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                        style={{minHeight: '56px', minWidth: '80px'}}
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contact Details Panel */}
                {showContactDetails && (
                  <div className="w-1/3 border-l bg-card overflow-y-auto">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Detalles del Contacto</h3>
                        <div className="flex gap-1">
                          {editingContact ? (
                            <>
                              <button
                                onClick={updateContact}
                                className="p-1 text-green-600 hover:bg-green-100 rounded"
                                title="Guardar cambios"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingContact(false)
                                  setEditedContact({
                                    name: selectedConversation.contact.name || '',
                                    email: selectedConversation.contact.email || '',
                                    phone_number: selectedConversation.contact.phone_number || '',
                                    custom_attributes: selectedConversation.contact.custom_attributes || {}
                                  })
                                }}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                title="Cancelar"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setEditingContact(true)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Editar contacto"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Información básica editable */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Información Básica</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Nombre:</span>
                              {editingContact ? (
                                <input
                                  type="text"
                                  value={editedContact.name || ''}
                                  onChange={(e) => setEditedContact(prev => ({ ...prev, name: e.target.value }))}
                                  className="px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              ) : (
                                <span>{selectedConversation.contact.name || 'N/A'}</span>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Teléfono:</span>
                              {editingContact ? (
                                <input
                                  type="text"
                                  value={editedContact.phone_number || ''}
                                  onChange={(e) => setEditedContact(prev => ({ ...prev, phone_number: e.target.value }))}
                                  className="px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              ) : (
                                <span>{selectedConversation.contact.phone_number || 'N/A'}</span>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Email:</span>
                              {editingContact ? (
                                <input
                                  type="email"
                                  value={editedContact.email || ''}
                                  onChange={(e) => setEditedContact(prev => ({ ...prev, email: e.target.value }))}
                                  className="px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              ) : (
                                <span>{selectedConversation.contact.email || 'N/A'}</span>
                              )}
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Estado:</span>
                              <span className="capitalize">{selectedConversation.contact.availability_status || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Atributos personalizados editables */}
                        {renderEditableCustomAttributes()}

                        {/* Información de la conversación */}
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <h4 className="text-sm font-semibold mb-2">Información de la Conversación</h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="font-medium">Estado:</span>
                              <span className="capitalize">{selectedConversation.status}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Mensajes:</span>
                              <span>{selectedConversation.messages_count}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">No leídos:</span>
                              <span>{selectedConversation.unread_count}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Prioridad:</span>
                              <span>{selectedConversation.priority || 'Normal'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Canal:</span>
                              <span>{selectedConversation.channel || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Fechas importantes */}
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <h4 className="text-sm font-semibold mb-2">Fechas</h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="font-medium">Última actividad:</span>
                              <span>{formatDate(selectedConversation.last_activity_at)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Contacto creado:</span>
                              <span>{formatDate(selectedConversation.contact.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecciona una conversación</h3>
                <p className="text-muted-foreground">
                  Elige una conversación de la lista para ver los mensajes y detalles del contacto
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

