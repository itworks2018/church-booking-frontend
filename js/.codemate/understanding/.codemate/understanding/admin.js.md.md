This script manages an admin dashboard page with the following key functionalities:

- **Access Control**: It verifies if the current user has admin privileges by fetching their profile. Non-admin users are redirected away to a user-specific page, while errors during this check lead to a homepage redirect.

- **Data Loading**: For authorized admins, it retrieves all booking records from a protected API endpoint and attempts to display them.

- **Data Presentation**: Bookings are rendered in a structured HTML table showing comprehensive details (user, venue, event, purpose, timing, status). If no bookings exist or data retrieval fails, appropriate messages are shown to inform the user.

- **Entry Point**: The script initiates by enforcing the admin access guard, ensuring only authorized users can view and interact with the dashboard content.