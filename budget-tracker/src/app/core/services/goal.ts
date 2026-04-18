import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Goal } from '../models/goal.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GoalService {
  private dbUrl = environment.firebase.databaseURL;
  private goalsSubject = new BehaviorSubject<Goal[]>([]);
  goals$ = this.goalsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadGoals(userId: string): void {
    this.http.get<{[key: string]: Goal}>(
      `${this.dbUrl}/users/${userId}/goals.json`
    ).pipe(
      map(data => data ? Object.keys(data).map(k => ({ ...data[k], id: k })) : [])
    ).subscribe(goals => this.goalsSubject.next(goals));
  }

  addGoal(userId: string, goal: Omit<Goal, 'id'>): Observable<any> {
    return this.http.post(`${this.dbUrl}/users/${userId}/goals.json`, goal)
      .pipe(tap(() => this.loadGoals(userId)));
  }

  updateGoal(userId: string, goal: Goal): Observable<any> {
    return this.http.put(`${this.dbUrl}/users/${userId}/goals/${goal.id}.json`, goal)
      .pipe(tap(() => this.loadGoals(userId)));
  }

  deleteGoal(userId: string, id: string): Observable<any> {
    return this.http.delete(`${this.dbUrl}/users/${userId}/goals/${id}.json`)
      .pipe(tap(() => this.loadGoals(userId)));
  }
}