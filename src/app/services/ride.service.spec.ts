import { TestBed } from '@angular/core/testing';
import { RideService } from './ride.service';
import { Ride } from '../model';

describe('RideService', () => {
  let service: RideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RideService);
    // clear localStorage before each test to ensure isolation
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('rides_data');
    }
  });

  afterEach(() => {
    // restore any Date.now spy if used
    if ((Date.now as any).and && (Date.now as any).and.originalFn) {
      (Date.now as any).and.callThrough();
    }
  });

  it('should add a ride for today successfully', () => {
    // set system time to a fixed moment
    const base = new Date('2025-12-06T11:37:00').getTime();
    spyOn(Date, 'now').and.returnValue(base);

    const nowIso = new Date(Number(Date.now())).toISOString().slice(0,16);
    const rideData = {
      ownerEmployeeId: 'E100',
      vehicleType: 'Car' as any,
      vehicleNo: 'KA01AA1111',
      vacantSeats: 2,
      time: nowIso,        // today, current time
      pickupPoint: 'A',
      destination: 'B'
    };

    service.addRide(rideData);
    const all = service.getAllRides();
    expect(all.length).toBe(1);
    expect(all[0].ownerEmployeeId).toBe('E100');
    expect(all[0].vacantSeats).toBe(2);
  });

  it('should not allow adding ride for non-today date', () => {
    const base = new Date('2025-12-06T11:37:00').getTime();
    spyOn(Date, 'now').and.returnValue(base);

    const tomorrowIso = new Date(base + 24*60*60*1000).toISOString().slice(0,16);
    const rideData = {
      ownerEmployeeId: 'E101',
      vehicleType: 'Bike' as any,
      vehicleNo: 'AP01VC0000',
      vacantSeats: 1,
      time: tomorrowIso,
      pickupPoint: 'A',
      destination: 'B'
    };

    expect(() => service.addRide(rideData)).toThrowError(/today only/i);
  });

  it('should prevent same owner adding second ride same day', () => {
    const base = new Date('2025-12-06T11:37:00').getTime();
    spyOn(Date, 'now').and.returnValue(base);
    const nowIso = new Date(base).toISOString().slice(0,16);

    service.addRide({
      ownerEmployeeId: 'E200',
      vehicleType: 'Bike' as any,
      vehicleNo: 'AP01VC1111',
      vacantSeats: 2,
      time: nowIso,
      pickupPoint: 'P',
      destination: 'Q'
    });

    expect(() => service.addRide({
      ownerEmployeeId: 'E200',
      vehicleType: 'Car' as any,
      vehicleNo: 'AP01VC2222',
      vacantSeats: 1,
      time: nowIso,
      pickupPoint: 'X',
      destination: 'Y'
    })).toThrowError(/already added/i);
  });

  it('should book ride, reduce seats and prevent double booking/owner booking', () => {
    const base = new Date('2025-12-06T11:37:00').getTime();
    spyOn(Date, 'now').and.returnValue(base);
    const nowIso = new Date(base).toISOString().slice(0,16);

    service.addRide({
      ownerEmployeeId: 'OWNER1',
      vehicleType: 'Car' as any,
      vehicleNo: 'KA01AA0001',
      vacantSeats: 2,
      time: nowIso,
      pickupPoint: 'A',
      destination: 'B'
    });

    const rides = service.getAllRides();
    expect(rides.length).toBe(1);
    const id = rides[0].id;

    // booking by another employee
    const booked = service.bookRide(id, 'EMP1');
    // bookRide may return void in your implementation; if so fetch again
    const after = service.getAllRides().find(r => r.id === id)!;
    expect(after.vacantSeats).toBe(1);
    expect(after.bookedBy).toContain('EMP1');

    // cannot book again by same employee
    expect(() => service.bookRide(id, 'EMP1')).toThrowError(/already booked/i);

    // owner cannot book
    expect(() => service.bookRide(id, 'OWNER1')).toThrowError(/cannot book your own/i);
  });

  it('getAvailableRides should include rides within ±60 minutes and exclude others', () => {
  jasmine.clock().install();
  jasmine.clock().mockDate(new Date('2025-12-06T12:00:00'));

  const rideAt11_10 = "2025-12-06T11:10"; // within 60 min → show
  const rideAt10_30 = "2025-12-06T10:30"; // 90 min → hide
  const rideAt12_30 = "2025-12-06T12:30"; // within 60 min → show
  const rideAt13_10 = "2025-12-06T13:10"; // 70 min → hide

  service.addRide({ ownerEmployeeId: 'A1', vehicleType: 'Bike', vehicleNo: 'V1', vacantSeats: 1, time: rideAt11_10, pickupPoint: 'p', destination: 'd' });
  service.addRide({ ownerEmployeeId: 'A2', vehicleType: 'Bike', vehicleNo: 'V2', vacantSeats: 1, time: rideAt10_30, pickupPoint: 'p', destination: 'd' });
  service.addRide({ ownerEmployeeId: 'A3', vehicleType: 'Car', vehicleNo: 'V3', vacantSeats: 1, time: rideAt12_30, pickupPoint: 'p', destination: 'd' });
  service.addRide({ ownerEmployeeId: 'A4', vehicleType: 'Car', vehicleNo: 'V4', vacantSeats: 1, time: rideAt13_10, pickupPoint: 'p', destination: 'd' });

  const allNear = service.getAvailableRides();

  expect(allNear.some(r => r.ownerEmployeeId === 'A1')).toBeTrue(); // should be visible
  expect(allNear.some(r => r.ownerEmployeeId === 'A3')).toBeTrue(); // should be visible
  expect(allNear.some(r => r.ownerEmployeeId === 'A2')).toBeFalse(); // too early
  expect(allNear.some(r => r.ownerEmployeeId === 'A4')).toBeFalse(); // too late

  jasmine.clock().uninstall();
});

});
