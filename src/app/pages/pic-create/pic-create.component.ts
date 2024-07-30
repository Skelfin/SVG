import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { AddFormComponent } from "../../components/add-form/add-form.component";
import { handleTokenExpiration, isTokenExpired } from '../../services/token-utils.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pic-create',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, AddFormComponent],
  templateUrl: './pic-create.component.html',
  styleUrl: './pic-create.component.scss'
})
export class PicCreateComponent implements OnInit {
  
  constructor(private toastr: ToastrService, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwtToken');
    if (token && isTokenExpired(token)) {
      handleTokenExpiration(this.toastr, this.router);
    }
  }
}
