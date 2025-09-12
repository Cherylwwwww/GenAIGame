import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface TrainingRequest {
  sessionId: string;
  annotations: Array<{
    imageId: string;
    imageUrl: string;
    hasObject: boolean;
    boundingBox: any;
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

    const { sessionId, annotations }: TrainingRequest = await req.json();

    // Create training job
    const { data: job, error: jobError } = await supabaseClient
      .from('training_jobs')
      .insert({
        session_id: sessionId,
        status: 'training'
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // Save annotations to database
    const annotationRecords = annotations.map(ann => ({
      session_id: sessionId,
      image_url: ann.imageUrl,
      image_id: ann.imageId,
      has_object: ann.hasObject,
      bounding_box: ann.boundingBox,
      actual_label: ann.actualLabel
    }));

    const { error: annotationError } = await supabaseClient
      .from('annotations')
      .insert(annotationRecords);

    if (annotationError) throw annotationError;

    // Simulate model training (replace with real ML training)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate accuracy based on annotations
    const correctAnnotations = annotations.filter(
      ann => (ann.hasObject) === ann.actualLabel
    ).length;
    
    const accuracy = Math.round((correctAnnotations / annotations.length) * 100);
    
    // Determine model state based on annotation count and accuracy
    let modelState: 'underfitting' | 'correct' | 'overfitting';
    const annotationCount = annotations.length;
    
    if (annotationCount < 5) {
      modelState = 'underfitting';
    } else if (annotationCount > 15 && accuracy < 70) {
      modelState = 'overfitting';
    } else if (accuracy >= 70 && accuracy <= 90) {
      modelState = 'correct';
    } else if (accuracy < 60) {
      modelState = 'underfitting';
    } else {
      modelState = 'overfitting';
    }

    // Update training job with results
    const { error: updateError } = await supabaseClient
      .from('training_jobs')
      .update({
        status: 'completed',
        accuracy,
        model_state: modelState,
        completed_at: new Date().toISOString()
      })
      .eq('id', job.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        jobId: job.id,
        accuracy,
        modelState,
        status: 'completed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Training error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Training failed', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});