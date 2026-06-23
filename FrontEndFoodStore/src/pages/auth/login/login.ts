import type { IUser } from "../../../types/IUser";

function showError(msg: string) {
    if (errorContainer) {
        errorContainer.textContent = msg;
        errorContainer.style.display = "block";
    }
}

const errorContainer = document.getElementById("error-message") as HTMLDivElement;
const form = document.getElementById("form") as HTMLFormElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;
const selectRol = document.getElementById("rol") as HTMLSelectElement;

form.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();

    const valueEmail = inputEmail.value.trim();
    const valuePassword = inputPassword.value.trim();
    const valueRol = selectRol.value;

    if (!valueEmail || !valuePassword || !valueRol) {
        showError("Por favor, completa todos los campos y selecciona un rol.");
        return;
    }

    const users: IUser[] = JSON.parse(localStorage.getItem("users") || "[]");

    // Buscamos coincidencia estricta: Email + Password + Rol
    const foundUser = users.find(u =>
        u.email === valueEmail &&
        u.password === valuePassword &&
        u.role === valueRol
    );

    if (foundUser) {
        const sessionUser = { ...foundUser, loggedIn: true };
        localStorage.setItem("userData", JSON.stringify(sessionUser));

        // Redirección con rutas relativas
        if (foundUser.role === "admin") {
            window.location.href = "../../admin/home/home.html";
        } else {
            window.location.href = "../../client/home/home.html";
        }
    } else {
        alert("Usuario, contraseña o rol incorrectos.");
    }
});