import { Component, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-transmission-live',
  imports: [],
  templateUrl: './transmission-live.html',
  styleUrl: './transmission-live.css',
  encapsulation: ViewEncapsulation.None
})
export class TransmissionLive implements OnInit, OnDestroy{
  constructor(
    private router: Router,
    private uiService: UiService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    const container = document.querySelector('.view-container');
    if (container) {
      this.renderer.setStyle(container, 'padding', '0');
    }

    // Ocultar sidebar y top-bar al iniciar la transmisión
    setTimeout(() => {
      this.uiService.setNavigationVisibility(false);
    })
  }

  ngOnDestroy(): void {
    // IMPORTANTE: Restaurar el padding original al salir del componente
    const container = document.querySelector('.view-container');
    if (container) {
      this.renderer.setStyle(container, 'padding', '20px'); // O el valor original
    }
    // Reestablecer la navegación al salir del componente (destrucción)
    this.uiService.setNavigationVisibility(true);
  }

  salirDeTransmision(): void {
    if (confirm('¿Deseas salir de la transmisión en vivo?')) {
      this.router.navigate(['/transmission-lobby']);
    }
  }
}
