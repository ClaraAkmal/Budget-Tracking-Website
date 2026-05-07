import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: false,
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  messages: ToastMessage[] = [];
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.messages$.subscribe(msgs => {
      this.messages = msgs;
    });
  }

  dismiss(id: number): void {
    this.toastService.remove(id);
  }

  getIcon(severity: string): string {
    switch (severity) {
      case 'success': return '✓';
      case 'error':   return '✕';
      case 'warn':    return '⚠';
      default:        return 'ℹ';
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}