# Trabajo Final Integrador: Food Store (Educativo)
Estudiante: Gragera Lucas Ignacio

Tecnologías: Vite + TypeScript (Frontend) | Java 21 + JPA / Hibernate 6 + H2 (Backend)

# Link al video:
https://www.youtube.com/watch?v=FtSVWORb06E

# Descripción General
Food Store es un proyecto integrador con fines estrictamente educativos diseñado para modelar un flujo de negocio completo de gestión de alimentos, administración de catálogos y procesamiento atómico de pedidos.

El proyecto consta de dos soluciones desacopladas:

Frontend Web (Vite + TypeScript): Una interfaz SPA dinámica orientada a la experiencia del cliente y del administrador que simula el flujo comercial del negocio.

Backend de Consola (Java 21 + JPA): Una aplicación de terminal robusta orientada a objetos que implementa lógica relacional formal con persistencia histórica.

# ¡Importante! Niveles de Seguridad Diferenciados
Frontend (No Seguro - Didáctico): La simulación de control de accesos se gestiona del lado del cliente mediante Guards basados en datos guardados en el localStorage del navegador. Cualquier usuario con conocimientos técnicos puede alterar estos campos desde las herramientas de desarrollo. Su propósito es puramente pedagógico para entender lógica de ruteo.

Backend (Seguro - Transaccional): Toda la lógica crítica del negocio (control de inventario, unicidad de correos y transaccionalidad de compras) está centralizada en el backend relacional. Si un pedido falla por stock o consistencia, el motor ejecuta un rollback para asegurar la integridad absoluta de los datos.

# Instalación y Uso
Módulo 1: Frontend Web (Vite + TypeScript)
Se recomienda usar pnpm como gestor de paquetes para mayor eficiencia.

Bash
# 1. Instalar pnpm (si no se posee)
npm install -g pnpm

# 2. Instalar dependencias en la raíz del frontend
pnpm install

# 3. Ejecutar el servidor de desarrollo
pnpm dev
La aplicación estará disponible en http://localhost:5173.

Módulo 2: Backend de Consola (Java 21 + JPA + H2)
El backend utiliza Gradle 8 como sistema de automatización de construcción.

Bash
# Ejecutar la aplicación de consola de forma directa
./gradlew run
Nota: Al iniciar el sistema por primera vez, el motor creará de manera automática la base de datos relacional en un archivo local ubicado en ./data/jpa_db.mv.db.

# Arquitectura y Decisiones Técnicas
Backend & Persistencia Relacional (JPA)
Clase Base Mapeada (@MappedSuperclass): Se implementó la abstracción Base.java de la cual heredan todas las entidades del sistema (Usuario, Producto, Categoria, Pedido, DetallePedido). Maneja de forma transparente los atributos de auditoría id (generación correlativa), eliminado (baja lógica) y createdAt.

Patrón Repositorio Genérico (BaseRepository<T>): Abstrae las operaciones CRUD fundamentales interactuando directamente con un EntityManagerFactory configurado bajo el patrón Singleton en JPAUtil.java.

Transaccionalidad Atómica: El alta de pedidos opera bajo un bloque transaccional controlado (EntityTransaction). Valida el stock actual del inventario, calcula subtotales, descuenta las unidades correspondientes y asocia los registros al usuario de manera atómica, garantizando que el sistema nunca quede en un estado inconsistente.

Frontend & Control de Acceso
Protección de Rutas: Orquestado en src/utils/auth.ts, el método checkAuthUser valida que exista una sesión activa en el localStorage (userData) y que el rol coincida de forma estricta con la jerarquía permitida (admin o client) antes de renderizar la página.

Sincronización de Estado: El catálogo de productos y el flujo del carrito (cart.ts) se encuentran unificados consumiendo y mutando de forma dinámica la clave "productos_db", permitiendo que las acciones del administrador impacten de inmediato en la visualización del cliente.

# Orden de Carga de Datos Sugerido
Dado que las entidades poseen restricciones de integridad relacional estrictas en la base de datos H2, se recomienda poblar el sistema a través del menú de consola en el siguiente orden:

Categorías: Crear al menos una categoría base (ej: Pizzas, Hamburguesas).

Productos: Dar de alta los productos vinculándolos al ID de una categoría activa.

Usuarios: Crear los perfiles de acceso (asegurando un correo electrónico único).

Pedidos: Generar las órdenes transaccionales seleccionando un usuario y productos válidos con stock disponible.
