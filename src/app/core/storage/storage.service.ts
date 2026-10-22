import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Sortie } from '../models/sortie.model';
import { Objectif } from '../models/objectif.model';
import { Badge } from '../models/badge.model';
import { NotificationSettings } from '../models/notification.model';
import { Note } from '../models/note.model';
import { CompteursBadges, REGLES_BADGES, RegleBadge } from '../badge-regles';
import { fusionnerBadges } from '../badges-fusion';
import { memeJour, numeroDeJour } from '../sorties-utils';

/*==================================================*/
/*             STORAGE SERVICE                      */
/*  Ce service est la source unique de données      */
/*  de toute l'application.                         */
/*                                                  */
/*  MÉTHODES DISPONIBLES DEPUIS N'IMPORTE OÙ :      */
/*                                                  */
/*  --- SORTIES (une entrée = une journée) ---      */
/*  getSorties()             → tableau complet      */
/*  getSortieDuJour(date?)   → l'entrée d'un jour   */
/*  addSortie(sortie)        → ajoute une sortie    */
/*  updateSortie(sortie)     → modifie une sortie   */
/*  deleteSortie(id)         → supprime une sortie  */
/*                                                  */
/*  --- OBJECTIFS ---                               */
/*  getObjectifs()               → tableau complet  */
/*  addObjectif(titre)           → ajoute           */
/*  updateObjectif(id)           → bascule statut   */
/*  supprimerObjectif(id)        → supprime         */
/*  getObjectifsEnCours()        → filtre en cours  */
/*  getObjectifsTermines()       → filtre terminés  */
/*  getNombreObjectifsEnCours()  → nombre en cours  */
/*  getNombreObjectifsTermines() → nombre terminés  */
/*                                                  */
/*  --- STATS ---                                   */
/*  getTotalSorties()        → jours de sortie      */
/*  getSortiesCeMois()       → jours de sortie ce   */
/*                             mois                 */
/*  getMoyenneAvant()        → moyenne note avant   */
/*  getMoyenneApres()        → moyenne note après   */
/*  getStreak()              → jours consécutifs    */
/*  getRecentesSorties(n)    → n dernières          */
/*                                                  */
/*  --- BADGES ---                                  */
/*  badges$                      → observable       */
/*  getDerniersBadges(n)         → n derniers       */
/*  getNombreBadgesDebloques()   → nombre débloqués */
/*  getCompteursBadges()         → valeurs des      */
/*                                 règles (voir     */
/*                                 badge-regles.ts) */
/*  nouveauBadge$  → émet quand un badge est débloqué  */
/*                                                  */
/*  --- IMPORT / EXPORT ---                         */
/*  exportData()             → télécharge .json     */
/*  importData(fichier)      → importe depuis .json */
/*  clearData()              → efface tout          */
/*                                                  */
/*  --- OBSERVABLES (abonnement automatique) ---    */
/*  sorties$    → flux de sorties                   */
/*  objectifs$  → flux d'objectifs                  */
/*  badges$     → flux de badges                    */
/*==================================================*/

@Injectable({
  providedIn: 'root', // Une seule instance partagée dans toute l'app
})
export class StorageService {
  /*================================*/
  /*         BEHAVIOR SUBJECTS      */
  /*  Les "boîtes" qui stockent     */
  /*  les données en temps réel     */
  /*================================*/

  // Privés : seul ce service peut les modifier directement
  private prenomSubject = new BehaviorSubject<string>('');
  private sortiesSubject = new BehaviorSubject<Sortie[]>([]);
  private objectifsSubject = new BehaviorSubject<Objectif[]>([]);
  private badgesSubject = new BehaviorSubject<Badge[]>([]);
  private nouveauBadgeSubject = new BehaviorSubject<Badge | null>(null);
  private notesSubject = new BehaviorSubject<Note[]>([]);

