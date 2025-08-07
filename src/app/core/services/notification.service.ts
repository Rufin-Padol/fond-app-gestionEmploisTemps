import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notifications {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
 private notificationsSubject = new BehaviorSubject<Notifications[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  showSuccess(message: string, duration: number = 5000): void {
    this.addNotification({
      type: 'success',
      message,
      duration
    });
  }

  showError(message: string, duration: number = 7000): void {
    this.addNotification({
      type: 'error',
      message,
      duration
    });
  }

  showInfo(message: string, duration: number = 5000): void {
    this.addNotification({
      type: 'info',
      message,
      duration
    });
  }

  showWarning(message: string, duration: number = 5000): void {
    this.addNotification({
      type: 'warning',
      message,
      duration
    });
  }

  private addNotification(notification: Omit<Notifications, 'id'>): void {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notifications = { ...notification, id };
    
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, newNotification]);

    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, notification.duration);
    }
  }

  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(filteredNotifications);
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
  }
}