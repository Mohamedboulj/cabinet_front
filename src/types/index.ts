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
  currency?: string;
  password?: string;
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
  consultations?: Consultation[];
  appointments?: Appointment[];
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
  type: 'CONSULTATION' | 'FOLLOW_UP' | 'EXAMINATION' | 'EMERGENCY' | 'PRENATAL' | 'POSTPARTUM';
  reason?: string;
  notes?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  pregnancy?: Pregnancy | null;
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  id: number;
  referenceNumber: string
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

export interface Holiday {
  description: string;
  day: number;
  month: number;
  date: string;
  holiday_type: 'National' | 'Religious' | 'Exceptional';
  country_code: string;
  status: string;
}

export interface AuditLog {
  id: number;
  action: 'CREATE' | 'UPDATE' | 'IMPORT' | 'DELETE';
  entityType: string;
  entityId: number;
  description: string;
  userEmail: string;
  user: string;
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Pregnancy follow-up module
// ---------------------------------------------------------------------------

export type PregnancyStatus = 'ONGOING' | 'COMPLETED' | 'MISCARRIED' | 'TERMINATED' | 'LOST_TO_FOLLOW_UP';
export type EddSource = 'LMP' | 'ULTRASOUND' | 'CLINICAL';
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH';
export type Rhesus = 'POSITIVE' | 'NEGATIVE';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type FetalMovements = 'PRESENT' | 'REDUCED' | 'ABSENT';
export type FetalPresentation = 'CEPHALIC' | 'BREECH' | 'TRANSVERSE' | 'UNKNOWN';
export type EdemaLevel = 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE';
export type ProteinuriaGlycosuriaLevel = 'NEGATIVE' | 'TRACE' | 'ONE_PLUS' | 'TWO_PLUS' | 'THREE_PLUS';

export type UltrasoundType = 'DATING' | 'NUCHAL_TRANSLUCENCY' | 'MORPHOLOGY' | 'GROWTH' | 'DOPPLER' | 'OTHER';
export type AmnioticFluid = 'NORMAL' | 'OLIGOHYDRAMNIOS' | 'POLYHYDRAMNIOS';

export type ObstetricLabCategory = 'BLOOD_GROUP' | 'SEROLOGY' | 'CBC' | 'GLUCOSE' | 'URINE' | 'OTHER';
export type ObstetricLabResult = 'PENDING' | 'NORMAL' | 'ABNORMAL' | 'POSITIVE' | 'NEGATIVE' | 'IMMUNE' | 'NOT_IMMUNE';

export type DeliveryMode = 'VAGINAL_SPONTANEOUS' | 'VAGINAL_INSTRUMENTAL' | 'CESAREAN_PLANNED' | 'CESAREAN_EMERGENCY';
export type DeliveryAnesthesia = 'NONE' | 'LOCAL' | 'EPIDURAL' | 'SPINAL' | 'GENERAL';
export type DeliveryOutcome = 'LIVE_BIRTH' | 'STILLBIRTH' | 'NEONATAL_DEATH';
export type TermCategory = 'PRETERM' | 'TERM' | 'POST_TERM';
export type PerinealTear = 'NONE' | string;

export type NewbornSex = 'M' | 'F';
export type FeedingType = 'BREAST' | 'FORMULA' | 'MIXED';

export type UterineInvolution = 'NORMAL' | 'DELAYED';
export type Lochia = 'NORMAL' | 'ABNORMAL';

export type ImmunizationType = 'INFLUENZA' | 'COVID' | 'ANTI_D';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface GestationalAge {
  weeks: number;
  days: number;
  totalDays: number;
  text: string; // e.g. "32+4"
}

export interface PregnancyMinimal {
  id: number;
  referenceNumber: string;
  patient: Patient;
  status: PregnancyStatus;
  edd: string;
  riskLevel: RiskLevel;
}

export interface Pregnancy {
  id: number;
  referenceNumber: string;
  patient: Patient;
  doctor: User;
  status: PregnancyStatus;
  lmp: string;
  edd: string;
  eddSource: EddSource;
  gravida: number;
  para: number;
  abortions: number;
  livingChildren: number;
  isMultiple: boolean;
  fetusCount: number;
  bloodGroup?: BloodGroup | null;
  rhesus?: Rhesus | null;
  riskLevel: RiskLevel;
  riskFactors: string[];
  prePregnancyWeight?: string | null;
  height?: string | null;
  obstetricHistoryNotes?: string | null;
  medicalHistoryNotes?: string | null;
  closedAt?: string | null;
  closureReason?: string | null;
  createdAt: string;
  updatedAt: string;