  // Publics en lecture seule : les composants s'y abonnent
  prenom$ = this.prenomSubject.asObservable();
  sorties$ = this.sortiesSubject.asObservable();
  objectifs$ = this.objectifsSubject.asObservable();
  badges$ = this.badgesSubject.asObservable();
  nouveauBadge$ = this.nouveauBadgeSubject.asObservable();
  notes$ = this.notesSubject.asObservable();

  private notifSubject = new BehaviorSubject<NotificationSettings>({
    sortieActive: true,
    sortieHeure: '18:00',
    encouragementActif: true,
    encouragementHeure: '09:00',
    coherenceActive: true,
    coherenceHeures: ['08:00', '13:00', '18:00'],
  });

  notif$ = this.notifSubject.asObservable();

  /*================================*/
  /*          CONSTRUCTEUR          */
  /*  S'exécute au démarrage de     */
  /*  l'app, charge le localStorage */
  /*================================*/
  constructor() {
    const sorties = localStorage.getItem('sorties');
    const objectifs = localStorage.getItem('objectifs');
    const badges = localStorage.getItem('badges');
    const notif = localStorage.getItem('notif');
    const notes = localStorage.getItem('notes');
    const prenom = localStorage.getItem('prenom');

    if (notes) this.notesSubject.next(JSON.parse(notes));
    if (notif) this.notifSubject.next(JSON.parse(notif));
    // Le prénom était enregistré mais jamais relu au démarrage
    if (prenom) this.prenomSubject.next(prenom);

    if (sorties) this.sortiesSubject.next(JSON.parse(sorties));
    if (objectifs) this.objectifsSubject.next(JSON.parse(objectifs));

    // On fusionne ce qui est enregistré avec la liste actuelle du code
    // (voir badges-fusion.ts). Au premier lancement, rien n'est enregistré :
    // on obtient simplement les badges par défaut.
    this.badgesSubject.next(
      fusionnerBadges(this.lireBadgesEnregistres(badges), this.getDefaultBadges()),
    );

    // Vérification des badges au démarrage
    this.verifierBadges(this.sortiesSubject.getValue());
  }

  // Lit les badges enregistrés. Un contenu absent ou illisible donne une liste
  // vide : on repart des badges par défaut au lieu de faire planter l'appli.
  private lireBadgesEnregistres(texte: string | null): Badge[] {
    if (!texte) return [];
    try {
      const donnees: unknown = JSON.parse(texte);
      return Array.isArray(donnees) ? (donnees as Badge[]) : [];
    } catch {
      return [];
    }
  }

  /*================================*/
  /*       SAUVEGARDE PRIVÉE        */
  /*  JSON.stringify() convertit    */
  /*  le tableau en texte pour      */
  /*  le stocker dans localStorage  */
  /*================================*/

  private saveSorties(sorties: Sortie[]): void {
    localStorage.setItem('sorties', JSON.stringify(sorties));
  }

  private saveObjectifs(objectifs: Objectif[]): void {
    localStorage.setItem('objectifs', JSON.stringify(objectifs));
  }

  private saveBadges(badges: Badge[]): void {
    localStorage.setItem('badges', JSON.stringify(badges));
  }

  private saveNotif(notif: NotificationSettings): void {
    localStorage.setItem('notif', JSON.stringify(notif));
  }

  /*================================*/
  /*             PRÉNOM             */
  /*================================*/

  getPrenom(): string {
    return this.prenomSubject.getValue();
  }

  setPrenom(prenom: string): void {
    this.prenomSubject.next(prenom);
    localStorage.setItem('prenom', prenom);
  }

  /*================================*/
  /*            SORTIES             */
  /*================================*/

  // Retourne la liste actuelle sans s'abonner (lecture synchrone)
  getSorties(): Sortie[] {
    return this.sortiesSubject.getValue();
  }

  // L'entrée d'un jour donné (aujourd'hui par défaut), ou undefined s'il n'y en a pas
  getSortieDuJour(date: Date = new Date()): Sortie | undefined {
    return this.sortiesSubject.getValue().find((s) => memeJour(s.start, date));
  }

