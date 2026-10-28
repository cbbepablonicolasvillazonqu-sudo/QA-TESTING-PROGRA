import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { HitosService } from '../../core/services/hitos.service';
import { Hito } from '../../core/models/hito.model';

@Component({
  selector: 'app-hito-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="min-h-full py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      <!-- ESTADO: CARGANDO (Skeleton loader) -->
      @if (hitosService.loading()) {
        <div class="animate-pulse space-y-6" aria-busy="true" aria-label="Cargando contenido histórico">
          <div class="h-8 bg-stone-800 rounded w-1/3"></div>
          <div class="h-12 bg-stone-800 rounded w-3/4"></div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="h-80 bg-stone-800 rounded-2xl"></div>
            <div class="h-80 bg-stone-800 rounded-2xl"></div>
          </div>
          <div class="space-y-3">
            <div class="h-4 bg-stone-800 rounded w-full"></div>
            <div class="h-4 bg-stone-800 rounded w-5/6"></div>
            <div class="h-4 bg-stone-800 rounded w-4/6"></div>
          </div>
        </div>
      }

      <!-- ESTADO: ERROR -->
      @else if (hitosService.error(); as errorMsg) {
        <div class="bg-red-950/40 border border-red-800 rounded-2xl p-8 text-center text-red-200 my-8 shadow-xl">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/60 flex items-center justify-center text-3xl">
            ⚠️
          </div>
          <h2 class="text-xl font-bold font-serif mb-2">Error al cargar el contenido</h2>
          <p class="text-sm text-red-300 max-w-md mx-auto mb-6">{{ errorMsg }}</p>
          <div class="flex justify-center gap-4">
            <button
              type="button"
              (click)="retry()"
              class="px-5 py-2.5 bg-red-800 hover:bg-red-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
            >
              Reintentar
            </button>
            <button
              type="button"
              (click)="switchToMock()"
              class="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium rounded-lg transition-colors cursor-pointer"
            >
              Usar Mock Local
            </button>
          </div>
        </div>
      }

      <!-- ESTADO: ÉXITO (Contenido del Hito) -->
      @else if (hito(); as item) {
        <article class="space-y-8 animate-fade-in" [id]="item.codigo_linea_tiempo">
          
          <!-- Encabezado del Hito: Badges, Título y Metadatos -->
          <header class="border-b border-stone-800 pb-6">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
              
              <!-- Badges de identificación -->
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono">
                  Hito #{{ item.id }} de 7
                </span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-stone-800 text-stone-300 border border-stone-700">
                  📅 {{ item.fecha || item.codigo_linea_tiempo }}
                </span>
              </div>

              <!-- Controles de navegación anterior / siguiente -->
              <div class="flex items-center gap-2" role="group" aria-label="Navegación entre hitos">
                @if (prevHito(); as prev) {
                  <button
                    type="button"
                    (click)="navigateTo(prev.codigo_linea_tiempo)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-900 border border-stone-700 text-stone-300 hover:text-amber-400 hover:bg-stone-800 transition-colors cursor-pointer"
                    title="Hito anterior: {{ prev.titulo }}"
                  >
                    ← Anterior
                  </button>
                }
                @if (nextHito(); as next) {
                  <button
                    type="button"
                    (click)="navigateTo(next.codigo_linea_tiempo)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-900 border border-stone-700 text-stone-300 hover:text-amber-400 hover:bg-stone-800 transition-colors cursor-pointer"
                    title="Hito siguiente: {{ next.titulo }}"
                  >
                    Siguiente →
                  </button>
                }
              </div>
            </div>

            <h1 class="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-serif text-stone-100 tracking-tight leading-tight">
              {{ item.titulo || item.descripcion }}
            </h1>

            <p class="mt-3 text-base sm:text-lg text-amber-200/90 font-medium leading-relaxed max-w-4xl">
              {{ item.descripcion }}
            </p>

            <!-- Metadatos históricos contextuales -->
            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t border-stone-800/60 text-xs text-stone-400">
              @if (item.ubicacion) {
                <div class="flex items-center gap-2 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                  <span class="text-amber-400">📍</span>
                  <div>
                    <span class="block text-stone-400 text-[10px] uppercase font-bold">Teatro de Operaciones</span>
                    <span class="text-stone-200 font-semibold">{{ item.ubicacion }}</span>
                  </div>
                </div>
              }
              @if (item.bajas) {
                <div class="flex items-center gap-2 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                  <span class="text-red-400">⚔️</span>
                  <div>
                    <span class="block text-stone-400 text-[10px] uppercase font-bold">Impacto / Bajas</span>
                    <span class="text-stone-200 font-semibold">{{ item.bajas }}</span>
                  </div>
                </div>
              }
              @if (item.comandantes && item.comandantes.length > 0) {
                <div class="flex items-center gap-2 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800 sm:col-span-2 lg:col-span-1">
                  <span class="text-blue-400">🎖️</span>
                  <div>
                    <span class="block text-stone-400 text-[10px] uppercase font-bold">Mandos en Campaña</span>
                    <span class="text-stone-200 font-semibold">{{ item.comandantes.join(' vs ') }}</span>
                  </div>
                </div>
              }
            </div>
          </header>

          <!-- SECCIÓN MULTIMEDIA PRINCIPAL: IMAGEN HERO & VIDEO -->
          <section class="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Archivos Multimedia">
            
            <!-- 1. Imagen Fotográfica de Archivo -->
            <figure class="bg-stone-900/80 rounded-2xl overflow-hidden border border-stone-800 shadow-xl flex flex-col group">
              <div class="p-3 bg-stone-950/70 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400">
                <span class="font-mono text-amber-400 flex items-center gap-1.5 font-bold">
                  📷 Fotografía Histórica de Archivo
                </span>
                <span class="text-[11px] text-stone-400">Archivo 1932–1935</span>
              </div>
              <div class="relative overflow-hidden aspect-video bg-black flex items-center justify-center">
                <img
                  [src]="item.foto"
                  [alt]="'Fotografía histórica de ' + item.titulo"
                  loading="lazy"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  (error)="handleImageError($event)"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                <div class="absolute bottom-2 left-3 right-3 text-xs text-stone-300 font-serif italic truncate">
                  {{ item.titulo }} — Campaña del Chaco
                </div>
              </div>
              <figcaption class="p-3 text-xs text-stone-400 bg-stone-950/40 border-t border-stone-850">
                Registro documental conservado en la colección histórica fotográfica del conflicto chaqueño.
              </figcaption>
            </figure>

            <!-- 2. Documental en Video Local -->
            <div class="bg-stone-900/80 rounded-2xl overflow-hidden border border-stone-800 shadow-xl flex flex-col">
              <div class="p-3 bg-stone-950/70 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400">
                <span class="font-mono text-amber-400 flex items-center gap-1.5 font-bold">
                  🎬 Archivo Audiovisual Documental
                </span>
                <span class="text-[11px] text-stone-400">Video Local HD</span>
              </div>
              <div class="aspect-video bg-black relative flex items-center justify-center">
                <video
                  #videoPlayer
                  [src]="item.video"
                  controls
                  preload="none"
                  class="w-full h-full object-contain"
                  [attr.aria-label]="'Documental de ' + item.titulo"
                >
                  Tu navegador no soporta reproducción de video HTML5.
                </video>
              </div>
              <div class="p-3 text-xs text-stone-400 bg-stone-950/40 border-t border-stone-850 flex items-center justify-between">
                <span>Reproducción diferida (preload: none) para optimizar carga.</span>
                <button
                  type="button"
                  (click)="videoPlayer.play()"
                  class="text-amber-400 hover:text-amber-300 text-xs font-semibold cursor-pointer"
                >
                  ▶ Reproducir
                </button>
              </div>
            </div>

          </section>

          <!-- 3. NARRACIÓN HISTÓRICA EN AUDIO (Voz estilo Carlos Mesa / Archivo Oral) -->
          <section
            class="bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 rounded-2xl p-5 sm:p-6 border border-amber-600/40 shadow-xl"
            aria-label="Narración Sonora Histórica"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-2xl text-amber-400 shrink-0 shadow-inner">
                  🎙️
                </div>
                <div>
                  <h2 class="text-base sm:text-lg font-bold font-serif text-stone-100 flex items-center gap-2">
                    Narración Histórica Oral
                    <span class="text-xs font-sans font-normal px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                      Archivo Sonora
                    </span>
                  </h2>
                  <p class="text-xs text-stone-400">
                    Relato documental narrado con fidelidad cronológica del hito militar.
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-stone-950/80 p-3 rounded-xl border border-stone-800">
              <audio
                [src]="item.voz"
                controls
                preload="none"
                class="w-full h-11 rounded"
                [attr.aria-label]="'Narración sonora de ' + item.titulo"
              >
                Tu navegador no soporta el elemento de audio HTML5.
              </audio>
            </div>
          </section>

          <!-- 4. TEXTO HISTÓRICO RIGUROSO Y EXTENSO -->
          <section class="bg-stone-900/60 rounded-2xl p-6 sm:p-8 border border-stone-800 shadow-xl" aria-label="Crónica histórica">
            <h2 class="text-lg sm:text-xl font-bold font-serif text-amber-400 mb-4 pb-2 border-b border-stone-800 flex items-center gap-2">
              <span>📜</span> Crónica y Análisis Histórico
            </h2>
            
            <div class="prose prose-invert prose-stone max-w-none text-stone-300 leading-relaxed text-sm sm:text-base space-y-4 font-serif">
              @for (paragraph of getParagraphs(item.texto); track $index) {
                <p class="leading-relaxed">
                  {{ paragraph }}
                </p>
              }
            </div>
          </section>

          <!-- Pie de navegación entre hitos -->
          <footer class="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              @if (prevHito(); as prev) {
                <button
                  type="button"
                  (click)="navigateTo(prev.codigo_linea_tiempo)"
                  class="flex items-center gap-2 text-stone-300 hover:text-amber-400 transition-colors text-sm font-semibold cursor-pointer"
                >
                  <span>← Anterior:</span>
                  <span class="underline">{{ prev.titulo }}</span>
                </button>
              }
            </div>

            <div class="text-xs text-stone-400 font-mono">
              Navega con flechas [←] [→] de tu teclado
            </div>

            <div>
              @if (nextHito(); as next) {
                <button
                  type="button"
                  (click)="navigateTo(next.codigo_linea_tiempo)"
                  class="flex items-center gap-2 text-stone-300 hover:text-amber-400 transition-colors text-sm font-semibold cursor-pointer"
                >
                  <span>Siguiente:</span>
                  <span class="underline">{{ next.titulo }}</span>
                  <span>→</span>
                </button>
              }
            </div>
          </footer>

        </article>
      }

      <!-- ESTADO: VACÍO -->
      @else {
        <div class="text-center py-16 text-stone-400 bg-stone-900/40 rounded-2xl border border-stone-800 p-8 my-8">
          <span class="text-4xl block mb-3">🔍</span>
          <h2 class="text-lg font-bold text-stone-200 mb-1">Hito no encontrado</h2>
          <p class="text-xs text-stone-400 mb-6">El hito especificado en la URL no existe en el catálogo cronológico.</p>
          <a
            routerLink="/hito/junio-1932"
            class="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-sm inline-block transition-colors"
          >
            Volver al Inicio (Pitiantuta 1932)
          </a>
        </div>
      }

    </main>
  `
})
export class HitoDetalleComponent implements OnInit {
  readonly hitosService = inject(HitosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly hito = signal<Hito | null>(null);
  readonly prevHito = signal<Hito | null>(null);
  readonly nextHito = signal<Hito | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const codigo = params.get('codigo') || 'junio-1932';
      this.loadHito(codigo);
    });
  }

  loadHito(codigo: string): void {
    this.hitosService.getHitoByCodigo(codigo).subscribe((item) => {
      this.hito.set(item ?? null);
      if (item) {
        this.prevHito.set(this.hitosService.getPreviousHito(codigo) ?? null);
        this.nextHito.set(this.hitosService.getNextHito(codigo) ?? null);
      }
    });
  }

  retry(): void {
    const currentCode = this.route.snapshot.paramMap.get('codigo') || 'junio-1932';
    this.loadHito(currentCode);
  }

  switchToMock(): void {
    this.hitosService.setUseMockApi(true);
    this.retry();
  }

  navigateTo(codigo: string): void {
    this.router.navigate(['/hito', codigo]);
  }

  getParagraphs(texto: string): string[] {
    return texto.split('\n\n').filter((p) => p.trim().length > 0);
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/imgs/boqueron_1932.jpg';
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight' && this.nextHito()) {
      this.navigateTo(this.nextHito()!.codigo_linea_tiempo);
    } else if (event.key === 'ArrowLeft' && this.prevHito()) {
      this.navigateTo(this.prevHito()!.codigo_linea_tiempo);
    }
  }
}