  // Computed, read-only
  gestationalAge: GestationalAge;
  trimester: 1 | 2 | 3;
  daysRemaining: number;
  bmi: number | null;

  // Embedded on GET /{id}
  prenatalVisits?: PrenatalVisit[];
  ultrasounds?: Ultrasound[];
  labs?: ObstetricLab[];
  postpartumVisits?: PostpartumVisit[];
  immunizations?: PregnancyImmunization[];
  documents?: MedicalDocument[];
  deliveryRecord?: DeliveryRecord | null;
}

export interface PrenatalVisit {
  id: number;
  pregnancy?: Pregnancy;
  visitDate: string;
  consultationId?: number | null;
  doctor?: User;
  visitNumber: number; // server-assigned
  gestationalWeeks: number; // server-assigned
  gestationalDays: number; // server-assigned
  weight?: string | null;
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
  bloodPressureLabel?: string | null; // computed, e.g. "118/74"
  fundalHeight?: string | null;
  fetalHeartRate?: number | null;
  fetalMovements?: FetalMovements | null;
  fetalPresentation?: FetalPresentation | null;
  edema?: EdemaLevel | null;
  proteinuria?: ProteinuriaGlycosuriaLevel | null;
  glycosuria?: ProteinuriaGlycosuriaLevel | null;
  uterineContractions?: boolean | null;
  cervixExam?: string | null;
  complaints?: string | null;
  examination?: string | null;
  diagnosis?: string | null;
  recommendations?: string | null;
  notes?: string | null;
  nextVisitDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ultrasound {
  id: number;
  pregnancy?: Pregnancy;
  type: UltrasoundType;
  performedAt: string;
  prenatalVisitId?: number | null;
  performedBy?: string | null;
  fetusLabel?: string | null;
  crl?: string | null;
  bpd?: string | null;
  hc?: string | null;
  ac?: string | null;
  fl?: string | null;
  efw?: string | null; // auto-computed (Hadlock) when ac+fl present and not sent
  efwPercentile?: number | null;
  nuchalTranslucency?: string | null;
  amnioticFluidIndex?: string | null;
  amnioticFluid?: AmnioticFluid | null;
  placentaLocation?: string | null;
  placentaGrade?: string | null;
  presentation?: UltrasoundPresentation | null;
  fetalHeartRate?: number | null;
  cervicalLength?: string | null;
  dopplerUmbilicalPi?: string | null;
  dopplerNotes?: string | null;
  findings?: string | null;
  conclusion?: string | null;
  isNormal?: boolean | null;
  correctedEdd?: string | null;
  gestationalWeeks: number; // derived from performedAt
  gestationalDays: number; // derived from performedAt
  createdAt: string;
  updatedAt: string;
}

export type UltrasoundPresentation = FetalPresentation;

export interface ObstetricLabCatalogItem {
  code: string;
  name: string;
  category: ObstetricLabCategory;
  trimester: 1 | 2 | 3;
  mandatory: boolean;
}

export interface ObstetricLab {
  id: number;
  pregnancy?: Pregnancy;
  category: ObstetricLabCategory;
  testCode: string;
  testName: string;
  prescribedAt?: string | null;
  gestationalWeeks?: number | null;
  value?: string | null;
  unit?: string | null;
  referenceRange?: string | null;
  result: ObstetricLabResult;
  resultAt?: string | null;
  isCritical?: boolean | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryRecord {
  id: number;
  pregnancy?: Pregnancy;
  deliveryAt: string;
  mode: DeliveryMode;
  gestationalWeeksAtBirth: number;
  gestationalDaysAtBirth?: number | null;
  place?: string | null;
  attendedBy?: string | null;
  indication?: string | null;
  laborDurationMinutes?: number | null;
  anesthesia?: DeliveryAnesthesia | null;
  episiotomy?: boolean | null;
  perinealTear?: PerinealTear | null;
  bloodLossMl?: number | null;
  complications?: string | null;
  outcome: DeliveryOutcome;
  termCategory: TermCategory; // read-only, computed
  newborns: Newborn[];
  createdAt: string;
  updatedAt: string;
}

export interface Newborn {
  id: number;
  delivery?: DeliveryRecord;
  birthOrder: number;
  sex: NewbornSex;
  weightGrams: number;
  lengthCm?: string | null;
  headCircumferenceCm?: string | null;
  apgar1?: number | null;
  apgar5?: number | null;
  apgar10?: number | null;
  isAlive: boolean;
  resuscitationRequired?: boolean | null;
  nicuAdmission?: boolean | null;
  feedingType?: FeedingType | null;
  congenitalAnomalies?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostpartumVisit {
  id: number;
  pregnancy?: Pregnancy;
  visitDate: string;
  consultationId?: number | null;
  weight?: string | null;
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
  temperature?: string | null;
  uterineInvolution?: UterineInvolution | null;
  lochia?: Lochia | null;
  perinealHealing?: string | null;
  breastExam?: string | null;
  breastfeedingStatus?: string | null;
  breastfeedingIssues?: string | null;
  edpsScore?: number | null; // Edinburgh depression scale 0-30, flag >= 13 client-side
  contraceptionCounseled?: boolean | null;
  contraceptionMethod?: string | null;
  complications?: string | null;
  notes?: string | null;
  daysPostpartum?: number | null; // computed, null if no delivery record
  createdAt: string;
  updatedAt: string;
}

export interface PregnancyImmunization {
  id: number;
  pregnancy?: Pregnancy;
  type: ImmunizationType;
  administeredAt: string;
  dose?: string | null;
  batchNumber?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface MedicalDocument {
  id: number;
  patient?: Patient;
  pregnancy?: Pregnancy | null;
  ultrasound?: Ultrasound | null;
  obstetricLab?: ObstetricLab | null;
  consultationId?: number | null;
  type: string;
  title: string;
  description?: string | null;
  documentDate?: string | null;
  issuedBy?: string | null;
  isConfidential?: boolean | null;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PregnancyAlert {
  code: string;
  severity: AlertSeverity;
  message: string;
}

export interface PregnancyAlertFeedItem {
  pregnancy: PregnancyMinimal;
  alerts: PregnancyAlert[];
}

export type ScheduleMilestoneType = 'PRENATAL_VISIT' | 'ULTRASOUND' | 'LAB_PANEL';
export type ScheduleMilestoneStatus = 'DONE' | 'OVERDUE' | 'DUE' | 'UPCOMING';

export interface ScheduleMilestone {
  type: ScheduleMilestoneType;
  label: string;
  targetWeek: number;
  targetDate: string;
  status: ScheduleMilestoneStatus;
  completedAt: string | null;
  recordId: number | null;
}

export interface PregnancyTimelineItem {
  type: string;
  date: string;
  data: Record<string, any>;
}

export interface ChartPoint {
  week: number;
  date: string;
  value: number;
}

export interface ChartBpPoint {
  week: number;
  date: string;
  systolic: number;
  diastolic: number;
}

export interface ChartEfwPoint {
  week: number;
  date: string;
  value: number;
  percentile: number | null;
}

export interface PregnancyChartData {
  weight: ChartPoint[];
  bloodPressure: ChartBpPoint[];
  fundalHeight: ChartPoint[];
  efw: ChartEfwPoint[];
  weightCorridor: { min: number; max: number } | null;
  prePregnancyWeight: string | null;
}

export interface PregnancyStatistics {
  total: number;
  ongoing: number;
  highRisk: number;
  byStatus: { status: PregnancyStatus; count: number }[];
}

export interface PregnancyPrint {
  pregnancy: {
    referenceNumber: string;
    patient: { name: string; birthDate: string; age: number };
    doctor: string;
    lmp: string;
    edd: string;
    gestationalAge: string;
    gravida: number;
    para: number;
    bloodGroup: string | null;
    rhesus: string | null;
    riskLevel: RiskLevel;
    riskFactors: string[];
  };
  visits: {
    date: string;
    gestationalAge: string;
    weight: string | null;
    bloodPressure: string | null;
    fundalHeight: string | null;
    fetalHeartRate: number | null;
  }[];
  ultrasounds: {
    date: string;
    type: UltrasoundType;
    efw: string | null;
    conclusion: string | null;
  }[];
}
