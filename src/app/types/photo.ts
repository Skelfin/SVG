export interface Photo {
  ID: number;
  Name: string;
  Path_to_photography: string;
  Date_created: string;
  Rating: number;
  Number_of_ratings: number;
}

export interface MainPhoto {
  ID: number;
  Name: string;
  Path_to_photography: string;
  Date_created: string;
}

export interface UploadPhotoData {
  name: string;
  image: File;
  token: string;
  onComplete: () => void;
}