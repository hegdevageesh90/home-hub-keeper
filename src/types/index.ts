
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface HomeProfile {
  id: string;
  address: string;
  constructionYear: number;
  userId: string;
  images?: string[];
}

export enum ApplianceCategory {
  HVAC = "HVAC",
  PLUMBING = "Plumbing",
  ELECTRICAL = "Electrical",
  KITCHEN = "Kitchen",
  LAUNDRY = "Laundry",
  ENTERTAINMENT = "Entertainment",
  OTHER = "Other"
}

export interface Appliance {
  id: string;
  name: string;
  category: ApplianceCategory;
  purchaseDate: string;
  warrantyExpirationDate: string;
  warrantyDocument?: string;
  notes?: string;
  homeProfileId: string;
}

export enum ServiceType {
  REPAIR = "Repair",
  MAINTENANCE = "Maintenance",
  REPLACEMENT = "Replacement"
}

export interface ServiceRecord {
  id: string;
  applianceId: string;
  date: string;
  serviceType: ServiceType;
  providerName: string;
  providerContact?: string;
  cost: number;
  notes?: string;
  invoiceDocument?: string;
}

export interface MaintenanceReminder {
  id: string;
  applianceId: string;
  title: string;
  description?: string;
  dueDate: string;
  recurring: boolean;
  recurrencePattern?: string; // e.g. "6M" for 6 months
  completed: boolean;
}

export interface DashboardStats {
  totalAppliances: number;
  upcomingReminders: MaintenanceReminder[];
  expiringWarranties: Appliance[];
  recentServiceRecords: ServiceRecord[];
}
