This JavaScript module manages a user interface for venue booking within a web application. It performs the following key functions:

1. **Authentication and Access Control**: 
   - Checks if the user has a valid role; if not, redirects to the login page.
   - Provides a logout button that clears authentication data and redirects to the login page.

2. **Venue Management**:
   - Fetches a list of available venues from the server via an API call.
   - Populates a dropdown selection with venue options, displaying venue name, area, and capacity range.

3. **Booking Management**:
   - Retrieves the current user's bookings from the server.
   - Groups bookings by date and displays them in a structured format, showing event name, status, venue, time range, and purpose.
   - Handles cases where no bookings exist or when loading fails.

4. **Booking Submission**:
   - Handles form submission for creating new bookings.
   - Collects booking details from form inputs including venue, event name, purpose, and start/end datetime.
   - Sends a POST request to create a new booking.
   - Provides user feedback on submission success or failure.
   - Refreshes the displayed bookings list after a successful submission.

5. **User Feedback**:
   - Displays success or error messages to the user in response to various actions like loading data or submitting bookings.

Overall, the code integrates UI elements with backend API calls to facilitate venue booking management for authenticated users.