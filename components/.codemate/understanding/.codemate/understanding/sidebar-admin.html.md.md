This code implements a responsive user dashboard webpage for a "Church Booking" system with support for light and dark themes. It features:

- A header bar containing a sidebar toggle button (visible on mobile), a theme toggle button, and a logout button.
- A sidebar navigation menu with links to Dashboard, Book a Venue, and My Profile pages. The sidebar is fixed and always visible on larger screens, while on smaller screens it slides in/out with an overlay to close it.
- A main content area that welcomes the user by name, displays three informational cards (My Bookings, Next Event, Profile), and a section for recent bookings that initially shows a loading message.
- Dark mode functionality toggled via a button that adds or removes a "dark" class on the root HTML element, with the user's preference saved in localStorage for persistence.
- JavaScript to handle sidebar toggling on mobile devices, overlay click to close the sidebar, and theme switching.

Overall, the page provides a clean, accessible, and customizable user interface for managing church venue bookings.