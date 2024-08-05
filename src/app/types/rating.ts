export type RatePhotoParams = {
    photoId: string;
    rating: number;
    onComplete: (newRating: number, newNumberOfRatings: number) => void;
  };