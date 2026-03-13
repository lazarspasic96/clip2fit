import type { FormDataSummary } from '@/types/form-coaching'

// Canned coaching messages based on active issues
const COACHING_MESSAGES: Record<string, string[]> = {
  'Back rounding detected': [
    'Focus on bracing your core before each rep. Take a big breath and push your belly into your belt.',
    'Think about pulling your chest up and keeping your spine neutral throughout the lift.',
  ],
  'Excessive forward lean': [
    'Try pushing your knees out more — this will help you stay upright.',
    'Think about sitting back into the squat rather than folding forward.',
  ],
  'Knees caving inward': [
    'Focus on pushing your knees out over your toes. Think about spreading the floor with your feet.',
    'Try a slightly wider stance if your knees keep caving.',
  ],
  'Squat depth too shallow': [
    'Try pausing at the bottom for a count to build confidence in the hole.',
    'Work on ankle mobility — tight ankles often limit squat depth.',
  ],
  'Not fully locked out': [
    'Squeeze your glutes hard at the top of each rep to ensure full lockout.',
    'Think about driving your hips through at the top.',
  ],
  'Too much back arch': [
    'Brace your core harder before pressing. Think about keeping your ribs down.',
    'Try squeezing your glutes to stabilize your pelvis during the press.',
  ],
  'Go deeper — hips should reach knee level': [
    'From this angle, it looks like you need more depth. Try to get hips to knee level.',
    'Focus on sitting down between your heels to increase depth.',
  ],
  'Leaning forward — keep chest up': [
    'Your torso is tilting forward. Focus on keeping your chest proud.',
    'Try looking slightly up — it can help keep your torso more upright.',
  ],
  'Shoulders uneven — keep bar level': [
    'One shoulder is dropping. Focus on pulling both shoulders back evenly.',
    'Check your grip width — an uneven grip can cause shoulder tilt.',
  ],
}

const GENERIC_GOOD_MESSAGES = [
  'Looking solid! Keep maintaining that form.',
  'Great consistency — your depth and control are on point.',
  'Nice work! Focus on keeping this tempo.',
  'Form is looking clean. Stay focused on your breathing.',
]

const SIDE_VIEW_QUALIFIER = 'Switch to side view for a deeper form analysis.'

let hasSpokenQualifier = false

export const resetCoachingState = () => {
  hasSpokenQualifier = false
}

export const getMockCoachingMessage = (summary: FormDataSummary): {
  displayMessage: string
  spokenMessage: string
} => {
  const hasSkippedChecks = summary.skippedChecks.length > 0

  // If there are active issues, provide specific coaching
  for (const issue of summary.activeIssues) {
    const messages = COACHING_MESSAGES[issue]
    if (messages !== undefined) {
      const base = messages[Math.floor(Math.random() * messages.length)]

      if (hasSkippedChecks && !hasSpokenQualifier) {
        hasSpokenQualifier = true
        return {
          displayMessage: `${base} ${SIDE_VIEW_QUALIFIER}`,
          spokenMessage: base,
        }
      }

      return { displayMessage: base, spokenMessage: base }
    }
  }

  // No issues — encouraging message (with qualifier on first pass if checks skipped)
  const goodMsg = GENERIC_GOOD_MESSAGES[Math.floor(Math.random() * GENERIC_GOOD_MESSAGES.length)]

  if (hasSkippedChecks && !hasSpokenQualifier) {
    hasSpokenQualifier = true
    return {
      displayMessage: `${goodMsg} ${SIDE_VIEW_QUALIFIER}`,
      spokenMessage: goodMsg,
    }
  }

  return { displayMessage: goodMsg, spokenMessage: goodMsg }
}
