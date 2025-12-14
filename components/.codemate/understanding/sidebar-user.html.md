This code defines a responsive user dashboard webpage for a "Church Booking" system with light and dark theme support. Key features include:

- **Layout and Styling:** Uses Tailwind CSS for styling and responsive design. The page has a fixed sidebar navigation on larger screens and a toggleable sidebar on smaller screens, with an overlay to close the sidebar on mobile devices.

- **Header:** Contains the page title, a sidebar toggle button (visible on small screens), a theme toggle button to switch between light and dark modes, and a logout button.

- **Sidebar Navigation:** Provides links to the Dashboard, Book a Venue, and My Profile pages. The sidebar is collapsible on mobile devices.

- **Main Content Area:** Welcomes the user by name and displays three informational cards: "My Bookings," "Next Event," and "Profile." Below these, it shows a section for recent bookings, initially displaying a loading message.

- **Interactivity:**
  - Sidebar toggle functionality for mobile view, allowing the sidebar to slide in and out with an overlay.
  - Theme toggle button that switches between light and dark modes, persisting the user's preference in localStorage.
  
Overall, this page serves as a user-friendly dashboard interface for managing church venue bookings with adaptive design and theme customization.