import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Sortie } from '../models/sortie.model';
import { Objectif } from '../models/objectif.model';
import { Badge } from '../models/badge.model';
import { NotificationSettings } from '../models/notification.model';
import { Note } from '../models/note.model';
import { CompteursBadges, REGLES_BADGES, RegleBadge } from '../badge-regles';

/*==================================================*/
/*             STORAGE SERVICE                      */
/*  Ce service est la source unique de données      */
/*  de toute l'application.                         */
/*                                                  */
/*  MÉTHODES DISPONIBLES DEPUIS N'IMPORTE OÙ :      */
/*                                                  */
/*  --- SORTIES ---                                 */
/*  getSorties()             → tableau complet      */
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
/*  getTotalSorties()        → nombre total         */
/*  getSortiesCeMois()       → sorties ce mois      */
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
    if (badges) {
      this.badgesSubject.next(JSON.parse(badges));
    } else {
      // Premier lancement : on charge les badges par défaut
      this.badgesSubject.next(this.getDefaultBadges());
    }

    // Vérification des badges au démarrage
    this.verifierBadges(this.sortiesSubject.getValue());
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

  // Nombre total de sorties
  getTotalSorties(): number {
    return this.sortiesSubject.getValue().length;
  }

  // Nombre de sorties du mois en cours
  getSortiesCeMois(): number {
    const now = new Date();
    return this.sortiesSubject.getValue().filter((s) => {
      const date = new Date(s.start);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;
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

    const UN_JOUR_MS = 86400000; // 24h en millisecondes

    // 1. On transforme chaque sortie en "numéro de jour" (un entier),
    //    en ignorant l'heure. Un Set ne garde chaque valeur qu'une fois :
    //    deux sorties le même jour ne comptent que pour un jour.
    const jours = new Set<number>();
    for (const sortie of sorties) {
      const date = new Date(sortie.start);
      // Date.UTC(année, mois, jour) donne minuit pile pour ce jour du calendrier.
      // On part de getFullYear/getMonth/getDate (heure locale) : l'heure de la
      // sortie et le changement d'heure n'ont donc plus aucun effet.
      const minuit = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
      jours.add(Math.round(minuit / UN_JOUR_MS));
    }

    // 2. On trie du plus ancien au plus récent
    const joursTries = [...jours].sort((a, b) => a - b);

    // 3. On compte : deux jours se suivent si leur numéro diffère de 1
    let maxConsecutifs = 1;
    let compteur = 1;

    for (let i = 1; i < joursTries.length; i++) {
      if (joursTries[i] - joursTries[i - 1] === 1) {
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
      total: sorties.length,
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
  /*  Chargés au premier lancement  */
  /*  ou après un effacement        */
  /*================================*/
  private getDefaultBadges(): Badge[] {
    return [
      {
        id: 'premiere_sortie',
        image:
          'assets/icons/achivements/1-NombresDeSorties/1PremiereSortie.webp',
        title: 'Première Sortie',
        description: 'Tu viens de commencer ton aventure !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'en_mouvement',
        image: 'assets/icons/achivements/1-NombresDeSorties/1EnMouvement.webp',
        title: 'En mouvement',
        description: 'Tu as fait 5 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'mira_active',
        image: 'assets/icons/achivements/1-NombresDeSorties/1MiraActive.webp',
        title: 'Mira Active',
        description: 'Tu as fait 10 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'exploratrice',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Exploratrice.webp',
        title: 'Exploratrice',
        description: 'Tu as fait 20 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'aventurier',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Aventurier.webp',
        title: 'Aventurier',
        description: 'Tu as fait 30 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'nomade',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Nomade.webp',
        title: 'Nomade',
        description: 'Tu as fait 50 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'toujours_dehors',
        image:
          'assets/icons/achivements/1-NombresDeSorties/1ToujoursDehors.webp',
        title: 'Toujours dehors',
        description: 'Tu as fait 75 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'marathonien',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Maratonien.webp',
        title: 'Maratonien',
        description: 'Tu as fait 100 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'inarretable',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Inarretable.webp',
        title: 'Inarrêtable',
        description: 'Tu as fait 150 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'legende_sortie',
        image:
          'assets/icons/achivements/1-NombresDeSorties/1LegendesSortie.webp',
        title: 'Légende de la Sortie',
        description: 'Tu as fait 200 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'rayon_soleil',
        image: 'assets/icons/achivements/2-Humeurs/2RayonDeSoleil.webp',
        title: 'Rayon de Soleil',
        description: 'Tu as fait 5 sorties notées "Tres bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'energie_positive',
        image: 'assets/icons/achivements/2-Humeurs/2EnergiePositive.webp',
        title: 'Energie Positive',
        description: 'Tu as fait 15 sorties notées "Tres bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'humeur_or',
        image: 'assets/icons/achivements/2-Humeurs/2HumeurEnOr.webp',
        title: 'Humeur en Or',
        description: 'Tu as fait 30 sorties notées "Tres bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'bonne_vibes',
        image: 'assets/icons/achivements/2-Humeurs/2BonneVibes.webp',
        title: 'Bonne Vibes',
        description: 'Tu as fait 5 sorties notées "Bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'optimiste',
        image: 'assets/icons/achivements/2-Humeurs/2Optimiste.webp',
        title: 'Optimiste',
        description: 'Tu as fait 10 sorties notées "Bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'stable_sereine',
        image: 'assets/icons/achivements/2-Humeurs/2StableEtSereine.webp',
        title: 'Stable et Sereine',
        description: 'Tu as fait 25 sorties notées "Bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'cava_aller',
        image: 'assets/icons/achivements/2-Humeurs/2CavaAller.webp',
        title: 'Ca va Aller',
        description: 'Tu as fait 5 sorties notées "Moyen" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'tu_tiens_cap',
        image: 'assets/icons/achivements/2-Humeurs/2TuTiensLeCap.webp',
        title: 'Tu tiens le Cap',
        description: 'Tu as fait 15 sorties notées "Moyen" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'ressilient',
        image: 'assets/icons/achivements/2-Humeurs/2Ressilient.webp',
        title: 'Ressilient',
        description: 'Tu as fait 30 sorties notées "Moyen" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'sortie_courageuse',
        image: 'assets/icons/achivements/2-Humeurs/2SortieCourageuse.webp',
        title: 'Sortie Courageuse',
        description: 'Tu as fait 1 sortie notée "Anxieux" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'tu_laches_rien',
        image: 'assets/icons/achivements/2-Humeurs/2TuNeLachesRien.webp',
        title: 'Tu ne lâches rien',
        description: 'Tu as fait 5 sorties notées "Anxieux" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'courage_quotidien',
        image: 'assets/icons/achivements/2-Humeurs/2courageQuotidien.webp',
        title: 'Courage Quotidien',
        description: 'Tu as fait 10 sorties notées "Anxieux" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'petit_mieux',
        image: 'assets/icons/achivements/3-Progression/3PetitMieux.webp',
        title: 'Petit Mieux',
        description: 'Une sortie avec une humeur meilleure que la précédente',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'tu_progresses',
        image: 'assets/icons/achivements/3-Progression/3Tuprograsse.webp',
        title: 'Tu progresses',
        description: "Tu as fait 5 sorties avec une amélioration d'humeur !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'bonne_dynamique',
        image: 'assets/icons/achivements/3-Progression/3BonneDynamique.webp',
        title: 'Bonne Dynamique',
        description: "Tu as fait 10 sorties avec une amélioration d'humeur !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'ascension_positive',
        image: 'assets/icons/achivements/3-Progression/3AscensionPositive.webp',
        title: 'Ascension Positive',
        description: "Tu as fait 20 sorties avec une amélioration d'humeur !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'revenir_plus_fort',
        image: 'assets/icons/achivements/3-Progression/3RevenirplusFort.webp',
        title: 'Revenir plus Fort',
        description: 'Tu as fait 1 sortie améliorée après un jour difficile !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'resilience',
        image: 'assets/icons/achivements/3-Progression/3Resilience.webp',
        title: 'Résilience',
        description: '3 sorties consécutives après une période Anxieux',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'transformation',
        image: 'assets/icons/achivements/3-Progression/3Transformation.webp',
        title: 'Transformation',
        description: 'Amélioration visible sur un mois',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'jours_affillee',
        image: 'assets/icons/achivements/4-Repetitions/4JoursDaffilee.webp',
        title: "2 Jours d'affilée",
        description: 'Tu as fait 2 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'toujours_present',
        image: 'assets/icons/achivements/4-Repetitions/4ToujoursPresent.webp',
        title: 'Toujours présent',
        description: 'Tu as fait 3 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'rythme_trouve',
        image: 'assets/icons/achivements/4-Repetitions/4RythmeTrouve.webp',
        title: 'Rythme Trouvé',
        description: 'Tu as fait 7 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'routine_solide',
        image: 'assets/icons/achivements/4-Repetitions/4RoutineSolide.webp',
        title: 'Routine Solide',
        description: 'Tu as fait 14 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'flow_parfait',
        image: 'assets/icons/achivements/4-Repetitions/4FlowParfait.webp',
        title: 'Flow Parfait',
        description: 'Tu as fait 21 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'constance',
        image: 'assets/icons/achivements/4-Repetitions/4Constance.webp',
        title: 'Constance',
        description: 'Tu as fait 30 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'premier_pas',
        image: 'assets/icons/achivements/5-Objectifs/5Premierpas.webp',
        title: 'Premier pas',
        description: 'Tu as fait ton premier objectif !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'objectif_atteint',
        image: 'assets/icons/achivements/5-Objectifs/5ObjectifAtteint.webp',
        title: 'Objectif Atteint',
        description: 'Tu as terminé 3 objectifs !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'efficacite_pure',
        image: 'assets/icons/achivements/5-Objectifs/5EfficacitéPure.webp',
        title: 'Efficacité Pure',
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