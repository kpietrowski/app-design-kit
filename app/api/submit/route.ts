import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

// Validation schema
const submissionSchema = z.object({
  appIdea: z.string().min(10).max(200),
  appName: z.string().optional(),
  targetAudience: z.string(),
  targetAudienceOther: z.string().optional(),
  mainAction: z.string(),
  feelings: z.array(z.string()).min(1).max(3),
  colorPalette: z.string(),
  designInspiration: z.string(),
  personalitySeriousFun: z.number().min(1).max(5),
  personalityMinimalRich: z.number().min(1).max(5),
  personalityGentleMotivating: z.number().min(1).max(5),
  darkMode: z.boolean(),
  animations: z.boolean(),
  illustrations: z.boolean(),
  photos: z.boolean(),
  gradients: z.boolean(),
  roundedCorners: z.boolean(),
  name: z.string().min(2),
  email: z.string().email(),
  optedInMarketing: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validatedData = submissionSchema.parse(body)

    // Prepare data for database
    const dbData = {
      email: validatedData.email,
      name: validatedData.name,
      app_idea: validatedData.appIdea,
      app_name: validatedData.appName || null,
      target_audience: validatedData.targetAudienceOther || validatedData.targetAudience,
      main_action: validatedData.mainAction,
      feelings: validatedData.feelings,
      color_palette: validatedData.colorPalette,
      design_inspiration: validatedData.designInspiration,
      personality_serious_fun: validatedData.personalitySeriousFun,
      personality_minimal_rich: validatedData.personalityMinimalRich,
      personality_gentle_motivating: validatedData.personalityGentleMotivating,
      dark_mode: validatedData.darkMode,
      animations: validatedData.animations,
      illustrations: validatedData.illustrations,
      photos: validatedData.photos,
      gradients: validatedData.gradients,
      rounded_corners: validatedData.roundedCorners,
      opted_in_marketing: validatedData.optedInMarketing,
    }

    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from('design_kit_submissions')
      .insert([dbData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to save submission' },
        { status: 500 }
      )
    }

    const submissionId = data.id

    // Trigger background processes asynchronously (don't await them)
    // In production, you'd use a queue system like BullMQ or Trigger.dev
    fetch(`${request.nextUrl.origin}/api/generate-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId }),
    }).catch(err => console.error('Generate prompt error:', err))

    fetch(`${request.nextUrl.origin}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId }),
    }).catch(err => console.error('Send email error:', err))

    return NextResponse.json({
      success: true,
      submissionId,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid form data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
