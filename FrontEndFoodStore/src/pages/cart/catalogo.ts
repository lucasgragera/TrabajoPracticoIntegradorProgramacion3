import { PRODUCTS, getCategories } from '../../data/data.ts';
import type { Product as Producto } from '../../types/product.ts';
import type { Categoria } from '../../types/categoria.ts';
import { agregarAlCarrito, obtenerCantidadTotal } from './cart.service.ts';

// 1. INICIALIZACIÓN
if (!localStorage.getItem("productos_db")) localStorage.setItem("productos_db", JSON.stringify(PRODUCTS));
if (!localStorage.getItem("categorias_db")) localStorage.setItem("categorias_db", JSON.stringify(getCategories()));

const contenedor = document.getElementById("contenedor-productos") as HTMLDivElement;
const inputBusqueda = document.getElementById("buscarProducto") as HTMLInputElement;
const mensajeNoResultados = document.getElementById("mensaje-no-resultados") as HTMLParagraphElement;
const listaCategoriasUL = document.getElementById("lista-categorias") as HTMLUListElement;
const selectOrden = document.getElementById("ordenarProductos") as HTMLSelectElement;
const contadorResultados = document.getElementById("contador-resultados") as HTMLParagraphElement;

let filtroNombre = "";
let filtroCategoria = "todos";
let criterioOrden = "default";

// 2. RENDERIZAR CATEGORÍAS LATERALES
function renderizarCategoriasLaterales() {
    if (!listaCategoriasUL) return;
    const categoriasDB: Categoria[] = JSON.parse(localStorage.getItem("categorias_db") || "[]");
    const categoriasActivas = categoriasDB.filter(c => !c.eliminado);

    listaCategoriasUL.innerHTML = "";

    // Opción para ver todas
    const liTodos = document.createElement("li");
    liTodos.textContent = "🍔 Todos los Productos";
    liTodos.style.cursor = "pointer";
    liTodos.style.padding = "10px";
    liTodos.style.borderRadius = "5px";
    liTodos.style.fontWeight = filtroCategoria === "todos" ? "bold" : "normal";
    liTodos.style.backgroundColor = filtroCategoria === "todos" ? "#e8f5e9" : "transparent";
    liTodos.style.color = filtroCategoria === "todos" ? "#4CAF50" : "inherit";
    liTodos.style.marginBottom = "5px";

    liTodos.addEventListener("click", () => {
        filtroCategoria = "todos";
        renderizarCatalogo();
    });
    listaCategoriasUL.appendChild(liTodos);

    // Listar activas
    categoriasActivas.forEach(cat => {
        const li = document.createElement("li");
        li.textContent = cat.nombre;
        li.style.cursor = "pointer";
        li.style.padding = "10px";
        li.style.borderRadius = "5px";
        li.style.fontWeight = filtroCategoria === cat.nombre ? "bold" : "normal";
        li.style.backgroundColor = filtroCategoria === cat.nombre ? "#e8f5e9" : "transparent";
        li.style.color = filtroCategoria === cat.nombre ? "#4CAF50" : "inherit";
        li.style.marginBottom = "5px";

        li.addEventListener("click", () => {
            filtroCategoria = cat.nombre;
            renderizarCatalogo();
        });
        listaCategoriasUL.appendChild(li);
    });
}

