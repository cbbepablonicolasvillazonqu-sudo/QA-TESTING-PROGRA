import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { Hito } from '../models/hito.model';
import { environment } from '../../../environments/environment';

/**
 * Servicio principal para la gestión y consulta de hitos históricos de la Guerra del Chaco.
 * Soporta alternar dinámicamente entre datos locales mock (/data/hitos.json)
 * y una API REST externa (http://localhost:3000/api/hitos).
 */
@Injectable({
  providedIn: 'root'
})
export class HitosService {
  private readonly http = inject(HttpClient);

  /** Lista reactiva de hitos cargados */
  readonly hitos = signal<Hito[]>([]);

  /** Hito actualmente seleccionado en la línea de tiempo */
  readonly selectedHito = signal<Hito | null>(null);

  /** Estado de carga de peticiones */
  readonly loading = signal<boolean>(false);

  /** Mensaje de error en caso de fallo */
  readonly error = signal<string | null>(null);

  /** Flag para determinar si se usa el archivo mock local o la API */
  readonly useMockApi = signal<boolean>(environment.useMockApi);

  /**
   * Modifica el origen de datos (Mock local vs API REST) y recarga los hitos.
   * @param useMock Booleano indicando si usar mock JSON
   */
  setUseMockApi(useMock: boolean): void {
    this.useMockApi.set(useMock);
    this.loadHitos().subscribe();
  }

  /**
   * Carga la colección completa de los 7 hitos históricos.
   * Utiliza primero el archivo `/data/hitos.json` o la API en `http://localhost:3000/api/hitos`.
   * @returns Observable con la lista de hitos
   */
  loadHitos(): Observable<Hito[]> {
    this.loading.set(true);
    this.error.set(null);

    const url = this.useMockApi()
      ? '/data/hitos.json'
      : `${environment.apiUrl}/hitos`;

    return this.http.get<Hito[]>(url).pipe(
      tap((data) => {
        // Asegurar orden cronológico por ID
        const sorted = [...data].sort((a, b) => a.id - b.id);
        this.hitos.set(sorted);
        this.loading.set(false);
      }),
      catchError((err) => {
        const errorMsg = this.useMockApi()
          ? 'Error al cargar los datos históricos locales (/data/hitos.json).'
          : `Error al conectar con la API REST (${url}). Asegúrate de que el servidor en el puerto 3000 esté activo.`;
        this.error.set(errorMsg);
        this.loading.set(false);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  /**
   * Obtiene un hito específico buscando por su `codigo_linea_tiempo`.
   * Si la lista aún no ha sido cargada, la solicita automáticamente.
   * @param codigo Código identificador (ej: "boqueron-1932")
   * @returns Observable con el hito o undefined si no existe
   */
  getHitoByCodigo(codigo: string): Observable<Hito | undefined> {
    if (this.hitos().length > 0) {
      const found = this.hitos().find((h) => h.codigo_linea_tiempo === codigo);
      this.selectedHito.set(found ?? null);
      return of(found);
    }

    return this.loadHitos().pipe(
      map((list) => {
        const found = list.find((h) => h.codigo_linea_tiempo === codigo);
        this.selectedHito.set(found ?? null);
        return found;
      })
    );
  }

  /**
   * Obtiene el siguiente hito en la cronología.
   * @param codigo Código del hito actual
   * @returns Hito siguiente o undefined si es el último
   */
  getNextHito(codigo: string): Hito | undefined {
    const list = this.hitos();
    const idx = list.findIndex((h) => h.codigo_linea_tiempo === codigo);
    if (idx >= 0 && idx < list.length - 1) {
      return list[idx + 1];
    }
    return undefined;
  }

  /**
   * Obtiene el hito anterior en la cronología.
   * @param codigo Código del hito actual
   * @returns Hito anterior o undefined si es el primero
   */
  getPreviousHito(codigo: string): Hito | undefined {
    const list = this.hitos();
    const idx = list.findIndex((h) => h.codigo_linea_tiempo === codigo);
    if (idx > 0) {
      return list[idx - 1];
    }
    return undefined;
  }
}
