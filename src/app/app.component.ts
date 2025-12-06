import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AddRideComponent } from './features/add-ride/add-ride.component';
import { AvailableRidesComponent } from './features/available-rides/available-rides.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,AddRideComponent,AvailableRidesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'transport-facility';
}
