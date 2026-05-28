import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';

@Component({
  selector: 'app-spinner',
  imports: [CommonModule],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
})
export class Spinner {
  private spinnerService = inject(SpinnerService);
  
  isLoading = this.spinnerService.isLoading;
}
