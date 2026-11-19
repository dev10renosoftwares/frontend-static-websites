import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PAGES, PageEntry } from './pages.config';

interface Card extends PageEntry {
  preview: SafeResourceUrl;
}

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="dash">

      <!-- Top bar -->
      <header class="bar">
        <div class="brand">
          <span class="logo">◆</span>
          <div>
            <strong>Site Dashboard</strong>
            <small>All your web pages in one place</small>
          </div>
        </div>
        <label class="search">
          <span aria-hidden="true">⌕</span>
          <input type="search" placeholder="Search pages" aria-label="Search pages"
                 (input)="query.set($any($event.target).value)">
        </label>
      </header>

      <main class="content">

        <!-- Summary -->
        <section class="stats" aria-label="Summary">
          <div class="stat">
            <span class="num">{{ cards.length }}</span>
            <span class="lbl">Total pages</span>
          </div>
          <div class="stat">
            <span class="num">{{ categoryCount }}</span>
            <span class="lbl">Categories</span>
          </div>
          <div class="stat">
            <span class="num live">● Live</span>
            <span class="lbl">All pages online</span>
          </div>
        </section>

        <div class="title-row">
          <h1>Your pages</h1>
          <span class="count">{{ filtered().length }} shown</span>
        </div>

        <!-- Cards -->
        <section class="grid">
          @for (card of filtered(); track card.slug) {
            <article class="card" tabindex="0" role="button"
                     [attr.aria-label]="'Open ' + card.name"
                     [style.--accent]="card.accent"
                     (click)="open(card)" (keydown.enter)="open(card)">

              <div class="preview">
                <iframe [src]="card.preview" loading="lazy" tabindex="-1"
                        aria-hidden="true" title=""></iframe>
                <span class="chip">{{ card.category }}</span>
              </div>

              <div class="body">
                <h2>{{ card.name }}</h2>
                <p>{{ card.description }}</p>
                <div class="foot">
                  <code>/{{ card.slug }}</code>
                  <span class="go">Open page</span>
                </div>
              </div>
            </article>
          } @empty {
            <div class="empty">
              <strong>No pages found</strong>
              <p>Try a different search word.</p>
            </div>
          }
        </section>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .dash { min-height: 100vh; background: #F6F4F0; color: #26211E; font-family: 'Inter', system-ui, sans-serif; }

    /* Top bar */
    .bar { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 16px;
           padding: 14px 32px; background: rgba(255,255,255,.92); backdrop-filter: blur(8px); border-bottom: 1px solid #E8E3DB; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .logo { width: 38px; height: 38px; border-radius: 11px; background: #2A1810; color: #E9A82B; display: grid; place-items: center; font-size: 1.1rem; }
    .brand strong { display: block; font-size: 1.02rem; }
    .brand small { color: #7C726A; font-size: .78rem; }
    .search { display: flex; align-items: center; gap: 8px; background: #F6F4F0; border: 1px solid #E8E3DB; border-radius: 999px; padding: 8px 16px; min-width: 260px; }
    .search input { border: 0; background: transparent; font: inherit; outline: none; width: 100%; }
    .search:focus-within { border-color: #B3321F; }

    /* Content */
    .content { max-width: 1180px; margin: 0 auto; padding: 32px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 36px; }
    .stat { background: #fff; border: 1px solid #E8E3DB; border-radius: 16px; padding: 20px 24px; }
    .num { display: block; font-family: 'Playfair Display', Georgia, serif; font-size: 2rem; font-weight: 700; line-height: 1.1; }
    .num.live { color: #3F6B47; font-size: 1.5rem; padding-top: 6px; }
    .lbl { color: #7C726A; font-size: .85rem; }
    .title-row { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 18px; }
    h1 { font-family: 'Playfair Display', Georgia, serif; font-size: 1.7rem; margin: 0; }
    .count { color: #7C726A; font-size: .85rem; }

    /* Cards */
    .grid { display: grid; grid-template-columns: repeat(auto-fill, 340px); gap: 24px; justify-content: start; }
    .card { width: 340px; background: #fff; border: 1px solid #E8E3DB; border-radius: 20px; overflow: hidden; cursor: pointer;
            transition: transform .2s, box-shadow .2s; }
    .card:hover, .card:focus-visible { transform: translateY(-4px); box-shadow: 0 18px 36px rgba(42,24,16,.14); outline: none; }
    .card:focus-visible { box-shadow: 0 0 0 3px var(--accent); }
    .preview { position: relative; height: 212px; overflow: hidden; background: #EFEAE2; border-bottom: 4px solid var(--accent); }
    .preview iframe { width: 1280px; height: 800px; border: 0; transform: scale(.2656); transform-origin: top left; pointer-events: none; }
    .chip { position: absolute; left: 12px; top: 12px; background: var(--accent); color: #fff; font-size: .72rem; font-weight: 600; padding: 4px 12px; border-radius: 999px; }
    .body { padding: 18px 20px 20px; }
    h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 1.3rem; margin: 0 0 6px; }
    p { margin: 0; color: #7C726A; font-size: .9rem; line-height: 1.5; min-height: 2.8em; }
    .foot { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; padding-top: 14px; border-top: 1px solid #EFEAE2; }
    code { background: #F6F4F0; color: #5C524A; padding: 3px 10px; border-radius: 8px; font-size: .8rem; }
    .go { color: var(--accent); font-weight: 600; font-size: .88rem; }
    .go::after { content: ' →'; transition: margin .2s; }
    .card:hover .go::after { margin-left: 4px; }
    .empty { grid-column: 1 / -1; text-align: center; padding: 60px 0; color: #7C726A; }

    @media (max-width: 760px) {
      .bar { padding: 12px 16px; flex-wrap: wrap; }
      .search { min-width: 0; flex: 1; }
      .content { padding: 20px 16px; }
      .stats { grid-template-columns: 1fr; }
      .grid { grid-template-columns: 1fr; justify-content: center; }
      .card { width: 100%; max-width: 340px; margin: 0 auto; }
    }
  `]
})
export class HomeComponent {
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  query = signal('');

  cards: Card[] = PAGES.map(page => ({
    ...page,
    preview: this.sanitizer.bypassSecurityTrustResourceUrl('assets/pages/' + page.file)
  }));

  categoryCount = new Set(PAGES.map(p => p.category)).size;

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q
      ? this.cards.filter(c => (c.name + ' ' + c.category + ' ' + c.description + ' ' + c.slug).toLowerCase().includes(q))
      : this.cards;
  });

  open(card: Card): void {
    this.router.navigate(['/', card.slug]);
  }
}
