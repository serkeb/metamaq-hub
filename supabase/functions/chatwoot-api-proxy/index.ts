import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Definimos las cabeceras CORS aquí mismo para mayor claridad
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Permite peticiones desde cualquier origen
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Este es el cambio más importante:
  // Si la petición es de tipo OPTIONS (la de permiso), respondemos inmediatamente
  // con las cabeceras correctas y terminamos la ejecución.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- Lógica del Proxy ---
    const chatwootUrl = "https://chatwoot-chatwoot.xmhjrf.easypanel.host";
    const chatwootToken = "rtvCeU59uWofWaWBAPXYGiu1";
    const chatwootAccountId = "2";

    if (!chatwootUrl || !chatwootToken || !chatwootAccountId) {
      throw new Error("Faltan secretos de Chatwoot en la configuración de la Edge Function.");
    }

    const requestUrl = new URL(req.url);
    // Extraemos la ruta que el frontend quiere consultar en la API de Chatwoot
    const path = requestUrl.pathname.replace('/chatwoot-api-proxy', '');

    // Construimos la URL final para la API de Chatwoot
    const apiUrl = `${chatwootUrl}${path}`;

    // Hacemos la llamada a Chatwoot
    const response = await fetch(apiUrl, {
      headers: {
        "api_access_token": chatwootToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Error de Chatwoot: ${response.statusText}`);
      throw new Error(`La API de Chatwoot devolvió un error: ${response.status}`);
    }

    const data = await response.json();

    // Devolvemos la respuesta de Chatwoot al frontend, añadiendo las cabeceras CORS
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error en la función proxy:", errorMessage);

    // MUY IMPORTANTE: Devolvemos el error con las cabeceras CORS
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});