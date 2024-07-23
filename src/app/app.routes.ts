import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { PicDetailComponent } from './pages/pic-detail/pic-detail.component';
import { PicCreateComponent } from './pages/pic-create/pic-create.component';

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
    },

    {
        path: '**',
        component: MainComponent,
        redirectTo: '',
    },
];
