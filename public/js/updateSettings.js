/* eslint-disable */
const updateData = (name, email) => {
  fetch('http://127.0.0.1:3000/api/v1/users/updateMe', {
    method: 'PATCH',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
    }),
  })
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      if (data.status === 'success') {
        alert('Data updated')
      } else alert(data.message)
    })
}

const updatePassword = (currentPassword, password, passwordConfirm) => {
  fetch('http://127.0.0.1:3000/api/v1/users/updateMyPassword', {
    method: 'PATCH',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      currentPassword,
      password,
      passwordConfirm,
    }),
  })
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      if (data.status === 'success') {
        alert('Password updated')
      } else alert(data.message)
    })
}

const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')

if (userDataForm) {
  userDataForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const name = document.getElementById('name').value
    const email = document.getElementById('email').value
    updateData(name, email)
  })
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const currentPassword = document.getElementById('password-current').value
    const password = document.getElementById('password').value
    const passwordConfirm = document.getElementById('password-confirm').value
    await updatePassword(currentPassword, password, passwordConfirm)

    document.getElementById('password-current').value = ''
    document.getElementById('password').value = ''
    document.getElementById('password-confirm').value = ''
  })
}
