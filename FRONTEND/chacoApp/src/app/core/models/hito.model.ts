export interface Hito {
  id: number;
  codigo_linea_tiempo: string;  // ej. "junio-1932"
  descripcion: string;          // resumen corto
  texto: string;                // descripción larga del hito
  foto: string;                 // "/imgs/pitiantuta_1932.jpg"
  video: string;                // "/videos/pitiantuta.mp4"
  voz: string;                  // "/voz/pitiantuta_1932.mp3"
  titulo?: string;
  fecha?: string;
  ubicacion?: string;
  bajas?: string;
  comandantes?: string[];
}
