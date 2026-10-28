import { Component, ElementRef, HostListener, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../core/services/chatbot.service';
import { HitosService } from '../../core/services/hitos.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- BOTÓN FLOTANTE TRIGGER (Esquina inferior derecha) -->
    <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      <!-- Ventana de Chat Flotante -->
      @if (chatbotService.isOpen()) {
        <section
          class="w-[90vw] sm:w-[420px] h-[560px] max-h-[82vh] bg-stone-900 border border-amber-600/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-scale-up backdrop-blur-xl transition-all"
          role="dialog"
          aria-label="Asistente Histórico de la Guerra del Chaco"
          aria-modal="true"
        >
          <!-- Encabezado del Chatbot -->
          <header class="bg-gradient-to-r from-stone-950 via-amber-950/80 to-stone-950 px-4 py-3 border-b border-stone-800 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-amber-600/30 border border-amber-500/60 flex items-center justify-center text-base">
                🤖
              </div>
              <div>
                <h2 class="text-sm font-bold text-stone-100 flex items-center gap-1.5 font-serif">
                  Asistente IA del Chaco
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="En línea"></span>
                </h2>
                <p class="text-[11px] text-amber-300/80 font-mono truncate max-w-[220px]">
                  @if (hitosService.selectedHito(); as sel) {
                    Contexto: {{ sel.titulo || sel.codigo_linea_tiempo }}
                  } @else {
                    Contexto General (1932–1935)
                  }
                </p>
              </div>
            </div>

            <div class="flex items-center gap-1">
              <button
                type="button"
                (click)="chatbotService.clearHistory()"
                class="p-1.5 text-stone-400 hover:text-stone-200 rounded hover:bg-stone-800/80 transition-colors text-xs"
                title="Limpiar historial"
                aria-label="Limpiar historial de conversación"
              >
                🔄
              </button>
              <button
                type="button"
                (click)="chatbotService.closeChat()"
                class="p-1.5 text-stone-400 hover:text-stone-100 rounded hover:bg-stone-800/80 transition-colors"
                title="Cerrar chat"
                aria-label="Cerrar ventana del chat"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          <!-- Banner Informativo de Contexto Activo -->
          <div class="bg-amber-950/40 border-b border-amber-800/30 px-3 py-1.5 text-[11px] text-amber-200/90 flex items-center justify-between">
            <span class="flex items-center gap-1">
              <span>📍</span> Analizando hito activo en pantalla
            </span>
            <span class="font-mono text-[10px] text-amber-400">
              {{ hitosService.selectedHito()?.codigo_linea_tiempo || '1932-1935' }}
            </span>
          </div>

          <!-- Historial de Mensajes -->
          <div
            #scrollContainer
            class="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-950/50"
            role="log"
            aria-live="polite"
          >
            @for (msg of chatbotService.messages(); track msg.id) {
              <div
                class="flex flex-col"
                [class]="msg.sender === 'user' ? 'items-end' : 'items-start'"
              >
                <div
                  class="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm transition-all"
                  [class]="msg.sender === 'user'
                    ? 'bg-amber-600 text-stone-950 font-medium rounded-br-none'
                    : 'bg-stone-800 border border-stone-700 text-stone-200 rounded-bl-none'"
                >
                  <p class="whitespace-pre-line">{{ msg.text }}</p>
                </div>
                
                <span class="text-[10px] text-stone-500 mt-1 px-1 font-mono">
                  {{ msg.timestamp | date:'HH:mm' }}
                </span>
              </div>
            }

            <!-- Indicador de "Escribiendo..." -->
            @if (chatbotService.isTyping()) {
              <div class="flex items-center gap-2 text-stone-400 text-xs py-1">
                <div class="flex gap-1 items-center bg-stone-800 px-3 py-2 rounded-xl border border-stone-700">
                  <span class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></span>
                  <span class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span class="text-[11px] text-stone-300 ml-1">Consultando archivos históricos...</span>
                </div>
              </div>
            }

            <!-- Alerta de Error con botón de Reintento -->
            @if (chatbotService.lastFailedMessage(); as failed) {
              <div class="bg-red-950/60 border border-red-800/80 rounded-xl p-2.5 text-xs text-red-200 flex items-center justify-between gap-2">
                <span>⚠️ Error al comunicar con la API.</span>
                <button
                  type="button"
                  (click)="chatbotService.retryLastMessage()"
                  class="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white rounded font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  Reintentar
                </button>
              </div>
            }
          </div>

          <!-- Sugerencias de Preguntas Frecuentes (Pills) -->
          <div class="px-3 py-2 bg-stone-900 border-t border-stone-800 flex gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            <button
              type="button"
              (click)="sendQuickPrompt('¿Por qué fue clave la Batalla de Boquerón?')"
              class="whitespace-nowrap px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors cursor-pointer"
            >
              Defensa de Boquerón
            </button>
            <button
              type="button"
              (click)="sendQuickPrompt('¿Qué tácticas aplicó el General Hans Kundt?')"
              class="whitespace-nowrap px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors cursor-pointer"
            >
              Gral. Kundt
            </button>
            <button
              type="button"
              (click)="sendQuickPrompt('¿Cómo se llegó a la paz en 1935?')"
              class="whitespace-nowrap px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors cursor-pointer"
            >
              Paz de 1935
            </button>
          </div>

          <!-- Formulario de Entrada de Texto -->
          <form
            (ngSubmit)="onSubmit()"
            class="p-3 bg-stone-950 border-t border-stone-800 flex items-center gap-2"
          >
            <label for="chatInput" class="sr-only">Escribe tu pregunta sobre la Guerra del Chaco</label>
            <input
              #inputField
              id="chatInput"
              type="text"
              [(ngModel)]="userInput"
              name="userInput"
              placeholder="Pregunta sobre la Guerra del Chaco..."
              autocomplete="off"
              class="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              [disabled]="chatbotService.isTyping()"
            />
            <button
              type="submit"
              [disabled]="!userInput.trim() || chatbotService.isTyping()"
              class="p-2 sm:px-4 sm:py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Enviar mensaje"
            >
              <span class="hidden sm:inline">Enviar</span>
              <span class="sm:hidden text-base">➤</span>
            </button>
          </form>

        </section>
      }

      <!-- BOTÓN FLOTANTE DISPARADOR -->
      <button
        type="button"
        (click)="chatbotService.toggleChat()"
        class="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-400/50"
        aria-label="Abrir asistente inteligente"
      >
        <span class="text-xl">🤖</span>
        <span class="text-sm font-semibold tracking-wide">
          {{ chatbotService.isOpen() ? 'Cerrar Asistente' : 'Consultar Asistente IA' }}
        </span>
        @if (!chatbotService.isOpen()) {
          <span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
          </span>
        }
      </button>

    </div>
  `
})
export class ChatbotWidgetComponent {
  readonly chatbotService = inject(ChatbotService);
  readonly hitosService = inject(HitosService);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;
  @ViewChild('inputField') private inputField?: ElementRef;

  userInput = '';

  onSubmit(): void {
    if (!this.userInput.trim() || this.chatbotService.isTyping()) return;

    const query = this.userInput.trim();
    this.userInput = '';
    const activeCode = this.hitosService.selectedHito()?.codigo_linea_tiempo;

    this.chatbotService.sendMessage(query, activeCode).subscribe(() => {
      this.scrollToBottom();
    });

    setTimeout(() => this.scrollToBottom(), 100);
  }

  sendQuickPrompt(promptText: string): void {
    this.userInput = promptText;
    this.onSubmit();
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      // noop
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.chatbotService.isOpen()) {
      this.chatbotService.closeChat();
    }
  }
}
