import type { Product } from './product'; 

export interface ItemCarrito extends Product {
    cantidad: number;
}