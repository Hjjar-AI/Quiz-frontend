import { describe, expect, it } from 'vitest'
import { localizedCase, localizedQuestion, questionTranslation } from '@/utils/localizedQuestion'


const question = {
  question: 'Original?',
  text: 'Original?',
  choices: ['A', 'B'],
  explanation: 'Original explanation',
  translations: {
    ar: {
      question: 'الأصل؟',
      choices: ['أ', 'ب'],
      explanation: 'شرح',
    },
    'en-US': {
      question: 'US wording?',
      choices: [],
      explanation: '',
    },
  },
}


describe('localizedQuestion', () => {
  it('uses a complete locale variant without changing answer positions', () => {
    const localized = localizedQuestion(question, 'ar')

    expect(localized.question).toBe('الأصل؟')
    expect(localized.text).toBe('الأصل؟')
    expect(localized.choices).toEqual(['أ', 'ب'])
    expect(localized.explanation).toBe('شرح')
  })

  it('keeps original stem, choices and explanation together for an incomplete translation', () => {
    const localized = localizedQuestion(question, 'en-US')

    expect(localized.question).toBe('Original?')
    expect(localized.choices).toEqual(['A', 'B'])
    expect(localized.explanation).toBe('Original explanation')
  })

  it('falls back from a regional locale to its base language', () => {
    expect(questionTranslation(question, 'ar-SY')).toEqual(question.translations.ar)
  })

  it('matches locale keys case-insensitively with underscore aliases', () => {
    expect(questionTranslation(question, ' EN_us ')).toEqual(question.translations['en-US'])
  })

  it('keeps answer options original when even one translated option is blank', () => {
    const partial = { ...question, translations: { ar: { question: 'مترجم', choices: ['أ', ' '] } } }
    const localized = localizedQuestion(partial, 'ar')
    expect(localized.question).toBe(question.question)
    expect(localized.choices).toEqual(question.choices)
  })

  it('translates available case fields independently without changing the original', () => {
    const original = { title: 'Case', stem: 'Vignette', translations: { AR: { title: 'حالة', stem: ' ' } } }
    expect(localizedCase(original, 'ar-SY')).toMatchObject({ title: 'حالة', stem: 'Vignette' })
    expect(original.title).toBe('Case')
  })

  it('applies case translation even when question translation is incomplete', () => {
    const original = { ...question, translations: { ar: { question: 'مترجم', choices: [] } }, case: { title: 'Case', stem: 'Vignette', translations: { ar: { stem: 'نص الحالة' } } } }
    const localized = localizedQuestion(original, 'ar')
    expect(localized.question).toBe(question.question)
    expect(localized.case.stem).toBe('نص الحالة')
  })
})
