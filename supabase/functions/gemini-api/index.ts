import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Function to get API key from secure storage
async function getSecureApiKey(keyName: string): Promise<string> {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data, error } = await supabaseClient
    .from('secure_api_keys')
    .select('api_key')
    .eq('key_name', keyName)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error(`Error fetching API key ${keyName}:`, error)
    throw new Error(`API key ${keyName} not found or inactive`)
  }

  return data.api_key
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Initialize Supabase client to verify the user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const { action, payload } = await req.json()

    if (action !== 'generate') {
      throw new Error('Invalid action')
    }

    // Get the Gemini API key from secure storage
    let geminiApiKey: string
    try {
      geminiApiKey = await getSecureApiKey('GEMINI_API_KEY')
    } catch (error) {
      // Fallback to environment variable if database lookup fails
      geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? ''
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY not found in secure storage or environment variables')
      }
    }

    // Make the actual API call to Gemini
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify(payload)
    })

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error(`Gemini API error: ${geminiResponse.status} - ${errorText}`)
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`)
    }

    const result = await geminiResponse.json()

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})