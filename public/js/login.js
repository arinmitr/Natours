/* eslint-disable */

const login = (email, password) => {
  //console.log(email, password)

  const res = fetch('http://127.0.0.1:3000/api/v1/users/login', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  })
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      if (data.status === 'success') {
        alert('Logged in successfully')
        window.setTimeout(() => {
          location.assign('/')
        }, 1500)
      } else alert(data.message)
    })
}

const logout = () => {
  const res = fetch('http://127.0.0.1:3000/api/v1/users/logout', {
    method: 'GET',
  })
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      console.log(data)
      if (data.status === 'success') window.location.reload()
    })
}

const loginForm = document.querySelector('.form_userLogin')
const logoutBtn = document.querySelector('.nav__el--logout')

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    login(email, password)
  })
}
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout)
}
