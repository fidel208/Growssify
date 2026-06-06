document.addEventListener("DOMContentLoaded", () => {
  const welcomeMsg = document.getElementById("welcome-msg");
  const profileName = document.getElementById("profile-name");
  const profileBusiness = document.getElementById("profile-business");
  const navLinks = document.querySelectorAll("aside nav a");
  const sections = document.querySelectorAll("main > section");

  sections.forEach((section) => {
    if (section.id === "dashboard") {
      section.style.display = "grid";
    } else {
      section.style.display = "none";
    }
  });

  async function fetchUserProfile() {
    try {
      const mockDbResponse = {
        username: "Fidel Muthomi",
        businessName: "Finora Technologies",
      };

      if (welcomeMsg)
        welcomeMsg.textContent = `Hello ${mockDbResponse.username}`;
      if (profileName) profileName.textContent = mockDbResponse.username;
      if (profileBusiness)
        profileBusiness.textContent = mockDbResponse.businessName;
    } catch (error) {
      console.error("Profile database stream offline:", error);
      if (welcomeMsg) welcomeMsg.textContent = "Welcome back";
    }
  }

  function handleNavigation() {
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href");
        if (!targetId.startsWith("#")) return;

        e.preventDefault();

        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");

        sections.forEach((section) => {
          if (`#${section.id}` === targetId) {
            section.style.display = "grid";
          } else {
            section.style.display = "none";
          }
        });
      });
    });
  }

  function setupFormToggles() {
    const revenueBtn = document.getElementById("toggle-revenue-form");
    const expenseBtn = document.getElementById("toggle-expense-form");
    const revenueForm = document.getElementById("revenue-form");
    const expenseForm = document.getElementById("expense-form");

    if (revenueBtn) {
      const newRevenueBtn = revenueBtn.cloneNode(true);
      revenueBtn.parentNode.replaceChild(newRevenueBtn, revenueBtn);

      if (revenueForm) {
        newRevenueBtn.addEventListener("click", (e) => {
          e.preventDefault();
          revenueForm.classList.toggle("revenue-active");
        });
      }
    }

    if (expenseBtn) {
      const newExpenseBtn = expenseBtn.cloneNode(true);
      expenseBtn.parentNode.replaceChild(newExpenseBtn, expenseBtn);

      if (expenseForm) {
        newExpenseBtn.addEventListener("click", (e) => {
          e.preventDefault();
          expenseForm.classList.toggle("expense-active");
        });
      }
    }
  }

  fetchUserProfile();
  handleNavigation();
  setupFormToggles();
});
