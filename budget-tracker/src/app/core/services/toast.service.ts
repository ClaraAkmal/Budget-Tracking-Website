import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: number;
  severity: 'success' | 'error' | 'warn' | 'info';
  summary: string;
  detail: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();
  private counter = 0;

  show(severity: ToastMessage['severity'], summary: string, detail: string): void {
    const id = ++this.counter;
    const current = this.messagesSubject.value;
    this.messagesSubject.next([...current, { id, severity, summary, detail }]);
    setTimeout(() => this.remove(id), 3500);
  }

  success(summary: string, detail: string): void {
    this.show('success', summary, detail);
  }

  error(summary: string, detail: string): void {
    this.show('error', summary, detail);
  }

  warn(summary: string, detail: string): void {
   this.show('warn', summary, detail);
  }

  remove(id: number): void {
    this.messagesSubject.next(
      this.messagesSubject.value.filter(m => m.id !== id)
    );
  }
}