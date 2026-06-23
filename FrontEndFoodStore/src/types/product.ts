import type { Categoria } from './categoria';

export interface Product {
    id: number;
    eliminado: boolean;
    createdAt: string;
    nombre: string;
    precio: number;
    descripcion: string;
    stock: number;
    imagen: string;
    disponible: boolean;
    categorias: Categoria[];
}

export type Producto = Product;