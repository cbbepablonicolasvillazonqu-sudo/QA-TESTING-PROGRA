import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header';
import { TimelineComponent } from './features/timeline/timeline';
import { ChatbotWidgetComponent } from './features/chatbot/chatbot';
import { HitosService } from './core/services/hitos.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    TimelineComponent,
    ChatbotWidgetComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  readonly hitosService = inject(HitosService);

  /** Controla si la línea de tiempo está visible en pantallas móviles / desktop */
  readonly isTimelineOpen = signal<boolean>(true);

  ngOnInit(): void {
    // Carga inicial de los 7 hitos
    this.hitosService.loadHitos().subscribe();
  }

  toggleTimeline(): void {
    this.isTimelineOpen.update((v) => !v);
  }

  closeTimeline(): void {
    this.isTimelineOpen.set(false);
  }
}
