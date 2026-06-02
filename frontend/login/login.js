const loginLink = document.getElementById("login-link");
const createLink = document.getElementById("create-link");
const loginCont = document.getElementById("login");
const signupCont = document.getElementById("signup");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

loginLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginCont.classList.remove("hidden");
  signupCont.classList.add("hidden");
});

createLink.addEventListener("click", (e) => {
  e.preventDefault();
  signupCont.classList.remove("hidden");
  loginCont.classList.add("hidden");
});

loginForm.addEventListener("click", (e) => {
    e.preventDefault();
});

signupForm.addEventListener("click", (e) => {
    e.preventDefault();
})