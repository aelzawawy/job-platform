import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPostsFormComponent } from './job-posts-form.component';

describe('JobPostsFormComponent', () => {
  let component: JobPostsFormComponent;
  let fixture: ComponentFixture<JobPostsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobPostsFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobPostsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
