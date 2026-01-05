export interface HelpTopic {
  id: string;
  title: string;
  summary: string;
  sources: string[];
  rules: string[];
  troubleshooting?: string[];
  links?: { text: string; route: string }[];
}
