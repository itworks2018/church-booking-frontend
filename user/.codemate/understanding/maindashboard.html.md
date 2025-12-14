This HTML document implements a responsive user dashboard for "CCF Sandoval Events" with dark mode support and dynamic content loading. Key features include:

- **Layout and Styling:** Uses Tailwind CSS for styling, with a light/dark theme toggle controlled via a button and persisted in localStorage.

- **Navigation Bar:** Contains a brand link, a mobile sidebar toggle button, a dark mode toggle, and a profile dropdown with a logout link.

- **Sidebar:** A dark-themed vertical sidebar with user profile info and navigation links to different dashboard pages (Dashboard, Profile, Resources, Create Venue Reservation). The sidebar is collapsible on mobile devices with an overlay.

- **Main Content Area:** Dynamically loads content from separate HTML files into a content container when sidebar links are clicked, defaulting to the dashboard page on load.

- **Footer:** Displays copyright information.

- **JavaScript Functionality:**
  - Toggles dark mode and saves preference.
  - Controls mobile sidebar visibility and overlay.
  - Manages profile dropdown visibility.
  - Loads page content dynamically via fetch requests.
  - Redirects users to login if not authenticated (based on token in localStorage).
  - Redirects admin users (identified by email) to a separate admin dashboard.

Overall, the page provides a user-friendly, theme-aware dashboard interface with client-side routing and access control.