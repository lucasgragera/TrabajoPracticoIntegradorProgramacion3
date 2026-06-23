import type { IUser } from "./types/IUser.js";
import './style.css';

function checkSessionGuard(): void {
  const userData: IUser | null = JSON.parse(localStorage.getItem("userData") || "null");
  
  const currentPath = window.location.pathname;

  const isAuthPage = currentPath.includes("/auth/login/") || 
                     currentPath.includes("/auth/registro/") ||
                     currentPath === "/" || 
                     currentPath === "/index.html";

  if (userData && isAuthPage) {
    if (userData.role === "admin") {
      window.location.href = "/src/pages/admin/home/home.html";
    } else {
      window.location.href = "/src/pages/client/home/home.html";
    }
    return; 
  }

  if (!userData) {
    if (!isAuthPage) {
      window.location.href = "/src/pages/auth/login/login.html";
    }
    return; 
  }

  if (userData.role === "client" && currentPath.includes("/admin/")) {
    console.warn("Acceso denegado: Redirigiendo a zona autorizada.");
    window.location.href = "/src/pages/client/home/home.html";
    return;
  }
}

checkSessionGuard();