  // Ajoute une nouvelle sortie et vérifie les badges
  addSortie(sortie: Sortie): void {
    const current = this.sortiesSubject.getValue();
    const updated = [...current, sortie];
    this.sortiesSubject.next(updated);
    this.saveSorties(updated);
    this.verifierBadges(updated);
  }

  // Remplace une sortie existante par la version modifiée.
  // On revérifie les badges : changer l'humeur ou les notes peut en débloquer un.
  updateSortie(sortie: Sortie): void {
    const updated = this.sortiesSubject
      .getValue()
      .map((s) => (s.id === sortie.id ? sortie : s));
    this.sortiesSubject.next(updated);
    this.saveSorties(updated);
    this.verifierBadges(updated);
  }

  // Supprime une sortie par son id
  deleteSortie(id: string): void {
    const updated = this.sortiesSubject.getValue().filter((s) => s.id !== id);
    this.sortiesSubject.next(updated);
    this.saveSorties(updated);
  }

  /*================================*/
  /*            OBJECTIFS           */
  /*================================*/

  // Retourne la liste actuelle sans s'abonner (lecture synchrone)
  getObjectifs(): Objectif[] {
    return this.objectifsSubject.getValue();
  }

  // Crée et ajoute un nouvel objectif
  addObjectif(titre: string): void {
    const newObjectif: Objectif = {
      id: Math.random().toString(36).substr(2, 9),
      titre,
      statut: 'en cours',
      dateCreation: new Date().toISOString(),
    };
    const current = this.objectifsSubject.getValue();
    const updated = [...current, newObjectif];
    this.objectifsSubject.next(updated);
    this.saveObjectifs(updated);
  }

  // Bascule le statut d'un objectif : 'en cours' ↔ 'terminé'.
  // On revérifie les badges : terminer un objectif peut en débloquer un.
  updateObjectif(id: string): void {
    const updated = this.objectifsSubject.getValue().map((obj) => {
      if (obj.id !== id) return obj;
      return obj.statut === 'en cours'
        ? {
            ...obj,
            statut: 'terminé' as const,
            dateValidation: new Date().toISOString(),
          }
        : { ...obj, statut: 'en cours' as const, dateValidation: undefined };
    });
    this.objectifsSubject.next(updated);
    this.saveObjectifs(updated);
    this.verifierBadges(this.sortiesSubject.getValue());
  }

  // Supprime un objectif par son id
  supprimerObjectif(id: string): void {
    const updated = this.objectifsSubject
      .getValue()
      .filter((obj) => obj.id !== id);
    this.objectifsSubject.next(updated);
    this.saveObjectifs(updated);
  }

  // Retourne uniquement les objectifs en cours
  getObjectifsEnCours(): Objectif[] {
    return this.objectifsSubject
      .getValue()
      .filter((o) => o.statut === 'en cours');
  }

  // Retourne uniquement les objectifs terminés
  getObjectifsTermines(): Objectif[] {
    return this.objectifsSubject
      .getValue()
      .filter((o) => o.statut === 'terminé');
  }

  // Retourne le nombre d'objectifs en cours
  getNombreObjectifsEnCours(): number {
    return this.objectifsSubject
      .getValue()
      .filter((o) => o.statut === 'en cours').length;
  }

  // Retourne le nombre d'objectifs terminés
  getNombreObjectifsTermines(): number {
    return this.objectifsSubject
      .getValue()
      .filter((o) => o.statut === 'terminé').length;
  }

  /*================================*/
  /*              STATS             */
  /*  Calculs centralisés           */
  /*  utilisables partout           */
  /*================================*/

  // Nombre de jours distincts qui comptent au moins une sortie
  private nombreDeJours(sorties: Sortie[]): number {
    return new Set(sorties.map((s) => numeroDeJour(s.start))).size;
  }

  // Nombre de jours de sortie
  getTotalSorties(): number {
    return this.nombreDeJours(this.sortiesSubject.getValue());
  }

