export type VehicleType='Car'|'Bike';
export interface Ride{
  id:string;
  ownerEmployeeId:string;
  vehicleType:VehicleType;
  vehicleNo:string;
  vacantSeats:number;
  time:string;
  pickupPoint:string;
  destination:string;
  bookedBy:string[];

}