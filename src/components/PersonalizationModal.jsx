import React from 'react'
import { INTERESTS } from '../utils/personalization'

export default function PersonalizationModal({
  open,
  selectedInterestIds = [],
  onToggleInterest,
  onContinue,
  onSkip,
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#fff6fa]/95 backdrop-blur-xl px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="personalize-title"
      aria-describedby="personalize-subtitle"
    >
      <div className="w-full max-w-3xl rounded-[2rem] border border-border bg-white shadow-[0_30px_90px_rgba(232,111,164,0.12)] overflow-hidden">
        <div className="bg-[linear-gradient(135deg,rgba(248,215,229,0.45),rgba(255,255,255,0.92))] px-6 sm:px-8 py-6 border-b border-border">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent mb-3">
            Personalization
          </p>
          <h2 id="personalize-title" className="font-display text-2xl sm:text-3xl font-bold text-ink">
            Personalize Your Experience
          </h2>
          <p id="personalize-subtitle" className="mt-2 text-sm sm:text-base text-ink-dim leading-relaxed">
            Select the topics you're interested in so we can recommend events you'll love.
          </p>
        </div>

        <div className="px-6 sm:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INTERESTS.map((interest) => {
              const selected = selectedInterestIds.includes(interest.id)
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => onToggleInterest(interest.id)}
                  className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200
                    ${selected
                      ? 'border-accent bg-[#fff1f7] shadow-[0_12px_24px_rgba(232,111,164,0.12)]'
                      : 'border-border bg-white hover:border-accent/40 hover:bg-[#fff8fb]'
                    }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white border border-border text-lg shadow-sm">
                    {interest.emoji}
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold text-ink leading-snug">{interest.label}</span>
                    <span className="block mt-1 text-xs text-ink-dim">
                      {selected ? 'Selected' : 'Tap to add this interest'}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={onSkip}
              className="px-5 py-3 rounded-xl border border-border bg-white text-ink-dim font-semibold hover:border-accent/40 hover:text-ink transition-colors"
            >
              Skip for Now
            </button>

            <button
              type="button"
              onClick={onContinue}
              className="px-6 py-3 rounded-xl border border-accent bg-accent text-white font-semibold shadow-[0_10px_24px_rgba(232,111,164,0.24)] hover:bg-accent-dim transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
