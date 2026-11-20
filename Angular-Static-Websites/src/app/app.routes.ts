import { Routes } from '@angular/router';
import { PAGES } from './pages.config';
import { HomeComponent } from './home.component';
import { LoginComponent } from './login.component';
import { PageViewerComponent } from './page-viewer.component';
import { NotFoundComponent } from './not-found.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  // Dashboard: password protected
  { path: '', component: HomeComponent, pathMatch: 'full', canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },

  // One public route per page in pages.config.ts (no password)
  ...PAGES.map(page => ({
    path: page.slug,
    component: PageViewerComponent,
    data: { file: page.file, title: page.title }
  })),

  { path: '**', component: NotFoundComponent }
];
