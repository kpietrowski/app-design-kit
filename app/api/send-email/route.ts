import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { submissionId } = await request.json()

    if (!submissionId) {
      return NextResponse.json(
        { success: false, error: 'Missing submissionId' },
        { status: 400 }
      )
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.log('Resend API key not configured - skipping email send')
      return NextResponse.json({
        success: true,
        message: 'Email service not configured',
      })
    }

    // Fetch the submission
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

    // Check if email was already sent
    if (submission.email_sent) {
      return NextResponse.json({
        success: true,
        message: 'Email already sent',
      })
    }

    const appName = submission.app_name || 'Your App'
    const resultsUrl = `${request.nextUrl.origin}/results/${submissionId}`

    // Initialize Resend client
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Design Kit <noreply@appin30days.com>', // Update with your verified domain
      to: [submission.email],
      subject: `${appName} Design Kit Ready! 🎨`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 20px 20px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 32px;">Your ${appName} Design Kit is Ready! 🎨</h1>
            </div>

            <div style="background: white; padding: 40px 30px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="font-size: 18px; margin-bottom: 20px;">Hi ${submission.name || 'there'}!</p>

              <p style="margin-bottom: 20px;">Your custom app design kit is ready to view. We've created:</p>

              <ul style="margin-bottom: 30px; padding-left: 20px;">
                <li style="margin-bottom: 10px;"><strong>Visual Moodboard</strong> - 9 curated images matching your app's vibe</li>
                <li style="margin-bottom: 10px;"><strong>Custom Color Palette</strong> - Perfectly matched colors with hex codes</li>
                <li style="margin-bottom: 10px;"><strong>Claude Code Prompt</strong> - Ready-to-use prompt to start building</li>
                <li style="margin-bottom: 10px;"><strong>Complete Design Brief</strong> - All your preferences in one place</li>
              </ul>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${resultsUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px;">
                  View Your Design Kit →
                </a>
              </div>

              <div style="background: #f0f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #667eea;">Ready to Build Your App?</h3>
                <p style="margin-bottom: 15px;">Join our course to learn how to use Claude Code and AI to build real iOS apps—no coding experience needed.</p>
                <a href="https://www.appin30days.com" style="color: #667eea; text-decoration: none; font-weight: bold;">
                  Learn More About the Course →
                </a>
              </div>

              <p style="color: #666; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                Questions? Just reply to this email.<br>
                We're here to help you bring your app idea to life!
              </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>Build Your First App with Claude Code</p>
              <p>© ${new Date().getFullYear()} appin30days.com</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      )
    }

    // Mark email as sent
    await supabaseAdmin
      .from('design_kit_submissions')
      .update({ email_sent: true })
      .eq('id', submissionId)

    return NextResponse.json({
      success: true,
      emailId: data?.id,
    })

  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
