package com.tp.jpa;

import com.tp.jpa.model.enums.EstadoPedido;
import com.tp.jpa.model.*;
import com.tp.jpa.model.enums.FormaPago;
import com.tp.jpa.model.enums.Rol;
import com.tp.jpa.repository.CategoriaRepository;
import com.tp.jpa.repository.PedidoRepository;
import com.tp.jpa.repository.ProductoRepository;
import com.tp.jpa.repository.UsuarioRepository;
import com.tp.jpa.util.JPAUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Scanner;

/**
 * Clase principal: menú de consola del sistema Food Store.
 * Orden de uso natural: Categorías -> Productos -> Usuarios -> Pedidos.
 */
public class Main {

    private static final Scanner sc = new Scanner(System.in);

    private static final CategoriaRepository categoriaRepo = new CategoriaRepository();
    private static final ProductoRepository productoRepo = new ProductoRepository();
    private static final UsuarioRepository usuarioRepo = new UsuarioRepository();
    private static final PedidoRepository pedidoRepo = new PedidoRepository();

    public static void main(String[] args) {
        boolean salir = false;
        while (!salir) {
            System.out.println();
            System.out.println("===== FOOD STORE - MENÚ PRINCIPAL =====");
            System.out.println("1. Gestionar Categorías");
            System.out.println("2. Gestionar Productos");
            System.out.println("3. Gestionar Usuarios");
            System.out.println("4. Gestionar Pedidos");
            System.out.println("5. Reportes");
            System.out.println("0. Salir");
            System.out.print("Opción: ");
            String op = sc.nextLine().trim();
            switch (op) {
                case "1":
                    menuCategorias();
                    break;
                case "2":
                    menuProductos();
                    break;
                case "3":
                    menuUsuarios();
                    break;
                case "4":
                    menuPedidos();
                    break;
                case "5":
                    menuReportes();
                    break;
                case "0":
                    salir = true;
                    break;
                default:
                    System.out.println("Opción inválida.");
            }
        }
        JPAUtil.close();
        System.out.println("Aplicación finalizada.");
    }

    // ── GESTIÓN DE CATEGORÍAS ────────────────────────────────────────────

