import { AddRideComponent } from './add-ride.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RideService } from '../../services/ride.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('AddRideComponent', () => {
  let comp: AddRideComponent;
  let fixture: ComponentFixture<AddRideComponent>;
  let rideServiceSpy: jasmine.SpyObj<RideService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('RideService', ['addRide']);
    await TestBed.configureTestingModule({
      imports: [AddRideComponent],
      providers: [{ provide: RideService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AddRideComponent);
    comp = fixture.componentInstance;
    rideServiceSpy = TestBed.inject(RideService) as jasmine.SpyObj<RideService>;
    fixture.detectChanges();
  });

  it('should not call addRide when form invalid', () => {
    comp.rideForm.patchValue({ ownerEmployeeId: '', vehicleNo: '' }); // invalid
    comp.submitRide();
    expect(rideServiceSpy.addRide).not.toHaveBeenCalled();
    expect(comp.error).toBeTruthy();
  });

  it('should call addRide when form valid', () => {
    // set up valid values (ensure time is today; may need spyOn Date.now)
    comp.rideForm.patchValue({
      ownerEmployeeId: 'E1', vehicleType: 'Car', vehicleNo: 'V1',
      vacantSeats: 1, time: new Date().toISOString().slice(0,16), pickupPoint: 'p', destination: 'd'
    });
    comp.submitRide();
    expect(rideServiceSpy.addRide).toHaveBeenCalled();
  });
});
