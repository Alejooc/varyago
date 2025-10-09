import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressGoalBar } from './progress-goal-bar';

describe('ProgressGoalBar', () => {
  let component: ProgressGoalBar;
  let fixture: ComponentFixture<ProgressGoalBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressGoalBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressGoalBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
