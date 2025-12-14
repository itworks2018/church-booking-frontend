This code defines an admin dashboard web page with the following key features:

1. **Layout and Styling**:
   - Uses Tailwind CSS for styling.
   - The page is divided into a top navigation bar, a sidebar, and a main content area.
   - The sidebar has a dark theme, while the main content area and navbar have a light theme.

2. **Top Navbar**:
   - Displays the title "Admin Dashboard".
   - Shows a welcome message with the admin's name.
   - Includes a profile button that toggles a dropdown menu with a "Log Out" option.

3. **Sidebar Navigation**:
   - Contains navigation buttons for different admin sections: Dashboard, Manage Events, Profile, Resources, and Create Venue Reservation.
   - A disabled button indicates upcoming features.
   - Clicking a button dynamically loads the corresponding page content into the main content area.

4. **Main Content Area**:
   - Initially loads the "dashboard.html" page content.
   - Content is fetched asynchronously from a "pages" directory and injected into the content area.
   - Displays an error message if the requested page is not found.

5. **JavaScript Functionality**:
   - `loadPage(page)`: Fetches and displays the specified page content.
   - Profile button toggles visibility of the profile dropdown menu.
   - `logout()`: Redirects the user to the admin login page.
   - On page load, the dashboard page is loaded by default.

6. **Access Control**:
   - Checks for a stored authentication token in local storage; if missing, redirects to the admin login page.
   - Verifies that the logged-in user's email matches the admin email; if not, redirects to the general user login page.
   
Overall, this code implements a secure, responsive admin dashboard interface with dynamic content loading and user session validation.