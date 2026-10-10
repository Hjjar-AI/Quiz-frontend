function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

export function contentTranslation(translations, locale) {
  if (!isObject(translations)) return null
  const normalized = String(locale || '').trim().replaceAll('_', '-').toLowerCase()
  if (!normalized) return null
  for (const candidate of [...new Set([normalized, normalized.split('-')[0]])]) {
    const entry = Object.entries(translations).find(([key, content]) =>
      key.replaceAll('_', '-').toLowerCase() === candidate && isObject(content))
    if (entry) return entry[1]
  }
  return null
}

export function questionTranslation(question, locale) {
  return contentTranslation(question?.translations, locale)
}

function translatedText(value) {
  return typeof value === 'string' && value.trim() ? value : null
}

export function localizedCase(caseContext, locale) {
  if (!caseContext) return caseContext
  const translation = contentTranslation(caseContext.translations, locale)
  if (!translation) return caseContext
  return { ...caseContext,
    title: translatedText(translation.title) || caseContext.title,
    stem: translatedText(translation.stem) || caseContext.stem,
  }
}

export function localizedQuestion(question, locale) {
  if (!question) return question
  const translation = questionTranslation(question, locale)
  const originalChoices = Array.isArray(question.choices) ? question.choices : []
  const translatedChoices = Array.isArray(translation?.choices) ? translation.choices : []
  // Stem and choices stay together, preserving option order and answer indices.
  const complete = translatedText(translation?.question) &&
    translatedChoices.length === originalChoices.length && translatedChoices.every(translatedText)
  return {
    ...question,
    case: localizedCase(question.case, locale),
    ...(complete ? {
      question: translation.question,
      text: translation.question,
      choices: translatedChoices,
      explanation: translatedText(translation.explanation) || question.explanation,
    } : {}),
  }
}
