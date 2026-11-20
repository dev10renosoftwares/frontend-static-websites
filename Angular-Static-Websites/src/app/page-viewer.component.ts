import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';

/**
 * Shows a static HTML file full-screen inside an iframe.
 * The iframe keeps each page's own CSS and JavaScript isolated,
 * so the pages work exactly as they do when opened directly.
 */
@Component({
  selector: 'app-page-viewer',
  standalone: true,
  template: `<iframe class="page-frame" [src]="url" [title]="title"></iframe>`,
  styles: [`
    .page-frame {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }
  `]
})
export class PageViewerComponent {
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private titleService = inject(Title);

  title: string = this.route.snapshot.data['title'];
  url: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    '/assets/pages/' + this.route.snapshot.data['file']
  );

  constructor() {
    this.titleService.setTitle(this.title);
  }
}
