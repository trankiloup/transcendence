import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyToogleComponent } from './my-toogle.component';

describe('MyToogleComponent', () => {
  let component: MyToogleComponent;
  let fixture: ComponentFixture<MyToogleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MyToogleComponent]
    });
    fixture = TestBed.createComponent(MyToogleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
