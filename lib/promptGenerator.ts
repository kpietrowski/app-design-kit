import { DesignKitSubmission } from './supabase'

// Map color palettes to actual hex codes
const colorPaletteMap: Record<string, { colors: string[], description: string }> = {
  'soft-pastels': {
    colors: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFB3', '#E7B3FF'],
    description: 'soft pastel pinks, mint greens, and sky blues'
  },
  'earth-tones': {
    colors: ['#8B7355', '#A0937D', '#C9B8A0', '#6B8E23', '#8FBC8F'],
    description: 'warm browns, sage greens, and natural tans'
  },
  'bold-bright': {
    colors: ['#FF6B35', '#004E89', '#FFC43D', '#9C27B0', '#00BCD4'],
    description: 'vibrant oranges, deep blues, and sunny yellows'
  },
  'monochrome': {
    colors: ['#000000', '#2C2C2C', '#808080', '#D3D3D3', '#FFFFFF'],
    description: 'classic blacks, grays, and whites'
  },
  'ocean-vibes': {
    colors: ['#006BA6', '#0496FF', '#5DFDCB', '#1E88E5', '#00ACC1'],
    description: 'deep ocean blues, turquoise, and seafoam'
  },
  'sunset': {
    colors: ['#9B59B6', '#E67E22', '#F39C12', '#E74C3C', '#FF6B9D'],
    description: 'rich purples, warm oranges, and sunset pinks'
  }
}

// Map design inspirations to style descriptions
const designStyleMap: Record<string, string> = {
  'calm': 'minimalist and zen-like, similar to meditation apps like Calm. Use lots of white space, gentle animations, and soothing colors.',
  'duolingo': 'playful and gamified with bright colors, friendly illustrations, and engaging micro-interactions. Think fun, motivating, and slightly cartoonish.',
  'notion': 'clean, organized, and highly functional. Embrace simple layouts, clear typography, and intuitive navigation patterns.',
  'instagram': 'visual-first and modern with emphasis on images, stories, and contemporary UI patterns. Sleek and trendy.',
  'headspace': 'friendly and illustrated with warm, approachable animations and character-driven design. Feels like a helpful companion.',
  'stripe': 'professional and sleek with subtle gradients, sharp typography, and polished interactions. Corporate but not boring.'
}

export function generateClaudePrompt(submission: DesignKitSubmission): string {
  const appName = submission.app_name || 'your app'
  const colorPalette = colorPaletteMap[submission.color_palette]
  const designStyle = designStyleMap[submission.design_inspiration]

  // Determine personality traits
  const isFun = submission.personality_serious_fun >= 4
  const isMinimal = submission.personality_minimal_rich <= 2
  const isMotivating = submission.personality_gentle_motivating >= 4

  // Build personality description
  let personalityDesc = ''
  if (isFun) {
    personalityDesc += 'Keep the tone fun, casual, and approachable. '
  } else if (submission.personality_serious_fun <= 2) {
    personalityDesc += 'Maintain a professional, serious tone throughout. '
  }

  if (isMinimal) {
    personalityDesc += 'Focus on minimalism—only include essential features with lots of white space. '
  } else if (submission.personality_minimal_rich >= 4) {
    personalityDesc += 'Make it feature-rich with plenty of options, details, and functionality. '
  }

  if (isMotivating) {
    personalityDesc += 'Use motivating language and challenging prompts to push users forward. '
  } else if (submission.personality_gentle_motivating <= 2) {
    personalityDesc += 'Be gentle and supportive in the language and interactions. '
  }

  // Build features list
  const features = []
  if (submission.dark_mode) features.push('dark mode support')
  if (submission.animations) features.push('smooth animations and transitions')
  if (submission.illustrations) features.push('custom illustrations or icons')
  if (submission.photos) features.push('high-quality photos/imagery')
  if (submission.gradients) features.push('gradient backgrounds or accents')
  if (submission.rounded_corners) features.push('rounded corners on UI elements')

  const prompt = `# Build ${appName} - iOS App

## App Concept
${submission.app_idea}

**Target Users:** ${submission.target_audience}
**Primary Action:** ${submission.main_action}

## Design Direction

**Emotional Tone:**
This app should feel ${submission.feelings.join(', ')}.

**Visual Style:**
${designStyle}

**Color Palette:**
Use ${colorPalette.description}. Primary colors:
${colorPalette.colors.map((color, i) => `- ${i === 0 ? 'Primary' : i === 1 ? 'Secondary' : 'Accent ' + (i - 1)}: ${color}`).join('\n')}

**Personality:**
${personalityDesc}

## Technical Requirements

**Platform:** iOS (SwiftUI)

**Special Features:**
${features.length > 0 ? features.map(f => `- ${f}`).join('\n') : '- Standard iOS patterns and interactions'}

## Implementation Plan

1. **Project Setup:**
   - Create a new iOS project using Xcode
   - Set up SwiftUI with the color scheme defined above
   - Configure basic navigation structure

2. **Core Features:**
   - Build the main ${submission.main_action.toLowerCase()} functionality
   - Implement user onboarding flow
   ${submission.dark_mode ? '- Add dark mode support using @Environment(\\.colorScheme)' : ''}
   ${submission.animations ? '- Add smooth animations using SwiftUI transitions' : ''}

3. **UI Components:**
   - Design reusable components matching the ${submission.design_inspiration} aesthetic
   - Implement the color palette consistently across all screens
   ${submission.rounded_corners ? '- Use rounded corners (cornerRadius: 12-20) throughout' : ''}
   ${submission.gradients ? '- Incorporate gradient backgrounds where appropriate' : ''}

4. **Polish:**
   - Add micro-interactions and feedback
   - Ensure accessibility (VoiceOver, Dynamic Type)
   - Test on different iOS devices and screen sizes

## Getting Started

Create a new iOS project in Xcode:
1. Open Xcode
2. Create New Project → iOS → App
3. Use SwiftUI for the interface
4. Name it "${appName}"

Then start building! Focus on the core ${submission.main_action.toLowerCase()} functionality first, then layer in the design aesthetics.

---

**Design Keywords:** ${submission.feelings.join(', ')}, ${submission.design_inspiration}-inspired, ${colorPalette.description}
**User Experience Goal:** Make it effortless for ${submission.target_audience.toLowerCase()} to ${submission.main_action.toLowerCase()}
`

  return prompt
}
