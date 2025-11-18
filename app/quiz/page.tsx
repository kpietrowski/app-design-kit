'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

// Form validation schema
const formSchema = z.object({
  appIdea: z.string().min(10, 'Please describe your app idea (at least 10 characters)').max(200),
  appName: z.string().optional(),
  targetAudience: z.string().min(1, 'Please select a target audience'),
  targetAudienceOther: z.string().optional(),
  mainAction: z.string().min(1, 'Please select the main action'),
  feelings: z.array(z.string()).min(1, 'Please select at least one feeling').max(3, 'Maximum 3 feelings'),
  colorPalette: z.string().min(1, 'Please select a color palette'),
  designInspiration: z.string().min(1, 'Please select a design inspiration'),
  personalitySeriousFun: z.number().min(1).max(5),
  personalityMinimalRich: z.number().min(1).max(5),
  personalityGentleMotivating: z.number().min(1).max(5),
  darkMode: z.boolean(),
  animations: z.boolean(),
  illustrations: z.boolean(),
  photos: z.boolean(),
  gradients: z.boolean(),
  roundedCorners: z.boolean(),
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email'),
  optedInMarketing: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

const colorPalettes = [
  { id: 'soft-pastels', name: 'Soft Pastels', emoji: '🌸', colors: ['#FFB3BA', '#BAFFC9', '#BAE1FF'] },
  { id: 'earth-tones', name: 'Earth Tones', emoji: '🌿', colors: ['#8B7355', '#A0937D', '#C9B8A0'] },
  { id: 'bold-bright', name: 'Bold & Bright', emoji: '⚡', colors: ['#FF6B35', '#004E89', '#FFC43D'] },
  { id: 'monochrome', name: 'Monochrome', emoji: '⚪', colors: ['#000000', '#808080', '#FFFFFF'] },
  { id: 'ocean-vibes', name: 'Ocean Vibes', emoji: '🌊', colors: ['#006BA6', '#0496FF', '#5DFDCB'] },
  { id: 'sunset', name: 'Sunset', emoji: '🌅', colors: ['#9B59B6', '#E67E22', '#F39C12'] },
]

const designStyles = [
  { id: 'calm', name: 'Calm', emoji: '🧘', description: 'Minimal, zen' },
  { id: 'duolingo', name: 'Duolingo', emoji: '🎮', description: 'Playful, gamified' },
  { id: 'notion', name: 'Notion', emoji: '📝', description: 'Clean, organized' },
  { id: 'instagram', name: 'Instagram', emoji: '📸', description: 'Visual, modern' },
  { id: 'headspace', name: 'Headspace', emoji: '😌', description: 'Friendly, illustrated' },
  { id: 'stripe', name: 'Stripe', emoji: '💳', description: 'Professional, sleek' },
]

// Total: 13 questions
const TOTAL_QUESTIONS = 13

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      personalitySeriousFun: 3,
      personalityMinimalRich: 3,
      personalityGentleMotivating: 3,
      darkMode: false,
      animations: true,
      illustrations: false,
      photos: true,
      gradients: true,
      roundedCorners: true,
      optedInMarketing: true,
      feelings: [],
    }
  })

  const feelings = watch('feelings') || []
  const targetAudience = watch('targetAudience')
  const appIdea = watch('appIdea')
  const colorPalette = watch('colorPalette')
  const designInspiration = watch('designInspiration')

  const toggleFeeling = (feeling: string) => {
    const current = feelings
    if (current.includes(feeling)) {
      setValue('feelings', current.filter(f => f !== feeling))
    } else if (current.length < 3) {
      setValue('feelings', [...current, feeling])
    }
  }

  const nextQuestion = async () => {
    // Validate current question before proceeding
    let isValid = true

    switch(currentQuestion) {
      case 1: isValid = await trigger('appIdea'); break
      case 3: isValid = await trigger('targetAudience'); break
      case 4: isValid = await trigger('mainAction'); break
      case 5: isValid = await trigger('feelings'); break
      case 6: isValid = await trigger('colorPalette'); break
      case 7: isValid = await trigger('designInspiration'); break
      case 12: isValid = await trigger('name'); break
      case 13: isValid = await trigger('email'); break
    }

    if (isValid && currentQuestion < TOTAL_QUESTIONS) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 1) setCurrentQuestion(currentQuestion - 1)
  }

  const selectAndAdvance = (field: any, value: any) => {
    setValue(field, value)
    setTimeout(() => nextQuestion(), 300) // Small delay for visual feedback
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        router.push(`/results/${result.submissionId}`)
      } else {
        alert('Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentQuestion / TOTAL_QUESTIONS) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex flex-col">
      {/* Progress Bar - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-2 bg-white/20">
          <motion.div
            className="h-full bg-white"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="bg-white/10 backdrop-blur-lg px-4 py-3 flex justify-between items-center">
          {currentQuestion > 1 && (
            <button
              onClick={prevQuestion}
              className="text-white text-2xl font-bold"
            >
              ←
            </button>
          )}
          <span className="text-white text-sm font-medium ml-auto">
            {currentQuestion} of {TOTAL_QUESTIONS}
          </span>
        </div>
      </div>

      {/* Question Container - Scrollable */}
      <div className="flex-1 overflow-y-auto pt-20 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* Q1: App Idea */}
              {currentQuestion === 1 && (
                <motion.div
                  key="q1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="min-h-[70vh] flex flex-col"
                >
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    What's your app idea? 💡
                  </h2>
                  <p className="text-white/90 text-lg mb-8">
                    Describe it in one sentence
                  </p>

                  <textarea
                    {...register('appIdea')}
                    className="w-full p-6 text-xl rounded-3xl border-4 border-white/30 focus:border-white focus:ring-0 resize-none h-48 bg-white/10 backdrop-blur-lg text-white placeholder-white/50"
                    placeholder="Example: A habit tracker that uses AI to suggest personalized routines..."
                    maxLength={200}
                  />
                  {appIdea && (
                    <p className="text-white/70 text-sm mt-2 text-right">
                      {appIdea.length}/200
                    </p>
                  )}
                  {errors.appIdea && (
                    <p className="text-yellow-300 mt-3 text-lg">{errors.appIdea.message}</p>
                  )}
                </motion.div>
              )}

              {/* Q2: App Name (Optional) */}
              {currentQuestion === 2 && (
                <motion.div
                  key="q2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="min-h-[70vh] flex flex-col"
                >
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    What should we call it? ✨
                  </h2>
                  <p className="text-white/90 text-lg mb-8">
                    Optional - skip if you haven't decided yet
                  </p>

                  <input
                    type="text"
                    {...register('appName')}
                    className="w-full p-6 text-2xl rounded-3xl border-4 border-white/30 focus:border-white focus:ring-0 bg-white/10 backdrop-blur-lg text-white placeholder-white/50"
                    placeholder="My Awesome App"
                  />
                </motion.div>
              )}

              {/* Q3: Target Audience */}
              {currentQuestion === 3 && (
                <motion.div
                  key="q3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="min-h-[70vh] flex flex-col"
                >
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Who is this for? 👥
                  </h2>
                  <p className="text-white/90 text-lg mb-8">
                    Choose your target audience
                  </p>

                  <div className="space-y-3">
                    {['Busy professionals', 'Parents/families', 'Students', 'Health & fitness enthusiasts', 'Creatives/artists', 'Small business owners', 'Other'].map((audience) => (
                      <button
                        key={audience}
                        type="button"
                        onClick={() => selectAndAdvance('targetAudience', audience)}
                        className={`w-full p-6 text-left text-lg font-medium rounded-2xl transition-all ${
                          targetAudience === audience
                            ? 'bg-white text-purple-600 scale-105'
                            : 'bg-white/10 backdrop-blur-lg text-white border-2 border-white/30 hover:bg-white/20'
                        }`}
                      >
                        {audience}
                      </button>
                    ))}
                  </div>
                  {targetAudience === 'Other' && (
                    <input
                      type="text"
                      {...register('targetAudienceOther')}
                      className="w-full p-6 text-xl rounded-2xl mt-4 bg-white/10 backdrop-blur-lg text-white placeholder-white/50 border-2 border-white/30"
                      placeholder="Describe your audience..."
                      autoFocus
                    />
                  )}
                  {errors.targetAudience && (
                    <p className="text-yellow-300 mt-3 text-lg">{errors.targetAudience.message}</p>
                  )}
                </motion.div>
              )}

              {/* Q4: Main Action */}
              {currentQuestion === 4 && (
                <motion.div
                  key="q4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="min-h-[70vh] flex flex-col"
                >
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    What will users DO? 🎯
                  </h2>
                  <p className="text-white/90 text-lg mb-8">
                    Pick the main action
                  </p>

                  <div className="space-y-3">
                    {['Track something', 'Create content', 'Learn something', 'Organize information', 'Connect with others', 'Make purchases', 'Play/compete'].map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => selectAndAdvance('mainAction', action)}
                        className="w-full p-6 text-left text-lg font-medium rounded-2xl bg-white/10 backdrop-blur-lg text-white border-2 border-white/30 hover:bg-white/20 hover:scale-105 transition-all"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                  {errors.mainAction && (
                    <p className="text-yellow-300 mt-3 text-lg">{errors.mainAction.message}</p>
                  )}
                </motion.div>
              )}

              {/* Q5: Feelings */}
              {currentQuestion === 5 && (
                <motion.div
                  key="q5"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="min-h-[70vh] flex flex-col"
                >
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    How should it feel? ✨
                  </h2>
                  <p className="text-white/90 text-lg mb-8">
                    Choose up to 3 feelings
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {['Calm & peaceful', 'Energetic & motivating', 'Professional & trustworthy', 'Fun & playful', 'Luxurious & premium', 'Minimal & clean', 'Warm & friendly', 'Bold & edgy'].map((feeling) => (
                      <button
                        key={feeling}
                        type="button"
                        onClick={() => toggleFeeling(feeling)}
                        className={`p-6 text-center text-base font-medium rounded-2xl transition-all ${
                          feelings.includes(feeling)
                            ? 'bg-white text-purple-600 scale-105'
                            : 'bg-white/10 backdrop-blur-lg text-white border-2 border-white/30 hover:bg-white/20'
                        }`}
                      >
                        {feeling}
                      </button>
                    ))}
                  </div>
                  {feelings.length > 0 && (
                    <p className="text-white/70 text-sm mt-4 text-center">
                      {feelings.length}/3 selected
                    </p>
                  )}
                  {errors.feelings && (
                    <p className="text-yellow-300 mt-3 text-lg text-center">{errors.feelings.message}</p>
                  )}
                </motion.div>
              )}

              {/* Q6: Color Palette */}
              {currentQuestion === 6 && (
                <motion.div
                  key="q6"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="min-h-[70vh] flex flex-col"
                >
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Pick your colors 🎨
                  </h2>
                  <p className="text-white/90 text-lg mb-8">
                    Choose a color vibe
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {colorPalettes.map((palette) => (
                      <button
                        key={palette.id}
                        type="button"
                        onClick={() => selectAndAdvance('colorPalette', palette.id)}
                        className={`p-6 rounded-2xl transition-all ${
                          colorPalette === palette.id
                            ? 'bg-white scale-105'
                            : 'bg-white/10 backdrop-blur-lg border-2 border-white/30 hover:bg-white/20'
                        }`}
                      >
                        <div className="text-4xl mb-3">{palette.emoji}</div>
                        <div className="flex gap-2 mb-3 justify-center">
                          {palette.colors.map((color) => (
                            <div
                              key={color}
                              className="w-8 h-8 rounded-full border-2 border-white/50"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className={`font-medium ${colorPalette === palette.id ? 'text-purple-600' : 'text-white'}`}>
                          {palette.name}
                        </p>
                      </button>
                    ))}
                  </div>
                  {errors.colorPalette && (
                    <p className="text-yellow-300 mt-3 text-lg text-center">{errors.colorPalette.message}</p>
                  )}
                </motion.div>
              )}

              {/* Q7: Design Inspiration */}
              {currentQuestion === 7 && (
                <motion.div
                  key="q7"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="min-h-[70vh] flex flex-col"
                >
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Design inspiration? 🎯
                  </h2>
                  <p className="text-white/90 text-lg mb-8">
                    Which style speaks to you?
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {designStyles.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => selectAndAdvance('designInspiration', style.id)}
                        className={`p-6 rounded-2xl transition-all ${
                          designInspiration === style.id
                            ? 'bg-white scale-105'
                            : 'bg-white/10 backdrop-blur-lg border-2 border-white/30 hover:bg-white/20'
                        }`}
                      >
                        <div className="text-5xl mb-3">{style.emoji}</div>
                        <p className={`font-bold text-lg mb-1 ${designInspiration === style.id ? 'text-purple-600' : 'text-white'}`}>
                          {style.name}
                        </p>
                        <p className={`text-sm ${designInspiration === style.id ? 'text-purple-500' : 'text-white/70'}`}>
                          {style.description}
                        </p>
                      </button>
                    ))}
                  </div>
                  {errors.designInspiration && (
                    <p className="text-yellow-300 mt-3 text-lg text-center">{errors.designInspiration.message}</p>
                  )}
                </motion.div>
              )}

              {/* Q8-10: Personality Sliders */}
              {currentQuestion >= 8 && currentQuestion <= 10 && (
                <motion.div
                  key={`q${currentQuestion}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="min-h-[70vh] flex flex-col justify-center"
                >
                  {currentQuestion === 8 && (
                    <>
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 text-center">
                        Serious or Fun? 🎭
                      </h2>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        {...register('personalitySeriousFun', { valueAsNumber: true })}
                        className="w-full h-4 rounded-full appearance-none cursor-pointer accent-white bg-white/30"
                        style={{ WebkitAppearance: 'none' }}
                      />
                      <div className="flex justify-between text-white/70 mt-4 text-lg">
                        <span>Serious 😐</span>
                        <span>Fun 🎉</span>
                      </div>
                    </>
                  )}
                  {currentQuestion === 9 && (
                    <>
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 text-center">
                        Minimal or Rich? 🎨
                      </h2>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        {...register('personalityMinimalRich', { valueAsNumber: true })}
                        className="w-full h-4 rounded-full appearance-none cursor-pointer accent-white bg-white/30"
                      />
                      <div className="flex justify-between text-white/70 mt-4 text-lg">
                        <span>Minimal ⚪</span>
                        <span>Feature-Rich 🌈</span>
                      </div>
                    </>
                  )}
                  {currentQuestion === 10 && (
                    <>
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 text-center">
                        Gentle or Motivating? 💪
                      </h2>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        {...register('personalityGentleMotivating', { valueAsNumber: true })}
                        className="w-full h-4 rounded-full appearance-none cursor-pointer accent-white bg-white/30"
                      />
                      <div className="flex justify-between text-white/70 mt-4 text-lg">
                        <span>Gentle 🤗</span>
                        <span>Motivating 🔥</span>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Q11: Special Features */}
              {currentQuestion === 11 && (
                <motion.div
                  key="q11"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="min-h-[70vh] flex flex-col"
                >
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Special features? ✨
                  </h2>
                  <p className="text-white/90 text-lg mb-8">
                    Select all that apply
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'darkMode', label: 'Dark mode', emoji: '🌙' },
                      { name: 'animations', label: 'Animations', emoji: '✨' },
                      { name: 'illustrations', label: 'Illustrations', emoji: '🎨' },
                      { name: 'photos', label: 'Photos', emoji: '📸' },
                      { name: 'gradients', label: 'Gradients', emoji: '🌈' },
                      { name: 'roundedCorners', label: 'Rounded', emoji: '⬜' },
                    ].map((feature) => (
                      <label
                        key={feature.name}
                        className={`p-6 rounded-2xl cursor-pointer transition-all ${
                          watch(feature.name as any)
                            ? 'bg-white scale-105'
                            : 'bg-white/10 backdrop-blur-lg border-2 border-white/30'
                        }`}
                      >
                        <input
                          type="checkbox"
                          {...register(feature.name as any)}
                          className="sr-only"
                        />
                        <div className="text-4xl mb-2">{feature.emoji}</div>
                        <p className={`font-medium ${watch(feature.name as any) ? 'text-purple-600' : 'text-white'}`}>
                          {feature.label}
                        </p>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Q12: Name */}
              {currentQuestion === 12 && (
                <motion.div
                  key="q12"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="min-h-[70vh] flex flex-col"
                >
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    What's your name? 👋
                  </h2>
                  <p className="text-white/90 text-lg mb-8">
                    So we can personalize your results
                  </p>

                  <input
                    type="text"
                    {...register('name')}
                    className="w-full p-6 text-2xl rounded-3xl border-4 border-white/30 focus:border-white focus:ring-0 bg-white/10 backdrop-blur-lg text-white placeholder-white/50"
                    placeholder="Jane Smith"
                  />
                  {errors.name && (
                    <p className="text-yellow-300 mt-3 text-lg">{errors.name.message}</p>
                  )}
                </motion.div>
              )}

              {/* Q13: Email + Submit */}
              {currentQuestion === 13 && (
                <motion.div
                  key="q13"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="min-h-[70vh] flex flex-col"
                >
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Almost done! 📧
                  </h2>
                  <p className="text-white/90 text-lg mb-8">
                    Where should we send your design kit?
                  </p>

                  <input
                    type="email"
                    {...register('email')}
                    className="w-full p-6 text-2xl rounded-3xl border-4 border-white/30 focus:border-white focus:ring-0 bg-white/10 backdrop-blur-lg text-white placeholder-white/50 mb-6"
                    placeholder="jane@example.com"
                  />
                  {errors.email && (
                    <p className="text-yellow-300 mb-4 text-lg">{errors.email.message}</p>
                  )}

                  <label className="flex items-start space-x-3 p-6 bg-white/10 backdrop-blur-lg rounded-2xl border-2 border-white/30 cursor-pointer mb-8">
                    <input
                      type="checkbox"
                      {...register('optedInMarketing')}
                      className="mt-1 w-6 h-6 rounded accent-white"
                    />
                    <div className="flex-1 text-white">
                      <p className="font-medium text-lg mb-1">Send me tips on building my app with AI</p>
                      <p className="text-sm text-white/70">Exclusive tips, tutorials, and updates. Unsubscribe anytime.</p>
                    </div>
                  </label>

                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/30">
                    <p className="text-white font-bold text-lg mb-3">🎁 You'll receive:</p>
                    <ul className="text-white/90 space-y-2">
                      <li>✅ Custom visual moodboard</li>
                      <li>✅ Personalized color palette</li>
                      <li>✅ Ready-to-use Claude Code prompt</li>
                      <li>✅ Complete design brief</li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>

      {/* Bottom CTA - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="max-w-2xl mx-auto">
          {currentQuestion < TOTAL_QUESTIONS && (
            <button
              onClick={nextQuestion}
              className="w-full py-5 bg-white text-purple-600 rounded-full font-bold text-xl shadow-2xl hover:scale-105 transition-all"
            >
              Continue →
            </button>
          )}

          {currentQuestion === TOTAL_QUESTIONS && (
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="w-full py-5 bg-white text-purple-600 rounded-full font-bold text-xl shadow-2xl hover:scale-105 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create My Design Kit ✨'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
