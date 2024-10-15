import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInstrumentComponent } from './add-instrument.component';

describe('AddInstrumentComponent', () => {
  let component: AddInstrumentComponent;
  let fixture: ComponentFixture<AddInstrumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddInstrumentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInstrumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
