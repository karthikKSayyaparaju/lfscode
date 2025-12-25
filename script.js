const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const navActions = document.getElementById("navActions");
const nav = document.querySelector(".nav");

hamburger.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", String(isOpen));
});
