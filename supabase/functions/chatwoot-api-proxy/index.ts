import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORRECCIÓN: Agregamos PUT y DELETE a los métodos permitidos
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE', // ⬅️ AGREGADO PUT Y DELETE
};

serve(async (req: Request) => {
  // Manejar solicitudes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Variables de entorno de Chatwoot
    const chatwootUrl = Deno.env.get("CHATWOOT_URL");
    const chatwootToken = Deno.env.get("CHATWOOT_API_TOKEN");
    const chatwootAccountId = Deno.env.get("CHATWOOT_ACCOUNT_ID");

    if (!chatwootUrl || !chatwootToken || !chatwootAccountId) {
      throw new Error("Faltan secretos de Chatwoot en la configuración de la Edge Function.");
    }

    const requestUrl = new URL(req.url);
    // Extraer la ruta que el frontend quiere consultar
    const path = requestUrl.pathname.replace('/functions/v1/chatwoot-api-proxy', '');
    
    // Construir la URL final para Chatwoot
    const apiUrl = `${chatwootUrl}${path}${requestUrl.search}`;

    // CORRECCIÓN: Configurar headers y body según el método
    const headers = {
      "api_access_token": chatwootToken,
      "Content-Type": "application/json",
    };

    let body = undefined;
    
    // Si el método no es GET, leer el body de la petición
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      try {
        body = await req.text();
      } catch (error) {
        console.log('No se pudo leer el body de la petición:', error);
      }
    }

    console.log(`Proxying ${req.method} request to: ${apiUrl}`);
    if (body) {
      console.log('Body:', body);
    }

    // CORRECCIÓN: Hacer la petición a Chatwoot con el método correcto
    const response = await fetch(apiUrl, {
      method: req.method, // ⬅️ Usar el método original (GET, POST, PUT, DELETE)
      headers: headers,
      body: body, // ⬅️ Pasar el body si existe
    });

    if (!response.ok) {
      console.error(`Error de Chatwoot: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      return new Response(JSON.stringify({ 
        error: `La API de Chatwoot devolvió un error: ${response.status}`,
        details: errorText
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: response.status,
      });
    }

    // Leer la respuesta de Chatwoot
    const data = await response.text();
    let jsonData;
    
    try {
      jsonData = JSON.parse(data);
    } catch (error) {
      jsonData = { data: data };
    }

    // Devolver la respuesta con CORS headers
    return new Response(JSON.stringify(jsonData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: response.status,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error en la función proxy:", errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});