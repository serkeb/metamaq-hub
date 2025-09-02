import { useState, useEffect } from 'react'
import { MessageSquare, ExternalLink, RefreshCw, Maximize2, Minimize2, Info } from 'lucide-react'

export function ChatwootEmbed() {
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [showInfo, setShowInfo] = useState(false)

  // URL de tu instancia de Chatwoot
  const chatwootUrl = 'https://chatwoot-chatwoot.xmhjrf.easypanel.host/app/accounts/2/dashboard'

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const refreshIframe = () => {
    setIsLoading(true)
    setIframeKey(prev => prev + 1)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const openInNewTab = () => {
    window.open(chatwootUrl, '_blank')
  }

  return (
    <div className={`flex flex-col h-full bg-background ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Chatwoot - Centro de Conversaciones</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona todas tus conversaciones desde Chatwoot
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Información"
          >
            <Info className="h-4 w-4" />
          </button>
          
          <button
            onClick={refreshIframe}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={openInNewTab}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Abrir en nueva pestaña"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border-b">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Información de Integración con Chatwoot
              </p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Esta integración muestra tu instancia de Chatwoot directamente en MetaMAQ Hub</li>
                <li>• Si necesitas iniciar sesión, usa tus credenciales de Chatwoot</li>
                <li>• Todas las funcionalidades de Chatwoot están disponibles</li>
                <li>• Puedes usar el botón de pantalla completa para una mejor experiencia</li>
                <li>• Token de acceso configurado: rtvCeU59uWofWaWBAPXYGiu1</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <span className="text-muted-foreground">Cargando Chatwoot...</span>
          </div>
        </div>
      )}

      {/* Iframe Container */}
      <div className="flex-1 relative">
        <iframe
          key={iframeKey}
          src={chatwootUrl}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          title="Chatwoot Dashboard"
          allow="camera; microphone; fullscreen"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-top-navigation"
        />
      </div>

      {/* Info Footer */}
      <div className="p-3 bg-muted/50 border-t text-xs text-muted-foreground text-center">
        Integración directa con Chatwoot - Instancia: chatwoot-chatwoot.xmhjrf.easypanel.host
      </div>
    </div>
  )
}

