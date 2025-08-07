// export interface User {
//   id?: string; // Optionnel pour la création
//   email: string;
//   password: string;
//   name?: string;
//   role: 'admin' | 'teacher' | 'student';
//   department?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

import { EtablissementDto } from "./models";

// Interface pour la réponse de login
export interface AuthResponse {
  bearer: string;
  refresh: string;
}

export enum TypeRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}


export interface User {
  id?: number;
  mdp?: string;
  nom?: string;
  email?: string;
  logo?: string;
  actif: boolean;  // correspond au boolean "aticf"
  role: TypeRole;
  validation?: AuthResponse;
 etablissementDTO?: EtablissementDto;
  etablissementId?: number;
  // Champs génériques de réponse
  message?: string;
  code?: number;
}