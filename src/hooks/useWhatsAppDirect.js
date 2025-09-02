import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { whatsappDirectApi } from '../services/whatsappDirectApi'

export function useWhatsAppDirect(serverUrl = 'http://localhost:5000') {
  const [isConnected, setIsConnected] = useState(false)
  const [instanceStatus, setInstanceStatus] = useState('disconnected')
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [qrCode, setQrCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    // Crear conexión WebSocket
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling']
    })

    const socket = socketRef.current

    // Eventos de conexión
    socket.on('connect', () => {
      console.log('Conectado al servidor WebSocket')
      setIsConnected(true)
      // Unirse a la sala de WhatsApp
      socket.emit('join_whatsapp_room')
    })

    socket.on('disconnect', () => {
      console.log('Desconectado del servidor WebSocket')
      setIsConnected(false)
    })

    // Eventos específicos de WhatsApp directo
    socket.on('new_message_direct', (data) => {
      console.log('Nuevo mensaje directo recibido:', data)
      
      // Actualizar mensajes si es del chat seleccionado
      if (selectedChat && data.data.key && data.data.key.remoteJid) {
        const chatId = data.data.key.remoteJid.replace('@s.whatsapp.net', '')
        if (selectedChat.phone_number === chatId) {
          // Procesar y agregar el nuevo mensaje
          const newMessage = processMessage(data.data)
          setChatMessages(prev => [newMessage, ...prev])
        }
      }
      
      // Actualizar la lista de chats
      refreshChats()
    })

    socket.on('message_sent', (data) => {
      console.log('Mensaje enviado confirmado:', data)
      
      // Actualizar mensajes del chat actual
      if (selectedChat && selectedChat.phone_number === data.phone_number) {
        const sentMessage = {
          id: `sent_${Date.now()}`,
          content: data.message,
          message_type: 'text',
          is_from_me: true,
          timestamp: data.timestamp,
          sender_phone: data.phone_number,
          status: 'sent'
        }
        setChatMessages(prev => [sentMessage, ...prev])
      }
    })

    socket.on('connection_update_direct', (data) => {
      console.log('Actualización de conexión directa:', data)
      
      if (data.data && data.data.state) {
        setInstanceStatus(data.data.state === 'open' ? 'connected' : 'disconnected')
      }
    })

    // Cleanup al desmontar
    return () => {
      socket.emit('leave_whatsapp_room')
      socket.disconnect()
    }
  }, [serverUrl, selectedChat])

  // Función para procesar mensajes de Evolution API
  const processMessage = (messageData) => {
    let content = ''
    let messageType = 'text'
    
    if (messageData.message) {
      const msg = messageData.message
      if (msg.conversation) {
        content = msg.conversation
      } else if (msg.extendedTextMessage) {
        content = msg.extendedTextMessage.text || ''
      } else if (msg.imageMessage) {
        messageType = 'image'
        content = msg.imageMessage.caption || '[Imagen]'
      } else if (msg.audioMessage) {
        messageType = 'audio'
        content = '[Audio]'
      } else if (msg.videoMessage) {
        messageType = 'video'
        content = '[Video]'
      } else if (msg.documentMessage) {
        messageType = 'document'
        content = `[Documento: ${msg.documentMessage.fileName || 'archivo'}]`
      }
    }

    return {
      id: messageData.key?.id || `msg_${Date.now()}`,
      content: content,
      message_type: messageType,
      is_from_me: messageData.key?.fromMe || false,
      timestamp: new Date(parseInt(messageData.messageTimestamp) * 1000).toISOString(),
      sender_phone: messageData.key?.remoteJid?.replace('@s.whatsapp.net', '') || '',
      status: 'delivered'
    }
  }

  // Funciones de la API
  const checkInstanceStatus = async () => {
    try {
      setLoading(true)
      const response = await whatsappDirectApi.getInstanceStatus()
      
      if (response.status === 'success' && response.data) {
        setInstanceStatus(response.data.state === 'open' ? 'connected' : 'disconnected')
      }
    } catch (error) {
      console.error('Error checking instance status:', error)
      setInstanceStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const getQRCode = async () => {
    try {
      setLoading(true)
      const response = await whatsappDirectApi.getQRCode()
      
      if (response.status === 'success' && response.base64) {
        setQrCode(response.base64)
      }
    } catch (error) {
      console.error('Error getting QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  const logoutInstance = async () => {
    try {
      setLoading(true)
      const response = await whatsappDirectApi.logoutInstance()
      
      if (response.status === 'success') {
        setInstanceStatus('disconnected')
        setChats([])
        setSelectedChat(null)
        setChatMessages([])
        setQrCode(null)
      }
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshChats = async () => {
    try {
      const chatsData = await whatsappDirectApi.getAllChats()
      setChats(chatsData)
    } catch (error) {
      console.error('Error refreshing chats:', error)
    }
  }

  const loadChatMessages = async (chatId) => {
    try {
      setLoading(true)
      const messages = await whatsappDirectApi.getChatMessages(chatId)
      setChatMessages(messages)
    } catch (error) {
      console.error('Error loading chat messages:', error)
      setChatMessages([])
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (phoneNumber, message) => {
    try {
      const response = await whatsappDirectApi.sendMessage(phoneNumber, message)
      return response
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  const selectChat = (chat) => {
    setSelectedChat(chat)
    if (chat) {
      loadChatMessages(chat.phone_number)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    checkInstanceStatus()
    if (instanceStatus === 'connected') {
      refreshChats()
    }
  }, [instanceStatus])

  return {
    // Estado
    isConnected,
    instanceStatus,
    chats,
    selectedChat,
    chatMessages,
    qrCode,
    loading,
    
    // Funciones
    checkInstanceStatus,
    getQRCode,
    logoutInstance,
    refreshChats,
    loadChatMessages,
    sendMessage,
    selectChat
  }
}

