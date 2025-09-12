import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { jobId, category, annotations } = await req.json()

    // Update job status to training
    await supabaseClient
      .from('training_jobs')
      .update({ status: 'training' })
      .eq('id', jobId)

    // Simulate model training process
    // In a real implementation, you would:
    // 1. Prepare training data
    // 2. Train a computer vision model (YOLO, ResNet, etc.)
    // 3. Evaluate the model
    // 4. Save model weights/parameters

    // For now, simulate training with realistic logic
    const annotatedCount = annotations.length
    const positiveExamples = annotations.filter((ann: any) => ann.has_object).length
    const negativeExamples = annotatedCount - positiveExamples
    
    // Calculate accuracy based on data quality and quantity
    let accuracy = 30 // Base accuracy
    
    if (annotatedCount >= 5) {
      const balanceScore = Math.min(positiveExamples, negativeExamples) / Math.max(positiveExamples, negativeExamples)
      const quantityBonus = Math.min(annotatedCount * 3, 50)
      accuracy = Math.min(30 + (quantityBonus * balanceScore), 95)
    }
    
    // Determine model state
    let modelState = 'underfitting'
    if (annotatedCount >= 5 && annotatedCount <= 15 && accuracy >= 70) {
      modelState = 'correct'
    } else if (annotatedCount > 15 && accuracy < 70) {
      modelState = 'overfitting'
    }

    // Simulate training time
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Update job with results
    await supabaseClient
      .from('training_jobs')
      .update({
        status: 'completed',
        accuracy: Math.round(accuracy),
        model_state: modelState,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId)

    return new Response(
      JSON.stringify({
        success: true,
        jobId,
        accuracy: Math.round(accuracy),
        modelState
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})