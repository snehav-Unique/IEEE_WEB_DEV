import React from 'react';
import dayjs from 'dayjs';

/**
 * EventMeta
 * Displays supplemental metadata for an event such as date, location and host.
 * Props:
 *   - event: normalized event object (required)
 */
const EventMeta = ({ event }) => {
  const start = dayjs(event.startTime);
  const end = dayjs(event.endTime);
  const timeDisplay = start.isSame(end, 'day')
    ? `${start.format('MMM D, h:mm A')} – ${end.format('h:mm A')}`
    : `${start.format('MMM D, h:mm A')} – ${end.format('MMM D, h:mm A')}`;

  return (
    <div className="flex flex-col text-sm text-gray-500 space-y-1 mt-2">
      <div className="flex items-center">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        <span>{timeDisplay}</span>
      </div>
      {event.location && event.location.summary && (
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"/></svg>
          <span>{event.location.summary}</span>
        </div>
      )}
      {event.hostClub && (
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
          <span>{event.hostClub}</span>
        </div>
      )}
    </div>
  );
};

export default EventMeta;
