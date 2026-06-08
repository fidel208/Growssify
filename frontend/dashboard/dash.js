document.addEventListener("DOMContentLoaded", () => {
  const welcomeMsg = document.getElementById("welcome-msg");
  const profileName = document.getElementById("profile-name");
  const profileBusiness = document.getElementById("profile-business");
  const navLinks = document.querySelectorAll("aside nav a");
  const sections = document.querySelectorAll("main > section");

  const API_URL = "http://localhost:5000/api/auth";
  const FIN_API_URL = "http://localhost:5000/api/finance";

  const token = localStorage.getItem("growssify_token");

  sections.forEach((section) => {
    if (section.id === "dashboard") {
      section.style.display = window.innerWidth <= 768 ? "flex" : "grid";
    } else {
      section.style.display = "none";
    }
  });

  async function fetchUserProfile() {
    try {
      const storedUser = localStorage.getItem("growssify_user");

      if (!storedUser) {
        window.location.href = "../login/login.html";
        return;
      }

      const userPayload = JSON.parse(storedUser);

      if (welcomeMsg)
        welcomeMsg.textContent = `Hello ${userPayload.username || "User"}`;
      if (profileName) profileName.textContent = userPayload.username || "User";
      if (profileBusiness)
        profileBusiness.textContent =
          userPayload.businessName || "No Business Linked";

      const editBizInput = document.getElementById("edit-business-name");
      const editUserInput = document.getElementById("edit-username");
      const editEmailInput = document.getElementById("edit-email");

      if (editBizInput && userPayload.businessName)
        editBizInput.value = userPayload.businessName;
      if (editUserInput && userPayload.username)
        editUserInput.value = userPayload.username;
      if (editEmailInput && userPayload.email)
        editEmailInput.value = userPayload.email;
    } catch (error) {
      console.error("Profile account stream tracking offline:", error);
      if (welcomeMsg) welcomeMsg.textContent = "Welcome back";
    }
  }

  async function fetchTransactions() {
    const tbody = document.getElementById("activity-tbody");
    const revTotalSpan = document.getElementById("today-revenue-total");
    const expTotalSpan = document.getElementById("today-expense-total");

    const dashTodaySales = document.getElementById("dash-today-sales");
    const dashMonthSales = document.getElementById("dash-month-sales");
    const dashPieChart = document.getElementById("dash-pie-chart");
    const pieProfitPct = document.getElementById("pie-profit-pct");
    const pieExpensePct = document.getElementById("pie-expense-pct");

    try {
      const response = await fetch(`${FIN_API_URL}/transactions`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Could not retrieve ledger arrays");

      const transactions = await response.json();

      let todayRevenue = 0;
      let todayExpense = 0;
      let currentMonthRevenue = 0;
      let currentMonthExpense = 0;

      let yearlyMonthNetIncome = Array(12).fill(0);

      const now = new Date();
      const todayString = now.toISOString().split("T")[0];
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      if (tbody) tbody.innerHTML = "";

      transactions.forEach((tx) => {
        const txDateObj = new Date(tx.created_at);
        const txISODate = txDateObj.toISOString().split("T")[0];
        const txYear = txDateObj.getFullYear();
        const txMonth = txDateObj.getMonth();
        const numericAmount = parseFloat(tx.amount);

        if (txISODate === todayString) {
          if (tx.type.toLowerCase() === "revenue")
            todayRevenue += numericAmount;
          if (tx.type.toLowerCase() === "expense")
            todayExpense += numericAmount;
        }

        if (txYear === currentYear && txMonth === currentMonth) {
          if (tx.type.toLowerCase() === "revenue")
            currentMonthRevenue += numericAmount;
          if (tx.type.toLowerCase() === "expense")
            currentMonthExpense += numericAmount;
        }

        if (txYear === currentYear) {
          if (tx.type.toLowerCase() === "revenue") {
            yearlyMonthNetIncome[txMonth] += numericAmount;
          } else if (tx.type.toLowerCase() === "expense") {
            yearlyMonthNetIncome[txMonth] -= numericAmount;
          }
        }

        if (tbody) {
          const tr = document.createElement("tr");
          const txDateFormatted = txDateObj.toLocaleDateString("en-GB");
          const txTimeFormatted = txDateObj.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          });
          const typeBadgeColor =
            tx.type.toLowerCase() === "revenue" ? "#10b981" : "#ef4444";

          tr.innerHTML = `
            <td>${txDateFormatted}</td>
            <td>${tx.description}</td>
            <td><strong>${numericAmount.toLocaleString()}</strong></td>
            <td><span style="color:${typeBadgeColor};font-weight:600;">${tx.type}</span></td>
            <td>${txTimeFormatted}</td>
          `;
          tbody.appendChild(tr);
        }
      });

      if (dashTodaySales)
        dashTodaySales.textContent = todayRevenue.toLocaleString();
      if (dashMonthSales)
        dashMonthSales.textContent = currentMonthRevenue.toLocaleString();

      if (revTotalSpan)
        revTotalSpan.textContent = todayRevenue.toLocaleString();
      if (expTotalSpan)
        expTotalSpan.textContent = todayExpense.toLocaleString();

      const totalMonthTurnover = currentMonthRevenue + currentMonthExpense;
      let profitPercentage = 100;
      let expensePercentage = 0;

      if (totalMonthTurnover > 0) {
        profitPercentage = Math.round(
          (currentMonthRevenue / totalMonthTurnover) * 100,
        );
        expensePercentage = 100 - profitPercentage;
      }

      if (pieProfitPct) pieProfitPct.textContent = profitPercentage;
      if (pieExpensePct) pieExpensePct.textContent = expensePercentage;

      if (dashPieChart) {
        dashPieChart.style.background = `conic-gradient(#6366f1 0% ${profitPercentage}%, #10b981 ${profitPercentage}% 100%)`;
      }

      const maxMonthlyNet = Math.max(
        ...yearlyMonthNetIncome.map((val) => Math.abs(val)),
        1000,
      );
      const yAxisLabels = document.getElementById("y-axis-labels");
      if (yAxisLabels) {
        const step = Math.round(maxMonthlyNet / 5);
        yAxisLabels.innerHTML = `
          <span>${(step * 5).toLocaleString()}</span>
          <span>${(step * 4).toLocaleString()}</span>
          <span>${(step * 3).toLocaleString()}</span>
          <span>${(step * 2).toLocaleString()}</span>
          <span>${(step * 1).toLocaleString()}</span>
          <span>0</span>
        `;
      }
      yearlyMonthNetIncome.forEach((netIncome, monthIndex) => {
        const barPill = document.querySelector(
          `.bar-pill[data-month="${monthIndex}"]`,
        );
        if (barPill) {
          let calculatedHeight = 0;
          if (netIncome > 0) {
            calculatedHeight = Math.round((netIncome / maxMonthlyNet) * 100);
          }

          barPill.style.height = `${calculatedHeight}%`;
          barPill.setAttribute(
            "title",
            `Net Income: Kes. ${netIncome.toLocaleString()}`,
          );
        }
      });

      if (tbody && transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#64748b;padding:20px;">No historical activities compiled yet.</td></tr>`;
      }
    } catch (err) {
      console.error("Ledger rendering pipeline exception dropped:", err);
    }
  }

  function setupFinancialSubmissions() {
    const revForm = document.getElementById("revenue-form");
    const expForm = document.getElementById("expense-form");

    if (revForm) {
      revForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const amount = document.getElementById("revenue-amount").value;
        const description = document.getElementById(
          "revenue-description",
        ).value;

        try {
          const response = await fetch(`${FIN_API_URL}/add`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ amount, description, type: "Revenue" }),
          });

          if (!response.ok) {
            const data = await response.json();
            alert(data.error || "Failed to commit revenue record.");
          } else {
            revForm.reset();
            revForm.classList.remove("revenue-active");
            await fetchTransactions();
          }
        } catch (err) {
          console.error(err);
          alert("Could not process financial connection with server.");
        }
      });
    }

    if (expForm) {
      expForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const amount = document.getElementById("expense-amount").value;
        const description = document.getElementById(
          "expense-description",
        ).value;

        try {
          const response = await fetch(`${FIN_API_URL}/add`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ amount, description, type: "Expense" }),
          });

          if (!response.ok) {
            const data = await response.json();
            alert(data.error || "Failed to commit expense record.");
          } else {
            expForm.reset();
            expForm.classList.remove("expense-active");
            await fetchTransactions();
          }
        } catch (err) {
          console.error(err);
          alert("Could not process financial connection with server.");
        }
      });
    }
  }

  function setupSettingsBackend() {
    const editForm = document.getElementById("edit-profile-form");
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");

    if (editForm) {
      editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById("edit-submit-btn");
        if (submitBtn) submitBtn.disabled = true;

        const businessName = document
          .getElementById("edit-business-name")
          .value.trim();
        const username = document.getElementById("edit-username").value.trim();
        const email = document.getElementById("edit-email").value.trim();

        try {
          const response = await fetch(`${API_URL}/update-profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ businessName, username, email }),
          });

          const data = await response.json();

          if (!response.ok) {
            alert(data.error || "Failed to update profile details.");
          } else {
            alert("Account details updated successfully!");
            const updatedUser = { username, businessName, email };
            localStorage.setItem("growssify_user", JSON.stringify(updatedUser));
            window.location.reload();
          }
        } catch (err) {
          console.error(err);
          alert("Could not bridge connection with the server.");
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        if (
          !confirm(
            "Are you absolutely sure you want to delete your entire account? This action cannot be undone.",
          )
        )
          return;

        try {
          const response = await fetch(`${API_URL}/delete-account`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            const data = await response.json();
            alert(data.error || "Failed to delete account processing request.");
          } else {
            alert("Your account has been permanently removed. Redirecting...");
            localStorage.removeItem("growssify_token");
            localStorage.removeItem("growssify_user");
            window.location.href = "../login/login.html";
          }
        } catch (err) {
          console.error(err);
          alert("Could not bridge connection with the server.");
        }
      });
    }
  }

  function handleNavigation() {
    navLinks.forEach((link) => {
      ["click", "touchend"].forEach((eventType) => {
        link.addEventListener(eventType, function (e) {
          const targetId = this.getAttribute("href");
          if (!targetId || !targetId.startsWith("#")) return;

          e.preventDefault();
          e.stopPropagation();

          navLinks.forEach((l) => l.classList.remove("active"));
          this.classList.add("active");

          sections.forEach((section) => {
            if (`#${section.id}` === targetId) {
              if (window.innerWidth <= 768) {
                section.style.display = "flex";
              } else {
                section.style.display = "grid";
              }
            } else {
              section.style.display = "none";
            }
          });

          const sidebar = document.querySelector("aside");
          const menuIcon = document.getElementById("menu-icon");
          if (
            window.innerWidth <= 768 &&
            sidebar &&
            sidebar.classList.contains("menu-open")
          ) {
            sidebar.classList.remove("menu-open");
            if (menuIcon) menuIcon.textContent = "menu";
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

    if (revenueBtn && revenueForm) {
      const newRevenueBtn = revenueBtn.cloneNode(true);
      revenueBtn.parentNode.replaceChild(newRevenueBtn, revenueBtn);
      newRevenueBtn.addEventListener("click", (e) => {
        e.preventDefault();
        revenueForm.classList.toggle("revenue-active");
      });
    }

    if (expenseBtn && expenseForm) {
      const newExpenseBtn = expenseBtn.cloneNode(true);
      expenseBtn.parentNode.replaceChild(newExpenseBtn, expenseBtn);
      newExpenseBtn.addEventListener("click", (e) => {
        e.preventDefault();
        expenseForm.classList.toggle("expense-active");
      });
    }
  }

  function setupMobileSidebar() {
    const menuIcon = document.getElementById("menu-icon");
    const sidebar = document.querySelector("aside");

    if (!menuIcon || !sidebar) return;

    menuIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("menu-open");
      if (sidebar.classList.contains("menu-open")) {
        menuIcon.textContent = "close";
      } else {
        menuIcon.textContent = "menu";
      }
    });
  }

  fetchUserProfile();
  fetchTransactions();
  setupFinancialSubmissions();
  setupSettingsBackend();
  handleNavigation();
  setupFormToggles();
  setupMobileSidebar();

  const logoutLink = document.querySelector('a[href="../login/login.html"]');
  if (logoutLink) {
    logoutLink.addEventListener("click", () => {
      localStorage.removeItem("growssify_token");
      localStorage.removeItem("growssify_user");
    });
  }

  const contactForm = document.getElementById("help-form");
  const formStatus = document.getElementById("form-status");

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const submitButton = document.getElementById("help-button");
      if (!submitButton) return;

      const originalButtonText = submitButton.textContent;
      submitButton.textContent = "Sending...";
      submitButton.disabled = true;

      formStatus.textContent = "";
      formStatus.style.opacity = "1";

      emailjs
        .sendForm("service_4nu9vxq", "template_qh2hyg1", this)
        .then(() => {
          formStatus.style.color = "#10b981";
          formStatus.textContent =
            "Message sent successfully! Thank you for reaching out.";
          contactForm.reset();
        })
        .catch((error) => {
          console.error("Mail Delivery Failure:", error);
          formStatus.style.color = "#ef4444";
          formStatus.textContent =
            "Failed to send message. Please try again or email me directly.";
        })
        .finally(() => {
          submitButton.textContent = originalButtonText;
          submitButton.disabled = false;
          setTimeout(() => {
            formStatus.style.opacity = "0";
            setTimeout(() => {
              formStatus.textContent = "";
            }, 300);
          }, 5000);
        });
    });
  }

  const deleteTriggerBtn = document.getElementById("trigger-delete-btn");
  const deleteAccountBox = document.querySelector(".delete-account");
  const cancelDeleteBtn = document.querySelector(".btn-cancel");

  if (deleteTriggerBtn && deleteAccountBox) {
    deleteTriggerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      deleteAccountBox.classList.toggle("active-warning");
    });
  }

  if (cancelDeleteBtn && deleteAccountBox) {
    cancelDeleteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      deleteAccountBox.classList.remove("active-warning");
    });
  }
});