  // Nombre de jours de sortie du mois en cours
  getSortiesCeMois(): number {
    const now = new Date();
    const duMois = this.sortiesSubject.getValue().filter((s) => {
      const date = new Date(s.start);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });
    return this.nombreDeJours(duMois);
  }

  // Moyenne de toutes les notes avant
  getMoyenneAvant(): number {
    const notes = this.sortiesSubject
      .getValue()
      .map((s) => s.extendedProps?.noteAvant)
      .filter((note): note is number => typeof note === 'number');
    if (!notes.length) return 0;
    return notes.reduce((acc, n) => acc + n, 0) / notes.length;
  }

  // Moyenne de toutes les notes après
  getMoyenneApres(): number {
    const notes = this.sortiesSubject
      .getValue()
      .map((s) => s.extendedProps?.noteApres)
      .filter((note): note is number => typeof note === 'number');
    if (!notes.length) return 0;
    return notes.reduce((acc, n) => acc + n, 0) / notes.length;
  }

  // Record de jours consécutifs
  getStreak(): number {
    return this.getMaxJoursConsecutifs(this.sortiesSubject.getValue());
  }

  // Retourne les n sorties les plus récentes (5 par défaut)
  getRecentesSorties(nombre: number = 5): Sortie[] {
    return [...this.sortiesSubject.getValue()]
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
      .slice(0, nombre);
  }

  /*================================*/
  /*             BADGES             */
  /*================================*/

  // Retourne les n derniers badges débloqués (3 par défaut)
  getDerniersBadges(nombre: number = 3): Badge[] {
    return [...this.badgesSubject.getValue()]
      .filter((b) => b.unlocked)
      .sort(
        (a, b) =>
          new Date(b.dateUnlocked ?? 0).getTime() -
          new Date(a.dateUnlocked ?? 0).getTime(),
      )
      .slice(0, nombre);
  }

  // Retourne le nombre total de badges débloqués
  getNombreBadgesDebloques(): number {
    return this.badgesSubject.getValue().filter((b) => b.unlocked).length;
  }

  // Retourne le premier badge pas encore débloqué, dans l'ordre de la liste.
  // Attention : ça peut être un badge "Bientôt" (sans règle). Pour proposer
  // le badge le plus proche, utiliser trouverProchainBadge() (badge-regles.ts).
  getProchainBadge(): Badge | null {
    return this.badgesSubject.getValue().find((b) => !b.unlocked) ?? null;
  }

  /*================================*/
  /*         JOURS CONSÉCUTIFS      */
  /*  Calcule le record de jours    */
  /*  consécutifs de sorties        */
  /*================================*/
  getMaxJoursConsecutifs(sorties: Sortie[]): number {
    if (sorties.length === 0) return 0;

    // Les jours distincts, du plus ancien au plus récent
    const jours = [...new Set(sorties.map((s) => numeroDeJour(s.start)))].sort(
      (a, b) => a - b,
    );

    // Deux jours se suivent si leur numéro diffère de 1
    let maxConsecutifs = 1;
    let compteur = 1;
    for (let i = 1; i < jours.length; i++) {
      if (jours[i] - jours[i - 1] === 1) {
        compteur++;
        maxConsecutifs = Math.max(maxConsecutifs, compteur);
      } else {
        compteur = 1;
      }
    }
    return maxConsecutifs;
  }

  /*================================*/
  /*     COMPTEURS DES BADGES       */
  /*  Les valeurs que comparent les */
  /*  règles (voir badge-regles.ts) */
  /*================================*/
  calculerCompteurs(sorties: Sortie[]): CompteursBadges {
    const parHumeur = (humeur: string) =>
      sorties.filter((s) => s.extendedProps?.category === humeur).length;

    return {
      total: this.nombreDeJours(sorties),
      tresbien: parHumeur('tresbien'),
      bien: parHumeur('bien'),
      moyen: parHumeur('moyen'),
      anxieuse: parHumeur('anxieuse'),
      objectifs: this.objectifsSubject
        .getValue()
        .filter((o) => o.statut === 'terminé').length,
      consecutifs: this.getMaxJoursConsecutifs(sorties),
      // Sorties où la note après > note avant (amélioration)
      ameliorations: sorties.filter(
        (s) =>
          s.extendedProps?.noteApres !== undefined &&
          s.extendedProps?.noteAvant !== undefined &&
          s.extendedProps.noteApres > s.extendedProps.noteAvant,
      ).length,
    };
  }

