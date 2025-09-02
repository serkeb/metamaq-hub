import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export function useSocket(serverUrl = 'http://localhost:5000') {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
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
      // Unirse a la sala de chat
      socket.emit('join_chat_room')
    })

    socket.on('disconnect', () => {
      console.log('Desconectado del servidor WebSocket')
      setIsConnected(false)
    })

    // Eventos de chat
    socket.on('new_message', (data) => {
      console.log('Nuevo mensaje recibido:', data)
      setMessages(prev => [data.message, ...prev])
      
      // Actualizar conversaciones
      setConversations(prev => 
        prev.map(conv => 
          conv.id === data.conversation_id 
            ? { 
                ...conv, 
                last_message: data.message,
                unread_count: data.message.is_from_me ? conv.unread_count : conv.unread_count + 1
              }
            : conv
        )
      )
    })

    socket.on('bot_status_changed', (data) => {
      console.log('Estado del bot cambiado:', data)
      setConversations(prev =>
        prev.map(conv =>
          conv.id === data.conversation_id
            ? { ...conv, bot_paused: data.bot_paused }
            : conv
        )
      )
    })

    socket.on('connection_update', (data) => {
      console.log('Actualización de conexión:', data)
    })

    // Cleanup al desmontar
    return () => {
      socket.emit('leave_chat_room')
      socket.disconnect()
    }
  }, [serverUrl])

  // Funciones para interactuar con el socket
  const sendMessage = (phoneNumber, message) => {
    if (socketRef.current && isConnected) {
      // Enviar mensaje a través de la API REST
      fetch(`${serverUrl}/api/chat/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          message: message
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Mensaje enviado:', data)
      })
      .catch(error => {
        console.error('Error enviando mensaje:', error)
      })
    }
  }

  const toggleBot = (conversationId) => {
    if (socketRef.current && isConnected) {
      fetch(`${serverUrl}/api/chat/conversations/${conversationId}/toggle-bot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        console.log('Bot toggled:', data)
      })
      .catch(error => {
        console.error('Error toggling bot:', error)
      })
    }
  }

  return {
    isConnected,
    messages,
    conversations,
    setConversations,
    sendMessage,
    toggleBot
  }
}

