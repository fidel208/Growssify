const loginLink = document.getElementById("login-link");
const createLink = document.getElementById("create-link");
const loginCont = document.getElementById("login");
const signupCont = document.getElementById("signup");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

const API_URL = "https://growssify-backend.onrender.com/api/auth";
const FIN_API_URL = "https://growssify-backend.onrender.com/api/finance";

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

  const email = document.getElementById("signup-email").value.trim();
  const businessName = document.getElementById("business-name").value.trim();
  const username = document.getElementById("username").value.trim();
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

        document.getElementById("signup-email").style.borderColor = "#cbd5e1";
        document.getElementById("signup-email").style.boxShadow = "none";
        document.getElementById("signup-pass").style.borderColor = "#cbd5e1";
        document.getElementById("signup-pass").style.boxShadow = "none";

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

  const email = document.getElementById("login-email").value.trim();
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
        loginStatus.textContent = "Logging you in...";
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

function applyValidationGlow(inputElement, isValid) {
  if (isValid) {
    inputElement.style.borderColor = "#10b981";
    inputElement.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.15)";
  } else {
    inputElement.style.borderColor = "#ef4444";
    inputElement.style.boxShadow = "0 0 0 3px rgba(239, 68, 68, 0.15)";
  }
}

function clearValidationGlow(inputElement) {
  inputElement.style.borderColor = "#cbd5e1";
  inputElement.style.boxShadow = "none";
}

const signupEmailInput = document.getElementById("signup-email");
if (signupEmailInput) {
  signupEmailInput.addEventListener("input", () => {
    const currentEmail = signupEmailInput.value.trim();

    if (currentEmail === "") {
      clearValidationGlow(signupEmailInput);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(currentEmail);

    applyValidationGlow(signupEmailInput, isEmailValid);
  });
}

const showBox = document.getElementById("checkbox");
showBox.addEventListener("change", function () {
  const loginPassword = document.getElementById("login-pass");
  loginPassword.type = this.checked ? "text" : "password";
});

const password = document.getElementById("signup-pass");
password.addEventListener("input", function () {
  const showMessage = document.getElementById("show-message");
  const currentPassword = password.value.trim();

  if (currentPassword === "") {
    showMessage.textContent = "";
    clearValidationGlow(password);
    return;
  }

  if (currentPassword.length < 8) {
    showMessage.textContent = "Password must be at least 8 characters long";
    showMessage.style.color = "#ef4444";
    applyValidationGlow(password, false);
  } else {
    showMessage.textContent = "";
    showMessage.style.color = "#10b981";
    applyValidationGlow(password, true);
  }
});

const confirmPassword = document.getElementById("confirm-pass");
confirmPassword.addEventListener("input", function () {
  const showMessage = document.getElementById("show-message");

  if (confirmPassword.value === "") {
    showMessage.textContent = "";
    clearValidationGlow(confirmPassword);
    return;
  }

  if (confirmPassword.value === password.value) {
    showMessage.textContent = "Passwords match";
    showMessage.style.color = "#10b981";
    applyValidationGlow(confirmPassword, true);
  } else {
    showMessage.textContent = "Passwords do not match";
    showMessage.style.color = "#ef4444";
    applyValidationGlow(confirmPassword, false);
  }
});
