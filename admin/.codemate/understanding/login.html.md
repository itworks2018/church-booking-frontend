This code implements an admin login page for a church booking system with the following features:

- **User Interface:**
  - A visually styled login form using Tailwind CSS and a custom glassmorphism effect.
  - Background image covering the entire page.
  - Form fields for admin email and password input.
  - A submit button labeled "Log In as Admin".
  - A link to redirect non-admin users to the regular user login page.

- **Functionality:**
  - On form submission, it prevents the default behavior and captures the entered email and password.
  - Sends a POST request to the backend authentication API to verify credentials.
  - Checks if the login is successful and if the email matches a predefined admin email.
  - If authorized, stores the received JWT token and email in local storage.
  - Redirects the authorized admin user to the admin dashboard page.
  - Displays alert messages for login failures, unauthorized access, or network errors.