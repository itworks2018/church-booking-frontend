This code defines a responsive user dashboard webpage for a "Church Booking" system with light and dark theme support. Key features include:

- **Layout and Styling:** Uses Tailwind CSS for styling and layout, with a dark mode enabled by default on the HTML element. The page has a top header bar, a sidebar navigation menu, and a main content area.

- **Header:** Contains the page title, a sidebar toggle button (visible on small screens), a theme toggle button to switch between light and dark modes, and a logout button.

- **Sidebar Navigation:** Fixed on larger screens and collapsible on smaller screens. It includes links to the Dashboard, Book a Venue, and My Profile pages. The sidebar can be toggled open or closed on mobile devices, with an overlay that closes the sidebar when clicked.

- **Main Content:** Welcomes the user by name, displays three informational cards ("My Bookings," "Next Event," and "Profile"), and a section for recent bookings that initially shows a loading message.

- **Interactivity:**
  - Sidebar toggle functionality for mobile view, showing/hiding the sidebar and overlay.
  - Theme toggle button switches between light and dark modes, persisting the user's preference in localStorage.
  
- **Accessibility and Responsiveness:** The layout adapts to different screen sizes, with the sidebar hidden by default on small screens and visible on medium and larger screens.

Overall, this page serves as a user dashboard interface for managing church venue bookings, with a clean UI, theme customization, and responsive navigation.