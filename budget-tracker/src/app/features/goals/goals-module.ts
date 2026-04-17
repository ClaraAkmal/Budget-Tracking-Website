import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Goals } from './goals/goals';
import { GoalCard } from './goal-card/goal-card';

@NgModule({
  declarations: [Goals, GoalCard],
  imports: [CommonModule],
})
export class GoalsModule {}
