import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Footer} from './components/footer/footer'; // ← ajusta ruta real
import { Header } from './components/header/header'; // ← también importa el header si lo usas
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ZoomCleanerService } from './services/zoom-cleaner';
import { MetaPixel } from './services/meta-pixel';
import { Gtm } from './services/gtm';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Footer, Header,ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'varyago';
  constructor(private router: Router, private zoomCleaner: ZoomCleanerService,private pixel: MetaPixel,
     private gtm: Gtm) {
    this.pixel.init();
  this.router.events.subscribe(async (event) => {
    if (event instanceof NavigationEnd) {
      this.zoomCleaner.destroyAllZoom();
      await this.pixel.pageView();
      this.gtm.init({
        autoInit: true,
        debug: false
      });
      // Page views automáticos
      this.gtm.bindRouter(this.router);

      // Moneda por defecto
      this.gtm.setCurrency('COP');
    }
     window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
}
}
