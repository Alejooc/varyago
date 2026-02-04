import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ZoomCleanerService {
  destroyAllZoom(): void {
    try {
      // No zoom to clean (elevateZoom removed)
    } catch (error) {
      // Silent error handling
    }
  }
}
