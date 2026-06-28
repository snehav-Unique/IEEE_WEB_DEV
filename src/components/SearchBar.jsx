import React, { useState, useRef, useEffect, useCallback } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onClear,
  suggestions = [],
  onSuggestionClick,
  placeholder = 'Search event titles...',
  isSearching = false,
}) {
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef(null)

  // Suggestions only show when focused AND there are suggestions
  // (typing alone doesn't trigger search — only Enter/button does)
  const showDropdown = isFocused && value.trim().length > 0 && suggestions.length > 0

  // Click-outside: blur the whole bar
  useEffect(() => {
    const handlePointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const handleSubmit = useCallback((e) => {
    e?.preventDefault()
    setIsFocused(false)
    onSearch?.(value)
  }, [value, onSearch])

  const handleChange = (e) => {
    onChange(e.target.value)
    // don't reopen suggestions mid-type intentionally — user must focus
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmit() }
    if (e.key === 'Escape') setIsFocused(false)
  }

  const handleSuggestionClick = (suggestionValue) => {
    setIsFocused(false)
    onSuggestionClick?.(suggestionValue)
  }

  const handleClear = () => {
    setIsFocused(false)
    onClear?.()
  }

  return (
    <div ref={containerRef} className="w-full">
      <form className="relative w-full" onSubmit={handleSubmit}>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            {/* Left icon: spinner during search, magnifier otherwise */}
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
              {isSearching ? (
                <svg
                  className="w-[1.125rem] h-[1.125rem] animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="10" stroke="#e86fa4" strokeWidth="3" className="opacity-20" />
                  <path fill="#e86fa4" d="M12 2a10 10 0 0110 10h-3a7 7 0 00-7-7V2z" />
                </svg>
              ) : (
                <FiSearch className={`text-lg transition-colors duration-150 ${isFocused ? 'text-accent' : 'text-accent/50'}`} />
              )}
            </span>

            <input
              id="search-events"
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              className={`campus-search-input transition-all duration-150 ${isFocused ? 'ring-2 ring-accent/20' : ''}`}
              autoComplete="off"
              spellCheck={false}
            />

            {value && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()} // keep focus on input
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-white p-1.5 text-ink-dim transition hover:text-accent hover:bg-[#fff1f7]"
                aria-label="Clear search"
              >
                <FiX className="text-base" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="shrink-0 rounded-full border border-accent bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(232,111,164,0.18)] transition-all hover:bg-accent-dim active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching…' : 'Search'}
          </button>
        </div>

        {/* Suggestions dropdown — only while input is focused */}
        {showDropdown && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-2xl border border-border bg-white shadow-[0_12px_35px_rgba(232,111,164,0.12)]">
            <div className="border-b border-border px-4 py-2.5 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Suggestions</p>
              <p className="text-[10px] text-ink-dim">↵ Enter to search</p>
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.value}-${index}`}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionClick(suggestion.value)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#fff4f8]"
                >
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-border bg-[#fff8fb] text-xs font-bold text-accent-dim">
                    {suggestion.kind === 'event' ? 'E' : suggestion.kind === 'keyword' ? 'K' : '•'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink leading-tight">
                      {suggestion.label}
                    </span>
                    <span className="block truncate text-[11px] text-ink-dim leading-tight mt-0.5">
                      {suggestion.kind === 'event'
                        ? `Event${suggestion.helper ? ` · ${suggestion.helper}` : ''}`
                        : suggestion.kind === 'keyword'
                          ? 'Suggested topic'
                          : suggestion.kind === 'interest'
                            ? 'Interest match'
                            : suggestion.kind}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  )
}