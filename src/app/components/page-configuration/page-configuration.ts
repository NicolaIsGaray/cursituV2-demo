import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2, RendererFactory2 } from '@angular/core';

@Component({
  selector: 'app-page-configuration',
  imports: [CommonModule],
  templateUrl: './page-configuration.html',
  styleUrl: './page-configuration.css',
})
export class PageConfiguration {
  private renderer: Renderer2;
  public isDark = false;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    // Cargar preferencia guardada
    this.isDark = localStorage.getItem('theme') === 'dark';
    this.applyTheme();
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDark) {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }

  get currentTheme() { return this.isDark; }
}
