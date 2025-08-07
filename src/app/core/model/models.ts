import {  TypeCours, CategorieMatiere, Jour } from './enums';

export interface ResponseDto {
  message?: string;
  code?: number;
}

// Entités de base
export interface ClasseDto extends ResponseDto {
  id: number;
  nom: string;
  filiere: string;
  niveau: string;
  idEtablissement?: number;
  emploiDuTemps?: EmploiDuTempsClasseDto;
  statistiques?: StatistiquesClasseDto;
  idEmploiDuTemps?: number;
}

export interface CreneauDto extends ResponseDto {
  id?: number;
  jourSemaine: Jour;
  heureDebut: string;
  nomClasse?: string;
  heureFin: string;
  type: TypeCours;
  matiere: MatiereDto;
  enseignant: EnseignantDto;
  salle: SalleDto;
  periode: number;
  emploiDuTempsId?:any;
}

export interface CreneauIndividuelDto extends ResponseDto {
  id: number;
  jour: Jour;
  heureDebut: string;
  heureFin: string;
  type: TypeCours;
  matiereCode: string;
  matiereNom: string;
  classeNom: string;
  salleNumero: string;
  emploiDuTempsIndividuelId?: number;
}

export interface CycleNiveauxDto extends ResponseDto {
  cycle: string;
  niveaux: string[];
}

export interface DepartementDto extends ResponseDto {
  id?: number;
  codeDepar: string;
  nom: string;
  matieres?: MatiereDto[];
  enseignants?: EnseignantDto[];
  etablissement?: EtablissementDto;
  idEtablissement?: number;
}

export interface DisponibiliteDto extends ResponseDto {
  id?: number;
  jourSemaine: Jour;
  heureDebut: string;
  heureFin: string;
}

export interface EmploiDuTempsClasseDto extends ResponseDto {
  id: number;
  classe: ClasseDto;
  creneaux: CreneauDto[];
}

export interface EmploiDuTempsIndividuelDto extends ResponseDto {
  id: number;
  enseignant: EnseignantDto;
  creneaux: CreneauIndividuelDto[];
}

// export interface EnseignantDto extends ResponseDto {
//  // ↓ Ajouts (optionnels pour ne pas casser le code existant)
//   matricule?: string;
//   diplome?: string;
//   grade?: string;
//   anciennete?: number;
//   telephone?: string;
//   idDepartement?: number;

//   id: number;
//   nomComplet: string;
//   email?: string;
//   departement?: DepartementDto;
//   matieres?: MatiereDto[];
//   disponibilites?: DisponibiliteDto[];
//   emploiDuTemps?: EmploiDuTempsIndividuelDto;
//   statistiques?: StatistiquesEnseignantDto;
//   idEtablissement?:number,
//   codeRetour?:number
// }



export interface EnseignantDto extends ResponseDto {
  // Ajouts optionnels
  matricule: string;
  diplome: string;
  grade: string;
  anciennete: number;
  telephone: string;
  idDepartement: number;

  id?: number;
  nomComplet: string;
  email: string;
  departement?: DepartementDto;
  matieres?: MatiereDto[];
  matieresIds: number[];      // <-- Ajout important pour création/màj
  disponibilites?: DisponibiliteDto[];
  emploiDuTemps?: EmploiDuTempsIndividuelDto;
  statistiques?: StatistiquesEnseignantDto;
  idEtablissement: number;
  codeRetour?: number;
}


export interface EtablissementDto extends ResponseDto {
  id?: number;
  nom: string;
  logo?: string;
  anneeScolaire?: string;
  departements?: DepartementDto[];
  classes?: ClasseDto[];
  enseignants?: EnseignantDto[];
  telephone?: string;
  email?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  codePostal?: string;
  nomEn?: string;
   

    // ✅ Nouvelles propriétés calculées
  nombreDepartements?: number;
  nombreClasses?: number;
  nombreEnseignants?: number;
 // Pour les opérations de création/mise à jour
  message?: string; // Pour les messages d'erreur ou de succès
  codeRetoure?: number; // Pour les codes de retour d'erreur
}

export interface GrilleHoraireDto extends ResponseDto {
  id: number;
  filiere: string;
  niveaux: NiveauDto[];
}

export interface MatiereDto   {
  id: number;
  code: string;
  nom: string;
  coefficient?: number;
  categorie?: CategorieMatiere;
  idDepartement?: number;
   message?:string;
  codeRetoure?: number;

}

export interface NiveauDto extends ResponseDto {
  id: number;
  nom: string;
  matieres?: MatiereDto[];
  totaux?: TotauxDto;
}

export interface SalleDto extends ResponseDto {
  id: number;
  numero: string;
  type?: string;
}

export interface StatistiquesClasseDto extends ResponseDto {
  id: number;
  totalPeriodes?: number;
  heuresParMatiereJson?: string;
}

export interface StatistiquesEnseignantDto extends ResponseDto {
  id: number;
  heuresTotales?: number;
  heuresEffectuees?: number;
  classes?: CycleNiveauxDto[];
}

export interface TotauxDto extends ResponseDto {
  global?: string;
  general?: string;
  technique?: string;
  professionnel?: string;
  complementaire?: string;
}


export interface HoraireDTO {
  id?: number;
  heureDebut?: string;  // LocalTime sera reçu comme string en JSON, ex: "08:00:00"
  heureFin?: string;
  label?: string;
  etablissementId?: number;

  // Champs de réponse génériques
  message?: string;
  code?: number;
}


export interface JourDto {
  id?: number;
  jour: Jour;  // Enum côté Angular
  etablissementId?: number;

  // Champs de réponse
  message?: string;
  code?: number;
}


export interface StatistiquesSimpleDto {
  heuresDue?: string;
  heuresFaites?: string; 
}

export interface JourEnseignantDto {
  jour: Jour ;
  creneaux: CreneauDto[];
}


export interface FicheEnseignantDto {
  enseignant?: EnseignantDto;
  anneeScolaire?: string;
  statistiques?: StatistiquesSimpleDto;
  matiere?: MatiereDto[];
  classesTaught?: ClasseDto[];
  emploiDuTemps?: JourEnseignantDto[];
}