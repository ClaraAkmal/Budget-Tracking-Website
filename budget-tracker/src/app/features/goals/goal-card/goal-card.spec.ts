import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalCard } from './goal-card';

describe('GoalCard', () => {
  let component: GoalCard;
  let fixture: ComponentFixture<GoalCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GoalCard],
    }).compileComponents();

    fixture = TestBed.createComponent(GoalCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
