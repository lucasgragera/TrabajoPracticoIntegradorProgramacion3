import { checkAuhtUser, logout } from "../../../utils/auth.ts";

// 1. Proteger ruta: Solo ADMIN puede ver esto
checkAuhtUser(
    "/src/pages/auth/login/login.html",
    "/src/pages/client/home/home.html",
    "admin"
);

// 2. Lógica de Logout
const buttonLogout = document.getElementById("logoutButton") as HTMLButtonElement;
buttonLogout?.addEventListener("click", () => {
    logout();
});

// 3. Capturar elementos del DOM para el catálogo
const statCategorias = document.getElementById("stat-categorias") as HTMLParagraphElement;
const statProductos = document.getElementById("stat-productos") as HTMLParagraphElement;
const statPedidos = document.getElementById("stat-pedidos") as HTMLParagraphElement;
const statActivos = document.getElementById("stat-activos") as HTMLParagraphElement;

// 4. Capturar elementos del DOM para el Resumen Rápido (NUEVOS)
const statIngresos = document.getElementById("stat-ingresos") as HTMLParagraphElement;
const statPendientes = document.getElementById("stat-pendientes") as HTMLParagraphElement;
const statPreparacion = document.getElementById("stat-preparacion") as HTMLParagraphElement;
const statCompletados = document.getElementById("stat-completados") as HTMLParagraphElement;
const statCancelados = document.getElementById("stat-cancelados") as HTMLParagraphElement;

// 5. Calcular y renderizar estadísticas
function renderizarDashboard() {
    const categoriasDB = JSON.parse(localStorage.getItem("categorias_db") || "[]");
    const productosDB = JSON.parse(localStorage.getItem("productos_db") || "[]");
    const pedidosGuardados = JSON.parse(localStorage.getItem("pedidos") || "[]");

    // LÓGICA DEL CATÁLOGO
    const categoriasActivas = categoriasDB.filter((c: any) => !c.eliminado).length;
    const productosTotales = productosDB.filter((p: any) => !p.eliminado).length;
    const productosDisponibles = productosDB.filter((p: any) => !p.eliminado && p.disponible && p.stock > 0).length;

    if (statCategorias) statCategorias.textContent = categoriasActivas.toString();
    if (statProductos) statProductos.textContent = productosTotales.toString();
    if (statActivos) statActivos.textContent = productosDisponibles.toString();
    if (statPedidos) statPedidos.textContent = pedidosGuardados.length.toString();

    // LÓGICA DEL RESUMEN RÁPIDO (ÓRDENES)
    let ingresos = 0;
    let pendientes = 0;
    let preparacion = 0;
    let completados = 0;
    let cancelados = 0;

    pedidosGuardados.forEach((pedido: any) => {
        // Contabilizamos estados
        if (pedido.estado === "PENDIENTE") pendientes++;
        else if (pedido.estado === "CONFIRMADO") preparacion++;
        else if (pedido.estado === "TERMINADO") {
            completados++;
            ingresos += pedido.total; // Sumamos la plata solo si el pedido se completó
        }
        else if (pedido.estado === "CANCELADO") cancelados++;
    });

    if (statIngresos) statIngresos.textContent = `$${ingresos.toLocaleString('es-AR')}`;
    if (statPendientes) statPendientes.textContent = pendientes.toString();
    if (statPreparacion) statPreparacion.textContent = preparacion.toString();
    if (statCompletados) statCompletados.textContent = completados.toString();
    if (statCancelados) statCancelados.textContent = cancelados.toString();
}

renderizarDashboard();