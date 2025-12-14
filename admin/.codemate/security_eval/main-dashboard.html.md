# Security Vulnerabilities Report

The provided code is an admin dashboard HTML page with embedded JavaScript for navigation and access control. Below are the identified security vulnerabilities specifically related to this code:

---

## 1. **Client-Side Access Control**

### Description
- The code relies solely on client-side checks using `localStorage` values (`token` and `email`) to determine if the user is authenticated and authorized as an admin.
- Redirects are performed based on these values:
  ```js
  if (!token) {
    window.location.href = "/frontend/admin/admin-login.html";
  }
  if (email !== ADMIN_EMAIL) {
    window.location.href = "/frontend/login.html";
  }
  ```

### Risks
- **Bypassable Access Control:** An attacker can easily manipulate `localStorage` values (e.g., setting `email` to the admin email or adding a fake token) to gain unauthorized access to the admin dashboard.
- **No Server-Side Enforcement:** Without server-side validation, unauthorized users can access sensitive admin pages and potentially perform restricted actions.

### Recommendations
- Implement server-side authentication and authorization checks.
- Use secure HTTP-only cookies or tokens validated by the server.
- Protect admin pages on the server to prevent unauthorized access regardless of client-side state.

---

## 2. **Cross-Site Scripting (XSS) via `innerHTML` Injection**

### Description
- The `loadPage` function fetches HTML content from `pages/${page}` and injects it directly into the DOM using `innerHTML`:
  ```js
  fetch(`pages/${page}`)
    .then(res => res.text())
    .then(html => document.getElementById("contentArea").innerHTML = html)
  ```

### Risks
- **Stored or Reflected XSS:** If any of the loaded pages (`dashboard.html`, `manage-events.html`, etc.) contain malicious scripts or untrusted user input, these scripts will execute in the admin dashboard context.
- **Content Injection:** An attacker who can modify or upload content to these pages can execute arbitrary JavaScript, leading to session hijacking, data theft, or further compromise.

### Recommendations
- Sanitize and validate all HTML content before injecting it into the DOM.
- Use safer methods like DOM parsing or frameworks that automatically escape content.
- Implement Content Security Policy (CSP) headers to restrict script execution.
- Serve the loaded pages from trusted sources only.

---

## 3. **Insecure Logout Implementation**

### Description
- The `logout()` function simply redirects the user to the login page:
  ```js
  function logout() {
    window.location.href = "admin-login.html";
  }
  ```

### Risks
- **No Token Invalidation:** The authentication token stored in `localStorage` is not cleared on logout, meaning the token remains valid and accessible.
- **Session Persistence:** An attacker with access to the browser can reuse the token to regain access without logging in again.

### Recommendations
- Clear authentication tokens and sensitive data from `localStorage` and other storage on logout.
- Invalidate the session/token on the server side if applicable.
- Consider using secure, HTTP-only cookies for session management.

---

## 4. **Hardcoded Admin Email**

### Description
- The admin email is hardcoded in the client-side script:
  ```js
  const ADMIN_EMAIL = "ccfsandovaladmin@gmail.com";
  ```

### Risks
- **Information Disclosure:** Reveals the admin email publicly, which could be targeted for phishing or social engineering.
- **Easy Target for Attackers:** Attackers can use this information to attempt credential stuffing or targeted attacks.

### Recommendations
- Avoid hardcoding sensitive information in client-side code.
- Perform role checks on the server side.
- Use opaque identifiers or tokens rather than explicit emails.

---

## 5. **Lack of HTTPS Enforcement**

### Observation
- The code does not enforce HTTPS usage.

### Risks
- **Man-in-the-Middle (MITM) Attacks:** Without HTTPS, tokens and sensitive data can be intercepted.
- **Session Hijacking:** Tokens stored in `localStorage` are vulnerable to interception over insecure connections.

### Recommendations
- Serve the admin dashboard and all related resources over HTTPS.
- Use secure cookies with `Secure` and `HttpOnly` flags for session management.

---

# Summary

| Vulnerability                     | Severity | Description                                      | Recommendation                             |
|---------------------------------|----------|------------------------------------------------|--------------------------------------------|
| Client-Side Access Control       | High     | Access control enforced only on client side, easily bypassed | Implement server-side authentication and authorization |
| XSS via `innerHTML` Injection    | High     | Injecting fetched HTML directly into DOM without sanitization | Sanitize content, use CSP, and trusted sources only |
| Insecure Logout                  | Medium   | Tokens not cleared on logout, session persists | Clear tokens on logout and invalidate sessions server-side |
| Hardcoded Admin Email            | Low      | Exposes admin email publicly                     | Avoid hardcoding sensitive info client-side |
| Lack of HTTPS Enforcement        | High     | No HTTPS enforcement, data vulnerable in transit | Serve all content over HTTPS |

---

# Final Notes

- The current security model is insufficient for protecting an admin dashboard.
- Strong server-side controls and secure session management are critical.
- Client-side checks can be used for UX improvements but must never be relied upon for security.