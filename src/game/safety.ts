// A lightweight, keyword-based safety net for the app's free-text inputs
// (mood search, "plant something of your own"). This is deliberately not
// a chatbot and isn't trying to be a real crisis-detection system — it's a
// conservative match against unambiguous phrases, not general sad/heavy
// language (which the mood board already handles on its own gentle terms
// via its "sit with the heavy stuff" mood). The goal is narrow: the app's
// own response should never be cheerful, dismissive, or game-y in the face
// of language like this. False negatives are expected and fine; keeping
// false positives low matters more here, since a wrong match would either
// block something harmless or feel patronizing on an ordinary bad day.
const CRISIS_PHRASES = [
  'kill myself',
  'kill me',
  'want to die',
  'wish i was dead',
  'wish i were dead',
  "don't want to be alive",
  'do not want to be alive',
  "don't want to live",
  'do not want to live',
  'no longer want to live',
  'end my life',
  'ending my life',
  'end it all',
  'suicidal',
  'suicide',
  'hurt myself',
  'harm myself',
  'self harm',
  'self-harm',
  'no reason to live',
  'not worth living',
  'better off dead',
  'better off without me',
  'tired of living',
  'give up on life',
];

export function detectsCrisisLanguage(text: string): boolean {
  const q = text.toLowerCase();
  return CRISIS_PHRASES.some((phrase) => q.includes(phrase));
}

// Resources verified current as of this build: 988 Suicide & Crisis
// Lifeline (call or text 988, or chat at 988lifeline.org) and Crisis Text
// Line (text HOME to 741741) — both US-based, free, 24/7.
export const CRISIS_MESSAGE =
  "that sounds like a lot more than this app is built to hold. if you're thinking about suicide or hurting yourself, please reach out to someone trained for this — call or text 988 (Suicide & Crisis Lifeline), text HOME to 741741 (Crisis Text Line), or a person you trust. you don't have to carry this alone, and outside the US, a local crisis line is worth searching for right now.";
