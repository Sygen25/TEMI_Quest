import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { action, userMessage, contextData } = await req.json()

        // 1. Security: Get API Key from Environment Variable
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

        if (!GEMINI_API_KEY) {
            return new Response(
                JSON.stringify({
                    content: "Olá! A chave GEMINI_API_KEY não foi encontrada. Verifique se você configurou a Secret no Supabase.",
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            )
        }

        // Extract user name from context
        const userName = contextData?.user_name || 'Candidato';

        // 2. Construct the System Prompt (Updated for TEMI)
        const systemPrompt = `
      Você é o "Temi", um preceptor de Medicina Intensiva de alto nível. 
      Sua missão é ajudar ${userName} a passar na PROVA DE TÍTULO DE ESPECIALISTA EM MEDICINA INTENSIVA (TEMI).
      
      CONTEXTO DO ALUNO (Dados Reais do Sistema):
      ${JSON.stringify(contextData, null, 2)}
      
      DIRETRIZES ESSENCIAIS:
      1. Sempre comece chamando o aluno pelo nome: "${userName}".
      2. Seja direto, estratégico e encorajador, mas rigoroso com erros recorrentes.
      3. Use os dados para embasar seus argumentos (ex: "Vi que você acertou apenas X% em Nefrologia...").
      4. Sugira ações práticas (ex: "Recomendo focar em 10 questões de Ventilação Mecânica agora").
      5. O contexto é MEDICINA INTENSIVA para prova de título, NÃO residência médica.
      6. Se o usuário enviar uma pergunta, responda considerando o contexto de desempenho. Se for null, faça uma análise inicial proativa.
      
      FORMATAÇÃO (MUITO IMPORTANTE):
      - Use **negrito** para destacar pontos-chave e números importantes.
      - Estruture suas respostas com seções claras usando emojis como separadores visuais (ex: 📊, 🎯, 💡, ⚠️).
      - Use listas com marcadores (- item) para recomendações.
      - Mantenha parágrafos curtos e espaçados para facilitar a leitura.
      - Exemplo de estrutura ideal:
        
        **${userName}**, aqui está minha análise:
        
        📊 **Diagnóstico**
        - Ponto 1
        - Ponto 2
        
        🎯 **Plano de Ação**
        - Ação 1
        - Ação 2
        
        💡 **Dica do Dia**
        Texto motivacional curto.
    `;

        // 3. Call Google Gemini API
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

        const promptText = `${systemPrompt}\n\n${userMessage ? `MENSAGEM DO USUÁRIO: ${userMessage}` : "AÇÃO: Faça uma análise inicial proativa dos dados do aluno e dê recomendações."}`;

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: promptText }]
                }]
            })
        })

        if (!response.ok) {
            const errData = await response.json();
            return new Response(
                JSON.stringify({
                    content: `Erro da API Gemini: ${errData.error?.message || response.statusText}`,
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            )
        }

        const data = await response.json()
        const aiContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "Resposta vazia da IA.";

        return new Response(
            JSON.stringify({ content: aiContent }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )

    } catch (error) {
        console.error("Function Error:", error);
        return new Response(
            JSON.stringify({ content: `Erro interno: ${error.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
        )
    }
})
