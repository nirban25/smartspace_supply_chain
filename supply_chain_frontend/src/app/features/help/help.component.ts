
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HELP_TOPICS } from './help-topics';
import { HelpTopic } from './help-topic.model';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent {
  helpTopics: HelpTopic[] = HELP_TOPICS;
  searchQuery = '';

  /** ID of the currently expanded topic; ensures only one is open */
  expandedId: string | null = null;

  get filteredTopics(): HelpTopic[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.helpTopics;
    return this.helpTopics.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      (t.troubleshooting?.some(s => s.toLowerCase().includes(q)) ?? false)
    );
  }

  /** Expand inline below the clicked option; collapse if clicked again */
  toggleExpand(topic: HelpTopic) {
    this.expandedId = this.expandedId === topic.id ? null : topic.id;
  }

  /** Close via the inline close button without re‑triggering the li click */
  close(topicId: string, ev?: Event) {
    ev?.stopPropagation();
    if (this.expandedId === topicId) this.expandedId = null;
  }

  /** Keyboard support: Enter/Space toggles expansion */
  onKeyActivate(topic: HelpTopic, ev: KeyboardEvent) {
    const key = ev.key;
    if (key === 'Enter' || key === ' ') {
      ev.preventDefault();
      this.toggleExpand(topic);
    }
  }

  /** Utility for ARIA expanded state */
  isExpanded(topicId: string) {
    return this.expandedId === topicId;
  }
}
