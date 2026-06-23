import { checkAuhtUser, logout } from "../../../utils/auth";

const initPage = () => {
  // 1. Verificación de autenticación
  checkAuhtUser(
    "/src/pages/auth/login/login.html",
    "/src/pages/auth/login/login.html",
    ["client", "admin"]
  );

  // 2. Lógica del botón Logout
  const buttonLogout = document.getElementById("logoutButton") as HTMLButtonElement;
  buttonLogout?.addEventListener("click", () => {
    logout();
  });

  // 3. Lógica para mostrar el botón de Panel Admin
  const linkPanelAdmin = document.getElementById("link-panel-admin") as HTMLAnchorElement;
  const userDataString = localStorage.getItem("userData");

  if (userDataString && linkPanelAdmin) {
    try {
      const userData = JSON.parse(userDataString);
      if (userData.role === "admin") {
        linkPanelAdmin.style.display = "inline-block";
      }
    } catch (e) {
      console.error("Error al parsear userData", e);
    }
  }
};

initPage();