// Importa las herramientas necesarias de Deno y Supabase
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const payload = await req.json();
    const event = payload.event;

    console.log(`Recibido evento de Chatwoot: ${event}`);

    switch (event) {
      case "message_created": {
        // CORRECCIÓN: Los datos del mensaje son el payload, el contacto es payload.sender
        // y la conversación es payload.conversation.
        const message = payload;
        const conversation = payload.conversation;
        const contact = payload.sender;

        // Si no hay información del contacto o la conversación, no podemos continuar.
        if (!contact || !conversation) {
          throw new Error("El payload de message_created no contiene 'sender' o 'conversation'.");
        }

        const { data: existingContact } = await supabaseClient
          .from("contacts")
          .select("id")
          .eq("chatwoot_id", contact.id)
          .single();

        let contactId;
        if (!existingContact) {
          const { data: newContact, error } = await supabaseClient
            .from("contacts")
            .insert({
              chatwoot_id: contact.id,
              name: contact.name,
            })
            .select("id")
            .single();
          if (error) throw error;
          contactId = newContact.id;
        } else {
          contactId = existingContact.id;
        }

        const { data: existingConversation } = await supabaseClient
          .from("conversations")
          .select("id")
          .eq("chatwoot_id", conversation.id)
          .single();
        
        let conversationId;
        if (!existingConversation) {
          const { data: newConversation, error } = await supabaseClient
            .from("conversations")
            .insert({
              chatwoot_id: conversation.id,
              contact_id: contactId,
              status: conversation.status,
            })
            .select("id")
            .single();
          if (error) throw error;
          conversationId = newConversation.id;
        } else {
          conversationId = existingConversation.id;
        }

        const { error } = await supabaseClient.from("messages").insert({
          chatwoot_id: message.id,
          conversation_id: conversationId,
          content: message.content,
          sender_type: message.message_type === "incoming" ? "user" : "agent",
        });
        if (error) throw error;

        console.log(`Mensaje ${message.id} sincronizado correctamente.`);
        break;
      }

      case "contact_updated": {
        // CORRECCIÓN: Confirmamos que los datos del contacto son el payload.
        const updatedContact = payload;

        const { error } = await supabaseClient
          .from("contacts")
          .update({ name: updatedContact.name })
          .eq("chatwoot_id", updatedContact.id);
        
        if (error) throw error;
        console.log(`Contacto ${updatedContact.id} actualizado.`);
        break;
      }

      default:
        console.log(`Evento no manejado: ${event}`);
        break;
    }

    return new Response(JSON.stringify({ status: "success" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error procesando el webhook:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});