import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-progress-goal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-goal-bar.html',
  styleUrls: ['./progress-goal-bar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressGoalBar implements OnChanges {

  /** Valor actual (e.g., subtotal del carrito) */
  @Input() current = 0;

  /** Meta/objetivo (e.g., umbral de envío gratis) */
  @Input() goal = 0;

  /** Título opcional arriba de la barra */
  @Input() title = '';

  /** Mostrar números (porcentaje y montos) */
  @Input() showNumbers = true;

  /** Código de moneda (para | currency). Ej: 'COP', 'USD' */
  @Input() currencyCode: string = 'COP';

  /** Altura de la barra, ej: '10px', '0.75rem' */
  @Input() height: string = '10px';

  /** Bordes redondeados */
  @Input() rounded = true;

  /** Transición animada del avance */
  @Input() animate = true;

  /**
   * Texto cuando NO se ha alcanzado la meta.
   * Placeholders: {remaining}, {goal}, {current}, {percent}
   * Ej: "Faltan {remaining} para obtener envío gratis"
   */
  @Input() messageWhenIncomplete: string =
    'Faltan {remaining} para alcanzar la meta';

  /**
   * Texto cuando SÍ se alcanzó la meta.
   * Placeholders: {remaining}, {goal}, {current}, {percent}
   * Ej: "¡Ya alcanzaste el envío gratis!"
   */
  @Input() messageWhenComplete: string =
    '¡Meta alcanzada!';

  /** Etiqueta accesible (aria-label) de la barra */
  @Input() ariaLabel: string = 'Progreso hacia la meta';

  /** Emite cuando se alcanza la meta (transición de no-alcanzado → alcanzado) */
  @Output() reached = new EventEmitter<void>();

  /** Estado interno para detectar el cruce de meta */
  private wasReached = false;

  get clampedGoal(): number {
    return Math.max(this.goal, 0);
  }

  get clampedCurrent(): number {
    return Math.max(this.current, 0);
  }

  get percent(): number {
    if (this.clampedGoal <= 0) return 100;
    const pct = (this.clampedCurrent / this.clampedGoal) * 100;
    return Math.max(0, Math.min(100, pct));
  }

  get remainingRaw(): number {
    return Math.max(this.clampedGoal - this.clampedCurrent, 0);
  }

  /** Mensaje renderizado con placeholders sustituidos */
  get message(): string {
    const base = this.isReached ? this.messageWhenComplete : this.messageWhenIncomplete;
    const rep = (s: string) =>
      s
        .replace('{percent}', `${Math.floor(this.percent)}%`)
        .replace('{goal}', this.formatMoney(this.clampedGoal))
        .replace('{current}', this.formatMoney(this.clampedCurrent))
        .replace('{remaining}', this.formatMoney(this.remainingRaw));
    return rep(base);
  }

  get isReached(): boolean {
    return this.percent >= 100;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const nowReached = this.isReached;
    if (!this.wasReached && nowReached) {
      this.reached.emit();
    }
    this.wasReached = nowReached;
  }

  private formatMoney(value: number): string {
    try {
      // Nota: el pipe currency en plantilla ya se usa para labels si lo necesitas.
      // Aquí usamos Intl para los placeholders del mensaje.
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: this.currencyCode,
        maximumFractionDigits: 0
      }).format(value);
    } catch {
      // Fallback simple si la moneda no es válida
      return `${value.toFixed(0)} ${this.currencyCode}`;
    }
  }
}
