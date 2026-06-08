const loginLink = document.getElementById("login-link");
const createLink = document.getElementById("create-link");
const loginCont = document.getElementById("login");
const signupCont = document.getElementById("signup");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

const API_URL = "http://localhost:5000/api/auth";

createLink.addEventListener("click", (e) => {
  e.preventDefault();
  signupCont.classList.remove("hidden");
  loginCont.classList.add("hidden");
});

loginLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginCont.classList.remove("hidden");
  signupCont.classList.add("hidden");
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("signup-email").value;
  const businessName = document.getElementById("business-name").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("signup-pass").value;

  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, businessName, username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Signup failed");
    } else {
      alert("Account configured successfully! Redirecting to sign in...");
      signupForm.reset();
      signupCont.classList.add("hidden");
      loginCont.classList.remove("hidden");
    }
  } catch (err) {
    console.error(err);
    alert("Could not bridge connection with the server.");
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-pass").value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Login verification failed");
    } else {
      localStorage.setItem("growssify_token", data.token);

      const processedUser = {
        username: data.user.username,
        businessName:
          data.user.businessName ||
          data.user.companyName ||
          "No Business Linked",
      };

      localStorage.setItem("growssify_user", JSON.stringify(processedUser));

      window.location.href = "../dashboard/dash.html";
    }
  } catch (err) {
    console.error(err);
    alert("Could not bridge connection with the server.");
  }
});
