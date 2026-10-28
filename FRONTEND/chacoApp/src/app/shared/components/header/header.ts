import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HitosService } from '../../../core/services/hitos.service';
import { ChatbotService } from '../../../core/services/chatbot.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800 text-stone-100 shadow-xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        <!-- Botón menú móvil / toggle timeline & Título -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="toggleTimeline.emit()"
            class="p-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors cursor-pointer"
            aria-label="Abrir o cerrar línea de tiempo"
            title="Alternar línea de tiempo"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>

          <!-- Escudo / Icono Histórico -->
          <div class="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-700 via-amber-800 to-stone-900 border border-amber-600/50 flex items-center justify-center shadow-inner shrink-0">
            <span class="text-xl" role="img" aria-label="Bandera">🎖️</span>
          </div>

          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs uppercase tracking-widest font-bold text-amber-500 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                1932 — 1935
              </span>
              <span class="hidden sm:inline-block text-xs text-stone-400 font-mono">
                Archivo Histórico
              </span>
            </div>
            <h1 class="text-base sm:text-xl font-bold font-serif tracking-tight text-stone-100">
              Guerra del Chaco
              <span class="hidden md:inline font-normal text-stone-400 font-sans text-sm ml-1">
                | Enciclopedia Multimedia Interactiva
              </span>
            </h1>
          </div>
        </div>

        <!-- Acciones: Switch de Origen de Datos & Chatbot trigger -->
        <div class="flex items-center gap-2 sm:gap-3">
          
          <!-- Selector de Modo de Datos (Mock JSON vs Node API) -->
          <div class="hidden sm:flex items-center bg-stone-900 border border-stone-700/80 rounded-lg p-1 text-xs">
            <button
              type="button"
              (click)="hitosService.setUseMockApi(true)"
              [class]="hitosService.useMockApi()
                ? 'bg-amber-600 text-stone-950 font-bold shadow px-2.5 py-1 rounded transition-all cursor-pointer'
                : 'text-stone-400 hover:text-stone-200 px-2.5 py-1 rounded transition-all cursor-pointer'"
              title="Cargar desde /data/hitos.json local"
            >
              Mock JSON
            </button>
            <button
              type="button"
              (click)="hitosService.setUseMockApi(false)"
              [class]="!hitosService.useMockApi()
                ? 'bg-amber-600 text-stone-950 font-bold shadow px-2.5 py-1 rounded transition-all cursor-pointer'
                : 'text-stone-400 hover:text-stone-200 px-2.5 py-1 rounded transition-all cursor-pointer'"
              title="Conectar a API REST Node.js en http://localhost:3000"
            >
              API Node (3000)
            </button>
          </div>

          <!-- Botón de apertura Chatbot en header -->
          <button
            type="button"
            (click)="chatbotService.toggleChat()"
            class="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Abrir asistente de Inteligencia Artificial"
          >
            <span class="text-base">🤖</span>
            <span class="hidden md:inline">Consultar IA</span>
          </button>
        </div>

      </div>
    </header>
  `
})
export class HeaderComponent {
  readonly hitosService = inject(HitosService);
  readonly chatbotService = inject(ChatbotService);

  readonly toggleTimeline = output<void>();
}
