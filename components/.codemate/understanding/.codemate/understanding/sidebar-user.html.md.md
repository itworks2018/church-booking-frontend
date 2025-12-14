This code implements a responsive user dashboard webpage for a "Church Booking" system featuring light and dark theme support. The interface includes:

- A top header bar with:
  - A sidebar toggle button (visible on small screens) to open/close the sidebar.
  - A page title.
  - A dark mode toggle button that switches themes and saves the preference in localStorage.
  - A logout button.

- A sidebar navigation menu containing links to:
  - Dashboard
  - Book a Venue
  - My Profile
  The sidebar is collapsible on mobile devices and fixed on larger screens, with an overlay that appears when open on mobile to allow closing by clicking outside.

- A main content area that:
  - Welcomes the user by name (placeholder).
  - Displays three informational cards: My Bookings, Next Event (with dynamic text), and Profile.
  - Shows a recent bookings section initially displaying a loading message (placeholder for dynamic content).

Styling is managed using Tailwind CSS with dark mode enabled via a "dark" class on the root HTML element. JavaScript handles sidebar toggling, overlay visibility, and dark mode switching with persistence. User-specific data such as the user name and bookings list are placeholders intended for dynamic population. The overall design provides a user-friendly, responsive dashboard for managing church venue bookings with theme customization.