  // Les compteurs d'aujourd'hui (pour afficher la progression des badges)
  getCompteursBadges(): CompteursBadges {
    return this.calculerCompteurs(this.sortiesSubject.getValue());
  }

  /*================================*/
  /*        LOGIQUE BADGES          */
  /*  Appelée à chaque changement   */
  /*  de sortie ou d'objectif, et   */
  /*  au démarrage                  */
  /*================================*/
  private verifierBadges(sorties: Sortie[]): void {
    const badges = this.badgesSubject.getValue();
    const compteurs = this.calculerCompteurs(sorties);

    // Pour chaque badge non débloqué, on vérifie si sa règle est remplie
    const updated = badges.map((badge) => {
      if (badge.unlocked) return badge;

      // Un badge sans règle ("Bientôt") ne se débloque jamais
      const regle: RegleBadge | undefined = REGLES_BADGES[badge.id];
      if (regle && compteurs[regle.compteur] >= regle.cible) {
        return {
          ...badge,
          unlocked: true,
          dateUnlocked: new Date().toISOString(),
        };
      }
      return badge;
    });

    // On cherche les badges NOUVELLEMENT débloqués (qui ne l'étaient pas avant)
    const badgesNewellementDebloques = updated.filter((newBadge) => {
      const oldBadge = badges.find((b) => b.id === newBadge.id);
      return !oldBadge?.unlocked && newBadge.unlocked;
    });

    // On émet seulement le badge le plus récent s'il vient d'être débloqué
    if (badgesNewellementDebloques.length > 0) {
      const dernierDebloque = badgesNewellementDebloques.sort(
        (a, b) =>
          new Date(b.dateUnlocked ?? 0).getTime() -
          new Date(a.dateUnlocked ?? 0).getTime(),
      )[0];
      this.nouveauBadgeSubject.next(dernierDebloque);
    }

    this.badgesSubject.next(updated);
    this.saveBadges(updated);
  }

  /*================================*/
  /*         IMPORT / EXPORT        */
  /*  Gestion des sauvegardes       */
  /*  depuis la page Paramètres     */
  /*================================*/

  // Télécharge toutes les données dans un fichier .json
  exportData(): void {
    // 1. On récupère toutes les données
    const data = {
      sorties: this.sortiesSubject.getValue(),
      objectifs: this.objectifsSubject.getValue(),
      notes: this.notesSubject.getValue(),
      //badges: this.badgesSubject.getValue(),
    };

    // 2. On convertit en texte JSON lisible (le 2 = indentation pour que ce soit joli)
    const json = JSON.stringify(data, null, 2);

    // 3. On crée un fichier téléchargeable en mémoire
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // 4. On crée un lien invisible et on clique dessus automatiquement
    const a = document.createElement('a');
    a.href = url;
    a.download = `mira-backup-${new Date().toLocaleDateString('fr-FR')}.json`;
    a.click();

    // 5. On libère la mémoire
    URL.revokeObjectURL(url);
  }

