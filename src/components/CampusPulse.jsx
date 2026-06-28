import React, { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import Orb from './Orb'
import Shuffle from './Shuffle'
import './CampusPulse.css'

dayjs.extend(isBetween)

const FALLBACK_SEQUENCE = [
  { value: '12,483', label: 'Campus Events' },
  { value: '462', label: 'Workshops' },
  { value: '95', label: 'Hackathons' },
  { value: '38', label: 'Free Food Events' },
  { value: '217', label: 'Competitions' },
  { value: '620', label: 'Certificate Events' },
  { value: '185', label: 'Technical Talks' },
]

function toLowerText(value) {
  return typeof value === 'string' ? value.toLowerCase() : ''
}

function asSet(values) {
  return new Set(values.map((value) => toLowerText(value)))
}

function countMatches(events, keywords) {
  const terms = asSet(keywords)
  return events.filter((event) => {
    const haystack = [
      event.type,
      event.title,
      event.description,
      event.hostClub,
      event.location?.summary,
      ...(event.tags ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return [...terms].some((term) => haystack.includes(term))
  }).length
}

function sumCapacity(events, key) {
  return events.reduce((sum, event) => {
    const value = event.capacity?.[key]
    return Number.isFinite(value) ? sum + value : sum
  }, 0)
}

function normalizeCount(value) {
  return Number.isFinite(value) ? value : 0
}

function formatNumber(value) {
  return Number(value).toLocaleString('en-US')
}

export default function CampusPulse({
  events = [],
}) {
  const stats = useMemo(() => {
    const now = dayjs()
    const totalEvents = events.length
    const upcomingEvents = events.filter((event) => event.startTime && dayjs(event.startTime).isAfter(now)).length
    const todayEvents = events.filter((event) => event.startTime && dayjs(event.startTime).isSame(now, 'day')).length
    const activeClubs = new Set(events.map((event) => event.hostClub).filter(Boolean)).size
    const totalRegistrations = sumCapacity(events, 'current')
    const totalCapacity = sumCapacity(events, 'max')
    const fullyBookedEvents = events.filter((event) => event.capacity?.isFull).length
    const workshops = countMatches(events, ['workshop'])
    const hackathons = countMatches(events, ['hackathon'])
    const freeFoodEvents = countMatches(events, ['free food', 'freefood', 'food'])
    const competitions = countMatches(events, ['competition', 'contest', 'challenge'])
    const certificateEvents = countMatches(events, ['certificate', 'certification', 'certified'])
    const technicalTalks = countMatches(events, ['technical talk', 'talk', 'seminar', 'panel', 'lecture'])

    return {
      totalEvents,
      upcomingEvents,
      todayEvents,
      activeClubs,
      totalRegistrations,
      totalCapacity,
      fullyBookedEvents,
      workshops,
      hackathons,
      freeFoodEvents,
      competitions,
      certificateEvents,
      technicalTalks,
    }
  }, [events])

  const sequence = useMemo(() => {
    if (!events.length) {
      return FALLBACK_SEQUENCE
    }

    return [
      { value: formatNumber(stats.totalEvents), label: 'Campus Events' },
      { value: formatNumber(stats.upcomingEvents), label: 'Upcoming Now' },
      { value: formatNumber(stats.totalRegistrations), label: 'Live Registrations' },
      { value: formatNumber(stats.totalCapacity), label: 'Total Capacity' },
      { value: formatNumber(stats.fullyBookedEvents), label: 'Full Events' },
      { value: formatNumber(stats.workshops), label: 'Workshops' },
      { value: formatNumber(stats.hackathons), label: 'Hackathons' },
      { value: formatNumber(stats.freeFoodEvents), label: 'Free Food Events' },
      { value: formatNumber(stats.competitions), label: 'Competitions' },
      { value: formatNumber(stats.certificateEvents), label: 'Certificate Events' },
      { value: formatNumber(stats.technicalTalks), label: 'Technical Talks' },
    ]
  }, [events.length, stats])

  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const sequenceSignature = useMemo(() => sequence.map((item) => `${item.value}:${item.label}`).join('|'), [sequence])

  useEffect(() => {
    setActiveIndex(0)
    setIsTransitioning(false)
  }, [sequenceSignature])

  useEffect(() => {
    if (sequence.length <= 1) return undefined

    let transitionTimeout = null
    let swapTimeout = null
    const interval = setInterval(() => {
      setIsTransitioning(true)

      swapTimeout = window.setTimeout(() => {
        setActiveIndex((current) => (current + 1) % sequence.length)
      }, 170)

      transitionTimeout = window.setTimeout(() => {
        setIsTransitioning(false)
      }, 760)
    }, 4200)

    return () => {
      clearInterval(interval)
      if (transitionTimeout != null) clearTimeout(transitionTimeout)
      if (swapTimeout != null) clearTimeout(swapTimeout)
    }
  }, [sequence.length])

  const activeStat = sequence[activeIndex]

  return (
    <section className="campus-hero">
      <div className="campus-hero__background" aria-hidden="true">
        <div className="campus-hero__grid" />
        <div className="campus-hero__blob campus-hero__blob--one" />
        <div className="campus-hero__blob campus-hero__blob--two" />
        <div className="campus-hero__blob campus-hero__blob--three" />
        <div className="campus-hero__noise" />
      </div>

      <div className="campus-hero__content">
      <div className="campus-hero__copy">
        <div className="campus-hero__eyebrow">RVCE Campus Events</div>
        <h1 className="campus-hero__title">Discover. Bookmark. Never miss campus energy.</h1>
        <p className="campus-hero__subtitle">
          Discover, explore, and never miss technical, cultural, sports, and club events happening across campus.
        </p>
      </div>

        <div className="campus-hero__orb-wrap">
          <div className={`campus-hero__orb-frame ${isTransitioning ? 'is-transitioning' : ''}`}>
            <Orb
              hoverIntensity={2}
              rotateOnHover
              hue={0}
              forceHoverState={false}
              backgroundColor="#fff7fb"
            >
              <div className="campus-hero__orb-copy">
                <div className="campus-hero__metric">
                  <Shuffle
                    key={`${activeStat.value}-${activeIndex}`}
                    text={activeStat.value}
                    shuffleDirection="right"
                    duration={0.35}
                    animationMode="evenodd"
                    shuffleTimes={1}
                    ease="power3.out"
                    stagger={0.03}
                    threshold={0.1}
                    triggerOnce={true}
                    triggerOnHover
                    respectReducedMotion={true}
                    loop={false}
                    loopDelay={0}
                  />
                </div>
                <div className="campus-hero__metric-label">{activeStat.label}</div>
                <div className="campus-hero__metric-note">Orb shows one live stat at a time.</div>
              </div>
            </Orb>
          </div>
        </div>

        <div className="campus-hero__stats">
          <div className="campus-hero__stat-pill">
            <span className="campus-hero__stat-value">{stats.upcomingEvents.toLocaleString('en-US')}</span>
            <span className="campus-hero__stat-label">Upcoming</span>
          </div>
          <div className="campus-hero__stat-pill">
            <span className="campus-hero__stat-value">{stats.activeClubs.toLocaleString('en-US')}</span>
            <span className="campus-hero__stat-label">Active Clubs</span>
          </div>
          <div className="campus-hero__stat-pill">
            <span className="campus-hero__stat-value">{stats.todayEvents.toLocaleString('en-US')}</span>
            <span className="campus-hero__stat-label">Today</span>
          </div>
        </div>
      </div>
    </section>
  )
}
