import { obtenerCarrito, calcularTotal, restarCantidad, sumarCantidad, eliminarProducto } from './cart.service.ts';

const listaCarrito = document.getElementById("lista-carrito") as HTMLDivElement;
const mensajeVacio = document.getElementById("mensaje-vacio") as HTMLDivElement;
const resumenPedido = document.getElementById("resumen-pedido") as HTMLDivElement; // Capturamos el nuevo cuadro
const btnConfirmar = document.getElementById("btn-confirmar-compra") as HTMLButtonElement;
const btnVaciar = document.getElementById("btn-vaciar") as HTMLButtonElement;

//DEFINIMOS EL COSTO DE ENVÍO
const COSTO_ENVIO = 0;

function renderizarCarrito() {
    const carrito = obtenerCarrito();

    // Si no hay productos
    if (carrito.length === 0) {
        mensajeVacio.style.display = "block";
        listaCarrito.innerHTML = "";
        if (resumenPedido) resumenPedido.style.display = "none";
        if (btnConfirmar) btnConfirmar.style.display = "none";
        if (btnVaciar) btnVaciar.style.display = "none";
        return;
    }

    // Si hay productos
    mensajeVacio.style.display = "none";
    if (resumenPedido) resumenPedido.style.display = "block";
    if (btnConfirmar) btnConfirmar.style.display = "block";
    if (btnVaciar) btnVaciar.style.display = "block";
    listaCarrito.innerHTML = "";

    const productosSistema = JSON.parse(localStorage.getItem("productos_db") || "[]");

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        const itemElement = document.createElement("div");
        itemElement.style.borderBottom = "1px solid #eee";
        itemElement.style.padding = "15px 0";

        const imgSrc = item.imagen ? `/src/assets/img/${item.imagen}` : '/vite.svg';
        const productoReal = productosSistema.find((p: any) => p.id === item.id);
        const maxStock = productoReal ? productoReal.stock : (item.stock || 1);
        const limiteAlcanzado = item.cantidad >= maxStock;

        itemElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${imgSrc}" alt="${item.nombre}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #ccc;" onerror="this.src='/vite.svg'">
                    <div>
                        <strong style="font-size: 1.1em; color: #333;">${item.nombre}</strong> <br>
                        <span style="color: #666;">Precio unitario: $${item.precio} | Subtotal: <strong style="color: #2e7d32;">$${subtotal}</strong></span>
                        ${limiteAlcanzado ? `<br><small style="color: #d32f2f; font-weight: bold;">¡Stock máximo alcanzado!</small>` : ''}
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button id="btn-restar-${item.id}" style="padding: 6px 12px; cursor: pointer; border: 1px solid #ccc; background-color: #fff; border-radius: 4px; font-weight: bold;">-</button>
                    <span style="font-weight: bold; min-width: 25px; text-align: center; font-size: 1.1em;">${item.cantidad}</span>
                    <button id="btn-sumar-${item.id}" ${limiteAlcanzado ? 'disabled' : ''} style="padding: 6px 12px; cursor: ${limiteAlcanzado ? 'not-allowed' : 'pointer'}; border: 1px solid #ccc; background-color: ${limiteAlcanzado ? '#f5f5f5' : '#fff'}; color: ${limiteAlcanzado ? '#aaa' : '#333'}; border-radius: 4px; font-weight: bold;">+</button>
                    <button id="btn-eliminar-${item.id}" style="margin-left: 15px; padding: 7px 15px; background-color: #d32f2f; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Eliminar</button>
                </div>
            </div>
        `;

        listaCarrito.appendChild(itemElement);

        document.getElementById(`btn-sumar-${item.id}`)?.addEventListener("click", () => {
            if (item.cantidad < maxStock) { sumarCantidad(item.id); renderizarCarrito(); }
        });
        document.getElementById(`btn-restar-${item.id}`)?.addEventListener("click", () => { restarCantidad(item.id); renderizarCarrito(); });
        document.getElementById(`btn-eliminar-${item.id}`)?.addEventListener("click", () => { eliminarProducto(item.id); renderizarCarrito(); });
    });

    // 🚀 LÓGICA DEL DESGLOSE DE COSTOS
    const subtotalGeneral = calcularTotal();
    const totalFinal = subtotalGeneral + COSTO_ENVIO;

    if (resumenPedido) {
        resumenPedido.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #555; font-size: 1.1em;">
                <span>Subtotal de productos:</span>
                <strong>$${subtotalGeneral}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; color: #555; font-size: 1.1em;">
                <span>Costo de envío:</span>
                <strong style="color: #4CAF50;">${COSTO_ENVIO === 0 ? '¡Gratis!' : '$' + COSTO_ENVIO}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 15px; border-top: 2px solid #e2e8f0; padding-top: 15px; font-size: 1.5em; color: #2e7d32;">
                <span>Total Final:</span>
                <strong>$${totalFinal}</strong>
            </div>
        `;
    }
}

// Lógica Confirmar Compra
if (btnConfirmar) {
    btnConfirmar.addEventListener("click", () => {
        const carritoActual = obtenerCarrito();
        if (carritoActual.length === 0) return;

        const userDataString = localStorage.getItem("userData");
        if (!userDataString) {
            alert("Debes iniciar sesión para confirmar la compra.");
            window.location.href = "../auth/login/login.html";
            return;
        }
        const userData = JSON.parse(userDataString);

        const productosSistema = JSON.parse(localStorage.getItem("productos_db") || "[]");
        for (const itemCarrito of carritoActual) {
            const productoAdmin = productosSistema.find((p: any) => p.id === itemCarrito.id);
            if (productoAdmin) {
                productoAdmin.stock -= itemCarrito.cantidad;
                if (productoAdmin.stock <= 0) {
                    productoAdmin.stock = 0;
                    productoAdmin.disponible = false;
                }
            }
        }
        localStorage.setItem("productos_db", JSON.stringify(productosSistema));

        // Calculamos el monto final a cobrar
        const subtotal = calcularTotal();
        const totalConEnvio = subtotal + COSTO_ENVIO;

        const nuevoPedido = {
            id: crypto.randomUUID(),
            usuarioEmail: userData.email,
            fecha: new Date().toISOString(),
            estado: "PENDIENTE",
            total: totalConEnvio, // Guardamos el valor incluyendo envío
            items: carritoActual
        };

        const pedidosGuardados = JSON.parse(localStorage.getItem("pedidos") || "[]");
        pedidosGuardados.push(nuevoPedido);
        localStorage.setItem("pedidos", JSON.stringify(pedidosGuardados));

        localStorage.removeItem('carrito_compras');
        renderizarCarrito();

        alert("¡Compra confirmada! Tu pedido está en preparación.");
        window.location.href = "../client/orders/orders.html";
    });
}

// Lógica Vaciar Carrito
if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
        if (confirm("¿Estás seguro de que deseas eliminar todos los productos del carrito?")) {
            localStorage.removeItem("carrito_compras");
            renderizarCarrito();
        }
    });
}

renderizarCarrito();