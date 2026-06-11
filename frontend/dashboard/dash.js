document.addEventListener("DOMContentLoaded", () => {
  const welcomeMsg = document.getElementById("welcome-msg");
  const profileName = document.getElementById("profile-name");
  const profileBusiness = document.getElementById("profile-business");
  const navLinks = document.querySelectorAll("aside nav a");
  const sections = document.querySelectorAll("main > section");
  const aside = document.querySelector("aside");
  const menuIcon = document.getElementById("menu-icon");
  const closeIcon = document.getElementById("menu-close");
  const nav = document.querySelector("aside nav");

  const API_URL = "https://growssify-backend.onrender.com/api/auth";
  const FIN_API_URL = "https://growssify-backend.onrender.com/api/finance";

  // const API_URL = "http://localhost:5000/api/auth";
  // const FIN_API_URL = "http://localhost:5000/api/finance";
  const token = localStorage.getItem("growssify_token");

  function initSectionViews() {
    sections.forEach((section) => {
      if (section.id === "dashboard") {
        section.style.display = window.innerWidth <= 768 ? "" : "grid";
      } else {
        section.style.display = "none";
      }
    });
  }

  initSectionViews();

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

      cachedTransactions = transactions;

      let todayRevenue = 0,
        todayExpense = 0;
      let currentMonthRevenue = 0,
        currentMonthExpense = 0;
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
                        <td>${numericAmount.toLocaleString()}</td>
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
      let profitPercentage = 100,
        expensePercentage = 0;
      if (totalMonthTurnover > 0) {
        profitPercentage = Math.round(
          (currentMonthRevenue / totalMonthTurnover) * 100,
        );
        expensePercentage = 100 - profitPercentage;
      }

      if (pieProfitPct) pieProfitPct.textContent = profitPercentage;
      if (pieExpensePct) pieExpensePct.textContent = expensePercentage;
      if (dashPieChart) {
        dashPieChart.style.background = `conic-gradient(#6366f1 0% ${profitPercentage}%, #f43f5e ${profitPercentage}% 100%)`;
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
          let calculatedHeight =
            netIncome > 0 ? Math.round((netIncome / maxMonthlyNet) * 100) : 0;
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

    // 🎯 Added feedbackId to pass your specific "added-revenue" or "added-expense" paragraph elements
    const submitRecord = async (
      e,
      form,
      amountId,
      descId,
      type,
      activeClass,
      feedbackId,
    ) => {
      e.preventDefault();

      const amount = document.getElementById(amountId).value;
      const description = document.getElementById(descId).value;
      const statusMessage = document.getElementById(feedbackId);

      try {
        const response = await fetch(`${FIN_API_URL}/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount, description, type }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Render error inline if server crashes or validations fail
          if (statusMessage) {
            statusMessage.textContent =
              data.error || `Failed to commit ${type.toLowerCase()} record.`;
            statusMessage.style.backgroundColor = "#fef2f2";
            statusMessage.style.color = "#991b1b";
            statusMessage.style.border = "1px solid #fca5a5";
            statusMessage.classList.add("success-active");
            statusMessage.style.opacity = "1";
          }
        } else {
          form.reset();
          form.classList.remove(activeClass);
          await fetchTransactions();

          // 🚀 Trigger Custom Inline Success feedback
          if (statusMessage) {
            statusMessage.textContent = `${type} added successfully!`;

            // Apply unique styles depending on transaction context
            if (type === "Revenue") {
              statusMessage.style.backgroundColor = "#ecfdf5";
              statusMessage.style.color = "#065f46";
              statusMessage.style.border = "1px solid #a7f3d0";
            } else {
              statusMessage.style.backgroundColor = "#fef2f2";
              statusMessage.style.color = "#991b1b";
              statusMessage.style.border = "1px solid #fca5a5";
            }

            statusMessage.classList.add("success-active");
            statusMessage.style.opacity = "1";

            // ⏱️ Gracefully slide out after 3.5 seconds
            setTimeout(() => {
              statusMessage.style.opacity = "0";
              setTimeout(() => {
                statusMessage.classList.remove("success-active");
                statusMessage.textContent = "";
              }, 300);
            }, 3500);
          }
        }
      } catch (err) {
        console.error(err);
        if (statusMessage) {
          statusMessage.textContent =
            "Could not process financial connection with server.";
          statusMessage.style.backgroundColor = "#fef2f2";
          statusMessage.style.color = "#991b1b";
          statusMessage.style.border = "1px solid #fca5a5";
          statusMessage.classList.add("success-active");
          statusMessage.style.opacity = "1";
        }
      }
    };

    if (revForm) {
      revForm.addEventListener("submit", (e) =>
        submitRecord(
          e,
          revForm,
          "revenue-amount",
          "revenue-description",
          "Revenue",
          "revenue-active",
          "added-revenue",
        ),
      );
    }

    if (expForm) {
      expForm.addEventListener("submit", (e) =>
        submitRecord(
          e,
          expForm,
          "expense-amount",
          "expense-description",
          "Expense",
          "expense-active",
          "added-expense",
        ),
      );
    }
  }

  function setupSettingsBackend() {
    const editForm = document.getElementById("edit-profile-form");
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    const editStatus = document.getElementById("edit-status");

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
            editStatus.textContent = "Failed to update profile details.";
          } else {
            editStatus.textContent = "Account details updated successfully..";

            localStorage.setItem(
              "growssify_user",
              JSON.stringify({ username, businessName, email }),
            );

            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        } catch (err) {
          console.error(err);
          editStatus.textContent =
            "Could not bridge connection with the server.";
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const deleteStatus = document.getElementById("delete-status");
        if (deleteStatus) deleteStatus.textContent = "";

        try {
          const response = await fetch(`${API_URL}/delete-account`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            const data = await response.json();
            if (deleteStatus) {
              deleteStatus.textContent =
                data.error || "Failed to delete account processing request.";
              deleteStatus.style.color = "#ef4444";
            }
          } else {
            if (deleteStatus) {
              deleteStatus.textContent =
                "Your account has been permanently removed. Redirecting...";
              deleteStatus.style.color = "#10b981";
            }

            localStorage.removeItem("growssify_token");
            localStorage.removeItem("growssify_user");

            setTimeout(() => {
              window.location.href = "../login/login.html";
            }, 2000);
          }
        } catch (err) {
          console.error(err);
          if (deleteStatus) {
            deleteStatus.textContent =
              "Could not bridge connection with the server.";
            deleteStatus.style.color = "#ef4444";
          }
        }
      });
    }
  }

  function handleNavigation() {
    navLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (!targetId || !targetId.startsWith("#")) return;
        e.preventDefault();
        navLinks.forEach((l) => l.classList.remove("active"));
        this.classList.add("active");
        sections.forEach((section) => {
          if (`#${section.id}` === targetId) {
            section.style.display = window.innerWidth <= 768 ? "" : "grid";
          } else {
            section.style.display = "none";
          }
        });

        if (window.innerWidth <= 1024) {
          closeNav();
        }
      });
    });
  }

  let overlay = document.querySelector(".nav-overlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.classList.add("nav-overlay");
    document.body.appendChild(overlay);
  }

  function openNav() {
    aside?.classList.add("nav-open");
    overlay?.classList.add("active");
    if (menuIcon) menuIcon.style.setProperty("display", "none", "important");
    if (closeIcon) closeIcon.style.setProperty("display", "flex");
  }

  function closeNav() {
    aside?.classList.remove("nav-open");
    overlay?.classList.remove("active");

    if (menuIcon) menuIcon.style.setProperty("display", "flex");
    if (closeIcon) closeIcon.style.setProperty("display", "none", "important");
  }

  menuIcon?.addEventListener("click", openNav);
  closeIcon?.addEventListener("click", closeNav);
  overlay?.addEventListener("click", closeNav);

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
          formStatus.style.fontSize = "15px";
          formStatus.textContent =
            "Message sent successfully! Thank you for reaching out.";
          contactForm.reset();
        })
        .catch((error) => {
          console.error("Mail Delivery Failure:", error);
          formStatus.style.color = "#ef4444";
          formStatus.style.fontSize = "15px";
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
          }, 3000);
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

  const logoutLink = document.querySelector('a[href="../login/login.html"]');
  if (logoutLink) {
    logoutLink.addEventListener("click", () => {
      localStorage.removeItem("growssify_token");
      localStorage.removeItem("growssify_user");
    });
  }

  const exportBtn = document.getElementById("export-btn");

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      if (!cachedTransactions || cachedTransactions.length === 0) {
        alert("There are no transaction records compiled to export yet.");
        return;
      }

      let csvContent = "Date,Time,Description,Type,Amount (Kes)\n";

      cachedTransactions.forEach((tx) => {
        const txDateObj = new Date(tx.created_at);
        const dateStr = txDateObj.toLocaleDateString("en-GB");
        const timeStr = txDateObj.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        });

        const cleanDesc = tx.description
          ? tx.description.replace(/,/g, " ")
          : "No Description";
        const txType = tx.type || "Unknown";
        const amount = tx.amount || 0;

        csvContent += `${dateStr},${timeStr},${cleanDesc},${txType},${amount}\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      const currentDateString = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      downloadLink.href = url;
      downloadLink.setAttribute(
        "download",
        `Growssify_Statement_${currentDateString}.csv`,
      );
      downloadLink.style.visibility = "hidden";

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  }

  fetchUserProfile();
  fetchTransactions();
  setupFinancialSubmissions();
  setupSettingsBackend();
  handleNavigation();
  setupFormToggles();
});
