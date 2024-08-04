export interface Photo {
  ID: string;
  Name: string;
  Path_to_photography: string;
  Date_created: string;
  Rating: number;
  Number_of_ratings: number;
  Author: string;
  AuthorID: number;
  UserRating: number;
}

export interface PhotoInfo {
  Name: string;
  Date_created: string;
  Author: string;
}

export interface PhotoPath {
  Name: string;
  Path_to_photography: string;
}

export interface PhotoRating {
  ID: string;
  Rating: number;
  Number_of_ratings: number;
  AuthorID: number;
  UserRating: number;
}

export interface MainPhoto {
  ID: string;
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