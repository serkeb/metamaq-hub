import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// Define la URL base de tu instancia de Chatwoot y el token de API desde las variables de entorno.
const CHATWOOT_BASE_URL = Deno.env.get('CHATWOOT_URL')
const API_ACCESS_TOKEN = Deno.env.get('CHATWOOT_API_ACCESS_TOKEN')

serve(async (req) => {
  // Asegúrate de que las variables de entorno estén configuradas.
  if (!CHATWOOT_BASE_URL || !API_ACCESS_TOKEN) {
    return new Response(
      JSON.stringify({ error: 'Las variables de entorno no están configuradas en Supabase.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Captura la ruta de la petición entrante para añadirla a la URL de Chatwoot.
  // Ejemplo: si la petición es a /api/v1/accounts/1/conversations, 
  // url.pathname será /api/v1/accounts/1/conversations.
  const url = new URL(req.url)
  const targetUrl = `${CHATWOOT_BASE_URL}${url.pathname}`

  // Prepara las cabeceras para la petición a Chatwoot.
  // Aquí es donde se añade el token secreto de la API.
  const headers = new Headers(req.headers)
  headers.set('api_access_token', API_ACCESS_TOKEN)
  headers.set('Content-Type', 'application/json')

  // Maneja las peticiones OPTIONS (preflight) para CORS.
  // Esto es crucial para que el navegador permita las peticiones desde tu CRM.
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*', // O tu dominio específico para más seguridad
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, api_access_token',
      },
    })
  }

  try {
    // Realiza la petición a la API de Chatwoot con el método, cabeceras y cuerpo originales.
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.body,
    })

    // Devuelve la respuesta de Chatwoot directamente al cliente (tu CRM).
    // No olvides añadir las cabeceras CORS a la respuesta final.
    const responseHeaders = new Headers(response.headers)
    responseHeaders.set('Access-Control-Allow-Origin', '*') // O tu dominio
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
  // Creamos una variable para el mensaje de error.
  let errorMessage = "Error desconocido";
  
  // Verificamos si el error es una instancia de la clase Error.
  if (error instanceof Error) {
    // Si lo es, ahora TypeScript sabe que tiene una propiedad .message.
    errorMessage = error.message;
  }

  // Captura cualquier error de red o de otro tipo.
  return new Response(
    JSON.stringify({ error: 'Error al conectar con la API de Chatwoot.', details: errorMessage }),
    { status: 502, headers: { 'Content-Type': 'application/json' } }
  )
}
})