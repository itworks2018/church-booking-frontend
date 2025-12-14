This HTML document implements a user login page for a church booking system with the following key features:

- **Layout and Styling**: Uses Tailwind CSS for responsive styling and a custom "glass-box" style to create a translucent, blurred background effect for the login form. The page background is set to a full-screen image.

- **Dynamic Components**: Loads external HTML snippets for the navigation bar and footer asynchronously via JavaScript fetch calls, inserting them into designated divs.

- **Login Form**: Presents a centered login form with email and password inputs and a submit button. The form includes client-side validation for required fields and a link to a signup page.

- **Login Logic**:
  - On form submission, prevents default behavior and sends a POST request with the entered email and password to a backend authentication API.
  - Handles API responses by displaying error alerts if login fails.
  - Specifically blocks admin users from logging in on this user login page by checking the email against a predefined admin email.
  - On successful login, stores the received JWT token and user email in local storage.
  - Redirects authenticated users to the user dashboard page.

Overall, the page provides a secure and user-friendly interface for regular users to log into the church booking system, while separating admin access to a different login page.