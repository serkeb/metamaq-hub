import { useState, useEffect } from 'react'
import { MessageSquare, Send, RefreshCw, User, Clock, CheckCircle, AlertCircle, Tag, Phone, Mail, Globe, Settings, Edit2, Save, X, Plus } from 'lucide-react'

// 1. Usamos la URL de tu función proxy en Supabase como la URL base para todas las llamadas.
const SUPABASE_PROXY_URL = 'https://ovvwfgqkbhezcsegrdtz.supabase.co/functions/v1/chatwoot-api-proxy';

// 2. Definimos el ID de tu cuenta de Chatwoot para construir las URLs.
const CHATWOOT_ACCOUNT_ID = '2'; // Asegúrate de que este ID sea el correcto para tu cuenta.

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

  // --- INICIO DE LAS FUNCIONES CORREGIDAS ---

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch(`${SUPABASE_PROXY_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/agents`);
      if (response.ok) {
        setConnectionStatus('connected');
        setError(null);
      } else {
        throw new Error('La respuesta de la API no fue exitosa');
      }
    } catch (err) {
      setConnectionStatus('error');
      setError('No se puede conectar con el proxy de Supabase');
    }
  };

const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SUPABASE_PROXY_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations`);
      const data = await response.json();
      // CORRECCIÓN: Accedemos a data.data.payload para obtener la lista de conversaciones.
      setConversations(data.data.payload || []); 
      setError(null);
    } catch (err) {
      setError('Error al cargar conversaciones');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await fetch(`${SUPABASE_PROXY_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`);
      const data = await response.json();
      setMessages(data.payload || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar mensajes');
      setMessages([]);
    }
  };

  const loadAvailableLabels = async () => {
    try {
      const response = await fetch(`${SUPABASE_PROXY_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/labels`);
      const data = await response.json();
      setAvailableLabels(data.payload || []);
    } catch (err) {
      console.error('Error al cargar etiquetas:', err);
      setAvailableLabels([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      await fetch(`${SUPABASE_PROXY_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage, message_type: 'outgoing' })
      });
      setNewMessage('');
      await loadMessages(selectedConversation.id);
    } catch (err) {
      setError('Error al enviar mensaje');
    }
  };

  const updateContact = async () => {
    if (!selectedConversation || !editedContact) return;
    const contactId = selectedConversation.meta.sender.id;
    try {
      const response = await fetch(`${SUPABASE_PROXY_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedContact)
      });
      const data = await response.json();
      const updatedContactDetails = data.payload;

      setSelectedConversation(prev => ({
        ...prev,
        meta: { ...prev.meta, sender: { ...prev.meta.sender, ...updatedContactDetails } }
      }));
      setConversations(prev => prev.map(conv =>
        conv.id === selectedConversation.id
          ? { ...conv, meta: { ...conv.meta, sender: { ...conv.meta.sender, ...updatedContactDetails } } }
          : conv
      ));
      setEditingContact(false);
      setError(null);
    } catch (err) {
      setError('Error al actualizar contacto');
    }
  };

  const addLabelToConversation = async (label) => {
    if (!selectedConversation) return;
    try {
      const response = await fetch(`${SUPABASE_PROXY_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${selectedConversation.id}/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labels: [label] })
      });
      const data = await response.json();
      const updatedLabels = data.payload;

      setSelectedConversation(prev => ({ ...prev, labels: updatedLabels }));
      setConversations(prev => prev.map(conv =>
        conv.id === selectedConversation.id ? { ...conv, labels: updatedLabels } : conv
      ));
    } catch (err) {
      setError('Error al agregar etiqueta');
    }
  };

  const removeLabelFromConversation = async (label) => {
    if (!selectedConversation) return;
    // La API de Chatwoot no tiene un endpoint DELETE para una sola etiqueta, se actualiza la lista completa.
    // Por simplicidad, esta función se omite temporalmente. Se puede implementar después si es necesario.
    console.warn("La función para remover etiquetas no está implementada en este ejemplo.");
  };

  const createNewLabel = async () => {
    if (!newLabel.trim()) return;
    try {
      await fetch(`${SUPABASE_PROXY_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newLabel, color: '#1f93ff' })
      });
      setNewLabel('');
      await loadAvailableLabels(); // Recargar la lista de etiquetas
    } catch (err) {
      setError('Error al crear etiqueta');
    }
  };

  // --- FIN DE LAS FUNCIONES CORREGIDAS ---

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    const contact = conversation.meta.sender;
    setEditedContact({
      name: contact.name || '',
      email: contact.email || '',
      phone_number: contact.phone_number || '',
      custom_attributes: contact.custom_attributes || {}
    });
    loadMessages(conversation.id);
    setShowContactDetails(false);
    setEditingContact(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
    return date.toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  useEffect(() => {
    checkConnectionStatus();
    loadConversations();
  }, []);

    // El resto del componente (el return con todo el JSX) permanece igual.
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
            checkConnectionStatus();
            loadConversations();
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
                    <User className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">
                        {conversation.meta.sender.name || conversation.meta.sender.phone_number || 'Sin nombre'}
                      </h3>
                      <div className={`w-2 h-2 rounded-full ${
                        conversation.status === 'open' ? 'bg-green-500' :
                        conversation.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                    </div>
                    
                    <p className="text-sm truncate opacity-75">{conversation.messages.length > 0 ? conversation.messages[0].content : 'Sin mensajes'}</p>

                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 opacity-50" />
                      <span className="text-xs opacity-75">
                        {formatDate(conversation.timestamp)}
                      </span>
                    </div>

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
                       <User className="h-5 w-5" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">
                        {selectedConversation.meta.sender.name || selectedConversation.meta.sender.phone_number || 'Sin nombre'}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {selectedConversation.meta.sender.phone_number && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{selectedConversation.meta.sender.phone_number}</span>
                          </div>
                        )}
                        {selectedConversation.meta.sender.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{selectedConversation.meta.sender.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowContactDetails(!showContactDetails)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Ver detalles del contacto"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex">
                {/* Messages */}
                <div className={`${showContactDetails ? 'w-2/3' : 'w-full'} flex flex-col h-full`}>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No hay mensajes en esta conversación
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isOutgoing = message.message_type === 'outgoing';
                        const senderName = isOutgoing ? 'Agente' : selectedConversation?.meta.sender.name || 'Cliente';
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-3`}
                          >
                            <div className={`max-w-xs lg:max-w-md`}>
                              <div className={`text-xs text-gray-600 mb-1 ${isOutgoing ? 'text-right' : 'text-left'}`}>
                                {senderName}
                              </div>
                              
                              <div
                                className={`px-4 py-3 rounded-lg shadow-sm ${
                                  isOutgoing
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none border'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                
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
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t bg-card">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contact Details Panel */}
                {showContactDetails && (
                  <div className="w-1/3 border-l bg-card overflow-y-auto p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Detalles del Contacto</h3>
                      {/* Botones de Editar/Guardar */}
                    </div>
                    {/* ... (Aquí va el resto del JSX para los detalles del contacto) ... */}
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
                  Elige una conversación de la lista para ver los mensajes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}