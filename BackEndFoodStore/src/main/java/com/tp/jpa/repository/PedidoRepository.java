package com.tp.jpa.repository;

import com.tp.jpa.model.Pedido;
import com.tp.jpa.model.enums.EstadoPedido;
import jakarta.persistence.EntityManager;
import java.util.List;

public class PedidoRepository extends BaseRepository<Pedido> {

    public PedidoRepository() {
        super(Pedido.class);
    }

    public List<Pedido> buscarPorUsuario(Long idUsuario) {
        EntityManager em = emf.createEntityManager();
        try {
            // Consulta JPQL: retorna todos los pedidos activos de un usuario dado su ID
            // Filtra por eliminado = false para excluir pedidos dados de baja lógica
            String jpql = "SELECT p FROM Usuario u JOIN u.pedidos p WHERE u.id = :uid AND p.eliminado = false";
            return em.createQuery(jpql, Pedido.class)
                    .setParameter("uid", idUsuario)
                    .getResultList();
        } finally {
            em.close();
        }
    }

    public List<Pedido> buscarPorEstado(EstadoPedido estadoPedido) {
        EntityManager em = emf.createEntityManager();
        try {
            // Consulta JPQL: retorna todos los pedidos activos con un estado específico
            // Útil para filtrar PENDIENTE, CONFIRMADO, TERMINADO o CANCELADO
            String jpql = "SELECT p FROM Pedido p WHERE p.estado = :estado AND p.eliminado = false";
            return em.createQuery(jpql, Pedido.class)
                    .setParameter("estado", estadoPedido)
                    .getResultList();
        } finally {
            em.close();
        }
    }
}