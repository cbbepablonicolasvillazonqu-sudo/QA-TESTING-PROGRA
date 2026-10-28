import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { ChatMessage, ChatRequest, ChatResponse } from '../models/chat.model';
import { environment } from '../../../environments/environment';

/**
 * Servicio para gestionar la interacción conversacional con el Asistente IA
 * de la Guerra del Chaco, soportando contexto del hito activo, reintentos y
 * fallback de contingencia histórica.
 */
@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly http = inject(HttpClient);

  /** Historial reactivo de mensajes */
  readonly messages = signal<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '¡Saludos! Soy el Asistente Histórico de la Guerra del Chaco (1932–1935). Puedes consultarme sobre cualquier batalla, comandantes, estrategia o sobre el hito que estás explorando en pantalla.',
      timestamp: new Date()
    }
  ]);

  /** Indicador de respuesta en generación (escribiendo...) */
  readonly isTyping = signal<boolean>(false);

  /** Visibilidad de la ventana del chatbot */
  readonly isOpen = signal<boolean>(false);

  /** Último error registrado */
  readonly lastError = signal<string | null>(null);

  /** Almacena el último mensaje fallido para permitir reintentos */
  readonly lastFailedMessage = signal<{ text: string; context?: string } | null>(null);

  /** Alterna la apertura / cierre del widget */
  toggleChat(): void {
    this.isOpen.update((v) => !v);
  }

  /** Abre el widget del chatbot */
  openChat(): void {
    this.isOpen.set(true);
  }

  /** Cierra el widget del chatbot */
  closeChat(): void {
    this.isOpen.set(false);
  }

  /**
   * Envía un mensaje del usuario al asistente IA conectado a la API NodeJS (`POST /api/chat`).
   * Envía el `codigo_linea_tiempo` activo como contexto opcional.
   * @param text Mensaje redactado por el usuario
   * @param contextCodigo Código del hito que el usuario está visualizando actualmente
   * @returns Observable con la respuesta textual
   */
  sendMessage(text: string, contextCodigo?: string): Observable<string> {
    if (!text.trim()) return of('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date(),
      contextHito: contextCodigo
    };

    this.messages.update((msgs) => [...msgs, userMsg]);
    this.isTyping.set(true);
    this.lastError.set(null);
    this.lastFailedMessage.set(null);

    const payload: ChatRequest = {
      message: text.trim(),
      codigo_linea_tiempo: contextCodigo
    };

    const endpoint = `${environment.apiUrl}/chat`;

    return this.http.post<ChatResponse>(endpoint, payload).pipe(
      map((res) => res.reply),
      tap((reply) => {
        const assistantMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          timestamp: new Date(),
          contextHito: contextCodigo
        };
        this.messages.update((msgs) => [...msgs, assistantMsg]);
        this.isTyping.set(false);
      }),
      catchError((err) => {
        // En caso de que la API Node no esté iniciada o falle la red:
        const fallbackReply = this.generateFallbackHistoricalResponse(text, contextCodigo);
        const errorDetail = 'API externa no disponible. Se activó el motor histórico de contingencia.';
        this.lastError.set(errorDetail);
        this.lastFailedMessage.set({ text, context: contextCodigo });

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: fallbackReply,
          timestamp: new Date(),
          contextHito: contextCodigo,
          isError: false
        };
        this.messages.update((msgs) => [...msgs, botMsg]);
        this.isTyping.set(false);

        return of(fallbackReply);
      })
    );
  }

  /**
   * Reintenta el último mensaje fallido enviado por el usuario.
   */
  retryLastMessage(): void {
    const failed = this.lastFailedMessage();
    if (failed) {
      this.sendMessage(failed.text, failed.context).subscribe();
    }
  }

  /**
   * Limpia el historial dejando únicamente el mensaje de bienvenida inicial.
   */
  clearHistory(): void {
    this.messages.set([
      {
        id: 'welcome',
        sender: 'assistant',
        text: '¡Historial reiniciado! Estoy listo para responder tus consultas sobre la Guerra del Chaco (1932–1935).',
        timestamp: new Date()
      }
    ]);
    this.lastError.set(null);
    this.lastFailedMessage.set(null);
  }

  /**
   * Motor de respuestas de contingencia basado en el conocimiento estricto de los hitos del Chaco.
   * Evita inventar datos y se apega a la verdad histórica de 1932–1935.
   */
  private generateFallbackHistoricalResponse(query: string, contextCodigo?: string): string {
    const q = query.toLowerCase();

    if (q.includes('boqueron') || q.includes('boquerón') || (contextCodigo === 'boqueron-1932' && (q.includes('marzana') || q.includes('defensa') || q.includes('agua')))) {
      return 'En la Batalla de Boquerón (septiembre de 1932), 600 defensores bolivianos bajo el mando del Tte. Cnl. Manuel Marzana resistieron durante 20 días el asedio de casi 14.000 soldados paraguayos del Cnl. Estigarribia. Sin agua y con municiones agotadas, capitularon con honores militares, convirtiéndose en el mayor símbolo de coraje de la guerra.';
    }

    if (q.includes('kundt') || q.includes('hans kundt') || (contextCodigo === 'kundt-1932')) {
      return 'El General alemán Hans Kundt fue convocado en diciembre de 1932 por el presidente Daniel Salamanca tras la caída de Boquerón. Veterano de la Primera Guerra Mundial, aplicó tácticas prusianas de asalto frontal masivo. Sin embargo, estas doctrinas no se adaptaron a la agreste geografía chaqueña ni a la guerra de maniobra paraguaya, culminando en el desastre de Campo Vía en 1933.';
    }

    if (q.includes('nanawa') || (contextCodigo === 'nanawa-1933')) {
      return 'La Batalla de Nanawa (julio de 1933) fue conocida como "El Verdún Sudamericano". El general Kundt lanzó un asalto masivo con artillería pesada, bombardeo aéreo, minas subterráneas y tanques ligeros Vickers contra las posiciones paraguayas del Cnl. Luis Irrazábal, sufriendo miles de bajas ante una defensa inexpugnable.';
    }

    if (q.includes('campo via') || q.includes('campo vía') || (contextCodigo === 'campo-via-1933')) {
      return 'La Maniobra de Campo Vía (diciembre de 1933) fue una brillante operación envolvente del general paraguayo Estigarribia. Dos divisiones bolivianas (4.ª y 9.ª), con más de 7.500 soldados, quedaron cercadas en los cañadones chaqueños sin agua ni pertrechos, viéndose forzadas a rendirse. Provocó la destitución inmediata de Hans Kundt.';
    }

    if (q.includes('el carmen') || (contextCodigo === 'el-carmen-1934') || q.includes('corralito') || q.includes('salamanca')) {
      return 'En la Batalla de El Carmen (noviembre de 1934), una maniobra sorpresiva paraguaya cercó a más de 4.000 soldados bolivianos en el sector central. La conmoción política llevó al "Corralito de Villamontes", donde el alto mando militar destituyó al presidente civil Daniel Salamanca mientras visitaba el cuartel.';
    }

    if (q.includes('ingavi') || q.includes('pozo del tigre') || q.includes('paz') || (contextCodigo === 'ingavi-1935')) {
      return 'La Batalla de Pozo del Tigre – Ingavi (mayo–junio de 1935) fue el último choque de gran envergadura en el sector norte. Con ambos países exhaustos, el 12 de junio de 1935 se firmó el Protocolo de Paz en Buenos Aires y el cese al fuego definitivo se dio el 14 de junio a las 12:00.';
    }

    if (q.includes('pitiantuta') || (contextCodigo === 'junio-1932') || q.includes('inicio') || q.includes('laguna')) {
      return 'El Incidente de Laguna Pitiantuta (junio de 1932) comenzó cuando la patrulla boliviana del Mayor Óscar Moscoso tomó el fortín paraguayo Carlos Antonio López en Laguna Chuquisaca. La posterior retoma paraguaya y la orden boliviana de represalia detonaron la guerra abierta.';
    }

    return `Respecto a "${query}": La Guerra del Chaco (1932–1935) enfrentó a Bolivia y Paraguay por el control del Chaco Boreal. Fue el conflicto bélico más sangriento de Sudamérica en el siglo XX, marcado por la escasez de agua, calor abrasador y combates de trincheras en torno a fortines estratégicos. Puedes explorar los 7 hitos en la línea de tiempo lateral.`;
  }
}
