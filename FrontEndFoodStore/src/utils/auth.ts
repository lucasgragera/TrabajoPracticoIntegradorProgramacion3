import type { IUser } from "../types/IUser";
import type { Rol } from "../types/Rol";
import { getUSer, removeUser } from "./localStorage";
import { navigate } from "./navigate";

export const checkAuhtUser = (
  redireccion1: string,
  redireccion2: string,
  rolesRequeridos: Rol | Rol[] 
) => {
  console.log("comienzo de checkeo");

  const user = getUSer();

  if (!user) {
    console.log("no existe en local");
    navigate(redireccion1); // Redireccion al login
    return;
  } 
  
  const parseUser: IUser = JSON.parse(user);

  // Convertimos a array por si le pasam un solo string desde otra página
  const rolesPermitidos = Array.isArray(rolesRequeridos) ? rolesRequeridos : [rolesRequeridos];

  // Si el rol del usuario NO está en la lista de permitidos, lo expulsamos
  if (!rolesPermitidos.includes(parseUser.role)) {
    console.log("existe pero no tiene el rol necesario");
    navigate(redireccion2); // Redireccion al link correcto
    return;
  }
};

export const logout = () => {
  removeUser();
  navigate("/src/pages/auth/login/login.html");
};