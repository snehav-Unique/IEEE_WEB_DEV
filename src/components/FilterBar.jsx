import React from 'react'

const DATE_OPTIONS = [
  { value: 'all', label: 'All dates' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

/**
 * FilterBar — dynamic type dropdown (derived from dataset) + date range chips.
 * Props:
 *   - filters: { type: string, dateRange: string }
 *   - onFilterChange: (newFilters) => void
 *   - eventTypes: string[]  ← derived at runtime from the loaded dataset
 */
export default function FilterBar({ filters, onFilterChange, eventTypes = [] }) {
  const setType = (type) => onFilterChange({ ...filters, type })
  const setDateRange = (dateRange) => onFilterChange({ ...filters, dateRange })

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Type dropdown — options derived from actual dataset */}
      <select
        id="filter-type"
        value={filters.type || ''}
        onChange={(e) => setType(e.target.value)}
        className="px-3 py-2 rounded-xl border border-border bg-panel text-ink text-sm
                   focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
      >
        <option value="">All types</option>
        {eventTypes.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>

      {/* Date range chips */}
      <div className="flex gap-2 flex-wrap">
        {DATE_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setDateRange(value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
              ${(filters.dateRange || 'all') === value
                ? 'bg-accent text-white border-accent'
                : 'bg-panel text-ink-dim border-border hover:text-ink hover:border-accent/50'
              }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
