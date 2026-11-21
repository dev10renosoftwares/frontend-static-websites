import { Component, HostListener, OnDestroy, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PAGES, PageEntry } from './pages.config';
import { AuthService } from './auth.service';
import { BRAND } from './branding.config';

interface Card extends PageEntry {
  preview: SafeResourceUrl;
}

/** Dashboard (design C: Showcase). Shows only your websites. */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="dash">

      <!-- Top bar -->
      <header class="nav">
        <div class="wm">
          <img [src]="brand.icon" alt="">
          <span><b>Core</b> Vision</span>
        </div>

        <div class="pills" role="group" aria-label="Filter websites">
          @for (c of categories; track c) {
            <button type="button" class="pill" [class.on]="category() === c" [attr.aria-pressed]="category() === c"
                    (click)="setCategory(c)">{{ c }}</button>
          }
        </div>

        <button type="button" class="lock" (click)="lock()">Lock</button>
      </header>

      <main>
        <!-- Featured website -->
        @for (f of spot(); track f.slug) {
          <section class="hero" (mouseenter)="paused = true" (mouseleave)="paused = false" [style.--accent]="f.accent">
            <div class="copy">
              <div class="eyebrow">Featured website</div>
              <h1>{{ f.name }}</h1>
              <p>{{ f.description }}</p>
              <div class="meta"><span class="chip">{{ f.category }}</span><code>/{{ f.slug }}</code></div>
              <a class="open" [routerLink]="['/', f.slug]">Open website</a>

              @if (visible().length > 1) {
                <div class="pager" role="group" aria-label="Browse websites">
                  <button type="button" class="arrow" (click)="prev()" aria-label="Previous website">&larr; Previous</button>
                  <span class="count">{{ activeNumber() }} / {{ visible().length }}</span>
                  <button type="button" class="arrow" (click)="next()" aria-label="Next website">Next &rarr;</button>
                </div>
              }

              @if (visible().length > 1) {
                <div class="dots" role="group" aria-label="Choose featured website">
                  @for (v of visible(); track v.slug; let i = $index) {
                    <button type="button" class="dot" [class.on]="v.slug === f.slug"
                            [attr.aria-label]="'Show ' + v.name" (click)="select(i)"></button>
                  }
                </div>
              }
            </div>

            <a class="big" [routerLink]="['/', f.slug]" [attr.aria-label]="'Open ' + f.name">
              <iframe [src]="f.preview" tabindex="-1" aria-hidden="true" title=""></iframe>
            </a>
          </section>
        } @empty {
          <section class="none"><strong>No websites in this category</strong></section>
        }

        <!-- All websites -->
        <div class="row-head">
          <h2>All websites</h2>
          <span>{{ visible().length }} {{ visible().length === 1 ? 'website' : 'websites' }}</span>
        </div>

        <div class="tiles">
          @for (c of visible(); track c.slug) {
            <a class="tile" [routerLink]="['/', c.slug]" [class.active]="activeSlug() === c.slug" [style.--accent]="c.accent">
              <div class="mini"><i></i><i></i></div>
              <b>{{ c.name }}</b>
              <span>{{ c.category }} · /{{ c.slug }}</span>
            </a>
          }
        </div>
      </main>

      <footer class="dev">
        <span>Developed by</span>
        <img [src]="brand.logo" [alt]="brand.fullName">
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .dash { min-height: 100vh; background: #fff; color: #111A14; font-family: 'Inter', system-ui, sans-serif; }

    /* Top bar */
    .nav { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 56px; flex-wrap: wrap; }
    .wm { display: flex; align-items: center; gap: 10px; font: 700 1.25rem 'Fraunces', Georgia, serif; color: #14689A; }
    .wm img { height: 30px; width: auto; }
    .wm b { color: #3F7F26; }
    .pills { display: flex; gap: 8px; flex-wrap: wrap; }
    .pill { padding: 8px 16px; border-radius: 999px; border: 1px solid #D9E1DC; background: #fff; color: #4B5A52; font: 500 .85rem 'Inter', sans-serif; cursor: pointer; transition: .2s; }
    .pill:hover { border-color: #111A14; }
    .pill.on { background: #111A14; border-color: #111A14; color: #fff; }
    .lock { padding: 9px 20px; border: 0; border-radius: 999px; background: #3F7F26; color: #fff; font: 600 .85rem 'Inter', sans-serif; cursor: pointer; }
    .lock:hover { background: #2F6A1A; }

    main { padding: 0 56px; }

    /* Featured */
    .hero { display: grid; grid-template-columns: 1fr 560px; gap: 44px; align-items: center; padding: 32px 0 44px; animation: fade .6s ease; }
    @keyframes fade { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
    .eyebrow { font: 600 .75rem 'Inter', sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #3F7F26; }
    h1 { margin: 10px 0 14px; font: 700 clamp(2.4rem, 5vw, 3.8rem)/1.04 'Fraunces', Georgia, serif; }
    .copy p { margin: 0 0 18px; color: #4B5A52; font-size: 1.02rem; line-height: 1.6; max-width: 30em; }
    .meta { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
    .chip { background: var(--accent); color: #fff; font: 600 .75rem 'Inter', sans-serif; padding: 4px 12px; border-radius: 999px; }
    code { background: #F1F4F2; color: #4B5A52; padding: 3px 10px; border-radius: 8px; font-size: .8rem; }
    .open { display: inline-block; padding: 13px 28px; border-radius: 999px; background: #111A14; color: #fff; font: 600 .92rem 'Inter', sans-serif; text-decoration: none; transition: transform .2s, box-shadow .2s; }
    .open:hover { transform: translateY(-2px); box-shadow: 0 14px 26px rgba(17,26,20,.25); }
    .pager { display: flex; align-items: center; gap: 14px; margin-top: 22px; }
    .arrow { padding: 9px 20px; border-radius: 999px; border: 1px solid #D9E1DC; background: #fff; color: #111A14; font: 600 .85rem 'Inter', sans-serif; cursor: pointer; transition: .2s; }
    .arrow:hover { border-color: #111A14; background: #111A14; color: #fff; }
    .count { min-width: 44px; text-align: center; color: #4B5A52; font-size: .85rem; font-variant-numeric: tabular-nums; }
    .dots { display: flex; gap: 8px; margin-top: 22px; }
    .dot { width: 10px; height: 10px; padding: 0; border: 0; border-radius: 999px; background: #D3DBD6; cursor: pointer; transition: width .3s, background .3s; }
    .dot.on { width: 28px; background: var(--accent); }

    .big { --s: .4375; position: relative; display: block; width: 560px; height: 350px; border-radius: 28px; overflow: hidden; background: #EEF2EF;
           box-shadow: 0 30px 60px rgba(17,26,20,.18); border: 1px solid #E3E9E5; transition: transform .3s; }
    .big:hover { transform: translateY(-4px); }
    .big iframe { width: 1280px; height: 800px; border: 0; transform: scale(var(--s)); transform-origin: top left; pointer-events: none; }
    .none { padding: 60px 0; text-align: center; color: #4B5A52; }

    /* Tiles */
    .row-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 16px; }
    h2 { margin: 0; font: 700 1.4rem 'Fraunces', Georgia, serif; }
    .row-head span { color: #4B5A52; font-size: .85rem; }
    .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 16px; padding-bottom: 12px; }
    .tile { display: block; border: 1px solid #E3E9E5; border-radius: 18px; padding: 10px; text-decoration: none; color: inherit; transition: transform .2s, box-shadow .2s, border-color .2s; }
    .tile:hover { transform: translateY(-4px); box-shadow: 0 16px 30px rgba(17,26,20,.12); }
    .tile.active { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent); }
    .mini { height: 70px; border-radius: 12px; margin-bottom: 10px; padding-top: 14px; box-sizing: border-box;
            background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 45%, #fff)); }
    .mini i { display: block; height: 7px; width: 55%; margin: 0 0 7px 12px; border-radius: 4px; background: rgba(255,255,255,.8); }
    .mini i + i { width: 32%; }
    .tile b { display: block; font: 700 1rem 'Fraunces', Georgia, serif; }
    .tile span { font-size: .78rem; color: #4B5A52; }

    .dev { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 36px 16px 40px; color: #6B7A72; font-size: .8rem; }
    .dev img { height: 46px; width: auto; }

    @media (max-width: 1000px) {
      .nav, main { padding-left: 24px; padding-right: 24px; }
      .hero { grid-template-columns: 1fr; gap: 26px; }
      .big { margin: 0 auto; }
    }
    @media (max-width: 671px) {
      .big { --s: .25; width: 320px; height: 200px; }
      .pills { order: 3; width: 100%; }
    }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
  `]
})
export class HomeComponent implements OnDestroy {
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private auth = inject(AuthService);

  brand = BRAND;
  paused = false;

  cards: Card[] = PAGES.map(page => ({
    ...page,
    preview: this.sanitizer.bypassSecurityTrustResourceUrl('/assets/pages/' + page.file)
  }));

  categories = ['All', ...Array.from(new Set(PAGES.map(p => p.category)))];
  category = signal('All');
  index = signal(0);

  visible = computed(() =>
    this.category() === 'All' ? this.cards : this.cards.filter(c => c.category === this.category())
  );

  /** The featured website (as a one-item list so it re-draws when it changes). */
  spot = computed(() => {
    const list = this.visible();
    return list.length ? [list[this.index() % list.length]] : [];
  });

  /** Slug of the featured website (used to highlight its tile). */
  activeSlug = computed(() => {
    const list = this.visible();
    return list.length ? list[this.index() % list.length].slug : '';
  });

  /** Position of the featured website (1-based), shown as "2 / 5". */
  activeNumber = computed(() => {
    const n = this.visible().length;
    return n ? (this.index() % n) + 1 : 0;
  });

  /** Featured website rotates every 7 seconds; hovering pauses it. */
  private timer = setInterval(() => {
    if (!this.paused && this.visible().length > 1) {
      this.index.update(i => (i + 1) % this.visible().length);
    }
  }, 7000);

  setCategory(category: string): void {
    this.category.set(category);
    this.index.set(0);
  }

  next(): void {
    const n = this.visible().length;
    if (n) this.index.update(i => (i + 1) % n);
  }

  prev(): void {
    const n = this.visible().length;
    if (n) this.index.update(i => (i - 1 + n) % n);
  }

  /** Left / right arrow keys also move between websites. */
  @HostListener('window:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') this.next();
    else if (event.key === 'ArrowLeft') this.prev();
  }

  select(i: number): void {
    this.index.set(i);
  }

  lock(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
