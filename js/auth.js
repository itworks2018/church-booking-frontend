import { apiRequest, setToken, setRole } from './api.js'

const loginTab = document.getElementById('login-tab')
const signupTab = document.getElementById('signup-tab')
const loginForm = document.getElementById('login-form')
const signupForm = document.getElementById('signup-form')
const messageDiv = document.getElementById('message')

loginTab.addEventListener('click', () => {
  loginTab.classList.add('active')
  signupTab.classList.remove('active')
  loginForm.classList.remove('hidden')
  signupForm.classList.add('hidden')
  messageDiv.textContent = ''
})

signupTab.addEventListener('click', () => {
  signupTab.classList.add('active')
  loginTab.classList.remove('active')
  signupForm.classList.remove('hidden')
  loginForm.classList.add('hidden')
  messageDiv.textContent = ''
})

function showMessage(text, isError = false) {
  messageDiv.textContent = text
  messageDiv.className = isError ? 'message error' : 'message success'
}

// SIGNUP
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  showMessage('Creating account...')

  const name = document.getElementById('signup-name').value
  const email = document.getElementById('signup-email').value
  const password = document.getElementById('signup-password').value

  try {
    await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })

    const loginRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })

    setToken(loginRes.access_token)

    await apiRequest('/profiles', {
      method: 'POST',
      body: JSON.stringify({ name })
    })

    setRole('user')
    showMessage('Account created! Redirecting...')

    setTimeout(() => {
      window.location.href = 'user.html'
    }, 800)
  } catch (err) {
    showMessage(err.message, true)
  }
})

// LOGIN
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  showMessage('Logging in...')

  const email = document.getElementById('login-email').value
  const password = document.getElementById('login-password').value

  try {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })

    // Save token
    setToken(res.token)

    // Save user details to localStorage
    localStorage.setItem("email", res.user.email)
    localStorage.setItem("full_name", res.user.full_name)
    localStorage.setItem("role", res.user.role)

    showMessage('Login successful! Redirecting...')

    setTimeout(() => {
      window.location.href = res.user.role === 'admin'
        ? 'admin.html'
        : 'user.html'
    }, 800)

  } catch (err) {
    showMessage(err.message, true)
  }
})
