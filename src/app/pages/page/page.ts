import { CommonModule } from '@angular/common';
import { Component,OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PageService } from '../../services/page'; // Asegúrate de que este servicio esté implementado
@Component({
  selector: 'app-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './page.html',
  styleUrl: './page.scss'
})
export class Page implements OnInit {
  pageId!: string;
  pageData: any = {};

  constructor(private route: ActivatedRoute,private pageService : PageService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.pageId = params['id'];
      this.loadPageData();
    });
  }

  loadPageData(): void {
    // Aquí deberías hacer una llamada a tu servicio para obtener los datos de la página
    // Por ejemplo:
    this.pageService.getPage(this.pageId).subscribe(res=>{
      this.pageData = res.page;
      console.log(this.pageData);
    });
  }
}
