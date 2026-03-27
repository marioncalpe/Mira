export interface NotificationSettings {
  // Rappel sortie
  sortieActive: boolean;
  sortieHeure: string; // format "18:00"

  // Encouragement
  encouragementActif: boolean;
  encouragementHeure: string; // format "09:00"

  // Cohérence cardiaque
  coherenceActive: boolean;
  coherenceHeures: string[]; // ["08:00", "13:00", "18:00"]
}