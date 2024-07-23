import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { AddFormComponent } from "../../components/add-form/add-form.component";

@Component({
  selector: 'app-pic-create',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, AddFormComponent],
  templateUrl: './pic-create.component.html',
  styleUrl: './pic-create.component.scss'
})
export class PicCreateComponent {

}
