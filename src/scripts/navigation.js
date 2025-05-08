export function updateNav() {
  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");
  const logoutLink = document.getElementById("logout-link");
  const userDropdown = document.getElementById("user-dropdown");
  const userNameShow = document.getElementById("username");

  // Update navigation ARIA attributes
  const navList = document.getElementById("nav-list");
  if (navList) {
    navList.setAttribute("role", "menubar");
    
    // Set ARIA roles for menu items
    const menuItems = navList.querySelectorAll("li");
    menuItems.forEach(item => {
      item.setAttribute("role", "menuitem");
      
      // Ensure links have proper touch targets
      const links = item.querySelectorAll("a");
      links.forEach(link => {
        if (!link.hasAttribute("aria-label")) {
          link.setAttribute("aria-label", link.textContent.trim());
        }
      });
    });
  }

  // Check if the user is logged in by checking localStorage
  if (localStorage.getItem("userToken")) {
    const userName = localStorage.getItem("userName");
    // Update the username display and show the dropdown
    userNameShow.textContent = `${userName.toUpperCase()}`;

    userNameShow.style.display = "block";
    userDropdown.style.display = "block";

    // Set appropriate ARIA attributes
    userDropdown.setAttribute("role", "menu");
    userNameShow.setAttribute("aria-haspopup", "true");
    userNameShow.setAttribute("aria-expanded", "false");

    // Hide login and register links
    loginLink.style.display = "none";
    registerLink.style.display = "none";
  } else {
    // Hide user-related elements if not logged in
    userNameShow.style.display = "none";
    userDropdown.style.display = "none";

    // Show login and register links
    loginLink.style.display = "block";
    registerLink.style.display = "block";
  }

  // Toggle dropdown on username click
  if (userNameShow) {
    userNameShow.addEventListener("click", (e) => {
      e.preventDefault();
      const dropdownMenu = document.getElementById("dropdown-menu");
      const isExpanded = dropdownMenu.style.display === "block";
      
      dropdownMenu.style.display = isExpanded ? "none" : "block";
      userNameShow.setAttribute("aria-expanded", !isExpanded);
    });
  }

  // Logout functionality
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    console.log("Logout successful");

    // Re-run the nav update after logout
    updateNav();
    
    // Navigate to login page
    window.location.hash = "#/login";
  });
}
