export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone?: string | null;
  specialty?: string | null;
  licenseNumber?: string | null;
  roles: string[];
  isActive: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  fullName?: string;
  cin?: string;
  phone: string;
  email?: string;
  birthDate?: string;
  age?: number;
  gender?: string;
  address?: string;
  city?: string;
  bloodType?: string;
  medicalHistory?: string;
  allergies?: string;
  chronicConditions?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: number;
  patient: Patient;
  doctor: User;
  startAt: string;
  endAt: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  type: 'CONSULTATION' | 'FOLLOW_UP' | 'EXAMINATION' | 'EMERGENCY';
  reason?: string;
  notes?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  id: number;
  patient: Patient;
  doctor: User;
  appointment?: Appointment;
  reason: string;
  anamnesis?: string;
  examination?: string;
  diagnosis?: string;
  notes?: string;
  recommendations?: string;
  bloodPressure?: string;
  weight?: string;
  temperature?: string;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
  prescriptions?: Prescription[];
  invoice?: Invoice;
}

export interface Prescription {
  id: number;
  consultation: Consultation;
  medicationName: string;
  dosage?: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  quantity?: number;
  pharmaceuticalForm?: string;
  isRenewable: boolean;
  renewalsCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  consultation?: Consultation;
  patient: Patient;
  invoiceDate: string;
  dueDate?: string;
  subtotal: string;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  paidAmount: string;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
  payments?: Payment[];
  balance?: string;
}

export interface InvoiceItem {
  id: number;
  description: string;
  code?: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  taxRate?: number;
  taxAmount: string;
  discountPercent?: string;
}

export interface Payment {
  id: number;
  invoice: Invoice;
  amount: string;
  paymentMethod: 'CASH' | 'CARD' | 'CHECK' | 'TRANSFER' | 'INSURANCE' | 'MOBILE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentDate: string;
  transactionReference?: string;
  checkNumber?: string;
  bankName?: string;
  notes?: string;
  receivedBy?: User;
  createdAt: string;
}

export interface DashboardStats {
  patients: {
    total: number;
    newThisMonth: number;
    newToday: number;
  };
  appointments: {
    today: number;
    thisMonth: {
      total: number;
      completed: number;
      cancelled: number;
    };
  };
  consultations: {
    today: number;
    thisMonth: {
      total: number;
      completed: number;
      inProgress: number;
      unpaid: number;
    };
  };
  invoices: {
    thisMonth: {
      totalCount: number;
      totalAmount: number;
      paidCount: number;
      paidAmount: number;
      unpaidAmount: number;
      overdueCount: number;
    };
    unpaidCount: number;
    unpaidAmount: number;
  };
  payments: {
    thisMonth: {
      totalCount: number;
      totalAmount: number;
    };
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
