const API_BASE_URL = 'http://localhost:5000/api/chat'

class ChatApiService {
  async getConversations() {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`)
      if (!response.ok) {
        throw new Error('Error fetching conversations')
      }
      return await response.json()
    } catch (error) {
      console.error('Error getting conversations:', error)
      throw error
    }
  }

  async getConversationMessages(conversationId, page = 1, perPage = 50) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}/messages?page=${page}&per_page=${perPage}`
      )
      if (!response.ok) {
        throw new Error('Error fetching messages')
      }
      return await response.json()
    } catch (error) {
      console.error('Error getting messages:', error)
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

  async toggleBot(conversationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/toggle-bot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Error toggling bot')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error toggling bot:', error)
      throw error
    }
  }

  async getQuickReplies() {
    try {
      const response = await fetch(`${API_BASE_URL}/quick-replies`)
      if (!response.ok) {
        throw new Error('Error fetching quick replies')
      }
      return await response.json()
    } catch (error) {
      console.error('Error getting quick replies:', error)
      throw error
    }
  }

  async createQuickReply(title, content) {
    try {
      const response = await fetch(`${API_BASE_URL}/quick-replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          content: content
        })
      })
      
      if (!response.ok) {
        throw new Error('Error creating quick reply')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating quick reply:', error)
      throw error
    }
  }
}

export const chatApi = new ChatApiService()

