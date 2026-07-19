document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header");
  const menuBars = document.getElementById("menu-bars");
  const linksContainer = document.querySelector(".links");
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".links a");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 10) {
      header.style.boxShadow = "0 4px 20px rgba(15, 23, 42, 0.08)";
      header.style.transition = "box-shadow 0.3s ease";
    } else {
      header.style.boxShadow = "none";
    }

    let currentSectionId = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (window.scrollY >= sectionTop - 150) {
        currentSectionId = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("active");
      }
    });
  });

  if (menuBars && linksContainer) {
    menuBars.addEventListener("click", () => {
      linksContainer.classList.toggle("mobile-active");

      if (linksContainer.classList.contains("mobile-active")) {
        menuBars.classList.replace("fa-bars", "fa-xmark");
      } else {
        menuBars.classList.replace("fa-xmark", "fa-bars");
      }
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        linksContainer.classList.remove("mobile-active");
        menuBars.classList.replace("fa-xmark", "fa-bars");
      });
    });
  }

  function getYear() {
    const yearText = document.getElementById("year");

    yearText.textContent = new Date().getFullYear();
  }
  getYear();
});
