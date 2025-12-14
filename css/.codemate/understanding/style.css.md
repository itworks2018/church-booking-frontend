This CSS stylesheet provides styling for a clean, modern web interface with the following key features:

1. **Global Reset and Base Styles**:
   - Resets margin, padding, and sets box-sizing to border-box for all elements.
   - Sets a sans-serif font ("Inter"), light background color, and readable text color for the body.

2. **Container Layout**:
   - Defines a centered container with a max width of 900px, padding, white background, rounded corners, and subtle shadow for a card-like appearance.

3. **Topbar Section**:
   - Uses flexbox to space content horizontally with vertical centering.
   - Styles the main heading with a bold blue color.
   - Styles a logout button with red background and hover effect.

4. **Forms**:
   - Provides spacing and block display for labels.
   - Styles inputs, selects, and textareas with full width, padding, subtle borders, rounded corners, and light background.
   - Textareas have a minimum height.
   - Buttons are full width with blue background, white text, rounded corners, and hover darkening effect.

5. **Authentication Tabs**:
   - Displays tabs as flex items with spacing.
   - Tabs have a light gray background by default and switch to blue with white text when active.

6. **Messages**:
   - Styles success and error messages with distinct background and text colors, padding, and rounded corners.

7. **Bookings List**:
   - Groups bookings by day with a light background and padding.
   - Individual booking items have white background, padding, rounded corners, margin, left border color-coded by status (pending, approved, rejected, canceled), and subtle shadow.

8. **Responsive Design**:
   - Adjusts container margin and padding on smaller screens.
   - Changes topbar layout to vertical with spacing.
   - Slightly reduces font sizes for buttons and headings on narrow viewports.

Overall, the stylesheet creates a user-friendly, visually appealing layout suitable for a booking or authentication-related web application.