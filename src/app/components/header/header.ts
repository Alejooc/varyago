import { Component } from '@angular/core';
import { ActivatedRoute,RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule,RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  constructor(
      private route: ActivatedRoute
    ) {}
}
