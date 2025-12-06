import { Routes } from '@angular/router';
import { AddRideComponent } from './features/add-ride/add-ride.component';
import { AvailableRidesComponent } from './features/available-rides/available-rides.component';

export const routes: Routes = [
    {path:'',redirectTo:'add-ride',pathMatch:'full'},
    {path:'add-ride',component:AddRideComponent},
    {path:'available-rides',component:AvailableRidesComponent}
];
