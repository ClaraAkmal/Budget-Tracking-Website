import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmOptions {
  message: string;
  header: string;
  acceptLabel?: string;
  rejectLabel?: string;
  onAccept: () => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private stateSubject = new BehaviorSubject<ConfirmOptions | null>(null);
  state$ = this.stateSubject.asObservable();

  get current(): ConfirmOptions | null {
    return this.stateSubject.value;
  }

  confirm(options: ConfirmOptions): void {
    this.stateSubject.next(options);
  }

  accept(): void {
    this.current?.onAccept();
    this.stateSubject.next(null);
  }

  reject(): void {
    this.stateSubject.next(null);
  }
}