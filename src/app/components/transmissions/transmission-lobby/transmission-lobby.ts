import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface Sala {
  id: number;
  nombre: string;
  estado: 'Transmitiendo' | 'En Espera';
}

@Component({
  selector: 'app-transmission-lobby',
  imports: [CommonModule, RouterModule],
  templateUrl: './transmission-lobby.html',
  styleUrl: './transmission-lobby.css',
})
export class TransmissionLobby implements OnInit {
  // Simulación de datos dinámicos para las salas
  salas: Sala[] = [
    { id: 1, nombre: 'Grupo #1', estado: 'Transmitiendo' },
    { id: 2, nombre: 'Grupo #2', estado: 'En Espera' },
    { id: 3, nombre: 'Grupo #3', estado: 'En Espera' },
    { id: 4, nombre: 'Grupo #4', estado: 'En Espera' },
  ];

  constructor(
    public authService: AuthService,
    private location: Location,
  ) {}

  ngOnInit(): void {}

  triggerFileUpload(): void {
    console.log('Abriendo selector de archivos...');
  }

  sortGroups(): void {
    console.log('Definiendo orden de exposición...');
  }

  entrarASala(id: number): void {
    console.log(`Accediendo a la transmisión de la sala ${id}`);
  }

  finalizarConfiguracion(): void {
    alert('Configuración guardada correctamente.');
  }

  // Declaras la variable. Puede empezar vacía o con un valor por defecto.
  metodo: 'orden' | 'sorteo' | null = null;

  gruposSimulados = [
    { id: 1, resultado: 0 },
    { id: 2, resultado: 0 },
    { id: 3, resultado: 0 },
    { id: 4, resultado: 0 },
  ];

  ejecutarSorteo() {
    let numeros = [1, 2, 3, 4].sort(() => Math.random() - 0.5);
    this.gruposSimulados.forEach((g, index) => {
      g.resultado = numeros[index];
    });
  }

  goBack() {
    this.location.back();
  }
}
