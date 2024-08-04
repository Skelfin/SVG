import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { PhotoComponent } from "../../components/photo/photo.component";
import { RatingComponent } from "../../components/rating/rating.component";
import { InformationComponent } from "../../components/information/information.component";
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { handleTokenExpiration, isTokenExpired } from '../../services/token-utils.service';
import { Photo, PhotoInfo, PhotoPath, PhotoRating } from '../../types/photo';
import { PhotoService } from '../../services/photo.service';

@Component({
  selector: 'app-pic-detail',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, PhotoComponent, RatingComponent, InformationComponent],
  templateUrl: './pic-detail.component.html',
  styleUrl: './pic-detail.component.scss'
})
export class PicDetailComponent implements OnInit {
  photoData?: PhotoInfo;
  photoRating?: PhotoRating;
  photoPath?: PhotoPath;

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private photoService: PhotoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwtToken');
    if (token && isTokenExpired(token)) {
      handleTokenExpiration(this.toastr, this.router);
    }

    const id = this.route.snapshot.paramMap.get('id')!;
    this.photoService.getPhotoById(id).subscribe((data: Photo) => {
      this.photoData = {
        Name: data.Name,
        Date_created: data.Date_created,
        Author: data.Author
      };
      this.photoRating = {
        ID: data.ID,
        Rating: data.Rating,
        Number_of_ratings: data.Number_of_ratings,
        AuthorID: data.AuthorID,
        UserRating: data.UserRating
        
      };
      this.photoPath = {
        Name: data.Name,
        Path_to_photography: data.Path_to_photography
      };
    });
  }
}
