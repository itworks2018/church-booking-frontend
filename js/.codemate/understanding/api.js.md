This code provides utility functions for managing user authentication and making API requests to a backend service.

Key features:
- Defines a base URL for the API.
- Manages an access token and user role, storing and retrieving them from localStorage to persist authentication state across sessions.
- Functions to set and get the authentication token and user role.
- A function to clear authentication data from both memory and localStorage.
- A generic `apiRequest` function to make HTTP requests to the API:
  - Automatically includes JSON content-type headers.
  - Adds an Authorization header with the stored access token if available.
  - Parses JSON responses and throws errors if the response is not successful, propagating error messages from the API.