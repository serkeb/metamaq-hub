import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, RefreshCw, User, Clock, CheckCircle, 
  AlertCircle, Tag, Phone, Mail, Settings, Edit2, Save, X, 
  Pause, Play 
} from 'lucide-react';

// 1. URL de tu función proxy en Supabase.
const SUPABASE_PROXY_URL = 'https://ovvwfgqkbhezcsegrdtz.supabase.co/functions/v1/chatwoot-api-proxy';

// 2. ID de tu cuenta de Chatwoot.
const CHATWOOT_ACCOUNT_ID = '2';

export function ChatwootAPI() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [editedContact, setEditedContact] = useState({});

  // NUEVO: Ref para el scroll automático al final de los mensajes.
  const messagesEndRef = useRef(null);

  // --- Funciones de API ---

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
      // Corregido para acceder correctamente al payload
      setConversations(data.data ? data.data.payload : data.payload || []);
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
  
  // --- NUEVAS FUNCIONES Y MEJORAS ---

  // NUEVO: Función para pausar o reanudar el bot
  const toggleBotStatus = async () => {
    if (!selectedConversation) return;
    const contactId = selectedConversation.meta.sender.id;
    const customAttributes = selectedConversation.meta.sender.custom_attributes || {};
    const currentStatus = customAttributes.bot_on_off ?? 'on';
    const newStatus = currentStatus === 'on' ? 'off' : 'on';

    try {
      const response = await fetch(`${SUPABASE_PROXY_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          custom_attributes: { ...customAttributes, bot_on_off: newStatus }
        })
      });
      if (!response.ok) throw new Error('Falló la actualización');
      
      const data = await response.json();
      const updatedContactDetails = data.payload;

      // Actualizar el estado local para reflejar el cambio al instante
      const updatedConversation = {
        ...selectedConversation,
        meta: { ...selectedConversation.meta, sender: updatedContactDetails }
      };
      setSelectedConversation(updatedConversation);
      setConversations(prev => prev.map(conv => conv.id === selectedConversation.id ? updatedConversation : conv));

    } catch (err) {
      setError('Error al actualizar el estado del bot');
    }
  };


  // MEJORADO: Función para actualizar datos del contacto
  const updateContact = async () => {
    if (!selectedConversation || !editedContact) return;
    const contactId = selectedConversation.meta.sender.id;
    try {
      // Solo enviamos los campos que queremos actualizar
      const payload = {
        name: editedContact.name,
        email: editedContact.email
      };
      
      const response = await fetch(`${SUPABASE_PROXY_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      const updatedContactDetails = data.payload;

      setSelectedConversation(prev => ({
        ...prev,
        meta: { ...prev.meta, sender: updatedContactDetails }
      }));
      setConversations(prev => prev.map(conv =>
        conv.id === selectedConversation.id
          ? { ...conv, meta: { ...conv.meta, sender: updatedContactDetails } }
          : conv
      ));
      setEditingContact(false);
      setError(null);
    } catch (err) {
      setError('Error al actualizar contacto');
    }
  };


  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    const contact = conversation.meta.sender;
    setEditedContact({
      name: contact.name || '',
      email: contact.email || ''
    });
    loadMessages(conversation.id);
    setShowContactDetails(false);
    setEditingContact(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
    return date.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    checkConnectionStatus();
    loadConversations();
  }, []);

  // NUEVO: useEffect para hacer scroll al final cuando se cargan mensajes.
  useEffect(() => {
    if (messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ... (Cabecera y lista de conversaciones sin cambios, se omite por brevedad) ... */}
       {/* Main Content */}
       <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r bg-card overflow-y-auto resize-x min-w-[250px] max-w-[600px]" style={{resize: 'horizontal'}}>
            {/* ... (código de la lista de conversaciones) ... */}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* MEJORADO: Cabecera del chat con botones de acción */}
              <div className="p-4 border-b bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {selectedConversation.meta.sender.name || selectedConversation.meta.sender.phone_number || 'Sin nombre'}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const botStatus = selectedConversation.meta.sender.custom_attributes?.bot_on_off ?? 'on';
                    if (botStatus === 'on') {
                      return (
                        <button onClick={toggleBotStatus} className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-muted" title="Pausar Bot">
                          <Pause className="h-4 w-4 text-yellow-500" /> Pausar Bot
                        </button>
                      );
                    } else {
                      return (
                        <button onClick={toggleBotStatus} className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-muted" title="Reanudar Bot">
                          <Play className="h-4 w-4 text-green-500" /> Reanudar Bot
                        </button>
                      );
                    }
                  })()}
                  <button onClick={() => setShowContactDetails(!showContactDetails)} className="p-2 hover:bg-muted rounded-lg" title="Ver detalles">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* MEJORADO: Área de mensajes */}
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                    {messages.map((message) => {
                        // Lógica de visualización de mensajes corregida
                        const isOutgoing = message.message_type === 'outgoing';
                        const senderName = isOutgoing ? 'Agente' : selectedConversation?.meta.sender.name || 'Cliente';
                        
                        return (
                          <div key={message.id} className={`flex items-end gap-2 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                            {!isOutgoing && (
                              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                                {senderName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="max-w-md">
                              <div className={`text-xs text-muted-foreground mb-1 ${isOutgoing ? 'text-right' : 'text-left'}`}>
                                  {senderName}
                              </div>
                              <div className={`px-4 py-3 rounded-lg shadow-sm ${isOutgoing ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 rounded-bl-none border'}`}>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <div className={`flex items-center gap-1.5 mt-2 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                                  <span className={`text-xs ${isOutgoing ? 'text-blue-100/75' : 'text-muted-foreground/75'}`}>
                                    {formatDate(message.created_at)}
                                  </span>
                                  {isOutgoing && <CheckCircle className="h-3.5 w-3.5 text-blue-200" />}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                    })}
                    {/* Elemento invisible para forzar el scroll hacia abajo */}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input de Mensaje */}
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
                      <button onClick={sendMessage} disabled={!newMessage.trim()} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* MEJORADO: Panel de detalles del contacto funcional */}
                {showContactDetails && (
                  <div className="w-1/3 border-l bg-card overflow-y-auto p-4 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Detalles del Contacto</h3>
                      <div>
                        {editingContact ? (
                          <>
                            <button onClick={updateContact} className="p-2 hover:bg-muted rounded-lg mr-1"><Save className="h-4 w-4 text-green-500" /></button>
                            <button onClick={() => setEditingContact(false)} className="p-2 hover:bg-muted rounded-lg"><X className="h-4 w-4 text-red-500" /></button>
                          </>
                        ) : (
                          <button onClick={() => setEditingContact(true)} className="p-2 hover:bg-muted rounded-lg"><Edit2 className="h-4 w-4" /></button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div>
                        <label className="font-medium text-muted-foreground">Nombre</label>
                        {editingContact ? (
                          <input type="text" value={editedContact.name} onChange={(e) => setEditedContact({...editedContact, name: e.target.value})} className="w-full mt-1 px-2 py-1 border rounded" />
                        ) : (
                          <p>{selectedConversation.meta.sender.name || 'N/A'}</p>
                        )}
                      </div>
                      <div>
                        <label className="font-medium text-muted-foreground">Email</label>
                        {editingContact ? (
                          <input type="email" value={editedContact.email} onChange={(e) => setEditedContact({...editedContact, email: e.target.value})} className="w-full mt-1 px-2 py-1 border rounded" />
                        ) : (
                          <p>{selectedConversation.meta.sender.email || 'N/A'}</p>
                        )}
                      </div>
                       <div>
                        <label className="font-medium text-muted-foreground">Teléfono</label>
                        <p>{selectedConversation.meta.sender.phone_number || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="font-medium text-muted-foreground">Estado del Bot</label>
                        <p className="flex items-center gap-2">
                          {selectedConversation.meta.sender.custom_attributes?.bot_on_off === 'off' ? 
                              <><Pause className="h-4 w-4 text-red-500" /> Pausado</> : 
                              <><Play className="h-4 w-4 text-green-500" /> Activo</>
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Selecciona una conversación para empezar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}