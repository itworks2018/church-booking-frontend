This code implements an admin dashboard page with access control and data display functionality:

1. **Admin Access Guard (`guardAdminPage`)**:  
   - Checks the current user's profile via an API call to verify if they have an admin role.  
   - If the user is not an admin or the profile is missing, redirects them to a non-admin user page (`user.html`).  
   - If the user is an admin, proceeds to load the admin dashboard content.  
   - Handles errors by logging them and redirecting to the homepage (`index.html`).

2. **Loading Admin Dashboard Content (`loadAdminContent`)**:  
   - Fetches all bookings data from an admin-only API endpoint.  
   - Calls a function to render the bookings in a table format.  
   - Displays an error message in the admin content area if data loading fails.

3. **Rendering Bookings Table (`renderBookingsTable`)**:  
   - Takes an array of booking objects and generates an HTML table displaying details such as user, venue, event name, purpose, start/end times, and status.  
   - Handles cases where no bookings exist by showing a relevant message.  
   - Safely accesses nested properties and formats date/time for readability.

4. **Initialization**:  
   - The script starts by invoking the admin guard function to enforce access control and kick off the dashboard loading process if authorized.