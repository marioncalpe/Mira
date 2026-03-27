import { Injectable } from '@angular/core';
import { StorageService } from './storage/storage.service';
import { NotificationSettings } from './models/notification.model';

/*================================*/
/*       NOTIFICATION SERVICE     */
/*  Gère les notifications push   */
/*  programmées pour l'app        */
/*================================*/
@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  /*================================*/
  /*         CONSTRUCTEUR           */
  /*================================*/
  constructor(private storageService: StorageService) {}

  /*================================*/
  /*     DEMANDE DE PERMISSION      */
  /*================================*/

  // Demande la permission à l'utilisateur d'envoyer des notifs
  // Retourne true si accepté, false si refusé
  async demanderPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      alert('Ton navigateur ne supporte pas les notifications !');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /*================================*/
  /*     PROGRAMMER NOTIFICATIONS   */
  /*================================*/

  // Programme toutes les notifications selon les préférences
  async programmerTout(): Promise<void> {
    const accordé = await this.demanderPermission();
    if (!accordé) return;

    const notif = this.storageService.getNotif();
    this.programmerNotifications(notif);
  }

  // Calcule le délai en ms avant la prochaine occurrence d'une heure
  // Ex: si il est 14h et qu'on veut 18h → 4h en ms
  private delaiAvant(heure: string): number {
    const [h, m] = heure.split(':').map(Number);
    const maintenant = new Date();
    const cible = new Date();
    cible.setHours(h, m, 0, 0);

    // Si l'heure est déjà passée aujourd'hui → on programme pour demain
    if (cible <= maintenant) {
      cible.setDate(cible.getDate() + 1);
    }

    return cible.getTime() - maintenant.getTime();
  }

  // Programme une notification récurrente toutes les 24h
  private programmerNotification(
    titre: string,
    corps: string,
    heure: string,
  ): void {
    const delai = this.delaiAvant(heure);

    setTimeout(() => {
      // Affiche la notification
      new Notification(titre, {
        body: corps,
        icon: 'icons/icon-192x192.png',
      });

      // Reprogramme pour le lendemain (toutes les 24h)
      setInterval(() => {
        new Notification(titre, {
          body: corps,
          icon: 'icons/icon-192x192.png',
        });
      }, 24 * 60 * 60 * 1000);

    }, delai);
  }

  // Programme toutes les notifications selon les préférences
  private programmerNotifications(notif: NotificationSettings): void {

    // Rappel sortie
    if (notif.sortieActive) {
      this.programmerNotification(
        '🚶 Rappel de sortie',
        'N\'oublie pas d\'enregistrer ta sortie du jour !',
        notif.sortieHeure,
      );
    }

    // Message d'encouragement
    if (notif.encouragementActif) {
      this.programmerNotification(
        '💪 Message du jour',
        'Chaque petit pas compte. Tu es plus forte que tu ne le crois !',
        notif.encouragementHeure,
      );
    }

    // Cohérence cardiaque (plusieurs heures)
    if (notif.coherenceActive) {
      notif.coherenceHeures.forEach((heure) => {
        this.programmerNotification(
          '🫀 Cohérence cardiaque',
          'C\'est l\'heure de ta séance de cohérence cardiaque !',
          heure,
        );
      });
    }
  }
}