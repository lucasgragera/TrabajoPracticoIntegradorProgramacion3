import { checkAuhtUser } from '../../../utils/auth.ts';
import { getCategories } from '../../../data/data.ts';

checkAuhtUser("/src/pages/auth/login/login.html", "/src/pages/client/home/home.html", "admin");

const formCategoria = document.getElementById("form-categoria") as HTMLFormElement;
const tablaCategorias = document.getElementById("tabla-categorias") as HTMLTableSectionElement;

// Inicializar DB en LocalStorage si está vacía
function obtenerCategoriasDB() {
    let cats = JSON.parse(localStorage.getItem("categorias_db") || "null");
    if (!cats) {
        cats = getCategories();
        localStorage.setItem("categorias_db", JSON.stringify(cats));
    }
    return cats;
}

// Lógica para renderizar
function renderizarTabla() {
    const categorias = obtenerCategoriasDB();
    tablaCategorias.innerHTML = "";

    categorias.forEach((cat: any) => {
        const fila = document.createElement("tr");

        // Efecto visual más limpio para filas dadas de baja
        fila.style.opacity = cat.eliminado ? "0.6" : "1";
        fila.style.backgroundColor = cat.eliminado ? "#fafafa" : "transparent";

        // Lógica de la imagen: si tiene imagen la busca, si no, usa el vite.svg
        const imgSrc = cat.imagen ? `/src/assets/img/${cat.imagen}` : '/vite.svg';

        fila.innerHTML = `
            <td style="color: #888; font-size: 0.9em;">#${cat.id}</td>
            <td style="text-align: center;">
                <img src="${imgSrc}" alt="${cat.nombre}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid #ddd;" onerror="this.src='/vite.svg'">
            </td>
            <td><strong style="color: #333; font-size: 1.1em;">${cat.nombre}</strong></td>
            <td style="color: #666;">${cat.descripcion}</td>
            <td>
                <span class="badge ${cat.eliminado ? 'cancelado' : 'terminado'}">
                    ${cat.eliminado ? 'Inactiva' : 'Activa'}
                </span>
            </td>
            <td>
                <button class="btn-edit" onclick="editarCategoria(${cat.id})">Editar</button>
                <button class="${cat.eliminado ? 'btn-restore' : 'btn-delete'}" onclick="toggleBajaCategoria(${cat.id})">
                    ${cat.eliminado ? 'Restaurar' : 'Dar de Baja'}
                </button>
            </td>
        `;
        tablaCategorias.appendChild(fila);
    });
}

// Alta de Categoría
formCategoria.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = (document.getElementById("cat-nombre") as HTMLInputElement).value;
    const desc = (document.getElementById("cat-desc") as HTMLInputElement).value;

    const categorias = obtenerCategoriasDB();
    const nuevaCategoria = {
        id: Date.now(), // Generamos un ID único numérico
        eliminado: false,
        createdAt: new Date().toISOString(),
        nombre: nombre,
        descripcion: desc,
        imagen: ""
    };

    categorias.push(nuevaCategoria);
    localStorage.setItem("categorias_db", JSON.stringify(categorias));
    formCategoria.reset();
    renderizarTabla();
});

// Exponer funciones al entorno global para los botones onclick
(window as any).editarCategoria = (id: number) => {
    const categorias = obtenerCategoriasDB();
    const cat = categorias.find((c: any) => c.id === id);
    if (!cat) return;

    const nuevoNombre = prompt("Nuevo nombre:", cat.nombre);
    if (nuevoNombre) cat.nombre = nuevoNombre;

    const nuevaDesc = prompt("Nueva descripción:", cat.descripcion);
    if (nuevaDesc) cat.descripcion = nuevaDesc;

    localStorage.setItem("categorias_db", JSON.stringify(categorias));
    renderizarTabla();
};

(window as any).toggleBajaCategoria = (id: number) => {
    const categorias = obtenerCategoriasDB();
    const cat = categorias.find((c: any) => c.id === id);
    if (cat) {
        cat.eliminado = !cat.eliminado;
        localStorage.setItem("categorias_db", JSON.stringify(categorias));
        renderizarTabla();
    }
};

renderizarTabla();