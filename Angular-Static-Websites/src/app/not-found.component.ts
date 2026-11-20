import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PAGES, PageEntry } from './pages.config';
import { BRAND } from './branding.config';

/** Lowercase and strip everything except letters and digits ("Tabea-Foods" -> "tabeafoods"). */
const normalise = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Number of single-character edits between two strings. */
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <span class="blob b1"></span><span class="blob b2"></span>

      <main class="card">
        <img class="brand" [src]="brand.logo" [alt]="brand.fullName">

        <div class="code" aria-hidden="true">
          <span>4</span>
          <svg class="compass" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="32" cy="32" r="26"/>
            <path d="M32 9v5M32 50v5M9 32h5M50 32h5" opacity=".6"/>
            <path class="needle" d="M40.5 23.5 35 35l-11.5 5.5L29 29z" fill="currentColor" fill-opacity=".18"/>
          </svg>
          <span>4</span>
        </div>

        <h1>We couldn't find that page</h1>
        <p class="lead">
          The address <code>{{ path }}</code> doesn't match any website here.
          It may have been mistyped, moved, or removed.
        </p>

        @if (suggestion) {
          <div class="did">
            <div>
              <small>Did you mean</small>
              <strong>/{{ suggestion.slug }}</strong>
              <span>{{ suggestion.name }}</span>
            </div>
            <a class="btn fill" [routerLink]="['/', suggestion.slug]">Open this page</a>
          </div>
        }

        <div class="actions">
          <button class="btn line" type="button" (click)="back()">← Go back</button>
          <a class="btn dark" routerLink="/">Go to dashboard</a>
        </div>

        <dl class="info">
          <div><dt>Status</dt><dd>404 · Page not found</dd></div>
          <div><dt>Requested address</dt><dd>{{ path }}</dd></div>
          <div><dt>Support</dt><dd>{{ brand.fullName }}@if (brand.email) { · <a [href]="'mailto:' + brand.email">{{ brand.email }}</a> }@if (brand.phone) { · {{ brand.phone }} }</dd></div>
        </dl>

        <ul class="tips">
          <li><b>Check the spelling</b> of the web address, including hyphens.</li>
          <li><b>Use the original link</b> you were given, instead of typing it.</li>
          <li><b>Still stuck?</b> Ask the person who shared the link to send it again.</li>
        </ul>
      </main>

      <p class="foot">Developed by <span class="chip"><img [src]="brand.logo" [alt]="brand.fullName"></span></p>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { min-height: 100vh; display: grid; place-items: center; align-content: center; gap: 20px; padding: 28px 20px; position: relative; overflow: hidden;
            background: #FFFBF4; font-family: 'Inter', system-ui, sans-serif; color: #2B1D16; }
    .blob { position: absolute; border-radius: 50%; filter: blur(70px); opacity: .5; animation: drift 14s ease-in-out infinite; }
    .b1 { width: 380px; height: 380px; background: #FDEFC9; top: -120px; left: -100px; }
    .b2 { width: 340px; height: 340px; background: #F6D2C9; bottom: -120px; right: -90px; animation-delay: -6s; }
    @keyframes drift { 50% { transform: translate(40px, -30px) scale(1.1); } }

    .card { position: relative; width: 100%; max-width: 620px; text-align: center; background: #fff; border: 1px solid #EFE1C8; border-radius: 32px;
            padding: 48px 40px 36px; box-shadow: 0 30px 70px rgba(43,29,22,.12); }
    .code { display: flex; justify-content: center; align-items: center; gap: 6px; margin-bottom: 18px;
            font-family: 'Playfair Display', Georgia, serif; font-weight: 700; font-size: 6.2rem; line-height: 1; color: #B3321F; }
    .compass { width: 5.2rem; height: 5.2rem; color: #E9A82B; animation: wobble 5s ease-in-out infinite; }
    .needle { transform-origin: 32px 32px; animation: spin 7s ease-in-out infinite; }
    @keyframes wobble { 50% { transform: rotate(8deg); } }
    @keyframes spin { 0%,100% { transform: rotate(0); } 50% { transform: rotate(40deg); } }

    h1 { margin: 0 0 10px; font-family: 'Playfair Display', Georgia, serif; font-size: 2rem; color: #2A1810; }
    .lead { margin: 0 auto 24px; max-width: 30em; color: #7A6657; line-height: 1.6; }
    code { background: #F6EFE0; color: #8F2616; padding: 2px 10px; border-radius: 8px; font-size: .9em; word-break: break-all; }

    .did { display: flex; align-items: center; justify-content: space-between; gap: 16px; text-align: left; background: #FDF3D8;
           border: 1px solid #F0DCA4; border-radius: 18px; padding: 16px 20px; margin-bottom: 22px; }
    .did small { display: block; color: #8A6A1E; font-size: .75rem; letter-spacing: .06em; text-transform: uppercase; }
    .did strong { display: block; font-size: 1.1rem; color: #2A1810; }
    .did span { color: #7A6657; font-size: .85rem; }

    .actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 28px; }
    .btn { display: inline-block; padding: 12px 26px; border-radius: 999px; font: 600 .95rem 'Inter', sans-serif; cursor: pointer;
           border: 1.5px solid #2A1810; text-decoration: none; transition: transform .2s, box-shadow .2s, background .2s; }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(43,29,22,.18); }
    .dark { background: #2A1810; color: #fff; }
    .dark:hover { background: #B3321F; border-color: #B3321F; }
    .line { background: transparent; color: #2A1810; }
    .fill { background: #B3321F; border-color: #B3321F; color: #fff; white-space: nowrap; padding: 10px 20px; }

    .tips { list-style: none; margin: 0; padding: 22px 0 0; border-top: 1px solid #EFE1C8; text-align: left; display: grid; gap: 10px;
            font-size: .9rem; color: #7A6657; }
    .tips li::before { content: '✦'; color: #E9A82B; margin-right: 10px; }
    .tips b { color: #2A1810; font-weight: 600; }
    .brand { display: block; height: 92px; width: auto; margin: 0 auto 6px; }
    .info { margin: 0 0 24px; padding: 6px 18px; text-align: left; background: #FAF7F0; border: 1px solid #EFE1C8; border-radius: 16px; font-size: .88rem; }
    .info div { display: flex; gap: 14px; padding: 10px 0; border-bottom: 1px solid #EFE1C8; }
    .info div:last-child { border: 0; }
    .info dt { width: 130px; flex: none; color: #9A8A78; }
    .info dd { margin: 0; color: #2A1810; word-break: break-word; }
    .info a { color: #14689A; }
    .chip { display: inline-flex; vertical-align: middle; background: #fff; border: 1px solid #EFE1C8; border-radius: 10px; padding: 5px 12px; margin-left: 8px; }
    .chip img { height: 36px; width: auto; display: block; }
    .foot { position: relative; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; margin: 0; font-size: .8rem; color: #9A8A78; }

    @media (max-width: 520px) {
      .card { padding: 36px 22px 28px; }
      .code { font-size: 4.6rem; }
      .compass { width: 3.8rem; height: 3.8rem; }
      h1 { font-size: 1.6rem; }
      .info div { flex-direction: column; gap: 2px; }
      .did { flex-direction: column; align-items: stretch; text-align: center; }
    }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
  `]
})
export class NotFoundComponent {
  brand = BRAND;
  private location = inject(Location);

  path = decodeURIComponent(window.location.pathname) || '/';

  /** Closest page to what the visitor typed, if it is a likely typo (e.g. /tabeafoods -> /tabea-foods). */
  suggestion: PageEntry | null = this.findSuggestion();

  constructor() {
    inject(Title).setTitle('Page not found');
  }

  back(): void {
    this.location.back();
  }

  private findSuggestion(): PageEntry | null {
    const typed = normalise(this.path);
    if (typed.length < 3) return null;

    let best: PageEntry | null = null;
    let bestScore = Infinity;
    for (const page of PAGES) {
      const slug = normalise(page.slug);
      const contained = Math.min(slug.length, typed.length) >= 4 && (slug.includes(typed) || typed.includes(slug));
      const score = slug === typed ? 0 : contained ? 1 : distance(slug, typed);
      if (score < bestScore) { bestScore = score; best = page; }
    }
    return bestScore <= Math.max(2, Math.floor(typed.length * 0.3)) ? best : null;
  }
}
