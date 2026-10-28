import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChatbotService } from './chatbot.service';
import { ChatResponse } from '../models/chat.model';

describe('ChatbotService', () => {
  let service: ChatbotService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChatbotService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ChatbotService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crearse correctamente e inicializar con mensaje de bienvenida', () => {
    expect(service).toBeTruthy();
    expect(service.messages().length).toBe(1);
    expect(service.messages()[0].id).toBe('welcome');
  });

  it('debe enviar mensaje a la API NodeJS en /api/chat y recibir respuesta', () => {
    const mockReply: ChatResponse = {
      reply: 'Boquerón fue un hito clave en 1932',
      source: 'NodeJS API'
    };

    service.sendMessage('¿Qué pasó en Boquerón?', 'boqueron-1932').subscribe((reply) => {
      expect(reply).toBe('Boquerón fue un hito clave en 1932');
    });

    const req = httpMock.expectOne('http://localhost:3000/api/chat');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.message).toBe('¿Qué pasó en Boquerón?');
    expect(req.request.body.codigo_linea_tiempo).toBe('boqueron-1932');
    req.flush(mockReply);

    // Usuario + Bot + Mensaje inicial
    expect(service.messages().length).toBe(3);
    expect(service.isTyping()).toBe(false);
  });

  it('debe activar respuesta de contingencia si la API Node no responde', () => {
    service.sendMessage('Háblame sobre Hans Kundt', 'kundt-1932').subscribe((reply) => {
      expect(reply).toContain('Kundt');
    });

    const req = httpMock.expectOne('http://localhost:3000/api/chat');
    req.error(new ProgressEvent('Connection refused'));

    expect(service.lastFailedMessage()).toBeTruthy();
    expect(service.lastError()).toBeTruthy();
    expect(service.isTyping()).toBe(false);
  });

  it('debe alternar visibilidad con toggleChat, openChat y closeChat', () => {
    expect(service.isOpen()).toBe(false);
    service.toggleChat();
    expect(service.isOpen()).toBe(true);
    service.closeChat();
    expect(service.isOpen()).toBe(false);
    service.openChat();
    expect(service.isOpen()).toBe(true);
  });

  it('debe limpiar historial de mensajes con clearHistory', () => {
    service.clearHistory();
    expect(service.messages().length).toBe(1);
    expect(service.lastError()).toBeNull();
  });
});
