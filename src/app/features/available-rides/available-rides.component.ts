import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ride } from '../../model';
import { RideService } from '../../services/ride.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-available-rides',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './available-rides.component.html',
  styleUrl: './available-rides.component.css'
})
export class AvailableRidesComponent implements OnInit {
  rides: Ride[] = [];
  bookingEmployeeId = '';
  filterType = 'All';
  message = '';
  error = '';

  constructor(private rideService: RideService, private router:Router) {}

  ngOnInit() {
    this.load();
    this.rideService.rideChanged.subscribe(() => {
    this.load();
    });
  }

  goBack() {
  this.router.navigate(['/add-ride']);
  }

  load() {
    this.rides = this.filterType === 'All'
      ? this.rideService.getAvailableRides()
      : this.rideService.getAvailableRides(this.filterType as any);
  }

  bookRide(rideId: string) {
    if (!this.bookingEmployeeId.trim()) {
      this.error = 'Enter employee ID';
      return;
    }

    try {
      this.rideService.bookRide(rideId, this.bookingEmployeeId.trim());
      this.message = 'Ride booked successfully!';
      setTimeout(() => {
        this.message='';
      }, 3000);
      this.load(); 
    } catch (err:any) {
      this.error = err.message;
      setTimeout(() => {
      this.error = '';
      }, 3000);
    }
  }
}



