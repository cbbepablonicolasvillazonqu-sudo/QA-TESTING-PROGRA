import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { TimelineComponent } from './timeline';
import { HitosService } from '../../core/services/hitos.service';
import { Hito } from '../../core/models/hito.model';

@Component({ template: '' })
class DummyComponent {}

describe('TimelineComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;
  let hitosService: HitosService;
  let router: Router;

  const sampleHitos: Hito[] = [
    {
      id: 1,
      codigo_linea_tiempo: 'junio-1932',
      descripcion: 'Incidente Pitiantuta',
      texto: 'Desc 1',
      foto: '/imgs/pitiantuta_1932.jpg',
      video: '/videos/pitiantuta.mp4',
      voz: '/voz/pitiantuta_1932.mp3',
      titulo: 'Laguna Pitiantuta'
    },
    {
      id: 2,
      codigo_linea_tiempo: 'boqueron-1932',
      descripcion: 'Batalla de Boqueron',
      texto: 'Desc 2',
      foto: '/imgs/boqueron_1932.jpg',
      video: '/videos/boqueron.mp4',
      voz: '/voz/boqueron_1932.mp3',
      titulo: 'Boquerón'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'hito/:codigo', component: DummyComponent }]),
        HitosService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    hitosService = TestBed.inject(HitosService);
    hitosService.hitos.set(sampleHitos);
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe renderizar la lista de hitos', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('[role="listitem"]');
    expect(items.length).toBe(2);
    expect(compiled.textContent).toContain('Laguna Pitiantuta');
    expect(compiled.textContent).toContain('Boquerón');
  });

  it('debe emitir closeTimeline y navegar al seleccionar un hito', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    let emitted = false;
    component.closeTimeline.subscribe(() => {
      emitted = true;
    });

    component.selectHito('boqueron-1932');
    expect(emitted).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith(['/hito', 'boqueron-1932']);
  });
});
