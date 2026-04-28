import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly isDark = signal<boolean>(false);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Inicializar estado desde localStorage o preferencia del sistema
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        this.isDark.set(true);
      } else if (savedTheme === 'light') {
        this.isDark.set(false);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDark.set(prefersDark);
      }
    }

    // Aplicar la clase 'dark' al HTML cuando cambia
    effect(() => {
      const isDarkMode = this.isDark();
      if (isPlatformBrowser(this.platformId)) {
        const html = document.documentElement;
        
        if (isDarkMode) {
          html.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          html.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      }
    });
  }

  toggleTheme() {
    this.isDark.update((dark) => !dark);
  }
}
