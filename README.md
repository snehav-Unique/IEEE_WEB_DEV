# RVCE Campus Events

A polished IEEE RVCE event discovery app built with React and Vite.

## Overview

This project presents RVCE IEEE events in a clean, modern interface with searchable listings, filter controls, bookmark persistence, and personalized recommendations.

## Features

- Multi-page routing for the main event feed, individual event details, and bookmarks.
- Responsive card-based UI with a fixed side navbar and a join-the-branch modal.
- Search across event titles, descriptions, locations, host clubs, and tags.
- Dynamic filters for event type and date range.
- Browse and recommended sections with hash-based navigation.
- Personalized recommendations based on selected interests.
- Multi-select interest picker with instant visual feedback.
- Bookmark persistence in `localStorage`.
- Runtime event loading through `VITE_DATA_SOURCE`.
- Data normalization for inconsistent source fields and date formats.
- Smooth animations and expandable event detail panels.

## Routes

- `/events` - main event feed
- `/event/:id` - event feed with a selected event in focus
- `/bookmarks` - saved events
- `/` - redirects to `/events`

## Tech Stack

- React 18
- React Router
- Vite
- Day.js
- React Icons

## Setup

Install dependencies:

```bash
npm install
```
VERY IMPORTANT :
Make a copy of the .env.example to the new env.local by creating it 

Create a `.env.local` file in the project root:

```bash
VITE_DATA_SOURCE=events.json
```

Place `events.json` in the `public/` directory if you are using a local dataset.

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Data Source

`VITE_DATA_SOURCE` supports:

- A local file such as `events.json`
- A relative path such as `../events.json`
- A remote `http://` or `https://` URL

Example remote source:

```bash
VITE_DATA_SOURCE=https://pub-d6db99c9b68842a5b6f527e86583f256.r2.dev/events.json
```

## Project Notes

- Bookmarks are saved in the browser and survive refreshes.
- Interest selections are also stored locally so recommendations can be restored later.
- The app normalizes incoming event data before rendering, which helps avoid broken cards from messy source data.
- The Events tab scrolls to the browse section, while the Recommended tab scrolls to the personalized section.

## Folder Structure

```text
src/
  components/
  context/
  pages/
  utils/
```
