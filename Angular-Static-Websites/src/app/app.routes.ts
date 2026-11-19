import { Routes } from '@angular/router';
import { PAGES } from './pages.config';
import { HomeComponent } from './home.component';
import { PageViewerComponent } from './page-viewer.component';
import { NotFoundComponent } from './not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },

  // One route per page in pages.config.ts
  ...PAGES.map(page => ({
    path: page.slug,
    component: PageViewerComponent,
    data: { file: page.file, title: page.title }
  })),

  { path: '**', component: NotFoundComponent }
];