  // Importe les données depuis un fichier .json
  importData(fichier: File): void {
    // 1. FileReader lit le contenu du fichier
    const reader = new FileReader();

    // 2. Cette fonction s'exécute quand la lecture est terminée (asynchrone)
    reader.onload = (event) => {
      try {
        // 3. On parse le JSON
        const data = JSON.parse(event.target?.result as string);

        // 4. On remet les données dans les BehaviorSubjects
        // ?? [] = si la donnée est absente, on met un tableau vide par défaut
        this.sortiesSubject.next(data.sorties ?? []);
        this.objectifsSubject.next(data.objectifs ?? []);
        this.notesSubject.next(data.notes ?? []);
        this.saveNotes(data.notes ?? []);
        // this.badgesSubject.next(data.badges ?? this.getDefaultBadges());

        // 5. On sauvegarde dans le localStorage
        this.saveSorties(data.sorties ?? []);
        this.saveObjectifs(data.objectifs ?? []);
        // this.saveBadges(data.badges ?? this.getDefaultBadges());

        this.verifierBadges(data.sorties ?? []);
      } catch (e) {
        // Si le fichier est invalide ou corrompu
        alert('Fichier invalide !');
      }
    };

    // 6. On lance la lecture du fichier
    reader.readAsText(fichier);
  }

  // Efface toutes les données (avec confirmation)
  clearData(): void {
    if (confirm('Es-tu sûr de vouloir effacer toutes tes données ?')) {
      localStorage.clear();
      this.sortiesSubject.next([]);
      this.objectifsSubject.next([]);
      // Les notes et le prénom restaient affichés jusqu'au prochain rechargement
      this.notesSubject.next([]);
      this.prenomSubject.next('');
      // On recharge les badges par défaut (tous verrouillés)
      this.badgesSubject.next(this.getDefaultBadges());
    }
  }

