import { ComponentType } from "react";

export interface TourStep {
  selector: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  mode?: "view" | "interactive";
  advanceOn?: { event: string; selector: string };
  targetScreen?: string;
  targetTab?: string;
}

export interface ScreenGuide {
  key: string;
  title: string;
  description: string;
  icon: ComponentType<any>;
}

export interface RoleGuide {
  roleName: string;
  roleKey: string;
  description: string;
  colorClass: string;
  actions: string[];
  example: string;
}

export interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

export interface PlaybookTask {
  title: string;
  description: string;
  actionText: string;
  tourType: "workflow" | "view";
  tourKey: string;
}

export interface RolePlaybook {
  roleName: string;
  roleKey: "ADMIN" | "RECEPTIONIST" | "PHYSIO" | "AESTHETICIAN" | "SUPER_ADMIN";
  description: string;
  colorClass: string;
  icon: ComponentType<any>;
  tasks: PlaybookTask[];
}
