import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
type RatingBucket = { stars: 5|4|3|2|1; count: number };

@Component({
  selector: 'app-product-trustbar',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './product-trustbar.html',
  styleUrl: './product-trustbar.scss'
})
export class ProductTrustbar {
 //Dummies seguros (si no pasas nada desde afuera, igual se ve bonito)
  // Dummies seguros (si no pasas nada desde afuera, igual se ve bonito)
  @Input() productName = 'Producto X';
  @Input() satisfaction = 94; // %
  @Input() ratingDist: RatingBucket[] = [
    { stars: 5, count: 120 },
    { stars: 4, count: 38 },
    { stars: 3, count: 12 },
    { stars: 2, count: 6 },
    { stars: 1, count: 9 },
  ];
  @Input() badges: string[] = ['Entrega rápida', 'Envio gratis', 'Más vendido'];

  totalReviews = computed(() =>
    this.ratingDist.reduce((a, b) => a + b.count, 0)
  );

  avgRating = computed(() => {
    const total = this.totalReviews();
    if (!total) return 0;
    const sum = this.ratingDist.reduce((acc, b) => acc + b.stars * b.count, 0);
    return Math.round((sum / total) * 10) / 10; // ej: 4.7
  });

  // Para pintar estrellas sin usar Math en el template
  roundAvg = computed(() => Math.round(this.avgRating()));

  starArray = [1, 2, 3, 4, 5];

  bucketPct(stars: number): number {
    const total = this.totalReviews() || 1;
    const found = this.ratingDist.find(b => b.stars === stars)?.count ?? 0;
    return Math.round((found / total) * 100);
  }
}

