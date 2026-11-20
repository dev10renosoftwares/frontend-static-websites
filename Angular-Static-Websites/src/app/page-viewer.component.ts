import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { BRAND } from './branding.config';

/**
 * Shows a static HTML file full-screen inside an iframe.
 * A branded loading screen is shown until the page has loaded.
 */
@Component({
  selector: 'app-page-viewer',
  standalone: true,
  template: `
    @if (loading()) {
      <div class="splash" role="status" aria-label="Loading">
        <img [src]="brand.logo" [alt]="brand.fullName">
        <div class="bar"><i></i></div>
      </div>
    }
    <iframe class="page-frame" [src]="url" [title]="title" (load)="loading.set(false)"></iframe>
  `,
  styles: [`
    .page-frame { position: fixed; inset: 0; width: 100%; height: 100%; border: 0; }
    .splash { position: fixed; inset: 0; z-index: 5; display: grid; place-content: center; justify-items: center; gap: 22px; background: #fff; }
    .splash img { width: 170px; height: auto; animation: pulse 1.6s ease-in-out infinite; }
    .bar { width: 150px; height: 4px; border-radius: 4px; background: #E7ECEF; overflow: hidden; }
    .bar i { display: block; width: 40%; height: 100%; border-radius: 4px; background: linear-gradient(90deg, #5FA83B, #14689A); animation: slide 1.1s ease-in-out infinite; }
    @keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(260%); } }
    @keyframes pulse { 50% { opacity: .6; transform: scale(.97); } }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
  `]
})
export class PageViewerComponent {
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private titleService = inject(Title);

  brand = BRAND;
  loading = signal(true);

  title: string = this.route.snapshot.data['title'];
  url: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    '/assets/pages/' + this.route.snapshot.data['file']
  );

  constructor() {
    this.titleService.setTitle(this.title);
  }
}
