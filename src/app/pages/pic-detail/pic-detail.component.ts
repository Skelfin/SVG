import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { PhotoComponent } from "../../components/photo/photo.component";
import { RatingComponent } from "../../components/rating/rating.component";
import { InformationComponent } from "../../components/information/information.component";
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { handleTokenExpiration, isTokenExpired } from '../../services/token-utils.service';

@Component({
  selector: 'app-pic-detail',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, PhotoComponent, RatingComponent, InformationComponent],
  templateUrl: './pic-detail.component.html',
  styleUrl: './pic-detail.component.scss'
})
export class PicDetailComponent implements OnInit {

  constructor(private toastr: ToastrService, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwtToken');
    if (token && isTokenExpired(token)) {
      handleTokenExpiration(this.toastr, this.router);
    }
  }
}
