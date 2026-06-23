import { agregarAlCarrito, obtenerCantidadTotal } from '../../cart/cart.service.ts';
import { checkAuhtUser } from '../../../utils/auth.ts';

// 1. Proteger la ruta (Solo usuarios logueados pueden ver el detalle)
checkAuhtUser("/src/pages/auth/login/login.html", "/src/pages/auth/login/login.html", ["client", "admin"]);

const container = document.getElementById("detalle-container") as HTMLElement;
const contadorCarrito = document.getElementById("contador-carrito") as HTMLSpanElement;

// 2. Obtener el ID del producto desde la URL
const params = new URLSearchParams(window.location.search);
const productId = Number(params.get('id'));

// 3. Buscar el producto en la "Base de Datos" Viva (LocalStorage)
const productosDB = JSON.parse(localStorage.getItem("productos_db") || "[]");
const producto = productosDB.find((p: any) => p.id === productId);

function actualizarContador() {
    if (!contadorCarrito) return;
    const totalItems = obtenerCantidadTotal();
    if (totalItems > 0) {
        contadorCarrito.textContent = totalItems.toString();
        contadorCarrito.style.display = "inline-block";
    } else {
        contadorCarrito.style.display = "none";
    }
}

// 4. Renderizar la vista
if (!producto || producto.eliminado) {
    container.innerHTML = `
        <h2 style="color: red;">Producto no encontrado o dado de baja</h2>
        <a href="../home/home.html" style="text-decoration: underline; color: blue;">Volver al catálogo</a>
    `;
} else {
    const hayStock = producto.disponible && producto.stock > 0;
    const claseBadge = hayStock ? 'disponible' : 'agotado';
    const textoBadge = hayStock ? 'Disponible' : 'Agotado';

    container.innerHTML = `
    <div style="display: flex; gap: 40px; flex-wrap: wrap;">
        <img src="/src/assets/img/${producto.imagen}" alt="${producto.nombre}" style="width: 350px; height: 350px; border-radius: 8px; object-fit: cover; border: 1px solid #ccc;" onerror="this.src='/vite.svg'">
        
        <div style="flex: 1; min-width: 300px;">
            <h2 style="margin-top: 0; font-size: 2em;">${producto.nombre}</h2>
            
            <span class="badge-stock ${claseBadge}" style="display: inline-block; margin-bottom: 15px;">
                ${textoBadge}
            </span>

            <p><strong>Categoría:</strong> ${producto.categorias.map((c: any) => c.nombre).join(', ')}</p>
            <p style="font-size: 1.2em; color: #555; line-height: 1.5;">${producto.descripcion}</p>
            <h3 style="color: #2e7d32; font-size: 1.8em; margin: 15px 0;">$${producto.precio}</h3>
            
            <p style="font-size: 1.1em;"><strong>Stock disponible:</strong> ${producto.stock}</p>
            
            ${hayStock ? `
                <div style="margin: 25px 0; display: flex; align-items: center; gap: 15px;">
                    <label for="cantidad" style="font-weight: bold;">Cantidad:</label>
                    <input type="number" id="cantidad" value="1" min="1" max="${producto.stock}" style="width: 70px; padding: 8px; font-size: 1.1em; text-align: center; border-radius: 4px; border: 1px solid #ccc;">
                </div>
                <button id="btn-agregar" style="padding: 12px 25px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1.1em; font-weight: bold; width: 100%;">
                    🛒 Agregar al Carrito
                </button>
            ` : `
                <p style="color: red; font-weight: bold; font-size: 1.2em; margin-top: 20px;">❌ Producto no disponible temporalmente</p>
                <button disabled style="padding: 12px 25px; background-color: #ccc; color: #666; border: none; border-radius: 5px; font-size: 1.1em; font-weight: bold; width: 100%; cursor: not-allowed;">
                    Sin Stock
                </button>
            `}
            <div id="mensaje-exito" style="display: none; background-color: #e8f5e9; color: #2e7d32; padding: 15px; border-radius: 5px; margin-top: 20px; font-weight: bold; text-align: center; border: 1px solid #c8e6c9;"></div>
        </div>
    </div>
`;

    actualizarContador();

    // 5. Lógica del selector de cantidad y botón (Solo si hay stock)
    if (producto.disponible && producto.stock > 0) {
        const btnAgregar = document.getElementById("btn-agregar") as HTMLButtonElement;
        const inputCantidad = document.getElementById("cantidad") as HTMLInputElement;
        const mensajeExito = document.getElementById("mensaje-exito") as HTMLDivElement;

        // Validación en tiempo real del input
        inputCantidad.addEventListener("input", () => {
            let val = parseInt(inputCantidad.value);
            // Si meten texto raro, forzamos a 1
            if (isNaN(val) || val < 1) inputCantidad.value = "1";
            // Si superan el stock, forzamos al límite del stock
            if (val > producto.stock) inputCantidad.value = producto.stock.toString();
        });

        btnAgregar.addEventListener("click", () => {
            const cantidadSeleccionada = parseInt(inputCantidad.value);

            // Doble validación por seguridad antes de inyectar en LocalStorage
            if (cantidadSeleccionada > 0 && cantidadSeleccionada <= producto.stock) {
                agregarAlCarrito(producto, cantidadSeleccionada);
                actualizarContador();

                // Feedback visual exitoso
                mensajeExito.textContent = `¡Se agregaron ${cantidadSeleccionada} unidad(es) de ${producto.nombre} al carrito!`;
                mensajeExito.style.display = "block";

                // Ocultar mensaje después de 3 segundos
                setTimeout(() => {
                    mensajeExito.style.display = "none";
                }, 3000);
            } else {
                alert("La cantidad ingresada no es válida.");
            }
        });
    }
}