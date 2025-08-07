// // emploi-du-temps.model.ts
// export interface EmploiDuTempsClasse {
//   id: number;
//   classe: Classe;
//   creneaux: Creneau[];
//   message?: string;
//   code?: number;
      
// }

// export interface Classe {
//   id: number;
//   nom: string;
//   niveau: string;
//   filiere: string;
//   statistiques: StatistiquesClasse;
//   anneeScolaire: string;
//        message?: string;
//   code?: number;
// }

// export interface Creneau {
//   id: number;
//   jour: Jour;
//   heureDebut: string;
//   heureFin: string;
//   type: TypeCours;
//   matiere: Matiere;
//   enseignant: Enseignant;
//   salle: Salle;
//   periode: number;
//      message?: string;
//   code?: number;
// }

// export interface Matiere {
//   id: number;
//   nom: string;
//   code: string;
//      message?: string;
//   code?: number;
// }

// export interface Enseignant {
//   id: number;
//   nomComplet: string;
 
//   specialite: string;
//      message?: string;
//   code?: number;
// }

// export interface Salle {
//   id: number;
//   numero: string;
//   type: string;
//   capacite: number;
//    message?: string;
//   code?: number;
// }

// export interface StatistiquesClasse {
//   id: number;
//   totalPeriodes: string;
//   message: string;
//   heuresParMatiereJson: string;
//   code: number;
// }

// export enum Jour {
//   LUNDI = 'LUNDI',
//   MARDI = 'MARDI',
//   MERCREDI = 'MERCREDI',
//   JEUDI = 'JEUDI',
//   VENDREDI = 'VENDREDI',
//   SAMEDI = 'SAMEDI'
// }

// export enum TypeCours {
//   COURS = 'COURS',
//   TD = 'TD',
//   TP = 'TP',
//   EXAMEN = 'EXAMEN'
// }