export interface Categoria {
    id: number;
    eliminado: boolean;
    createdAt: string;
    nombre: string;
    descripcion: string;
}

export type ICategory = Categoria;