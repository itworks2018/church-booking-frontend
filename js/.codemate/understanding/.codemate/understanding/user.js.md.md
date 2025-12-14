This JavaScript module provides a user interface for managing venue bookings with the following high-level features:

- **Authentication Handling:** Ensures users are authenticated before accessing the booking interface, redirecting unauthenticated users to the login page. Supports user logout by clearing authentication data and redirecting to login.

- **Venue Management:** Loads available venues from an external API and populates a dropdown menu with venue names and capacities for user selection.

- **Booking Management:** Retrieves the current user's bookings from the API, organizes them by date, and displays detailed booking information including status and timing.

- **Booking Submission:** Offers a form for users to create new bookings by selecting a venue and specifying booking details. Submits booking requests to the API, handles success and error responses, and updates the displayed bookings accordingly.

- **User Feedback:** Provides real-time messages to inform users about the status of data loading, booking submissions, and any errors encountered.

The module depends on external helper functions for API communication, authentication state management, and user role retrieval to facilitate these operations.