# Theme visual QA checklist

Run this once in every theme, at comfortable and compact density. Check both English and Arabic, plus one view containing mixed Arabic/English content.

- [ ] Dashboard: Today action is dominant; progress, secondary sections, and heatmap remain readable at 320 px and desktop widths.
- [ ] Long question card: long stem, choices, two visible status badges, `+N` disclosure, actions, and expanded explanation do not overflow.
- [ ] Form errors: label, required state, hint/error text, focus ring, disabled control, and long validation messages retain contrast.
- [ ] Table: sticky header, compact density, horizontal-scroll fallback, and stacked mobile rows remain usable with long values.
- [ ] Mobile navigation: four bottom destinations fit without truncating controls; the top menu reaches every secondary/admin destination.
- [ ] Toast: success, warning, and error variants clear the bottom navigation and remain readable over page content.
- [ ] Dialog: focus ring, backdrop, long title/body, actions, and scroll lock work without a horizontal page shift.
- [ ] Theme selector: Light, Dark, and Accessibility groups are clear; Auto follows the operating-system scheme without a flash; browser chrome matches the page background.
- [ ] Charts and category markers: series remain distinguishable without colour, and user-selected category colours retain a visible outline on light and dark cards.
- [ ] Auth pages: Login remains a standalone card without app chrome; Change Password keeps app chrome and renders its key/title header exactly once at 320 px and desktop widths.
- [ ] Bulk-action dialogs: fields and actions fit the mobile bottom sheet without horizontal overflow at 320–360 px.
- [ ] Mixed content: Arabic shell with English clinical terms and English shell with Arabic question text preserve direction, wrapping, numerals, and icon alignment.

Also enable the operating system’s reduced-motion preference and confirm that welcome, card entrance, hover lift, toast, dialog, progress, and critical-state animations are removed or reduced to an instant state change.

## Optional case translations (pending)

- [ ] QuestionForm's clinical-case section contains a collapsed translation editor; opening loads the case, permission checks use actual case-linked question authorship, and optional title/stem fields save independently with an expected revision. New cases require the question to be saved first. Blank fields retain originals in readers; clearing both fields removes a language translation.
- [ ] Case-only draft changes protect route and enclosing editor/dialog navigation. Pending drafts lock case-key/question submission; read failures retain drafts. Concurrent changes/unknown saves require Refresh and explicit Keep draft/Use saved, without automatic write replay. Successful saves remain confirmed and case selectors update. Account/server changes do not display or apply stale private responses.
- [ ] Arabic/English/regional locale matching renders available case fields together with question content in library cards, study/exam/recall, master attempts and previews. Absent case fields retain originals, title-only/translated-only stems display, and no extra reader buttons appear. Check RTL, 320px, keyboard, screen reader, large text and Markdown editing.
- [ ] Frozen master/ordinary/offline content retains its supplied case translation after live edits. Client JSON downloads retain case translations; export previews use the same resolver. Existing completed-result views retain original content. Confirm hidden choices/answers and exam timing are unchanged.
