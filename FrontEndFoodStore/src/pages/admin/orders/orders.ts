import { checkAuhtUser } from '../../../utils/auth.ts';

// 1. Proteger ruta: Solo ADMIN puede ver esto
checkAuhtUser(
    "/src/pages/auth/login/login.html",
    "/src/pages/client/home/home.html",
    "admin"
);

const tablaPedidos = document.getElementById("tabla-pedidos") as HTMLTableSectionElement;
const filtroEstado = document.getElementById("filtro-estado") as HTMLSelectElement;
const mensajeVacio = document.getElementById("mensaje-vacio") as HTMLParagraphElement;

// Función para obtener y ordenar pedidos (más recientes primero)
function obtenerPedidos() {
    const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");
    return pedidos.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

// Asignar clase de color según el estado
function obtenerClaseBadge(estado: string) {
    switch (estado) {
        case 'PENDIENTE': return 'badge pendiente';
        case 'CONFIRMADO': return 'badge confirmado';
        case 'TERMINADO': return 'badge terminado';
        case 'CANCELADO': return 'badge cancelado';
        default: return 'badge';
    }
}

// Cambiar estado dinámicamente
(window as any).cambiarEstado = (idPedido: string, nuevoEstado: string) => {
    const pedidos = obtenerPedidos();
    const index = pedidos.findIndex((p: any) => p.id === idPedido);

    if (index !== -1) {
        pedidos[index].estado = nuevoEstado;
        localStorage.setItem("pedidos", JSON.stringify(pedidos));
        renderizarTablaPedidos();
    }
};

// Función para mostrar/ocultar los detalles
(window as any).toggleDetalles = (idPedido: string, boton: HTMLButtonElement) => {
    const filaDetalles = document.getElementById(`detalles-${idPedido}`);
    if (filaDetalles) {
        if (filaDetalles.style.display === "none") {
            filaDetalles.style.display = "table-row";
            boton.textContent = "Cerrar detalles";
            boton.style.backgroundColor = "#ffc107";
            boton.style.color = "#000";
        } else {
            filaDetalles.style.display = "none";
            boton.textContent = "Ver detalles";
            boton.style.backgroundColor = "#e0e0e0";
            boton.style.color = "#333";
        }
    }
};

function renderizarTablaPedidos() {
    const pedidos = obtenerPedidos();
    const estadoFiltrado = filtroEstado.value;

    const pedidosFiltrados = estadoFiltrado === "TODOS"
        ? pedidos
        : pedidos.filter((p: any) => p.estado === estadoFiltrado);

    tablaPedidos.innerHTML = "";

    if (pedidosFiltrados.length === 0) {
        mensajeVacio.style.display = "block";
    } else {
        mensajeVacio.style.display = "none";

        pedidosFiltrados.forEach((pedido: any) => {
            const fechaFormateada = new Date(pedido.fecha).toLocaleString('es-AR');
            const shortId = pedido.id.split('-')[0].toUpperCase();
            const cantidadItems = pedido.items.reduce((acc: number, item: any) => acc + item.cantidad, 0);

            // --- 1. FILA PRINCIPAL (La que siempre se ve) ---
            const filaPrincipal = document.createElement("tr");

            const selectEstado = `
                <select onchange="cambiarEstado('${pedido.id}', this.value)" style="padding: 6px; border-radius: 4px; border: 1px solid #ccc; cursor: pointer; width: 100%; margin-bottom: 8px;">
                    <option value="PENDIENTE" ${pedido.estado === 'PENDIENTE' ? 'selected' : ''}>Pendiente</option>
                    <option value="CONFIRMADO" ${pedido.estado === 'CONFIRMADO' ? 'selected' : ''}>Confirmado</option>
                    <option value="TERMINADO" ${pedido.estado === 'TERMINADO' ? 'selected' : ''}>Terminado</option>
                    <option value="CANCELADO" ${pedido.estado === 'CANCELADO' ? 'selected' : ''}>Cancelado</option>
                </select>
            `;

            filaPrincipal.innerHTML = `
                <td>
                    <strong>#${shortId}</strong><br>
                    <small style="color: gray;">${fechaFormateada}</small>
                </td>
                <td>${pedido.usuarioEmail}</td>
                <td>${cantidadItems} producto(s)</td>
                <td><strong>$${pedido.total}</strong></td>
                <td><span class="${obtenerClaseBadge(pedido.estado)}">${pedido.estado}</span></td>
                <td style="text-align: center; min-width: 150px;">
                    ${selectEstado}
                    <button onclick="toggleDetalles('${pedido.id}', this)" style="padding: 6px 10px; cursor: pointer; background: #e0e0e0; color: #333; border: 1px solid #bbb; border-radius: 4px; font-size: 0.85em; font-weight: bold; width: 100%; transition: all 0.2s;">
                        Ver detalles
                    </button>
                </td>
            `;
            tablaPedidos.appendChild(filaPrincipal);

            // --- 2. FILA DE DETALLES (Oculta por defecto) ---
            const filaDetalles = document.createElement("tr");
            filaDetalles.id = `detalles-${pedido.id}`;
            filaDetalles.style.display = "none";
            filaDetalles.style.backgroundColor = "#fafafa";

            const listaProductosHTML = pedido.items.map((item: any) => `
                <li style="display: flex; justify-content: space-between; border-bottom: 1px dashed #ccc; padding: 8px 0;">
                    <span><strong>${item.cantidad}x</strong> ${item.nombre} <small style="color: gray;">(Unitario: $${item.precio})</small></span>
                    <span><strong>$${item.precio * item.cantidad}</strong></span>
                </li>
            `).join('');

            filaDetalles.innerHTML = `
                <td colspan="6" style="padding: 20px; border-bottom: 2px solid #ccc;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; border: 1px solid #eee; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <h4 style="margin-top: 0; color: #2c3e50; border-bottom: 2px solid #4CAF50; padding-bottom: 8px;">🛒 Detalle de la Orden #${shortId}</h4>
                        <ul style="list-style: none; padding-left: 0; margin: 15px 0;">
                            ${listaProductosHTML}
                        </ul>
                        <div style="text-align: right; margin-top: 15px; font-size: 1.2em; color: #2e7d32; border-top: 1px solid #eee; padding-top: 10px;">
                            <strong>Total Cobrado: $${pedido.total}</strong>
                        </div>
                    </div>
                </td>
            `;
            tablaPedidos.appendChild(filaDetalles);
        });
    }
}

// Escuchar cambios en el filtro
filtroEstado.addEventListener("change", renderizarTablaPedidos);

// Renderizado inicial
renderizarTablaPedidos();