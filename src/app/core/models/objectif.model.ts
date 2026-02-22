export interface Objectif {
    id: string;
    titre: string;
    statut: 'en cours' | 'terminé';
    dateCreation: string;
    dateValidation?: string; // string pour pas reconvertir en date a chaque fois
    // le ? indique que ce champ est optionnel, il peut être null ou undefined
}