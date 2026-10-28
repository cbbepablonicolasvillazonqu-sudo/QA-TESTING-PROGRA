import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HitosService } from './hitos.service';
import { Hito } from '../models/hito.model';

describe('HitosService', () => {
  let service: HitosService;
  let httpMock: HttpTestingController;

  const mockHitos: Hito[] = [
    {
      id: 1,
      codigo_linea_tiempo: 'junio-1932',
      descripcion: 'Incidente Pitiantuta',
      texto: 'Texto de prueba 1',
      foto: '/imgs/pitiantuta_1932.jpg',
      video: '/videos/pitiantuta.mp4',
      voz: '/voz/pitiantuta_1932.mp3',
      titulo: 'Laguna Pitiantuta'
    },
    {
      id: 2,
      codigo_linea_tiempo: 'boqueron-1932',
      descripcion: 'Batalla de Boqueron',
      texto: 'Texto de prueba 2',
      foto: '/imgs/boqueron_1932.jpg',
      video: '/videos/boqueron.mp4',
      voz: '/voz/boqueron_1932.mp3',
      titulo: 'Boquerón'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HitosService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(HitosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe cargar los hitos locales por defecto desde /data/hitos.json', () => {
    service.loadHitos().subscribe((data) => {
      expect(data.length).toBe(2);
      expect(data[0].codigo_linea_tiempo).toBe('junio-1932');
    });

    const req = httpMock.expectOne('/data/hitos.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockHitos);

    expect(service.hitos().length).toBe(2);
    expect(service.loading()).toBe(false);
  });

  it('debe conmutar a la API REST cuando useMockApi sea false', () => {
    service.setUseMockApi(false);
    expect(service.useMockApi()).toBe(false);

    const req = httpMock.expectOne('http://localhost:3000/api/hitos');
    expect(req.request.method).toBe('GET');
    req.flush(mockHitos);
  });

  it('debe encontrar hito por codigo_linea_tiempo', () => {
    service.hitos.set(mockHitos);
    service.getHitoByCodigo('boqueron-1932').subscribe((item) => {
      expect(item).toBeTruthy();
      expect(item?.titulo).toBe('Boquerón');
    });
  });

  it('debe devolver siguiente y anterior correctamente', () => {
    service.hitos.set(mockHitos);
    const next = service.getNextHito('junio-1932');
    expect(next?.codigo_linea_tiempo).toBe('boqueron-1932');

    const prev = service.getPreviousHito('boqueron-1932');
    expect(prev?.codigo_linea_tiempo).toBe('junio-1932');
  });

  it('debe manejar errores de red y actualizar el signal de error', () => {
    service.loadHitos().subscribe({
      next: () => {},
      error: (err) => {
        expect(err).toBeTruthy();
      }
    });

    const req = httpMock.expectOne('/data/hitos.json');
    req.error(new ProgressEvent('Network error'));

    expect(service.error()).toBeTruthy();
    expect(service.loading()).toBe(false);
  });
});
