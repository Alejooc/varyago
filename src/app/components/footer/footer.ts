import { Component,OnInit } from '@angular/core';
import { FooterService } from '../../services/footer';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer implements OnInit {
  gralData: any = [];
  constructor(private footerService: FooterService) {}
  ngOnInit(): void {
    this.footerService.getGral().subscribe(res =>{
      this.gralData = res.gral;
      console.log('Footer data:', res);
      // Aquí puedes asignar los datos a una variable para usarlos en tu plantilla
    });
  }
}
