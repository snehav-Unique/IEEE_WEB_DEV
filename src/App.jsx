import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import EventFeedPage from './pages/EventFeedPage'
import EventDetailPage from './pages/EventDetailPage'
import BookmarksPage from './pages/BookmarksPage'

export default function App() {
  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<EventFeedPage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="*" element={<Navigate to="/events" replace />} />
        </Routes>
      </main>
    </div>
  )
}