  /*================================*/
  /*        BADGES PAR DÉFAUT       */
  /*  La LISTE DE RÉFÉRENCE : titre,*/
  /*  texte et image viennent d'ici */
  /*  (voir badges-fusion.ts).      */
  /*  Corriger un texte ici suffit :*/
  /*  il est mis à jour chez tout   */
  /*  le monde au démarrage.        */
  /*  Ne JAMAIS changer un "id".    */
  /*================================*/
  private getDefaultBadges(): Badge[] {
    return [
      /* ---------- Nombre de sorties (jours de sortie) ---------- */
      {
        id: 'premiere_sortie',
        image:
          'assets/icons/achivements/1-NombresDeSorties/1PremiereSortie.webp',
        title: 'Première sortie',
        description: 'Tu viens de commencer ton aventure !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'en_mouvement',
        image: 'assets/icons/achivements/1-NombresDeSorties/1EnMouvement.webp',
        title: 'En mouvement',
        description: '5 jours de sortie !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'mira_active',
        image: 'assets/icons/achivements/1-NombresDeSorties/1MiraActive.webp',
        title: 'Mira active',
        description: '10 jours de sortie !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'exploratrice',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Exploratrice.webp',
        title: 'Explorateur',
        description: '20 jours de sortie !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'aventurier',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Aventurier.webp',
        title: 'Aventurier',
        description: '30 jours de sortie !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'nomade',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Nomade.webp',
        title: 'Nomade',
        description: '50 jours de sortie !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'toujours_dehors',
        image:
          'assets/icons/achivements/1-NombresDeSorties/1ToujoursDehors.webp',
        title: 'Toujours dehors',
        description: '75 jours de sortie !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'marathonien',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Maratonien.webp',
        title: 'Marathonien',
        description: '100 jours de sortie !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'inarretable',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Inarretable.webp',
        title: 'Inarrêtable',
        description: '150 jours de sortie !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'legende_sortie',
        image:
          'assets/icons/achivements/1-NombresDeSorties/1LegendesSortie.webp',
        title: 'Légende des sorties',
        description: '200 jours de sortie !',
        unlocked: false,
        dateUnlocked: null,
      },

      /* ---------- Humeurs ---------- */
      {
        id: 'rayon_soleil',
        image: 'assets/icons/achivements/2-Humeurs/2RayonDeSoleil.webp',
        title: 'Rayon de soleil',
        description: "5 jours de sortie avec l'humeur « Très bien » !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'energie_positive',
        image: 'assets/icons/achivements/2-Humeurs/2EnergiePositive.webp',
        title: 'Énergie positive',
        description: "15 jours de sortie avec l'humeur « Très bien » !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'humeur_or',
        image: 'assets/icons/achivements/2-Humeurs/2HumeurEnOr.webp',
        title: 'Humeur en or',
        description: "30 jours de sortie avec l'humeur « Très bien » !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'bonne_vibes',
        image: 'assets/icons/achivements/2-Humeurs/2BonneVibes.webp',
        title: 'Bonne vibe',
        description: "5 jours de sortie avec l'humeur « Bien » !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'optimiste',
        image: 'assets/icons/achivements/2-Humeurs/2Optimiste.webp',
        title: 'Optimiste',
        description: "10 jours de sortie avec l'humeur « Bien » !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'stable_sereine',
        image: 'assets/icons/achivements/2-Humeurs/2StableEtSereine.webp',
        title: 'Stable et serein',
        description: "25 jours de sortie avec l'humeur « Bien » !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'cava_aller',
        image: 'assets/icons/achivements/2-Humeurs/2CavaAller.webp',
        title: 'Ça va aller',
        description: "5 jours de sortie avec l'humeur « Moyen » !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'tu_tiens_cap',
        image: 'assets/icons/achivements/2-Humeurs/2TuTiensLeCap.webp',
        title: 'Tu tiens le cap',
        description: "15 jours de sortie avec l'humeur « Moyen » !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'ressilient',
        image: 'assets/icons/achivements/2-Humeurs/2Ressilient.webp',
        title: 'Résilient',
        description: "30 jours de sortie avec l'humeur « Moyen » !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'sortie_courageuse',
        image: 'assets/icons/achivements/2-Humeurs/2SortieCourageuse.webp',
        title: 'Sortie courageuse',
        description: "1 jour de sortie avec l'humeur « Anxieuse » !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'tu_laches_rien',
        image: 'assets/icons/achivements/2-Humeurs/2TuNeLachesRien.webp',
        title: 'Tu ne lâches rien',
        description: "5 jours de sortie avec l'humeur « Anxieuse » !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'courage_quotidien',
        image: 'assets/icons/achivements/2-Humeurs/2courageQuotidien.webp',
        title: 'Courage quotidien',
        description: "10 jours de sortie avec l'humeur « Anxieuse » !",
        unlocked: false,
        dateUnlocked: null,
      },

      /* ---------- Progression ---------- */
      {
        id: 'petit_mieux',
        image: 'assets/icons/achivements/3-Progression/3PetitMieux.webp',
        title: 'Petit mieux',
        description: "Un jour de sortie où tu te sens mieux après qu'avant !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'tu_progresses',
        image: 'assets/icons/achivements/3-Progression/3Tuprograsse.webp',
        title: 'Tu progresses',
        description: "5 jours de sortie où tu te sens mieux après qu'avant !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'bonne_dynamique',
        image: 'assets/icons/achivements/3-Progression/3BonneDynamique.webp',
        title: 'Bonne dynamique',
        description: "10 jours de sortie où tu te sens mieux après qu'avant !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'ascension_positive',
        image: 'assets/icons/achivements/3-Progression/3AscensionPositive.webp',
        title: 'Ascension positive',
        description: "20 jours de sortie où tu te sens mieux après qu'avant !",
        unlocked: false,
        dateUnlocked: null,
      },
      // Les trois suivants n'ont pas encore de règle (voir badge-regles.ts) :
      // ils s'affichent en "Bientôt". Leur texte est provisoire.
      {
        id: 'revenir_plus_fort',
        image: 'assets/icons/achivements/3-Progression/3RevenirplusFort.webp',
        title: 'Revenir plus fort',
        description: 'Une sortie qui se passe mieux, après un jour difficile !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'resilience',
        image: 'assets/icons/achivements/3-Progression/3Resilience.webp',
        title: 'Résilience',
        description: "3 jours de sortie d'affilée après une période anxieuse !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'transformation',
        image: 'assets/icons/achivements/3-Progression/3Transformation.webp',
        title: 'Transformation',
        description: 'Une amélioration visible sur un mois !',
        unlocked: false,
        dateUnlocked: null,
      },

      /* ---------- Régularité (jours consécutifs) ---------- */
      {
        id: 'jours_affillee',
        image: 'assets/icons/achivements/4-Repetitions/4JoursDaffilee.webp',
        title: "2 jours d'affilée",
        description: "2 jours de sortie d'affilée !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'toujours_present',
        image: 'assets/icons/achivements/4-Repetitions/4ToujoursPresent.webp',
        title: 'Toujours présent',
        description: "3 jours de sortie d'affilée !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'rythme_trouve',
        image: 'assets/icons/achivements/4-Repetitions/4RythmeTrouve.webp',
        title: 'Rythme trouvé',
        description: "7 jours de sortie d'affilée !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'routine_solide',
        image: 'assets/icons/achivements/4-Repetitions/4RoutineSolide.webp',
        title: 'Routine solide',
        description: "14 jours de sortie d'affilée !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'flow_parfait',
        image: 'assets/icons/achivements/4-Repetitions/4FlowParfait.webp',
        title: 'Flow parfait',
        description: "21 jours de sortie d'affilée !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'constance',
        image: 'assets/icons/achivements/4-Repetitions/4Constance.webp',
        title: 'Constance',
        description: "30 jours de sortie d'affilée !",
        unlocked: false,
        dateUnlocked: null,
      },

      /* ---------- Objectifs ---------- */
      {
        id: 'premier_pas',
        image: 'assets/icons/achivements/5-Objectifs/5Premierpas.webp',
        title: 'Premier pas',
        description: 'Tu as terminé ton premier objectif !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'objectif_atteint',
        image: 'assets/icons/achivements/5-Objectifs/5ObjectifAtteint.webp',
        title: 'Objectif atteint',
        description: 'Tu as terminé 3 objectifs !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'efficacite_pure',
        image: 'assets/icons/achivements/5-Objectifs/5EfficacitéPure.webp',
        title: 'Efficacité pure',
        description: 'Tu as terminé 5 objectifs !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'determination',
        image: 'assets/icons/achivements/5-Objectifs/5Determination.webp',
        title: 'Détermination',
        description: 'Tu as terminé 10 objectifs !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'maitrise',
        image: 'assets/icons/achivements/5-Objectifs/5Maitrise.webp',
        title: 'Maîtrise',
        description: 'Tu as terminé 20 objectifs !',
        unlocked: false,
        dateUnlocked: null,
      },
    ];
  }

