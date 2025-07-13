import { Injectable } from '@angular/core';
declare var $: any;

@Injectable({ providedIn: 'root' })
export class ZoomCleanerService {
  destroyAllZoom(): void {
    try {
      // 🧹 1. Eliminar contenedor principal del zoom (como el de tu screenshot)
      $('div.zoomContainer').remove();

      // 🧹 2. Eliminar cualquier otro elemento generado por elevateZoom
      $('div.zoomWindowContainer').remove();
      $('img.zoomWindow, img.zoomLens, div.zoomWrapper').remove();

      // 🧹 3. Limpiar cualquier imagen que tenga instancia activa
      $('img').each(function (this: HTMLElement) {
        const $img = $(this);
        if ($img.data('elevateZoom')) {
          $img.data('elevateZoom').destroy();
          $img.removeData('elevateZoom');
        }
        $img.off();
      });

      // 🧹 4. Asegurar que no quede ningún listener global
      $('body').off('.elevateZoom');

    } catch (error) {
      console.warn('Error destruyendo zoom:', error);
    }
  }
}
