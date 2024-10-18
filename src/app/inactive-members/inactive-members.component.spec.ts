import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveMembersComponent } from './inactive-members.component';

describe('InactiveMembersComponent', () => {
  let component: InactiveMembersComponent;
  let fixture: ComponentFixture<InactiveMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InactiveMembersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactiveMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
