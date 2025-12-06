import { Component, OnInit } from '@angular/core';
import { VehicleType } from '../../model';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms'
import { RideService } from '../../services/ride.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-add-ride',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './add-ride.component.html',
  styleUrl: './add-ride.component.css'
})
export class AddRideComponent  implements OnInit{

  vehicleTypes:VehicleType[]=['Car','Bike'];
  message:string='';
  error:string='';
  rideForm!:FormGroup;
  todayMin = '';
  todayMax = '';


  constructor(private fb:FormBuilder, private rideService:RideService, private router:Router){}
  ngOnInit(): void {
     const now = new Date();
     this.todayMin = now.toISOString().slice(0, 16);

     const end = new Date();
     end.setHours(23, 59, 0, 0);
     this.todayMax = end.toISOString().slice(0, 16);
     this.createForm()
  }
  createForm(){
    this.rideForm= this.fb.group({
    ownerEmployeeId:['',Validators.required],
    vehicleType:['Car',Validators.required],
    vehicleNo:['',Validators.required],
    vacantSeats:[0,[Validators.required,Validators.min(1)]],
    time:['',Validators.required],
    pickupPoint:['',Validators.required],
    destination:['',Validators.required]

  })

  }

  submitRide(){
    this.message='';
    this.error='';
    if(this.rideForm.invalid){
      this.rideForm.markAllAsTouched();
      this.error = 'Please fill all required fields';
      return;
    }

    try{
      this.rideService.addRide(this.rideForm.value as any);
      this.message='Ride added successfully!';
      setTimeout(() => {
        this.message='';
      }, 3000);
     
      this.error='';
      this.rideForm.reset({
        vehicleType:'Car',
        vacantSeats:0
      });
    }catch(err:any){
      this.error=err?.message||'Failed to add ride';
      setTimeout(() => {
      this.error = '';
      }, 3000);
    }
  }

  get f(){
    return  this.rideForm.controls;
  }

  goToAvailableRides() {
  this.router.navigate(['/available-rides']);
  }
}
