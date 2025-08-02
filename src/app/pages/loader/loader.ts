import { Component } from '@angular/core';
import { LoadingService } from '../../services/loader';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrls: ['./loader.scss']
})
export class LoadingComponent {
  isLoading$: typeof this.loadingService.loading$;

  constructor(private loadingService: LoadingService) {
    this.isLoading$ = this.loadingService.loading$;
  }
}
