import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { Aviso } from '../../../notices/temp.model.notices';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-notices',
  imports: [CommonModule, RouterModule],
  templateUrl: './notices-list.html',
  styleUrl: '../notices.css',
})
export class NoticesList {
  // Simulación de datos provenientes de la base de datos
  avisos: Aviso[] = [
    {
      id: 1,
      autor: 'Ignacio Fontaine',
      fotoAutor: 'assets/profesor-ignacio.jpg',
      asunto: 'Suspensión de clases',
      fecha: '10/06/2026',
      mensaje: { saludo: '', cuerpo: [] } // No se necesita en el listado
    },
    // ... repetir para más avisos
  ];

  constructor(private router: Router, private location: Location) {}

  verDetalle(id: number) {
    // Navega a la ruta del aviso seleccionado
    this.router.navigate(['/notices', id]);
  }

  goBack() {
    this.location.back();
  }
}
