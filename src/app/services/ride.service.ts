import { Injectable } from '@angular/core';
import { Ride,VehicleType } from '../model';
import { Subject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class RideService {

  rideChanged = new Subject<void>();
 

  private STORAGE_KEY="rides_data";
  private Time_Buffer_minutes=60;

  constructor() { }

  private loadRides():Ride[]{
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY)|| '[]');
  }
  
  private saveRides(rides: Ride[]): void {
  if (typeof window === 'undefined') {
    return;
  } else {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rides));
    return;
  }
 }

  private generateId(){
    return 'ride_'+Math.random().toString(36).substring(2,9);
  }

  addRide(data:Omit<Ride,'id'|'bookedBy'>){
    const rides=this.loadRides();
    const rideDate=new Date(data.time);
    const today=new Date();
    if(rideDate.getFullYear() !== today.getFullYear() || rideDate.getMonth()!==today.getMonth()||rideDate.getDate() !== today.getDate()){
      throw new Error('Rides can be added for today only');
    }

    if(rides.some(r=>r.ownerEmployeeId===data.ownerEmployeeId)){
      throw new Error('This employee already added a ride today');
    }

    const newRide:Ride={
      id:this.generateId(),
      bookedBy:[],
      ...data
    };
    rides.push(newRide);
    this.saveRides(rides);
    this.rideChanged.next();
  }


  bookRide(rideId:string,employeeId:string){
    const rides=this.loadRides();
    const ride=rides.find(r=>r.id===rideId);

    if(!ride)throw new Error('Ride not found');
    if(ride.ownerEmployeeId===employeeId)throw new Error('you cannot book your own ride');

    if(ride.bookedBy.includes(employeeId))throw new Error('you already booked this ride');

    if(ride.vacantSeats<=0)throw new Error('no seats available');
    ride.vacantSeats-=1;
    ride.bookedBy.push(employeeId);
    this.saveRides(rides)
  }




private toLocalDate(dt: string): Date {
  // dt format "YYYY-MM-DDTHH:mm"
  const [date, time] = dt.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  const d = new Date();
  d.setFullYear(year);
  d.setMonth(month - 1);
  d.setDate(day);
  d.setHours(hour, minute, 0, 0);
  return d;
}

getAvailableRides(vehicleType?: VehicleType) {
  const rides = this.loadRides();
  const now = new Date();

  return rides.filter(r => {
    const rideTime = this.toLocalDate(r.time);

    const diff = Math.abs(rideTime.getTime() - now.getTime()) / 60000;
    const withinBuffer = diff <= this.Time_Buffer_minutes;
    const typeMatch = vehicleType ? r.vehicleType === vehicleType : true;

    return withinBuffer && typeMatch && r.vacantSeats > 0;
  });
}



  getAllRides(){
    return this.loadRides();
  }



}
