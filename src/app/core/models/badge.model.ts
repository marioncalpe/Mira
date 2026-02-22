export interface Badge {
  id: string;
  image: string;        // chemin vers l'image dans assets
  title: string;
  description: string;
  unlocked: boolean;
  dateUnlocked: string | null;
}