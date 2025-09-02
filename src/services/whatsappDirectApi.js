const API_BASE_URL = 'http://localhost:5000/api/whatsapp'

class WhatsAppDirectApiService {
  async getInstanceStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/instance/status`)
      if (!response.ok) {
        throw new Error('Error fetching instance status')
      }
      return await response.json()
    } catch (error) {
      console.error('Error getting instance status:', error)
      throw error
    }
  }

  async getQRCode() {
    try {
      const response = await fetch(`${API_BASE_URL}/instance/qr`)
      if (!response.ok) {
        throw new Error('Error fetching QR code')
      }
      return await response.json()
    } catch (error) {
      console.error('Error getting QR code:', error)
      throw error
    }
  }

  async logoutInstance() {
    try {
      const response = await fetch(`${API_BASE_URL}/instance/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Error logging out instance')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error logging out instance:', error)
      throw error
    }
  }

  async getAllChats() {
    try {
      const response = await fetch(`${API_BASE_URL}/chats`)
      if (!response.ok) {
        throw new Error('Error fetching chats')
      }
      return await response.json()
    } catch (error) {
      console.error('Error getting chats:', error)
      throw error
    }
  }

  async getChatMessages(chatId) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/${encodeURIComponent(chatId)}/messages`)
      if (!response.ok) {
        throw new Error('Error fetching chat messages')
      }
      return await response.json()
    } catch (error) {
      console.error('Error getting chat messages:', error)
      throw error
    }
  }

  async sendMessage(phoneNumber, message) {
    try {
      const response = await fetch(`${API_BASE_URL}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          message: message
        })
      })
      
      if (!response.ok) {
        throw new Error('Error sending message')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  async configureWebhook(webhookUrl) {
    try {
      // Esta función configuraría el webhook directamente desde el frontend
      // En un entorno de producción, esto se haría desde el backend por seguridad
      const response = await fetch(`${API_BASE_URL}/configure-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          webhook_url: webhookUrl
        })
      })
      
      if (!response.ok) {
        throw new Error('Error configuring webhook')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error configuring webhook:', error)
      throw error
    }
  }
}

export const whatsappDirectApi = new WhatsAppDirectApiService()

