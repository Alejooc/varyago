import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Footer} from './components/footer/footer'; // ← ajusta ruta real
import { Header } from './components/header/header'; // ← también importa el header si lo usas
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ZoomCleanerService } from './services/zoom-cleaner';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Footer, Header,ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'varyago';
  constructor(private router: Router, private zoomCleaner: ZoomCleanerService) {
  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      this.zoomCleaner.destroyAllZoom();
      
    }
     window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
}
}
