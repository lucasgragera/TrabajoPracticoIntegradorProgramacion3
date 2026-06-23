package com.tp.jpa.repository;

import com.tp.jpa.model.Usuario;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Optional;

public class UsuarioRepository extends BaseRepository<Usuario> {

    public UsuarioRepository() {
        super(Usuario.class);
    }

    public Optional<Usuario> buscarPorMail(String mail) {
        EntityManager em = emf.createEntityManager();
        try {
            // Consulta JPQL: busca un usuario activo por su dirección de correo electrónico
            // Retorna Optional para manejar el caso en que el mail no esté registrado
            String jpql = "SELECT u FROM Usuario u WHERE u.mail = :mail AND u.eliminado = false";
            List<Usuario> resultados = em.createQuery(jpql, Usuario.class)
                    .setParameter("mail", mail)
                    .getResultList();

            if (resultados.isEmpty()) {
                return Optional.empty();
            }
            return Optional.of(resultados.get(0));
        } finally {
            em.close();
        }
    }
}