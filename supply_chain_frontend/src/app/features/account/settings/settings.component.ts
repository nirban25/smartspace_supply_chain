
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
type NotificationsPref = {
  email: boolean;
  sms: boolean;
  inApp: boolean;
};

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  /** -------- Display / Home options -------- */
  kpiStrip = true;
  showHazmatNote = true;
  compactQuickLinks = false;

  /** -------- New settings (ensure they exist for template) -------- */
  notifications: NotificationsPref = {
    email: true,
    sms: false,
    inApp: true,
  };

  language = 'en'; // 'en' | 'hi' | 'ta' etc.
  showAdvancedAnalytics = false;
  autoRefreshDashboard = true;
  increaseFontSize = false;

}
