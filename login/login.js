// login.js (after successful login)
localStorage.setItem("token", data.access_token);
window.location.href = "login/dashboard.html";
