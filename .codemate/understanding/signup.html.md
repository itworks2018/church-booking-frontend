This HTML document implements a "Sign Up" page for a church booking system with the following key features:

1. **Layout and Styling**:
   - Uses Tailwind CSS for styling and responsive design.
   - Applies a glassmorphism effect to the sign-up form container with a semi-transparent blurred background.
   - Sets a full-screen background image for the page.

2. **Navbar Integration**:
   - Dynamically loads a navigation bar from an external HTML file (`components/navbar.html`) using JavaScript fetch and inserts it into the page.

3. **Sign-Up Form**:
   - Contains input fields for full name, email, contact number, role selection (with predefined roles), and password.
   - All fields are required and styled for clarity and usability.
   - Includes a submit button styled with a green theme.
   - Provides a link to the login page for existing users.

4. **Sign-Up Logic**:
   - Handles form submission with JavaScript to prevent default behavior.
   - Collects and trims user input values.
   - Sends a POST request with the user data in JSON format to a backend API endpoint (`/api/auth/signup`) hosted at `church-booking-backend.onrender.com`.
   - Processes the API response:
     - On success, alerts the user and redirects to the login page.
     - On failure, displays an error alert.
   - Includes error handling for network or unexpected issues.

Overall, this page provides a user-friendly interface for new users to create an account in the church booking system, integrating frontend form handling with backend API communication.