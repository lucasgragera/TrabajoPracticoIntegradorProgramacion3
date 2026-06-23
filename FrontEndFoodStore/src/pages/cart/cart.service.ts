import type { ItemCarrito } from '../../types/types.ts';
import type { Producto } from '../../types/product.ts';

const CART_KEY = 'carrito_compras';

// Recuperar el carrito desde localStorage
export function obtenerCarrito(): ItemCarrito[] {
    const carritoGuardado = localStorage.getItem(CART_KEY);
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
}

// Guardar el carrito actualizado en localStorage
export function guardarCarrito(carrito: ItemCarrito[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(carrito));
}

// Obtener la cantidad total de artículos (sumando las cantidades de cada producto)
export function obtenerCantidadTotal(): number {
    const carrito = obtenerCarrito();
    return carrito.reduce((total, item) => total + item.cantidad, 0);
}

// Agregar al carrito (ahora soporta cantidad dinámica)
export function agregarAlCarrito(producto: Producto, cantidadAAgregar: number = 1): void {
    const carrito = obtenerCarrito();

    // Verificamos si el producto ya está en el carrito
    const itemExistente = carrito.find(item => item.id === producto.id);

    if (itemExistente) {
        itemExistente.cantidad += cantidadAAgregar; // Actualiza sumando la nueva cantidad
    } else {
        carrito.push({ ...producto, cantidad: cantidadAAgregar }); // Agrega nuevo con su cantidad
    }

    guardarCarrito(carrito);

    // Indicador visual requerido por la HU
    alert(`¡"${producto.nombre}" se agregó al carrito correctamente!`);
}

// Restar cantidad de un producto
export function restarCantidad(idProducto: number): void {
    let carrito = obtenerCarrito();
    const itemExistente = carrito.find(item => item.id === idProducto);

    if (itemExistente) {
        if (itemExistente.cantidad > 1) {
            itemExistente.cantidad -= 1; // Bajamos de 2 a 1
        } else {
            // Si la cantidad es 1, sacamos el producto entero del array
            carrito = carrito.filter(item => item.id !== idProducto);
        }
        guardarCarrito(carrito); // Actualizamos el localStorage
    }
}

// Sumar cantidad de un producto existente
export function sumarCantidad(idProducto: number): void {
    const carrito = obtenerCarrito();
    const itemExistente = carrito.find(item => item.id === idProducto);

    if (itemExistente) {
        itemExistente.cantidad += 1;
        guardarCarrito(carrito);
    }
}

// Eliminar el producto por completo (sin importar la cantidad)
export function eliminarProducto(idProducto: number): void {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(item => item.id !== idProducto);
    guardarCarrito(carrito); // Actualizamos el localStorage
}

// Calcular el total general
export function calcularTotal(): number {
    const carrito = obtenerCarrito();
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}