import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { PicDetailComponent } from './pages/pic-detail/pic-detail.component';

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
        path: '**',
        component: MainComponent,
        redirectTo: '',
    },
];
