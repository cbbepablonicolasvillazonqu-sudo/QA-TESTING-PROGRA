import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HitoDetalleComponent } from './hito-detalle';
import { HitosService } from '../../core/services/hitos.service';
import { Hito } from '../../core/models/hito.model';

describe('HitoDetalleComponent', () => {
  let component: HitoDetalleComponent;
  let fixture: ComponentFixture<HitoDetalleComponent>;
  let hitosService: HitosService;

  const mockHito: Hito = {
    id: 2,
    codigo_linea_tiempo: 'boqueron-1932',
    titulo: 'Batalla de Boquerón',
    fecha: 'Septiembre 1932',
    descripcion: 'Resistencia heroica',
    texto: 'Crónica extensa de Boquerón.\n\nSegundo párrafo histórico.',
    foto: '/imgs/boqueron_1932.jpg',
    video: '/videos/boqueron.mp4',
    voz: '/voz/boqueron_1932.mp3',
    ubicacion: 'Fortín Boquerón'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HitoDetalleComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(new Map([['codigo', 'boqueron-1932']])),
            snapshot: {
              paramMap: {
                get: () => 'boqueron-1932'
              }
            }
          }
        },
        HitosService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HitoDetalleComponent);
    component = fixture.componentInstance;
    hitosService = TestBed.inject(HitosService);
    hitosService.hitos.set([mockHito]);
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe renderizar título, imagen, video y audio', () => {
    component.hito.set(mockHito);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Batalla de Boquerón');
    expect(compiled.textContent).toContain('Resistencia heroica');

    const img = compiled.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('/imgs/boqueron_1932.jpg');
    expect(img?.getAttribute('loading')).toBe('lazy');

    const video = compiled.querySelector('video');
    expect(video).toBeTruthy();
    expect(video?.getAttribute('src')).toBe('/videos/boqueron.mp4');
    expect(video?.getAttribute('preload')).toBe('none');

    const audio = compiled.querySelector('audio');
    expect(audio).toBeTruthy();
    expect(audio?.getAttribute('src')).toBe('/voz/boqueron_1932.mp3');
    expect(audio?.getAttribute('preload')).toBe('none');
  });

  it('debe separar párrafos correctamente con getParagraphs', () => {
    const paragraphs = component.getParagraphs('Párrafo 1\n\nPárrafo 2\n\nPárrafo 3');
    expect(paragraphs.length).toBe(3);
    expect(paragraphs[0]).toBe('Párrafo 1');
  });
});
