import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ChatbotWidgetComponent } from './chatbot';
import { ChatbotService } from '../../core/services/chatbot.service';
import { HitosService } from '../../core/services/hitos.service';

describe('ChatbotWidgetComponent', () => {
  let component: ChatbotWidgetComponent;
  let fixture: ComponentFixture<ChatbotWidgetComponent>;
  let chatbotService: ChatbotService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotWidgetComponent, FormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ChatbotService,
        HitosService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatbotWidgetComponent);
    component = fixture.componentInstance;
    chatbotService = TestBed.inject(ChatbotService);
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe abrir y cerrar el diálogo al llamar toggleChat', () => {
    expect(chatbotService.isOpen()).toBe(false);
    chatbotService.openChat();
    fixture.detectChanges();
    expect(chatbotService.isOpen()).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="dialog"]')).toBeTruthy();

    chatbotService.closeChat();
    fixture.detectChanges();
    expect(compiled.querySelector('[role="dialog"]')).toBeNull();
  });

  it('debe enviar mensaje al hacer submit', () => {
    chatbotService.openChat();
    fixture.detectChanges();

    vi.spyOn(chatbotService, 'sendMessage').mockReturnValue(of('Respuesta de prueba'));
    component.userInput = '¿Qué ocurrió en Nanawa?';
    component.onSubmit();

    expect(chatbotService.sendMessage).toHaveBeenCalledWith('¿Qué ocurrió en Nanawa?', undefined);
    expect(component.userInput).toBe('');
  });

  it('debe cerrar el chat al presionar Escape', () => {
    chatbotService.openChat();
    expect(chatbotService.isOpen()).toBe(true);

    component.onEscape();
    expect(chatbotService.isOpen()).toBe(false);
  });
});