  //========================//
  //      NOTIFICATION      //
  //========================//
  // Met à jour les préférences de notifications
  updateNotif(notif: NotificationSettings): void {
    this.notifSubject.next(notif);
    this.saveNotif(notif);
  }

  // Retourne les préférences actuelles
  getNotif(): NotificationSettings {
    return this.notifSubject.getValue();
  }

  private saveNotes(notes: Note[]): void {
    localStorage.setItem('notes', JSON.stringify(notes));
  }

  /*================================*/
  /*             NOTES              */
  /*================================*/

  getNotes(): Note[] {
    return this.notesSubject.getValue();
  }

  addNote(titre: string, contenu: string): void {
    const note: Note = {
      id: crypto.randomUUID(),
      titre,
      contenu,
      dateCreation: new Date().toISOString(),
    };
    const updated = [...this.notesSubject.getValue(), note];
    this.notesSubject.next(updated);
    this.saveNotes(updated);
  }

  updateNote(id: string, titre: string, contenu: string): void {
    const updated = this.notesSubject
      .getValue()
      .map((n) => (n.id === id ? { ...n, titre, contenu } : n));
    this.notesSubject.next(updated);
    this.saveNotes(updated);
  }

  deleteNote(id: string): void {
    const updated = this.notesSubject.getValue().filter((n) => n.id !== id);
    this.notesSubject.next(updated);
    this.saveNotes(updated);
  }
}