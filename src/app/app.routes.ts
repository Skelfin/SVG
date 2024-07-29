import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { PicDetailComponent } from './pages/pic-detail/pic-detail.component';
import { PicCreateComponent } from './pages/pic-create/pic-create.component';
import { AuthGuard } from './guards/adding';

export const routes: Routes = [
    {
        path: '',
        component: MainComponent,
        title: 'Главная',
    },

    {
        path: 'picture',
        component: PicDetailComponent,
        title: 'Название картинки',
    },

    {
        path: 'adding',
        component: PicCreateComponent,
        title: 'Новая картинка',
        canActivate: [AuthGuard]
    },

    {
        path: '**',
        component: MainComponent,
        redirectTo: '',
    },
];
