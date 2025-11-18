import { NextRequest, NextResponse } from 'next/server'
import { createApi } from 'unsplash-js'
import { supabaseAdmin } from '@/lib/supabase'
import { generateClaudePrompt } from '@/lib/promptGenerator'

// Map feelings/styles to Unsplash search queries
function getUnsplashSearchTerms(submission: any): string[] {
  const queries: string[] = []

  // Based on feelings
  submission.feelings.forEach((feeling: string) => {
    switch (feeling) {
      case 'Calm & peaceful':
        queries.push('minimal nature zen', 'peaceful meditation', 'calm minimal')
        break
      case 'Energetic & motivating':
        queries.push('energetic fitness', 'motivational workout', 'vibrant energy')
        break
      case 'Professional & trustworthy':
        queries.push('modern office clean', 'professional business', 'minimalist workspace')
        break
      case 'Fun & playful':
        queries.push('colorful playful design', 'fun creative', 'vibrant playful')
        break
      case 'Luxurious & premium':
        queries.push('luxury premium', 'elegant sophisticated', 'high-end design')
        break
      case 'Minimal & clean':
        queries.push('minimal clean design', 'simple aesthetic', 'white space')
        break
      case 'Warm & friendly':
        queries.push('warm cozy', 'friendly welcoming', 'soft comfortable')
        break
      case 'Bold & edgy':
        queries.push('bold graphic design', 'edgy modern', 'striking contrast')
        break
    }
  })

  // Based on design inspiration
  switch (submission.design_inspiration) {
    case 'calm':
      queries.push('zen minimal', 'meditation peaceful')
      break
    case 'duolingo':
      queries.push('playful colorful', 'fun gamification')
      break
    case 'notion':
      queries.push('organized clean workspace', 'productivity minimal')
      break
    case 'instagram':
      queries.push('modern aesthetic', 'visual photography')
      break
    case 'headspace':
      queries.push('friendly illustration', 'approachable design')
      break
    case 'stripe':
      queries.push('professional sleek', 'modern gradient')
      break
  }

  // Deduplicate and return first 3 unique queries
  return [...new Set(queries)].slice(0, 3)
}

export async function POST(request: NextRequest) {
  try {
    const { submissionId } = await request.json()

    if (!submissionId) {
      return NextResponse.json(
        { success: false, error: 'Missing submissionId' },
        { status: 400 }
      )
    }

    // Fetch the submission from database
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('design_kit_submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (fetchError || !submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Generate the custom Claude Code prompt
    const generatedPrompt = generateClaudePrompt(submission)

    let moodboardImages: string[] = []

    // Only fetch images if Unsplash API key is configured
    if (process.env.UNSPLASH_ACCESS_KEY) {
      // Initialize Unsplash client
      const unsplash = createApi({
        accessKey: process.env.UNSPLASH_ACCESS_KEY,
      })

      // Get Unsplash search terms
      const searchTerms = getUnsplashSearchTerms(submission)

      // Fetch images from Unsplash (3 images per query)
      const imagePromises = searchTerms.map(async (query) => {
        try {
          const result = await unsplash.search.getPhotos({
            query,
            perPage: 3,
            orientation: 'portrait',
          })

          if (result.response) {
            return result.response.results.map(photo => photo.urls.regular)
          }
          return []
        } catch (error) {
          console.error(`Unsplash error for query "${query}":`, error)
          return []
        }
      })

      const imageArrays = await Promise.all(imagePromises)
      moodboardImages = imageArrays.flat()
    } else {
      console.log('Unsplash API key not configured - skipping moodboard generation')
    }

    // Update the submission with generated content
    const { error: updateError } = await supabaseAdmin
      .from('design_kit_submissions')
      .update({
        generated_prompt: generatedPrompt,
        moodboard_images: moodboardImages,
      })
      .eq('id', submissionId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update submission' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      prompt: generatedPrompt,
      images: moodboardImages,
    })

  } catch (error) {
    console.error('Generate prompt error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
