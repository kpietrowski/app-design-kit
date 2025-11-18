'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

type ResultsData = {
  id: string
  app_name: string | null
  app_idea: string
  target_audience: string
  main_action: string
  feelings: string[]
  color_palette: string
  generated_prompt: string | null
  moodboard_images: string[] | null
}

const colorPaletteMap: Record<string, string[]> = {
  'soft-pastels': ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFB3', '#E7B3FF'],
  'earth-tones': ['#8B7355', '#A0937D', '#C9B8A0', '#6B8E23', '#8FBC8F'],
  'bold-bright': ['#FF6B35', '#004E89', '#FFC43D', '#9C27B0', '#00BCD4'],
  'monochrome': ['#000000', '#2C2C2C', '#808080', '#D3D3D3', '#FFFFFF'],
  'ocean-vibes': ['#006BA6', '#0496FF', '#5DFDCB', '#1E88E5', '#00ACC1'],
  'sunset': ['#9B59B6', '#E67E22', '#F39C12', '#E74C3C', '#FF6B9D'],
}

export default function ResultsPage() {
  const params = useParams()
  const [data, setData] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(`/api/results/${params.id}`)
        const result = await response.json()

        if (result.success) {
          setData(result.data)
        }
      } catch (error) {
        console.error('Error fetching results:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchResults()
    }
  }, [params.id])

  const copyPrompt = () => {
    if (data?.generated_prompt) {
      navigator.clipboard.writeText(data.generated_prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Creating your design kit...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Design Kit Not Found</h1>
          <Link href="/" className="text-purple-600 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  const appName = data.app_name || 'Your App'
  const colors = colorPaletteMap[data.color_palette] || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Your {appName} Design Kit is Ready! 🎨
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {data.app_idea}
          </p>
        </motion.div>

        {/* Moodboard */}
        {data.moodboard_images && data.moodboard_images.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Visual Moodboard</h2>
            <div className="grid grid-cols-3 gap-4">
              {data.moodboard_images.map((url, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
                >
                  <Image
                    src={url}
                    alt={`Moodboard image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Color Palette */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12 bg-white rounded-3xl shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Color Palette</h2>
          <div className="grid grid-cols-5 gap-4">
            {colors.map((color, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="text-center"
              >
                <div
                  className="w-full aspect-square rounded-2xl shadow-lg mb-3 cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    navigator.clipboard.writeText(color)
                  }}
                />
                <p className="text-sm font-mono text-gray-700">{color}</p>
                <p className="text-xs text-gray-500">Click to copy</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Design Brief */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12 bg-white rounded-3xl shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Design Brief</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-purple-600 mb-2">App Name</h3>
              <p className="text-gray-700">{appName}</p>
            </div>
            <div>
              <h3 className="font-bold text-purple-600 mb-2">Target Audience</h3>
              <p className="text-gray-700">{data.target_audience}</p>
            </div>
            <div>
              <h3 className="font-bold text-purple-600 mb-2">Primary Purpose</h3>
              <p className="text-gray-700">{data.main_action}</p>
            </div>
            <div>
              <h3 className="font-bold text-purple-600 mb-2">Emotional Tone</h3>
              <p className="text-gray-700">{data.feelings.join(', ')}</p>
            </div>
          </div>
        </motion.section>

        {/* Claude Code Prompt */}
        {data.generated_prompt && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-8 text-white"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Your Claude Code Prompt ✨</h2>
              <button
                onClick={copyPrompt}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-medium transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <span>✓</span>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-black/30 rounded-2xl p-6 overflow-x-auto">
              <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                {data.generated_prompt}
              </pre>
            </div>

            <p className="mt-6 text-purple-200 text-sm">
              💡 Copy this prompt and paste it into Claude Code to start building your app!
            </p>
          </motion.section>
        )}

        {/* Next Steps / CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-12 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your App?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our course to learn how to use Claude Code and AI to build real iOS apps—no coding experience needed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://www.appin30days.com"
              className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-yellow-300 hover:text-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Join the Course →
            </Link>

            <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-purple-600 transition-all">
              Download Design Kit PDF
            </button>
          </div>

          <p className="mt-8 text-sm opacity-75">
            Check your email for a copy of your design kit and next steps!
          </p>
        </motion.section>
      </div>
    </div>
  )
}
