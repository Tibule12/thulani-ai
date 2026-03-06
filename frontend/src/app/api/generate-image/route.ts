import { HfInference } from '@huggingface/inference';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      console.error("Missing HuggingFace API Key on server");
      return NextResponse.json(
        { error: 'Server configuration error: Missing API Key' },
        { status: 500 }
      );
    }

    const hf = new HfInference(apiKey);
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log(`Generating image for prompt: "${prompt}"`);

    // Extended model fallback chain
    const fallbackModels = [
      'stabilityai/stable-diffusion-xl-base-1.0',
      'stabilityai/stable-diffusion-2-1',
      'runwayml/stable-diffusion-v1-5',
      'prompthero/openjourney'
    ];

    let response: Blob | undefined;
    const errorLogs: string[] = [];

    for (const model of fallbackModels) {
      try {
        console.log(`Attempting model: ${model}`);
        
        // "Realism Booster" - Automatically remove fake/artistic qualities
        const deepNegativePrompt = 'cartoon, anime, 3d render, painting, illustration, drawing, sketch, plastic, fake, low quality, worst quality, bad anatomy, bad composition, watermark, text, blurry, distorted, deformed, ugly, pixelated, grain';

        const result = await hf.textToImage({
          model: model,
          inputs: prompt, // You can also append ", photorealistic, 8k, raw photo" here if you want to force it
          parameters: {
            negative_prompt: deepNegativePrompt,
            guidance_scale: 7.5, // Standard for obeying the prompt
            num_inference_steps: 25, // Higher steps = more detail (default is usually 20-25)
          },
        });
        
        response = result as unknown as Blob;
        console.log(`Success with model: ${model}`);
        break; // Stop if successful
      } catch (error: any) {
        console.warn(`Failed with model ${model}:`, error.message);
        errorLogs.push(`${model}: ${error.message} (${error.constructor.name})`);
      }
    }

    if (!response) {
      console.error('All models failed:', errorLogs);
      return NextResponse.json(
        { 
          error: 'Failed to generate image', 
          details: 'All model providers failed',
          attempts: errorLogs 
        },
        { status: 500 }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('SERVER IMAGE GENERATION ERROR:', error);
    
    // Return detailed error to client for debugging
    return NextResponse.json(
      { 
        error: 'Failed to generate image', 
        details: error.message,
        stack: error.stack,
        type: error.constructor.name
      },
      { status: 500 }
    );
  }
}