    private static void menuCategorias() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- GESTIÓN DE CATEGORÍAS ---");
            System.out.println("1. Alta");
            System.out.println("2. Modificar");
            System.out.println("3. Baja lógica");
            System.out.println("4. Listado");
            System.out.println("0. Volver");
            System.out.print("Opción: ");
            String op = sc.nextLine().trim();
            switch (op) {
                case "1":
                    System.out.print("Nombre (obligatorio): ");
                    String nombre = sc.nextLine().trim();
                    if (nombre.isEmpty()) {
                        System.out.println("Error: El nombre no puede estar vacío.");
                        break;
                    }
                    System.out.print("Descripción: ");
                    String desc = sc.nextLine().trim();

                    Categoria nueva = Categoria.builder()
                            .nombre(nombre)
                            .descripcion(desc)
                            .build();
                    Categoria guardada = categoriaRepo.guardar(nueva);
                    System.out.println("Categoría guardada con ID: " + guardada.getId());
                    break;
                case "2":
                    listarCategorias();
                    System.out.print("ID de la categoría a modificar: ");
                    try {
                        Long idMod = Long.parseLong(sc.nextLine().trim());
                        Optional<Categoria> catOpt = categoriaRepo.buscarPorId(idMod);
                        if (catOpt.isEmpty() || catOpt.get().isEliminado()) {
                            System.out.println("Error: Categoría no encontrada o ya dada de baja.");
                            break;
                        }
                        Categoria cat = catOpt.get();
                        System.out.println("Valores actuales -> Nombre: " + cat.getNombre() + " | Descripción: "
                                + cat.getDescripcion());

                        System.out.print("Nuevo nombre (Enter para mantener actual): ");
                        String nNombre = sc.nextLine().trim();
                        if (!nNombre.isEmpty())
                            cat.setNombre(nNombre);

                        System.out.print("Nueva descripción (Enter para mantener actual): ");
                        String nDesc = sc.nextLine().trim();
                        if (!nDesc.isEmpty())
                            cat.setDescripcion(nDesc);

                        categoriaRepo.guardar(cat);
                        System.out.println("Categoría actualizada exitosamente.");
                    } catch (NumberFormatException e) {
                        System.out.println("Error: Debe ingresar un ID numérico válido.");
                    }
                    break;
                case "3":
                    System.out.print("ID de la categoría a dar de baja: ");
                    try {
                        Long idBaja = Long.parseLong(sc.nextLine().trim());
                        Optional<Categoria> catBajaOpt = categoriaRepo.buscarPorId(idBaja);
                        if (categoriaRepo.eliminarLogico(idBaja)) {
                            System.out.println(
                                    "Categoría '" + catBajaOpt.get().getNombre() + "' dada de baja correctamente.");
                        } else {
                            System.out.println("Error: No se pudo dar de baja (no existe o ya está dada de baja).");
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("Error: Debe ingresar un ID numérico válido.");
                    }
                    break;
                case "4":
                    listarCategorias();
                    break;
                case "0":
                    volver = true;
                    break;
                default:
                    System.out.println("Opción inválida.");
            }
        }
    }

    private static void listarCategorias() {
        List<Categoria> activas = categoriaRepo.listarActivos();
        if (activas.isEmpty()) {
            System.out.println("No hay categorías activas.");
            return;
        }
        System.out.println("\n--- LISTADO DE CATEGORÍAS ACTIVAS ---");
        for (Categoria c : activas) {
            System.out.printf("ID: %d | Nombre: %s | Descripción: %s%n",
                    c.getId(), c.getNombre(), c.getDescripcion());
        }
    }

    // ── GESTIÓN DE PRODUCTOS ──────────────────────────────────────────────

    private static void menuProductos() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- GESTIÓN DE PRODUCTOS ---");
            System.out.println("1. Alta");
            System.out.println("2. Modificar");
            System.out.println("3. Baja lógica");
            System.out.println("4. Listado");
            System.out.println("0. Volver");
            System.out.print("Opción: ");
            String op = sc.nextLine().trim();
            switch (op) {
                case "1":
                    // Validación temprana: Verificar que existan categorías activas
                    List<Categoria> categoriasActivas = categoriaRepo.listarActivos();
                    if (categoriasActivas.isEmpty()) {
                        System.out.println(
                                "Error: No hay categorías activas. Debe crear una categoría antes de dar de alta un producto.");
                        break;
                    }

                    listarCategorias();
                    System.out.print("ID de la categoría a asignar: ");
                    try {
                        Long idCat = Long.parseLong(sc.nextLine().trim());

                        System.out.print("Nombre (obligatorio): ");
                        String nombre = sc.nextLine().trim();
                        if (nombre.isEmpty()) {
                            System.out.println("Error: El nombre es obligatorio.");
                            break;
                        }
                        System.out.print("Descripción: ");
                        String desc = sc.nextLine().trim();
                        System.out.print("Precio: ");
                        Double precio = Double.parseDouble(sc.nextLine().trim());
                        System.out.print("Stock inicial: ");
                        Integer stock = Integer.parseInt(sc.nextLine().trim());
                        System.out.print("Imagen (URL/Nombre): ");
                        String imagen = sc.nextLine().trim();

                        Producto nuevo = Producto.builder()
                                .nombre(nombre)
                                .descripcion(desc)
                                .precio(precio)
                                .stock(stock)
                                .imagen(imagen)
                                .disponible(stock > 0)
                                .build();

                        EntityManager em = JPAUtil.getEntityManagerFactory().createEntityManager();
                        EntityTransaction tx = em.getTransaction();
                        try {
                            tx.begin();
                            Categoria categoria = em.find(Categoria.class, idCat);
                            if (categoria == null || categoria.isEliminado()) {
                                System.out.println("Error: La categoría no existe o está dada de baja.");
                                tx.rollback();
                                break;
                            }
                            categoria.addProducto(nuevo);
                            em.merge(categoria);
                            tx.commit();
                            System.out.println("Producto guardado y asociado a la categoría: " + categoria.getNombre());
                        } catch (Exception e) {
                            if (tx.isActive())
                                tx.rollback();
                            System.out.println("Error al guardar el producto: " + e.getMessage());
                        } finally {
                            em.close();
                        }

                    } catch (NumberFormatException e) {
                        System.out.println("Error: Formato de número inválido (ID, Precio o Stock).");
                    }
                    break;
                case "2":
                    listarProductos();
                    System.out.print("ID del producto a modificar: ");
                    try {
                        Long idMod = Long.parseLong(sc.nextLine().trim());
                        Optional<Producto> pOpt = productoRepo.buscarPorId(idMod);
                        if (pOpt.isEmpty() || pOpt.get().isEliminado()) {
                            System.out.println("Error: Producto no encontrado o dado de baja.");
                            break;
                        }
                        Producto p = pOpt.get();
                        System.out.println("Valores actuales -> Nombre: " + p.getNombre() + " | Precio: $"
                                + p.getPrecio() + " | Stock: " + p.getStock());

                        System.out.print("Nuevo nombre (Enter para mantener): ");
                        String nNombre = sc.nextLine().trim();
                        if (!nNombre.isEmpty())
                            p.setNombre(nNombre);

                        System.out.print("Nuevo precio (Enter para mantener): ");
                        String nPrecio = sc.nextLine().trim();
                        if (!nPrecio.isEmpty())
                            p.setPrecio(Double.parseDouble(nPrecio));

                        System.out.print("Nuevo stock (Enter para mantener): ");
                        String nStock = sc.nextLine().trim();
                        if (!nStock.isEmpty()) {
                            int nuevoStock = Integer.parseInt(nStock);
                            p.setStock(nuevoStock);
                            p.setDisponible(nuevoStock > 0);
                        }

                        productoRepo.guardar(p);
                        System.out.println("Producto actualizado exitosamente.");
                    } catch (NumberFormatException e) {
                        System.out.println("Error: Formato de número inválido.");
                    }
                    break;
                case "3":
                    System.out.print("ID del producto a dar de baja: ");
                    try {
                        Long idBaja = Long.parseLong(sc.nextLine().trim());
                        Optional<Producto> pBajaOpt = productoRepo.buscarPorId(idBaja);
                        if (productoRepo.eliminarLogico(idBaja)) {
                            System.out.println("Producto '" + pBajaOpt.get().getNombre() + "' dado de baja.");
                        } else {
                            System.out.println("Error: No se pudo dar de baja (no existe o ya está dado de baja).");
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("Error: Debe ingresar un ID numérico válido.");
                    }
                    break;
                case "4":
                    listarProductos();
                    break;
                case "0":
                    volver = true;
                    break;
                default:
                    System.out.println("Opción inválida.");
            }
        }
    }

    private static void listarProductos() {
        List<Producto> activos = productoRepo.listarActivos();
        if (activos.isEmpty()) {
            System.out.println("No hay productos activos.");
            return;
        }
        System.out.println("\n--- LISTADO DE PRODUCTOS ACTIVOS ---");
        for (Producto p : activos) {
            System.out.printf("ID: %d | Nombre: %s | Precio: $%.2f | Stock: %d | Disponible: %s%n",
                    p.getId(), p.getNombre(), p.getPrecio(), p.getStock(), p.getDisponible() ? "Sí" : "No");
        }
    }

    // ── GESTIÓN DE USUARIOS ───────────────────────────────────────────────

    private static void menuUsuarios() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- GESTIÓN DE USUARIOS ---");
            System.out.println("1. Alta");
            System.out.println("2. Modificar");
            System.out.println("3. Baja lógica");
            System.out.println("4. Listado");
            System.out.println("5. Buscar por mail");
            System.out.println("0. Volver");
            System.out.print("Opción: ");
            String op = sc.nextLine().trim();
            switch (op) {
                case "1":
                    System.out.print("Nombre: ");
                    String nombre = sc.nextLine().trim();
                    System.out.print("Apellido: ");
                    String apellido = sc.nextLine().trim();
                    System.out.print("Mail (obligatorio): ");
                    String mail = sc.nextLine().trim();

                    if (usuarioRepo.buscarPorMail(mail).isPresent()) {
                        System.out.println("Error: El mail ya está en uso por un usuario activo.");
                        break;
                    }

                    System.out.print("Celular: ");
                    String celular = sc.nextLine().trim();
                    System.out.print("Contraseña: ");
                    String pass = sc.nextLine().trim();
                    System.out.print("Rol (1. ADMIN / 2. USUARIO): ");
                    String rolOp = sc.nextLine().trim();
                    Rol rol = rolOp.equals("1") ? Rol.ADMIN : Rol.USUARIO;

                    Usuario nuevo = Usuario.builder()
                            .nombre(nombre)
                            .apellido(apellido)
                            .mail(mail)
                            .celular(celular)
                            .contraseña(pass)
                            .rol(rol)
                            .build();

                    Usuario guardado = usuarioRepo.guardar(nuevo);
                    System.out.println("Usuario guardado con ID: " + guardado.getId());
                    break;
                case "2":
                    listarUsuarios();
                    System.out.print("ID del usuario a modificar: ");
                    try {
                        Long idMod = Long.parseLong(sc.nextLine().trim());
                        Optional<Usuario> uOpt = usuarioRepo.buscarPorId(idMod);
                        if (uOpt.isEmpty() || uOpt.get().isEliminado()) {
                            System.out.println("Error: Usuario no encontrado o dado de baja.");
                            break;
                        }
                        Usuario u = uOpt.get();
                        System.out.println("Valores actuales -> Nombre: " + u.getNombre() + " " + u.getApellido()
                                + " | Mail: " + u.getMail());

                        System.out.print("Nuevo nombre (Enter para mantener): ");
                        String nNom = sc.nextLine().trim();
                        if (!nNom.isEmpty())
                            u.setNombre(nNom);

                        System.out.print("Nuevo apellido (Enter para mantener): ");
                        String nApe = sc.nextLine().trim();
                        if (!nApe.isEmpty())
                            u.setApellido(nApe);

                        System.out.print("Nuevo mail (Enter para mantener): ");
                        String nMail = sc.nextLine().trim();
                        if (!nMail.isEmpty() && !nMail.equals(u.getMail())) {
                            if (usuarioRepo.buscarPorMail(nMail).isPresent()) {
                                System.out.println("Error: El mail ya está en uso. No se modificará el correo.");
                            } else {
                                u.setMail(nMail);
                            }
                        }

                        System.out.print("Nuevo celular (Enter para mantener): ");
                        String nCel = sc.nextLine().trim();
                        if (!nCel.isEmpty())
                            u.setCelular(nCel);

                        System.out.print("Nueva contraseña (Enter para mantener): ");
                        String nPass = sc.nextLine().trim();
                        if (!nPass.isEmpty())
                            u.setContraseña(nPass);

                        usuarioRepo.guardar(u);
                        System.out.println("Usuario actualizado exitosamente.");
                    } catch (NumberFormatException e) {
                        System.out.println("Error: Debe ingresar un ID numérico válido.");
                    }
                    break;
                case "3":
                    System.out.print("ID del usuario a dar de baja: ");
                    try {
                        Long idBaja = Long.parseLong(sc.nextLine().trim());
                        Optional<Usuario> uBajaOpt = usuarioRepo.buscarPorId(idBaja);
                        if (usuarioRepo.eliminarLogico(idBaja)) {
                            System.out.println("Usuario '" + uBajaOpt.get().getNombre() + " "
                                    + uBajaOpt.get().getApellido() + "' dado de baja.");
                        } else {
                            System.out.println("Error: No se pudo dar de baja (no existe o ya está dado de baja).");
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("Error: Debe ingresar un ID numérico válido.");
                    }
                    break;
                case "4":
                    listarUsuarios();
                    break;
                case "5":
                    System.out.print("Ingrese el mail a buscar: ");
                    String bMail = sc.nextLine().trim();
                    Optional<Usuario> bOpt = usuarioRepo.buscarPorMail(bMail);
                    if (bOpt.isPresent()) {
                        Usuario found = bOpt.get();
                        System.out.printf(
                                "Usuario encontrado -> ID: %d | Nombre: %s %s | Mail: %s | Celular: %s | Rol: %s%n",
                                found.getId(), found.getNombre(), found.getApellido(), found.getMail(),
                                found.getCelular(), found.getRol());
                    } else {
                        System.out.println("No existe usuario activo con ese mail.");
                    }
                    break;
                case "0":
                    volver = true;
                    break;
                default:
                    System.out.println("Opción inválida.");
            }
        }
    }

    private static void listarUsuarios() {
        List<Usuario> activos = usuarioRepo.listarActivos();
        if (activos.isEmpty()) {
            System.out.println("No hay usuarios activos.");
            return;
        }
        System.out.println("\n--- LISTADO DE USUARIOS ACTIVOS ---");
        for (Usuario u : activos) {
            System.out.printf("ID: %d | Nombre: %s %s | Mail: %s | Rol: %s%n",
                    u.getId(), u.getNombre(), u.getApellido(), u.getMail(), u.getRol());
        }
    }

    // ── GESTIÓN DE PEDIDOS ────────────────────────────────────────────────

    private static void menuPedidos() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- GESTIÓN DE PEDIDOS ---");
            System.out.println("1. Alta de pedido");
            System.out.println("2. Cambiar estado");
            System.out.println("3. Baja lógica");
            System.out.println("4. Listado");
            System.out.println("0. Volver");
            System.out.print("Opción: ");
            String op = sc.nextLine().trim();
            switch (op) {
                case "1":
                    altaPedido();
                    break;
                case "2":
                    listarPedidos();
                    System.out.print("ID del pedido a cambiar de estado: ");
                    try {
                        Long idPed = Long.parseLong(sc.nextLine().trim());
                        Optional<Pedido> pedOpt = pedidoRepo.buscarPorId(idPed);
                        if (pedOpt.isEmpty() || pedOpt.get().isEliminado()) {
                            System.out.println("Error: Pedido no encontrado o dado de baja.");
                            break;
                        }
                        Pedido pedido = pedOpt.get();
                        System.out.println("Estado actual: " + pedido.getEstado());
                        System.out.println("Seleccione nuevo estado:");
                        System.out.println("1. PENDIENTE\n2. CONFIRMADO\n3. TERMINADO\n4. CANCELADO");
                        System.out.print("Opción: ");
                        String estOp = sc.nextLine().trim();
                        switch (estOp) {
                            case "1":
                                pedido.setEstado(EstadoPedido.PENDIENTE);
                                break;
                            case "2":
                                pedido.setEstado(EstadoPedido.CONFIRMADO);
                                break;
                            case "3":
                                pedido.setEstado(EstadoPedido.TERMINADO);
                                break;
                            case "4":
                                pedido.setEstado(EstadoPedido.CANCELADO);
                                break;
                            default:
                                System.out.println("Estado inválido.");
                                continue;
                        }
                        pedidoRepo.guardar(pedido);
                        System.out.println("Estado actualizado exitosamente.");
                    } catch (NumberFormatException e) {
                        System.out.println("Error: Formato de ID inválido.");
                    }
                    break;
                case "3":
                    System.out.print("ID del pedido a dar de baja: ");
                    try {
                        Long idBaja = Long.parseLong(sc.nextLine().trim());
                        if (pedidoRepo.eliminarLogico(idBaja)) {
                            System.out.println("Pedido " + idBaja + " dado de baja exitosamente.");
                        } else {
                            System.out.println("Error: No se encontró el pedido o ya está dado de baja.");
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("Error: Formato de ID inválido.");
                    }
                    break;
                case "4":
                    listarPedidos();
                    break;
                case "0":
                    volver = true;
                    break;
                default:
                    System.out.println("Opción inválida.");
            }
        }
    }

    private static void altaPedido() {
        // Validación temprana: Verificar que existan usuarios activos
        List<Usuario> usuariosActivos = usuarioRepo.listarActivos();
        if (usuariosActivos.isEmpty()) {
            System.out.println("Error: No hay usuarios activos. Debe registrar un usuario antes de generar un pedido.");
            return;
        }

        listarUsuarios();
        System.out.print("ID del Usuario que realiza el pedido: ");
        Long idUser;
        try {
            idUser = Long.parseLong(sc.nextLine().trim());
        } catch (NumberFormatException e) {
            System.out.println("Error: ID inválido.");
            return;
        }

        Optional<Usuario> uOpt = usuarioRepo.buscarPorId(idUser);
        if (uOpt.isEmpty() || uOpt.get().isEliminado()) {
            System.out.println("Error: Usuario no válido.");
            return;
        }

        System.out.println("Forma de pago (1. TARJETA / 2. TRANSFERENCIA / 3. EFECTIVO): ");
        String fpOp = sc.nextLine().trim();
        FormaPago formaPago;
        switch (fpOp) {
            case "1":
                formaPago = FormaPago.TARJETA;
                break;
            case "2":
                formaPago = FormaPago.TRANSFERENCIA;
                break;
            case "3":
                formaPago = FormaPago.EFECTIVO;
                break;
            default:
                System.out.println("Opción inválida, asumiendo EFECTIVO.");
                formaPago = FormaPago.EFECTIVO;
        }

        List<Long> idsProductos = new ArrayList<>();
        List<Integer> cantidades = new ArrayList<>();

        boolean agregando = true;
        while (agregando) {
            listarProductos();
            System.out.print("ID del producto a agregar (o 0 para terminar): ");
            try {
                Long idProd = Long.parseLong(sc.nextLine().trim());
                if (idProd == 0) {
                    agregando = false;
                    continue;
                }
                Optional<Producto> pOpt = productoRepo.buscarPorId(idProd);
                if (pOpt.isEmpty() || pOpt.get().isEliminado() || !pOpt.get().getDisponible()) {
                    System.out.println("Error: Producto no disponible.");
                    continue;
                }
                Producto prod = pOpt.get();
                System.out.print("Cantidad (Stock disponible: " + prod.getStock() + "): ");
                int cant = Integer.parseInt(sc.nextLine().trim());
                if (cant <= 0 || cant > prod.getStock()) {
                    System.out.println("Error: Cantidad inválida o sin stock suficiente.");
                    continue;
                }

                idsProductos.add(idProd);
                cantidades.add(cant);
                System.out.println("Producto agregado al pedido.");
            } catch (NumberFormatException e) {
                System.out.println("Error: Entrada inválida.");
            }
        }

        if (idsProductos.isEmpty()) {
            System.out.println("Pedido cancelado: No se agregaron productos.");
            return;
        }

        EntityManager em = JPAUtil.getEntityManagerFactory().createEntityManager();
        EntityTransaction tx = em.getTransaction();
        try {
            tx.begin();

            Usuario usuario = em.find(Usuario.class, idUser);

            Pedido nuevoPedido = Pedido.builder()
                    .formaPago(formaPago)
                    .estado(EstadoPedido.PENDIENTE)
                    .fecha(java.time.LocalDate.now())
                    .build();

            for (int i = 0; i < idsProductos.size(); i++) {
                Long pId = idsProductos.get(i);
                int cantidad = cantidades.get(i);

                Producto prodGestionado = em.find(Producto.class, pId);
                if (prodGestionado.getStock() < cantidad) {
                    throw new RuntimeException("Stock insuficiente para: " + prodGestionado.getNombre());
                }

                nuevoPedido.addDetallePedido(cantidad, prodGestionado);

                prodGestionado.setStock(prodGestionado.getStock() - cantidad);
                prodGestionado.setDisponible(prodGestionado.getStock() > 0);
            }

            nuevoPedido.calcularTotal();
            usuario.addPedido(nuevoPedido);

            em.merge(usuario);

            tx.commit();
            System.out.println("Pedido generado exitosamente. Total a pagar: $" + nuevoPedido.getTotal());

        } catch (Exception e) {
            if (tx.isActive())
                tx.rollback();
            System.out.println(
                    "Error durante la creación del pedido. Operación cancelada (Rollback). Detalle: " + e.getMessage());
        } finally {
            em.close();
        }
    }

    private static void listarPedidos() {
        List<Pedido> activos = pedidoRepo.listarActivos();
        if (activos.isEmpty()) {
            System.out.println("No hay pedidos registrados.");
            return;
        }
        System.out.println("\n--- LISTADO DE PEDIDOS ---");
        for (Pedido p : activos) {
            System.out.printf("ID: %d | Fecha: %s | Estado: %s | Total: $%.2f | Pago: %s%n",
                    p.getId(), p.getFecha(), p.getEstado(), p.getTotal(), p.getFormaPago());
        }
    }

    // ── REPORTES ─────────────────────────────────────────────────────────

    private static void menuReportes() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- REPORTES ---");
            System.out.println("1. Productos por Categoría");
            System.out.println("2. Pedidos por Usuario");
            System.out.println("3. Pedidos por Estado");
            System.out.println("4. Total Facturado (Solo Terminados)");
            System.out.println("0. Volver");
            System.out.print("Opción: ");
            String op = sc.nextLine().trim();
            switch (op) {
                case "1":
                    listarCategorias();
                    System.out.print("ID de Categoría: ");
                    try {
                        Long idCat = Long.parseLong(sc.nextLine().trim());
                        List<Producto> prods = productoRepo.buscarPorCategoria(idCat);
                        if (prods.isEmpty())
                            System.out.println("No hay productos en esta categoría.");
                        else
                            prods.forEach(p -> System.out.println(" - " + p.getNombre() + " ($" + p.getPrecio() + ")"));
                    } catch (Exception e) {
                        System.out.println("Error.");
                    }
                    break;
                case "2":
                    listarUsuarios();
                    System.out.print("ID de Usuario: ");
                    try {
                        Long idUser = Long.parseLong(sc.nextLine().trim());
                        List<Pedido> peds = pedidoRepo.buscarPorUsuario(idUser);
                        if (peds.isEmpty())
                            System.out.println("El usuario no tiene pedidos.");
                        else
                            peds.forEach(p -> System.out.println(
                                    " - Pedido #" + p.getId() + " | Total: $" + p.getTotal() + " | " + p.getEstado()));
                    } catch (Exception e) {
                        System.out.println("Error.");
                    }
                    break;
                case "3":
                    System.out.println("Estados: 1. PENDIENTE | 2. CONFIRMADO | 3. TERMINADO | 4. CANCELADO");
                    System.out.print("Opción: ");
                    String eOp = sc.nextLine().trim();
                    EstadoPedido ep;
                    switch (eOp) {
                        case "1":
                            ep = EstadoPedido.PENDIENTE;
                            break;
                        case "2":
                            ep = EstadoPedido.CONFIRMADO;
                            break;
                        case "3":
                            ep = EstadoPedido.TERMINADO;
                            break;
                        case "4":
                            ep = EstadoPedido.CANCELADO;
                            break;
                        default:
                            System.out.println("Inválido.");
                            continue;
                    }
                    List<Pedido> pedsEst = pedidoRepo.buscarPorEstado(ep);
                    if (pedsEst.isEmpty())
                        System.out.println("No hay pedidos en ese estado.");
                    else
                        pedsEst.forEach(
                                p -> System.out.println(" - Pedido #" + p.getId() + " | Total: $" + p.getTotal()));
                    break;
                case "4":
                    List<Pedido> terminados = pedidoRepo.buscarPorEstado(EstadoPedido.TERMINADO);
                    double totalFacturado = terminados.stream().mapToDouble(Pedido::getTotal).sum();
                    System.out.printf(Locale.US, "Total Facturado Histórico: $%.2f%n", totalFacturado);
                    break;
                case "0":
                    volver = true;
                    break;
                default:
                    System.out.println("Opción inválida.");
            }
        }
    }
}