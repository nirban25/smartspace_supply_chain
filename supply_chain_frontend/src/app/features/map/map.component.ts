import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  error = '';
  private map: any;
  private marker: any;

  async ngAfterViewInit() {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      const L = await import('leaflet');

      navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          if (!this.map) {
            this.map = L.map('map').setView([lat, lng], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);

            this.marker = L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
              })
            }).addTo(this.map).bindPopup('You are here!');
          } else {
            this.map.setView([lat, lng], this.map.getZoom());
            this.marker.setLatLng([lat, lng]);
          }
        },
        (err) => setTimeout(() => this.error = 'Unable to retrieve your location: ' + err.message)
      );
    } else {
      setTimeout(() => this.error = 'Geolocation is not supported by this browser.');
    }
  }
}
