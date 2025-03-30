import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployersSignupComponent } from './employers-signup.component';

describe('EmployersSignupComponent', () => {
  let component: EmployersSignupComponent;
  let fixture: ComponentFixture<EmployersSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployersSignupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployersSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
