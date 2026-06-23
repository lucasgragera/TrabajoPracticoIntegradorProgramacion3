interface IUser {
    email: string;
    password: string;
    role: string;
    loggedIn: boolean;
}

function showError(msg: string) {
    if (errorContainer) {
        errorContainer.textContent = msg;
        errorContainer.style.display = "block";
    }
}

const errorContainer = document.getElementById("error-message") as HTMLDivElement;
const registroForm = document.querySelector("#registroForm") as HTMLFormElement;

registroForm.addEventListener("submit", (e: Event) => {
    e.preventDefault();

    const data = new FormData(registroForm);
    const email = (data.get("email") as string).trim();
    const password = (data.get("password") as string).trim();
    const role = data.get("role") as string;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        showError("El formato del correo electrónico no es válido.");
        return;
    }

    if (password.length < 6) {
        showError("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    if (!email || !password || !role) {
        showError("Por favor, completa todos los campos.");
        return;
    }

    const nuevoUsuario: IUser = {
        email,
        password,
        role,
        loggedIn: false
    };

    const usuariosGuardados: IUser[] = JSON.parse(localStorage.getItem("users") || "[]");
    //Verificar si el correo ya está registrado
    if (usuariosGuardados.some(u => u.email === email)) {
        showError("Este correo ya está registrado.");
        return;
    }

    usuariosGuardados.push(nuevoUsuario);
    localStorage.setItem("users", JSON.stringify(usuariosGuardados));

    alert("¡Registro completado! Ahora puedes iniciar sesión.");

    window.location.href = "/src/pages/auth/login/login.html";
});