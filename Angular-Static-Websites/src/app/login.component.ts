import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from './auth.service';
import { BRAND } from './branding.config';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="page">
      <span class="blob b1"></span><span class="blob b2"></span>

      <section class="card" aria-labelledby="t">
        <img class="brand" [src]="brand.logo" [alt]="brand.fullName">

        <h1 id="t">Dashboard Locked</h1>
        <p class="sub">Enter your 8-digit password to continue.</p>

        <div class="digits" [class.shake]="shake()" (paste)="onPaste($event)">
          @for (d of digits(); track $index; let i = $index) {
            <input #box [type]="show() ? 'text' : 'password'" inputmode="numeric" maxlength="1"
                   autocomplete="off" [value]="d" [class.filled]="d" [class.bad]="error()"
                   [attr.aria-label]="'Digit ' + (i + 1)"
                   (input)="onInput($event, i)" (keydown)="onKey($event, i)" (focus)="$any($event.target).select()">
          }
        </div>

        <div class="msg" role="alert">{{ error() }}</div>

        <button class="unlock" type="button" (click)="submit()">Unlock dashboard</button>
        <button class="eye" type="button" (click)="show.set(!show())">{{ show() ? 'Hide digits' : 'Show digits' }}</button>
      </section>

      <p class="foot">Developed by <span class="chip"><img [src]="brand.logo" [alt]="brand.fullName"></span></p>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { min-height: 100vh; display: grid; place-items: center; align-content: center; gap: 22px; padding: 24px; position: relative; overflow: hidden;
            background: #2A1810; font-family: 'Inter', system-ui, sans-serif; }
    .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .45; animation: drift 14s ease-in-out infinite; }
    .b1 { width: 420px; height: 420px; background: #B3321F; top: -120px; left: -100px; }
    .b2 { width: 380px; height: 380px; background: #E9A82B; bottom: -140px; right: -80px; animation-delay: -6s; opacity: .3; }
    @keyframes drift { 50% { transform: translate(40px, -30px) scale(1.1); } }

    .card { position: relative; width: 100%; max-width: 480px; text-align: center; background: rgba(255,251,244,.97); border-radius: 28px;
            padding: 44px 36px 36px; box-shadow: 0 40px 80px rgba(0,0,0,.4); }
    .lock { width: 68px; height: 68px; margin: 0 auto 20px; border-radius: 20px; display: grid; place-items: center;
            background: linear-gradient(140deg, #3B2417, #2A1810); color: #E9A82B; box-shadow: 0 14px 26px rgba(42,24,16,.3); }
    h1 { margin: 0 0 6px; font-family: 'Playfair Display', Georgia, serif; font-size: 1.9rem; color: #2A1810; }
    .sub { margin: 0 0 28px; color: #7A6657; font-size: .95rem; }

    .digits { display: flex; justify-content: center; gap: 8px; }
    .digits input { width: 44px; height: 54px; border: 1.5px solid #E6DCCB; border-radius: 12px; background: #fff; text-align: center;
                    font: 600 1.35rem 'Inter', sans-serif; color: #2A1810; transition: border .2s, box-shadow .2s, transform .15s; padding: 0; }
    .digits input:focus { outline: none; border-color: #B3321F; box-shadow: 0 0 0 4px rgba(179,50,31,.15); transform: translateY(-2px); }
    .digits input.filled { border-color: #E9A82B; background: #FFF7E3; }
    .digits input.bad { border-color: #B3321F; background: #FDECE8; }
    .shake { animation: shake .45s; }
    @keyframes shake { 20%,60% { transform: translateX(-8px); } 40%,80% { transform: translateX(8px); } }

    .msg { min-height: 22px; margin: 14px 0 6px; font-size: .88rem; color: #B3321F; font-weight: 500; }
    .unlock { width: 100%; padding: 14px; border: 0; border-radius: 14px; cursor: pointer; font: 600 1rem 'Inter', sans-serif;
              background: #B3321F; color: #fff; transition: background .2s, transform .2s, box-shadow .2s; }
    .unlock:hover { background: #8F2616; transform: translateY(-2px); box-shadow: 0 14px 26px rgba(179,50,31,.3); }
    .eye { margin-top: 14px; background: none; border: 0; color: #7A6657; font: 500 .85rem 'Inter', sans-serif; cursor: pointer; }
    .eye:hover { color: #2A1810; }
    .brand { display: block; height: 96px; width: auto; margin: 0 auto 18px; }
    .chip { display: inline-flex; vertical-align: middle; background: #fff; border-radius: 10px; padding: 5px 12px; margin-left: 8px; }
    .chip img { height: 38px; width: auto; display: block; }
    .foot { position: relative; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; margin: 0; color: rgba(255,255,255,.5); font-size: .82rem; }

    @media (max-width: 480px) {
      .card { padding: 36px 20px 28px; }
      .digits { gap: 5px; }
      .digits input { width: 36px; height: 48px; font-size: 1.15rem; }
    }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
  `]
})
export class LoginComponent implements AfterViewInit {
  brand = BRAND;
  private auth = inject(AuthService);
  private router = inject(Router);

  @ViewChildren('box') boxes!: QueryList<ElementRef<HTMLInputElement>>;

  digits = signal<string[]>(Array(8).fill(''));
  error = signal('');
  shake = signal(false);
  show = signal(false);

  constructor() {
    inject(Title).setTitle('Dashboard Login');
    if (this.auth.isLoggedIn()) this.router.navigate(['/']);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.focus(0));
  }

  private focus(i: number): void {
    this.boxes.get(i)?.nativeElement.focus();
  }

  private set(i: number, value: string): void {
    this.digits.update(d => d.map((x, idx) => (idx === i ? value : x)));
  }

  onInput(event: Event, i: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(-1);
    input.value = value;
    this.set(i, value);
    this.error.set('');
    if (value && i < 7) this.focus(i + 1);
    if (this.digits().every(d => d)) this.submit();
  }

  onKey(event: KeyboardEvent, i: number): void {
    if (event.key === 'Backspace' && !this.digits()[i] && i > 0) {
      event.preventDefault();
      this.set(i - 1, '');
      this.focus(i - 1);
    } else if (event.key === 'ArrowLeft' && i > 0) {
      this.focus(i - 1);
    } else if (event.key === 'ArrowRight' && i < 7) {
      this.focus(i + 1);
    } else if (event.key === 'Enter') {
      this.submit();
    }
  }

  onPaste(event: ClipboardEvent): void {
    const text = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, 8);
    if (!text) return;
    event.preventDefault();
    this.digits.set(Array.from({ length: 8 }, (_, i) => text[i] ?? ''));
    this.focus(Math.min(text.length, 7));
    if (text.length === 8) this.submit();
  }

  submit(): void {
    const password = this.digits().join('');
    if (password.length < 8) {
      this.error.set('Please enter all 8 digits.');
      return;
    }
    if (this.auth.login(password)) {
      this.router.navigate(['/']);
      return;
    }
    this.error.set('Incorrect password. Try again.');
    this.shake.set(true);
    setTimeout(() => {
      this.shake.set(false);
      this.digits.set(Array(8).fill(''));
      this.boxes.forEach(b => (b.nativeElement.value = ''));
      this.focus(0);
    }, 500);
  }
}
