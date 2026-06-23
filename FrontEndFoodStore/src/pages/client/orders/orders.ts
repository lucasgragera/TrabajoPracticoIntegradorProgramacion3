import { checkAuhtUser } from '../../../utils/auth.ts';

// 1. Proteger la ruta
checkAuhtUser("/src/pages/auth/login/login.html", "/src/pages/auth/login/login.html", ["client", "admin"]);

const listaPedidos = document.getElementById("lista-pedidos") as HTMLDivElement;
const mensajeVacio = document.getElementById("mensaje-vacio") as HTMLDivElement;
const modal = document.getElementById("modal-detalle") as HTMLDivElement;
const modalBody = document.getElementById("modal-body") as HTMLDivElement;
const closeBtn = document.querySelector(".close-button") as HTMLSpanElement;

// 2. Obtener los datos del usuario logueado
const userDataString = localStorage.getItem("userData");
const userData = userDataString ? JSON.parse(userDataString) : null;

// Diccionario visual de estados
function obtenerDatosEstado(estado: string) {
    switch (estado) {
        case 'PENDIENTE': return { color: '#ff9800', icono: '⏳', mensaje: 'Tu pedido está siendo revisado.' };
        case 'CONFIRMADO': return { color: '#2196F3', icono: '🍳', mensaje: '¡Tu pedido está en la cocina!' };
        case 'TERMINADO': return { color: '#4CAF50', icono: '✅', mensaje: 'Entregado con éxito. ¡Que lo disfrutes!' };
        case 'CANCELADO': return { color: '#f44336', icono: '❌', mensaje: 'Este pedido fue cancelado.' };
        default: return { color: 'gray', icono: '📦', mensaje: '' };
    }
}

function renderizarPedidos() {
    if (!userData) return;

    const todosLosPedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");
    const misPedidos = todosLosPedidos.filter((p: any) => p.usuarioEmail === userData.email);

    if (misPedidos.length === 0) {
        mensajeVacio.style.display = "block";
        listaPedidos.style.display = "none";
        return;
    }

    mensajeVacio.style.display = "none";
    listaPedidos.style.display = "grid"; // Si usas la clase orders-grid de tu CSS
    listaPedidos.innerHTML = "";

    // Reverse para ver los más nuevos arriba
    misPedidos.reverse().forEach((pedido: any) => {
        const fechaFormateada = new Date(pedido.fecha).toLocaleString('es-AR');
        const estadoInfo = obtenerDatosEstado(pedido.estado);
        const shortId = pedido.id.split('-')[0].toUpperCase();

        // RESUMEN DE PRODUCTOS: Primeros 3
        const primerosItems = pedido.items.slice(0, 3);
        const restantes = pedido.items.length - 3;

        let resumenHTML = `<ul style="margin: 10px 0; padding-left: 20px; color: #555; font-size: 0.9em;">`;
        primerosItems.forEach((item: any) => {
            resumenHTML += `<li>${item.cantidad}x ${item.nombre}</li>`;
        });
        if (restantes > 0) resumenHTML += `<li><em>...y ${restantes} más</em></li>`;
        resumenHTML += `</ul>`;

        const card = document.createElement("div");
        card.className = "order-card"; // Usa tu clase de estilo global
        card.style.border = "1px solid #ccc";
        card.style.borderRadius = "8px";
        card.style.padding = "15px";
        card.style.backgroundColor = "#fff";
        card.style.display = "flex";
        card.style.flexDirection = "column";

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 10px;">
                <h3 style="margin: 0;">#${shortId}</h3>
                <span style="background-color: ${estadoInfo.color}; color: white; padding: 5px 10px; border-radius: 12px; font-weight: bold; font-size: 0.85em;">
                    ${estadoInfo.icono} ${pedido.estado}
                </span>
            </div>
            <p style="margin: 0 0 10px 0; color: gray; font-size: 0.85em;">📅 ${fechaFormateada}</p>
            
            <div style="flex-grow: 1;">
                <strong>Resumen:</strong>
                ${resumenHTML}
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px;">
                <h3 style="margin: 0; color: #2e7d32;">$${pedido.total}</h3>
                <button class="btn-ver-detalle" data-id="${pedido.id}" style="padding: 8px 15px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    Ver Detalle
                </button>
            </div>
        `;
        listaPedidos.appendChild(card);
    });

    // Listeners para abrir el modal
    document.querySelectorAll('.btn-ver-detalle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = (e.target as HTMLElement).getAttribute('data-id');
            abrirModalDetalle(id!);
        });
    });
}

function abrirModalDetalle(idPedido: string) {
    const todosLosPedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");
    const pedido = todosLosPedidos.find((p: any) => p.id === idPedido);
    if (!pedido) return;

    const estadoInfo = obtenerDatosEstado(pedido.estado);
    const fecha = new Date(pedido.fecha).toLocaleString('es-AR');

    let listaProductosHTML = pedido.items.map((item: any) => `
        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #eee;">
            <span><strong>${item.cantidad}x</strong> ${item.nombre}</span>
            <span>$${item.precio * item.cantidad}</span>
        </div>
    `).join('');

    modalBody.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 3em;">${estadoInfo.icono}</div>
            <h2 style="margin: 5px 0; color: ${estadoInfo.color};">${pedido.estado}</h2>
            <p style="color: #666; font-style: italic;">${estadoInfo.mensaje}</p>
        </div>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0;"><strong>Pedido:</strong> #${pedido.id.split('-')[0].toUpperCase()}</p>
            <p style="margin: 5px 0 0 0;"><strong>Fecha:</strong> ${fecha}</p>
            <p style="margin: 5px 0 0 0;"><strong>Entrega:</strong> Retiro por local / Envío estándar</p>
        </div>

        <h3 style="border-bottom: 2px solid #ccc; padding-bottom: 5px;">Productos</h3>
        <div style="margin-bottom: 20px; max-height: 200px; overflow-y: auto;">
            ${listaProductosHTML}
        </div>

        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; border: 1px solid #c8e6c9;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span>Subtotal:</span> <span>$${pedido.total}</span></div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: gray;"><span>Envío:</span> <span>¡Gratis!</span></div>
            <div style="display: flex; justify-content: space-between; margin-top: 10px; border-top: 1px solid #a5d6a7; padding-top: 10px; font-size: 1.2em; font-weight: bold; color: #2e7d32;">
                <span>Total Final:</span> <span>$${pedido.total}</span>
            </div>
        </div>
    `;

    modal.style.display = "block";
}

// Cerrar Modal
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
};

renderizarPedidos();