import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pending-tasks',
  imports: [CommonModule, RouterModule],
  templateUrl: './pending-tasks.html',
  styleUrl: './pending-tasks.css',
})
export class PendingTasks {
  materias = [
    { id: 1, nombre: 'Programación Orientada a Objetos', color: '#ff8c2e' },
    { id: 2, nombre: 'Base de Datos Avanzada', color: '#2ecc71' },
    { id: 3, nombre: 'Sistemas Operativos Aplicados', color: '#3b67be' },
    { id: 4, nombre: 'Redes y Comunicaciones Distribuidas', color: '#b5b200' }
  ];

  materiaSeleccionada = this.materias[0];

  // Esto vendría de un servicio filtrado por materiaId
  tareasFiltradas = [
    { id: 101, titulo: 'Trabajo Práctico N° 3', descripcion: 'Manejo de Excepciones y Polimorfismo', fechaVencimiento: '12/05/2026' },
    { id: 102, titulo: 'Trabajo Práctico N° 3', descripcion: 'Manejo de Excepciones y Polimorfismo', fechaVencimiento: '12/05/2026' },
    { id: 103, titulo: 'Trabajo Práctico N° 3', descripcion: 'Manejo de Excepciones y Polimorfismo', fechaVencimiento: '12/05/2026' },
    { id: 104, titulo: 'Trabajo Práctico N° 3', descripcion: 'Manejo de Excepciones y Polimorfismo', fechaVencimiento: '12/05/2026' }
  ];
  
  constructor (private location: Location) {}

  seleccionarMateria(materia: any) {
    this.materiaSeleccionada = materia;
    // Aquí deberías refrescar 'tareasFiltradas' con los datos de la nueva materia
  }

  goBack() {
    this.location.back();
  }
}
