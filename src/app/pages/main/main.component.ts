import { Component, OnInit } from '@angular/core';
import { FooterComponent } from "../../components/footer/footer.component";
import { HeaderComponent } from "../../components/header/header.component";
import { MainComponentComponent } from "../../components/main-component/main-component.component";
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { handleTokenExpiration, isTokenExpired } from '../../services/token-utils.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, MainComponentComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {

  constructor(private toastr: ToastrService, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwtToken');
    if (token && isTokenExpired(token)) {
      handleTokenExpiration(this.toastr, this.router);
    }
  }
}
