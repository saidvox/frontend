import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { EMPTY, Observable, retry, timer } from 'rxjs';

import { apiUrl } from '../config/api.config';
import { RealtimeMessage } from '../models/realtime.model';
import { AuthService } from './auth.service';

interface RealtimeOptions {
  auth?: boolean;
}

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);

  events(path: string, options: RealtimeOptions = {}): Observable<RealtimeMessage> {
    if (!isPlatformBrowser(this.platformId)) {
      return EMPTY;
    }

    return new Observable<RealtimeMessage>((subscriber) => {
      const controller = new AbortController();
      const headers: Record<string, string> = {
        Accept: 'text/event-stream',
      };

      if (options.auth) {
        const token = this.authService.token();
        if (!token) {
          subscriber.complete();
          return undefined;
        }

        headers['Authorization'] = `Bearer ${token}`;
      }

      void this.openStream(path, headers, controller, (message) => subscriber.next(message))
        .then(() => {
          if (!controller.signal.aborted) {
            subscriber.error(new Error('Realtime connection closed'));
          }
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) {
            subscriber.error(error);
          }
        });

      return () => controller.abort();
    }).pipe(
      retry({
        delay: () => timer(3000),
      }),
    );
  }

  private async openStream(
    path: string,
    headers: Record<string, string>,
    controller: AbortController,
    emit: (message: RealtimeMessage) => void,
  ): Promise<void> {
    const response = await fetch(apiUrl(path), {
      headers,
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`Realtime connection failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (!controller.signal.aborted) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, '\n');

      let separatorIndex = buffer.indexOf('\n\n');
      while (separatorIndex >= 0) {
        const rawEvent = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(separatorIndex + 2);
        separatorIndex = buffer.indexOf('\n\n');

        const message = this.parseMessage(rawEvent);
        if (message) {
          emit(message);
        }
      }
    }
  }

  private parseMessage(rawEvent: string): RealtimeMessage | null {
    const data = rawEvent
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .join('\n');

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as RealtimeMessage;
    } catch {
      return null;
    }
  }
}
