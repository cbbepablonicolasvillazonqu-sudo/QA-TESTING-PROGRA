import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Hito } from '../../core/models/hito.model';
import { HitosService } from '../../core/services/hitos.service';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav
      class="h-full flex flex-col bg-stone-900 border-r border-stone-800 text-stone-200 select-none shadow-2xl"
      aria-label="Línea de tiempo de la Guerra del Chaco"
    >
      <!-- Encabezado de la barra lateral -->
      <div class="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
          <h2 class="text-sm font-bold uppercase tracking-wider text-amber-400 font-serif">
            Línea de Tiempo (1932–1935)
          </h2>
        </div>
        <button
          type="button"
          (click)="closeTimeline.emit()"
          class="lg:hidden p-1.5 text-stone-400 hover:text-stone-100 rounded hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          aria-label="Cerrar menú lateral"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Resumen de progreso cronológico -->
      <div class="px-4 py-2.5 bg-stone-950/30 border-b border-stone-800/80 text-xs text-stone-400 flex justify-between items-center">
        <span>7 Hitos Históricos</span>
        <span class="font-mono text-amber-400/90 text-xs">
          @if (hitosService.selectedHito(); as sel) {
            {{ sel.id }} de 7
          } @else {
            1 de 7
          }
        </span>
      </div>

      <!-- Lista cronológica con línea conectora vertical -->
      <div class="flex-1 overflow-y-auto px-3 py-4 space-y-2 relative" role="list">
        
        <!-- Línea continua decorativa de fondo -->
        <div class="absolute left-7 top-6 bottom-6 w-0.5 bg-gradient-to-b from-amber-600/40 via-amber-500/30 to-stone-700/40 -z-0"></div>

        @for (hito of hitosService.hitos(); track hito.id) {
          @let isActive = hitosService.selectedHito()?.codigo_linea_tiempo === hito.codigo_linea_tiempo;
          
          <div
            role="listitem"
            (click)="selectHito(hito.codigo_linea_tiempo)"
            (keydown.enter)="selectHito(hito.codigo_linea_tiempo)"
            (keydown.space)="selectHito(hito.codigo_linea_tiempo); $event.preventDefault()"
            tabindex="0"
            [attr.aria-current]="isActive ? 'step' : null"
            class="relative z-10 flex items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            [class]="isActive 
              ? 'bg-gradient-to-r from-amber-950/70 to-stone-900 border border-amber-600/60 shadow-lg text-amber-100' 
              : 'hover:bg-stone-800/60 border border-transparent text-stone-400 hover:text-stone-200'"
          >
            <!-- Badge numérico de hito -->
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all duration-200"
              [class]="isActive 
                ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-500/20 scale-110 shadow-md font-mono' 
                : 'bg-stone-800 text-stone-400 border border-stone-700 group-hover:border-amber-600/50 group-hover:text-amber-400'"
            >
              {{ hito.id }}
            </div>

            <!-- Contenido textual del ítem -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 mb-1">
                <span
                  class="text-[11px] font-semibold uppercase tracking-wider font-mono"
                  [class]="isActive ? 'text-amber-400' : 'text-stone-400 group-hover:text-amber-300'"
                >
                  {{ hito.fecha || hito.codigo_linea_tiempo }}
                </span>
                @if (isActive) {
                  <span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                }
              </div>

              <h3
                class="text-sm font-semibold leading-snug truncate"
                [class]="isActive ? 'text-stone-100 font-bold' : 'text-stone-300 group-hover:text-stone-100'"
              >
                {{ hito.titulo || hito.descripcion }}
              </h3>

              <p class="text-xs text-stone-400 line-clamp-1 mt-0.5">
                {{ hito.descripcion }}
              </p>
            </div>
          </div>
        } @empty {
          <div class="text-center py-8 text-stone-400 text-xs">
            @if (hitosService.loading()) {
              <div class="flex flex-col items-center gap-2">
                <div class="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Cargando cronología...</span>
              </div>
            } @else {
              <span>No se encontraron hitos en el archivo.</span>
            }
          </div>
        }
      </div>

      <!-- Pie de la barra lateral con selector de salto rápido -->
      <div class="p-3 bg-stone-950/80 border-t border-stone-800 text-xs text-stone-400 flex items-center justify-between">
        <span class="text-[11px] text-stone-400">Atajos: flechas & navegación</span>
        <button
          type="button"
          (click)="goToFirst()"
          class="text-amber-400 hover:text-amber-300 text-xs underline cursor-pointer"
        >
          Ir al Inicio (1932)
        </button>
      </div>
    </nav>
  `
})
export class TimelineComponent {
  readonly hitosService = inject(HitosService);
  private readonly router = inject(Router);

  readonly closeTimeline = output<void>();

  selectHito(codigo: string): void {
    this.router.navigate(['/hito', codigo]);
    this.closeTimeline.emit();
  }

  goToFirst(): void {
    const first = this.hitosService.hitos()[0];
    if (first) {
      this.selectHito(first.codigo_linea_tiempo);
    }
  }
}