// 3. RENDERIZAR CATÁLOGO (Grid con Imagen y Descripción)
function renderizarCatalogo() {
    const productosDB: Producto[] = JSON.parse(localStorage.getItem("productos_db") || "[]");

    // Filtrar dados de baja, por nombre y por categoría
    let productosFiltrados = productosDB.filter(p => {
        const coincideNombre = p.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
        const coincideCategoria = filtroCategoria === "todos" || p.categorias.some(cat => cat.nombre === filtroCategoria);
        return !p.eliminado && coincideNombre && coincideCategoria;
    });

    // Ordenamiento aplicable
    if (criterioOrden === "az") productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (criterioOrden === "za") productosFiltrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
    if (criterioOrden === "precio-asc") productosFiltrados.sort((a, b) => a.precio - b.precio);
    if (criterioOrden === "precio-desc") productosFiltrados.sort((a, b) => b.precio - a.precio);

    contenedor.innerHTML = "";

    // Contador dinámico de resultados encontrados
    if (contadorResultados) {
        contadorResultados.textContent = `Productos encontrados: ${productosFiltrados.length}`;
    }

    if (productosFiltrados.length === 0) {
        mensajeNoResultados.style.display = "block";
    } else {
        mensajeNoResultados.style.display = "none";

        productosFiltrados.forEach(p => {
            const hayStock = p.stock > 0 && p.disponible;
            const card = document.createElement("div");
            card.className = "product-card";

            // Resguardo por si la URL o el archivo de imagen no está definido
            const imgSrc = p.imagen ? `/src/assets/img/${p.imagen}` : '/vite.svg';

            card.innerHTML = `
                <img src="${imgSrc}" alt="${p.nombre}" class="product-img" onerror="this.src='/vite.svg'">
                
                <div class="product-info" style="display: flex; flex-direction: column; flex-grow: 1; padding-top: 10px;">
                    <h4 style="margin: 0 0 5px 0; font-size: 1.1em; color: #2c3e50;">${p.nombre}</h4>
                    
                    <div>
                        <span class="badge-stock ${hayStock ? 'disponible' : 'agotado'}">
                            ${hayStock ? 'Disponible' : 'Agotado'}
                        </span>
                    </div>

                    <p style="color: #666; font-size: 0.85em; margin: 8px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4;" title="${p.descripcion}">
                        ${p.descripcion || 'Sin descripción disponible.'}
                    </p>
                    
                    <h3 style="color: #2e7d32; margin: auto 0 12px 0; font-size: 1.3em;">$${p.precio}</h3>
                    
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: auto;">
                        <button onclick="window.location.href='/src/pages/client/productDetail/productDetail.html?id=${p.id}'" class="btn-detalle">
                            Ver Detalle
                        </button>
                        <button id="btn-add-${p.id}" class="${!hayStock ? 'disabled-btn' : 'btn-add-cart'}">
                            ${hayStock ? '🛒 Agregar' : 'Sin Stock'}
                        </button>
                    </div>
                </div>
            `;
            contenedor.appendChild(card);

            // Vinculación del listener para añadir productos
            const boton = document.getElementById(`btn-add-${p.id}`) as HTMLButtonElement;
            if (hayStock) {
                boton.addEventListener("click", () => {
                    agregarAlCarrito(p);
                    actualizarContador();
                });
            } else {
                boton.disabled = true;
            }
        });
    }
    renderizarCategoriasLaterales();
}

// 4. LISTENERS DE FILTROS Y BÚSQUEDA
inputBusqueda?.addEventListener("input", (e) => {
    filtroNombre = (e.target as HTMLInputElement).value;
    renderizarCatalogo();
});

selectOrden?.addEventListener("change", (e) => {
    criterioOrden = (e.target as HTMLSelectElement).value;
    renderizarCatalogo();
});

// Lógica operativa para el Toggle del Sidebar en Mobile
const btnToggle = document.getElementById("toggle-sidebar");
const aside = document.querySelector("aside") as HTMLElement;

btnToggle?.addEventListener("click", (e) => {
    e.stopPropagation(); // Evita que se propague el click
    if (aside.classList.contains("active")) {
        aside.classList.remove("active");
    } else {
        aside.classList.add("active");
    }
});

// Cerrar el menú al hacer click afuera del sidebar (Mejora UX Mobile)
document.addEventListener("click", (e) => {
    if (aside && aside.classList.contains("active") && !aside.contains(e.target as Node)) {
        aside.classList.remove("active");
    }
});

function actualizarContador() {
    const contador = document.getElementById("contador-carrito") as HTMLSpanElement;
    const total = obtenerCantidadTotal();
    if (contador) {
        contador.textContent = total.toString();
        contador.style.display = total > 0 ? "inline-block" : "none";
    }
}

// Render Inicial
renderizarCatalogo();
actualizarContador();