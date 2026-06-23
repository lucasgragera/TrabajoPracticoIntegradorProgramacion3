import { checkAuhtUser } from '../../../utils/auth.ts';
import { PRODUCTS } from '../../../data/data.ts';

checkAuhtUser("/src/pages/auth/login/login.html", "/src/pages/client/home/home.html", "admin");

const formProducto = document.getElementById("form-producto") as HTMLFormElement;
const tablaProductos = document.getElementById("tabla-productos") as HTMLTableSectionElement;
const selectCategoria = document.getElementById("prod-categoria") as HTMLSelectElement;

const inputNombre = document.getElementById("prod-nombre") as HTMLInputElement;
const inputPrecio = document.getElementById("prod-precio") as HTMLInputElement;
const inputStock = document.getElementById("prod-stock") as HTMLInputElement;
const datalistSugerencias = document.getElementById("lista-sugerencias") as HTMLDataListElement;

function obtenerProductosDB() {
    let prods = JSON.parse(localStorage.getItem("productos_db") || "null");
    if (!prods) {
        prods = PRODUCTS;
        localStorage.setItem("productos_db", JSON.stringify(prods));
    }
    return prods;
}

function cargarCategoriasSelect() {
    const categorias = JSON.parse(localStorage.getItem("categorias_db") || "[]");
    selectCategoria.innerHTML = '<option value="" disabled selected>Seleccionar Categoría...</option>';

    categorias.filter((c: any) => !c.eliminado).forEach((cat: any) => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.nombre;
        selectCategoria.appendChild(option);
    });
}

function cargarSugerenciasDatalist() {
    datalistSugerencias.innerHTML = "";
    PRODUCTS.forEach((p: any) => {
        const option = document.createElement("option");
        option.value = p.nombre;
        datalistSugerencias.appendChild(option);
    });
}

inputNombre.addEventListener("input", () => {
    const productoBase = PRODUCTS.find((p: any) => p.nombre.toLowerCase() === inputNombre.value.toLowerCase());

    if (productoBase) {
        inputPrecio.value = productoBase.precio.toString();
        inputStock.value = productoBase.stock.toString();

        if (productoBase.categorias && productoBase.categorias.length > 0) {
            const catNombreBase = productoBase.categorias[0].nombre;
            Array.from(selectCategoria.options).forEach((opt) => {
                if (opt.text === catNombreBase) {
                    selectCategoria.value = opt.value;
                }
            });
        }
    }
});

function renderizarTabla() {
    const productos = obtenerProductosDB();
    tablaProductos.innerHTML = "";

    productos.forEach((prod: any) => {
        const fila = document.createElement("tr");

        fila.style.backgroundColor = prod.eliminado ? "#f5f5f5" : "transparent";
        fila.style.opacity = prod.eliminado ? "0.7" : "1";

        const catNombre = prod.categorias && prod.categorias.length > 0 ? prod.categorias[0].nombre : "Sin categoría";
        const imgSrc = prod.imagen ? `/src/assets/img/${prod.imagen}` : '/vite.svg';

        // Verificamos disponibilidad real (marcado como disponible + tiene stock)
        const hayStock = prod.disponible && prod.stock > 0;

        fila.innerHTML = `
            <td style="color: #888; font-size: 0.9em;">#${prod.id}</td>
            <td style="text-align: center;">
                <img src="${imgSrc}" alt="${prod.nombre}" style="width: 45px; height: 45px; border-radius: 8px; object-fit: cover; border: 1px solid #ddd;" onerror="this.src='/vite.svg'">
            </td>
            <td><strong style="color: #333;">${prod.nombre}</strong></td>
            <td style="color: #666; font-size: 0.85em; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${prod.descripcion}">
                ${prod.descripcion}
            </td>
            <td>${catNombre}</td>
            <td><strong>$${prod.precio}</strong></td>
            <td style="font-weight: bold; color: ${prod.stock === 0 ? '#d32f2f' : '#2e7d32'};">${prod.stock}</td>
            <td>
                <span class="badge ${hayStock ? 'terminado' : 'cancelado'}">
                    ${hayStock ? 'Disponible' : 'No disponible'}
                </span>
            </td>
            <td>
                <span class="badge ${prod.eliminado ? 'cancelado' : 'terminado'}">
                    ${prod.eliminado ? 'Baja' : 'Activo'}
                </span>
            </td>
            <td style="min-width: 160px;">
                <button class="btn-edit" onclick="editarProducto(${prod.id})">Editar</button>
                <button class="${prod.eliminado ? 'btn-restore' : 'btn-delete'}" onclick="toggleBajaProducto(${prod.id})">
                    ${prod.eliminado ? 'Restaurar' : 'Eliminar'}
                </button>
            </td>
        `;
        tablaProductos.appendChild(fila);
    });
}

formProducto.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = inputNombre.value;
    const precio = Number(inputPrecio.value);
    const stock = Number(inputStock.value);
    const catId = Number(selectCategoria.value);

    const categorias = JSON.parse(localStorage.getItem("categorias_db") || "[]");
    const categoriaSeleccionada = categorias.find((c: any) => c.id === catId);

    const productos = obtenerProductosDB();

    // Al dar de alta, intentamos buscar la descripción/imagen base de data.ts si existe
    const prodReferencia = PRODUCTS.find((p: any) => p.nombre.toLowerCase() === nombre.toLowerCase());
    const descripcionFinal = prodReferencia ? prodReferencia.descripcion : "Producto agregado desde panel admin.";
    const imagenFinal = prodReferencia ? prodReferencia.imagen : "";

    const nuevoProducto = {
        id: Date.now(),
        eliminado: false,
        createdAt: new Date().toISOString(),
        nombre: nombre,
        precio: precio,
        descripcion: descripcionFinal,
        stock: stock,
        imagen: imagenFinal,
        disponible: stock > 0,
        categorias: [categoriaSeleccionada]
    };

    productos.push(nuevoProducto);
    localStorage.setItem("productos_db", JSON.stringify(productos));
    formProducto.reset();
    renderizarTabla();
});

(window as any).editarProducto = (id: number) => {
    const productos = obtenerProductosDB();
    const prod = productos.find((p: any) => p.id === id);
    if (!prod) return;

    const nuevoPrecio = prompt("Actualizar Precio ($):", prod.precio.toString());
    if (nuevoPrecio && !isNaN(Number(nuevoPrecio))) prod.precio = Number(nuevoPrecio);

    const nuevoStock = prompt("Actualizar Stock:", prod.stock.toString());
    if (nuevoStock && !isNaN(Number(nuevoStock))) {
        prod.stock = Number(nuevoStock);
        prod.disponible = prod.stock > 0;
    }

    localStorage.setItem("productos_db", JSON.stringify(productos));
    renderizarTabla();
};

(window as any).toggleBajaProducto = (id: number) => {
    const productos = obtenerProductosDB();
    const prod = productos.find((p: any) => p.id === id);
    if (prod) {
        prod.eliminado = !prod.eliminado;
        localStorage.setItem("productos_db", JSON.stringify(productos));
        renderizarTabla();
    }
};

cargarCategoriasSelect();
cargarSugerenciasDatalist();
renderizarTabla();