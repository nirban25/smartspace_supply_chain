
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  // Minimal placeholders; bind to real data later
  user = {
    name: 'Mahalakshmi V',
    title: 'Engineer - Industrial IoT',
    office: 'Chennai, Tamil Nadu'
  };
}
