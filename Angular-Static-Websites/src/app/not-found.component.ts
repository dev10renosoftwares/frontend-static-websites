import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="nf">
      <h1>Page not found</h1>
      <p>We couldn't find that page.</p>
      <a routerLink="/">Back to all pages</a>
    </main>
  `,
  styles: [`
    .nf { max-width: 520px; margin: 120px auto; text-align: center; font-family: system-ui, sans-serif; }
    a { color: #8f2616; font-weight: 600; }
  `]
})
export class NotFoundComponent {}
