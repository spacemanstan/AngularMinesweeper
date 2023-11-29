import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MineFieldComponent } from './mine-field.component';

describe('MineFieldComponent', () => {
  let component: MineFieldComponent;
  let fixture: ComponentFixture<MineFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MineFieldComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MineFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
