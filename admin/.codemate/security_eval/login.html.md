# Security Vulnerabilities Report

The provided code is an admin login page with client-side login logic. Below are the identified security vulnerabilities and concerns:

---

## 1. Client-Side Authorization Check

- **Issue:**  
  The code checks if the entered email matches the hardcoded admin email (`ADMIN_EMAIL`) **only on the client side** after receiving a successful login response from the backend:
  ```js
  if (email !== ADMIN_EMAIL) {
    alert("You are not authorized to access the admin dashboard.");
    return;
  }
  ```
- **Risk:**  
  This check can be easily bypassed by an attacker by modifying the client-side JavaScript or sending requests directly to the backend API. The backend should enforce authorization and verify that the authenticated user has admin privileges.

- **Recommendation:**  
  Implement server-side authorization checks to ensure only admin users can log in or access admin resources. The backend should return an error or restrict access if the user is not an admin.

---

## 2. Storing JWT Token in `localStorage`

- **Issue:**  
  The JWT access token is stored in `localStorage`:
  ```js
  localStorage.setItem("token", data.access_token);
  ```
- **Risk:**  
  `localStorage` is accessible via JavaScript and vulnerable to Cross-Site Scripting (XSS) attacks. If an attacker manages to inject malicious scripts, they can steal the token and impersonate the user.

- **Recommendation:**  
  Consider storing tokens in HTTP-only, Secure cookies to mitigate XSS risks. If `localStorage` must be used, ensure the application has strong Content Security Policy (CSP) and XSS protections.

---

## 3. Lack of Content Security Policy (CSP)

- **Issue:**  
  The HTML does not include any Content Security Policy headers or meta tags.

- **Risk:**  
  Without CSP, the application is more vulnerable to XSS attacks, which can lead to token theft or unauthorized actions.

- **Recommendation:**  
  Implement a strict CSP to restrict the sources of executable scripts and other resources.

---

## 4. No Rate Limiting or Brute Force Protection Indicated

- **Issue:**  
  The frontend code does not show any rate limiting or brute force protection mechanisms.

- **Risk:**  
  Attackers could attempt to brute force admin credentials by repeatedly submitting the login form.

- **Recommendation:**  
  Ensure the backend implements rate limiting, account lockout, or CAPTCHA after multiple failed login attempts.

---

## 5. No Secure Transmission Enforcement Shown

- **Issue:**  
  The code uses a hardcoded API URL with HTTPS, which is good:
  ```js
  const ADMIN_API_BASE_URL = "https://church-booking-backend.onrender.com";
  ```
- **Risk:**  
  However, there is no enforcement or fallback if the page is loaded over HTTP, which could lead to mixed content or downgrade attacks.

- **Recommendation:**  
  Ensure the entire site is served over HTTPS and consider adding HSTS headers on the server side.

---

## 6. Exposure of Admin Email in Frontend Code

- **Issue:**  
  The admin email is hardcoded and visible in the frontend JavaScript:
  ```js
  const ADMIN_EMAIL = "ccfsandovaladmin@gmail.com";
  ```
- **Risk:**  
  This exposes the admin email publicly, which could be used for targeted phishing or enumeration attacks.

- **Recommendation:**  
  Avoid exposing sensitive information like admin emails in client-side code. Perform all authorization checks on the server side.

---

# Summary

| Vulnerability                      | Severity | Description                                                                                  | Recommendation                                      |
|----------------------------------|----------|----------------------------------------------------------------------------------------------|----------------------------------------------------|
| Client-Side Authorization Check  | High     | Authorization enforced only on client side, easily bypassed.                                | Enforce authorization on backend.                   |
| JWT Storage in `localStorage`    | Medium   | Vulnerable to XSS attacks leading to token theft.                                           | Use HTTP-only cookies or strong XSS protections.    |
| Missing Content Security Policy  | Medium   | No CSP increases risk of XSS attacks.                                                       | Implement strict CSP headers.                        |
| No Rate Limiting Indicated        | Medium   | Potential for brute force attacks on login.                                                 | Implement rate limiting and brute force protections.|
| Exposure of Admin Email           | Low      | Admin email exposed publicly in frontend code.                                              | Avoid exposing sensitive info in frontend.          |

---

# Additional Notes

- The code uses `alert()` for error messages, which is not a security issue but could be improved for better UX.
- The backend API URL is hardcoded; consider environment-based configuration for flexibility and security.

---

# Conclusion

The main security concern is the reliance on client-side checks for admin authorization, which must be enforced on the backend. Additionally, storing tokens in `localStorage` and exposing sensitive information in frontend code increase the attack surface. Implementing server-side authorization, secure token storage, CSP, and brute force protections will significantly improve security.