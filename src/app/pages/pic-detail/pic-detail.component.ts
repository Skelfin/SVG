import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { PhotoComponent } from "../../components/photo/photo.component";
import { RatingComponent } from "../../components/rating/rating.component";
import { InformationComponent } from "../../components/information/information.component";

@Component({
  selector: 'app-pic-detail',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, PhotoComponent, RatingComponent, InformationComponent],
  templateUrl: './pic-detail.component.html',
  styleUrl: './pic-detail.component.scss'
})
export class PicDetailComponent {

}
