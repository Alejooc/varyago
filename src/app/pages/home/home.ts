import { Component, OnInit } from '@angular/core';
import { HomeService, HomeData } from '../../services/home';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})

export class Home implements OnInit {
  data:any= [];
  loading = true;

  constructor(private homeService: HomeService) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      $('.owl-carousel').owlCarousel({
        loop: true,
        margin: 10,
        nav: true,
        dots: true,
        items: 1,
        autoplay: true,
        autoplayTimeout: 3000,
        autoplayHoverPause: true,
        responsive: {
          "992": {
              "nav": true
          }
      }
      });
    }, 3000); // tiempo suficiente para que el DOM se renderice
  }
  ngOnInit(): void {
    this.homeService.getHomeData().subscribe({
      next: (res) => {
        this.data = res;
        console.log(res);
        
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar home:', err);
        this.loading = false;
      }
    });
  }
}
