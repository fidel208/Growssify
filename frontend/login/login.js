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
  const signupStatus = document.getElementById("signup-status");

  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, businessName, username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (signupStatus) {
        signupStatus.textContent = data.error || "Signup failed.";
        signupStatus.style.color = "#ef4444";
      } else {
        alert(data.error || "Signup failed");
      }
    } else {
      if (signupStatus) {
        signupStatus.textContent =
          "Account created successfully, redirecting...";
        signupStatus.style.color = "#10b981";
      }

      setTimeout(() => {
        signupForm.reset();
        if (signupStatus) signupStatus.textContent = "";
        signupCont.classList.add("hidden");
        loginCont.classList.remove("hidden");
      }, 1500);
    }
  } catch (err) {
    console.error(err);
    if (signupStatus) {
      signupStatus.textContent = "Could not bridge connection with the server.";
      signupStatus.style.color = "#ef4444";
    }
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-pass").value;
  const loginStatus = document.getElementById("login-status");

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (loginStatus) {
        loginStatus.textContent = data.error || "Login verification failed.";
        loginStatus.style.color = "#ef4444";
      }
    } else {
      if (loginStatus) {
        loginStatus.textContent =
          "Logging you in...";
        loginStatus.style.color = "#10b981";
      }

      localStorage.setItem("growssify_token", data.token);

      const processedUser = {
        username: data.user.username,
        businessName:
          data.user.businessName ||
          data.user.companyName ||
          "No Business Linked",
      };

      localStorage.setItem("growssify_user", JSON.stringify(processedUser));

      setTimeout(() => {
        window.location.href = "../dashboard/dash.html";
      }, 1500);
    }
  } catch (err) {
    console.error(err);
    if (loginStatus) {
      loginStatus.textContent = "Could not bridge connection with the server.";
      loginStatus.style.color = "#ef4444";
    }
  }
});
