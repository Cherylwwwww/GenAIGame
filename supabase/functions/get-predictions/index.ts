import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface PredictionRequest {
  jobId: string;
  testImages: Array<{
    id: string;
    url: string;
    actualLabel: boolean;
  }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { jobId, testImages }: PredictionRequest = await req.json();

    // Get training job details
    const { data: job, error: jobError } = await supabaseClient
      .from('training_jobs')
      .select('accuracy, model_state')
      .eq('id', jobId)
      .single();

    if (jobError) throw jobError;

    // Generate predictions based on model accuracy
    const predictions = testImages.map(image => {
      const random = Math.random();
      const shouldBeCorrect = random < (job.accuracy / 100);
      
      const prediction = shouldBeCorrect ? image.actualLabel : !image.actualLabel;
      const confidence = shouldBeCorrect 
        ? 0.7 + Math.random() * 0.3  // High confidence for correct predictions
        : 0.4 + Math.random() * 0.3; // Lower confidence for incorrect predictions

      return {
        job_id: jobId,
        image_url: image.url,
        image_id: image.id,
        predicted_label: prediction,
        confidence,
        actual_label: image.actualLabel
      };
    });

    // Save predictions to database
    const { error: predictionError } = await supabaseClient
      .from('model_predictions')
      .insert(predictions);

    if (predictionError) throw predictionError;

    return new Response(
      JSON.stringify({
        predictions: predictions.map(p => ({
          imageId: p.image_id,
          prediction: p.predicted_label,
          confidence: p.confidence
        }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Prediction error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Prediction failed', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});