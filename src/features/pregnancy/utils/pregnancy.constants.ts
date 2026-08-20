import type {
    PregnancyStatus,
    RiskLevel,
    AlertSeverity,
    FetalMovements,
    FetalPresentation,
    EdemaLevel,
    ProteinuriaGlycosuriaLevel,
    UltrasoundType,
    AmnioticFluid,
    ObstetricLabCategory,
    ObstetricLabResult,
    DeliveryMode,
    DeliveryAnesthesia,
    DeliveryOutcome,
    NewbornSex,
    FeedingType,
    UterineInvolution,
    Lochia,
    ImmunizationType,
    BloodGroup,
    Rhesus,
    ScheduleMilestoneStatus,
} from '@/types';

export const PREGNANCY_STATUS_OPTIONS: { value: PregnancyStatus; labelKey: string }[] = [
    { value: 'ONGOING', labelKey: 'pregnancy.enums.status.ONGOING' },
    { value: 'COMPLETED', labelKey: 'pregnancy.enums.status.COMPLETED' },
    { value: 'MISCARRIED', labelKey: 'pregnancy.enums.status.MISCARRIED' },
    { value: 'TERMINATED', labelKey: 'pregnancy.enums.status.TERMINATED' },
    { value: 'LOST_TO_FOLLOW_UP', labelKey: 'pregnancy.enums.status.LOST_TO_FOLLOW_UP' },
];

export const CLOSURE_STATUS_OPTIONS = PREGNANCY_STATUS_OPTIONS.filter(
    (o) => o.value !== 'ONGOING'
);

export const RISK_LEVEL_OPTIONS: { value: RiskLevel; labelKey: string }[] = [
    { value: 'LOW', labelKey: 'pregnancy.enums.riskLevel.LOW' },
    { value: 'MODERATE', labelKey: 'pregnancy.enums.riskLevel.MODERATE' },
    { value: 'HIGH', labelKey: 'pregnancy.enums.riskLevel.HIGH' },
];

export const RISK_LEVEL_SEVERITY: Record<RiskLevel, 'success' | 'warning' | 'danger'> = {
    LOW: 'success',
    MODERATE: 'warning',
    HIGH: 'danger',
};

export const PREGNANCY_STATUS_SEVERITY: Record<PregnancyStatus, 'info' | 'success' | 'danger' | 'warning'> = {
    ONGOING: 'info',
    COMPLETED: 'success',
    MISCARRIED: 'danger',
    TERMINATED: 'danger',
    LOST_TO_FOLLOW_UP: 'warning',
};

export const ALERT_SEVERITY_TAG: Record<AlertSeverity, 'danger' | 'warning' | 'info'> = {
    CRITICAL: 'danger',
    WARNING: 'warning',
    INFO: 'info',
};

export const SCHEDULE_STATUS_SEVERITY: Record<ScheduleMilestoneStatus, 'success' | 'danger' | 'warning' | 'info'> = {
    DONE: 'success',
    OVERDUE: 'danger',
    DUE: 'warning',
    UPCOMING: 'info',
};

export const BLOOD_GROUP_OPTIONS: { value: BloodGroup; label: string }[] = [
    { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
];

export const RHESUS_OPTIONS: { value: Rhesus; labelKey: string }[] = [
    { value: 'POSITIVE', labelKey: 'pregnancy.enums.rhesus.POSITIVE' },
    { value: 'NEGATIVE', labelKey: 'pregnancy.enums.rhesus.NEGATIVE' },
];

export const FETAL_MOVEMENTS_OPTIONS: { value: FetalMovements; labelKey: string }[] = [
    { value: 'PRESENT', labelKey: 'pregnancy.enums.fetalMovements.PRESENT' },
    { value: 'REDUCED', labelKey: 'pregnancy.enums.fetalMovements.REDUCED' },
    { value: 'ABSENT', labelKey: 'pregnancy.enums.fetalMovements.ABSENT' },
];

export const FETAL_PRESENTATION_OPTIONS: { value: FetalPresentation; labelKey: string }[] = [
    { value: 'CEPHALIC', labelKey: 'pregnancy.enums.fetalPresentation.CEPHALIC' },
    { value: 'BREECH', labelKey: 'pregnancy.enums.fetalPresentation.BREECH' },
    { value: 'TRANSVERSE', labelKey: 'pregnancy.enums.fetalPresentation.TRANSVERSE' },
    { value: 'UNKNOWN', labelKey: 'pregnancy.enums.fetalPresentation.UNKNOWN' },
];

export const EDEMA_OPTIONS: { value: EdemaLevel; labelKey: string }[] = [
    { value: 'NONE', labelKey: 'pregnancy.enums.edema.NONE' },
    { value: 'MILD', labelKey: 'pregnancy.enums.edema.MILD' },
    { value: 'MODERATE', labelKey: 'pregnancy.enums.edema.MODERATE' },
    { value: 'SEVERE', labelKey: 'pregnancy.enums.edema.SEVERE' },
];

export const PROTEINURIA_GLYCOSURIA_OPTIONS: { value: ProteinuriaGlycosuriaLevel; labelKey: string }[] = [
    { value: 'NEGATIVE', labelKey: 'pregnancy.enums.proteinuria.NEGATIVE' },
    { value: 'TRACE', labelKey: 'pregnancy.enums.proteinuria.TRACE' },
    { value: 'ONE_PLUS', labelKey: 'pregnancy.enums.proteinuria.ONE_PLUS' },
    { value: 'TWO_PLUS', labelKey: 'pregnancy.enums.proteinuria.TWO_PLUS' },
    { value: 'THREE_PLUS', labelKey: 'pregnancy.enums.proteinuria.THREE_PLUS' },
];

export const ULTRASOUND_TYPE_OPTIONS: { value: UltrasoundType; labelKey: string }[] = [
    { value: 'DATING', labelKey: 'pregnancy.enums.ultrasoundType.DATING' },
    { value: 'NUCHAL_TRANSLUCENCY', labelKey: 'pregnancy.enums.ultrasoundType.NUCHAL_TRANSLUCENCY' },
    { value: 'MORPHOLOGY', labelKey: 'pregnancy.enums.ultrasoundType.MORPHOLOGY' },
    { value: 'GROWTH', labelKey: 'pregnancy.enums.ultrasoundType.GROWTH' },
    { value: 'DOPPLER', labelKey: 'pregnancy.enums.ultrasoundType.DOPPLER' },
    { value: 'OTHER', labelKey: 'pregnancy.enums.ultrasoundType.OTHER' },
];

export const AMNIOTIC_FLUID_OPTIONS: { value: AmnioticFluid; labelKey: string }[] = [
    { value: 'NORMAL', labelKey: 'pregnancy.enums.amnioticFluid.NORMAL' },
    { value: 'OLIGOHYDRAMNIOS', labelKey: 'pregnancy.enums.amnioticFluid.OLIGOHYDRAMNIOS' },
    { value: 'POLYHYDRAMNIOS', labelKey: 'pregnancy.enums.amnioticFluid.POLYHYDRAMNIOS' },
];

export const LAB_CATEGORY_OPTIONS: { value: ObstetricLabCategory; labelKey: string }[] = [
    { value: 'BLOOD_GROUP', labelKey: 'pregnancy.enums.labCategory.BLOOD_GROUP' },
    { value: 'SEROLOGY', labelKey: 'pregnancy.enums.labCategory.SEROLOGY' },
    { value: 'CBC', labelKey: 'pregnancy.enums.labCategory.CBC' },
    { value: 'GLUCOSE', labelKey: 'pregnancy.enums.labCategory.GLUCOSE' },
    { value: 'URINE', labelKey: 'pregnancy.enums.labCategory.URINE' },
    { value: 'OTHER', labelKey: 'pregnancy.enums.labCategory.OTHER' },
];

export const LAB_RESULT_OPTIONS: { value: ObstetricLabResult; labelKey: string }[] = [
    { value: 'PENDING', labelKey: 'pregnancy.enums.labResult.PENDING' },
    { value: 'NORMAL', labelKey: 'pregnancy.enums.labResult.NORMAL' },
    { value: 'ABNORMAL', labelKey: 'pregnancy.enums.labResult.ABNORMAL' },
    { value: 'POSITIVE', labelKey: 'pregnancy.enums.labResult.POSITIVE' },
    { value: 'NEGATIVE', labelKey: 'pregnancy.enums.labResult.NEGATIVE' },
    { value: 'IMMUNE', labelKey: 'pregnancy.enums.labResult.IMMUNE' },
    { value: 'NOT_IMMUNE', labelKey: 'pregnancy.enums.labResult.NOT_IMMUNE' },
];

export const LAB_RESULT_SEVERITY: Record<ObstetricLabResult, 'info' | 'success' | 'danger' | 'warning'> = {
    PENDING: 'info',
    NORMAL: 'success',
    ABNORMAL: 'danger',
    POSITIVE: 'warning',
    NEGATIVE: 'success',
    IMMUNE: 'success',
    NOT_IMMUNE: 'warning',
};

export const DELIVERY_MODE_OPTIONS: { value: DeliveryMode; labelKey: string }[] = [
    { value: 'VAGINAL_SPONTANEOUS', labelKey: 'pregnancy.enums.deliveryMode.VAGINAL_SPONTANEOUS' },
    { value: 'VAGINAL_INSTRUMENTAL', labelKey: 'pregnancy.enums.deliveryMode.VAGINAL_INSTRUMENTAL' },
    { value: 'CESAREAN_PLANNED', labelKey: 'pregnancy.enums.deliveryMode.CESAREAN_PLANNED' },
    { value: 'CESAREAN_EMERGENCY', labelKey: 'pregnancy.enums.deliveryMode.CESAREAN_EMERGENCY' },
];

export const DELIVERY_ANESTHESIA_OPTIONS: { value: DeliveryAnesthesia; labelKey: string }[] = [
    { value: 'NONE', labelKey: 'pregnancy.enums.anesthesia.NONE' },
    { value: 'LOCAL', labelKey: 'pregnancy.enums.anesthesia.LOCAL' },
    { value: 'EPIDURAL', labelKey: 'pregnancy.enums.anesthesia.EPIDURAL' },
    { value: 'SPINAL', labelKey: 'pregnancy.enums.anesthesia.SPINAL' },
    { value: 'GENERAL', labelKey: 'pregnancy.enums.anesthesia.GENERAL' },
];

export const DELIVERY_OUTCOME_OPTIONS: { value: DeliveryOutcome; labelKey: string }[] = [
    { value: 'LIVE_BIRTH', labelKey: 'pregnancy.enums.outcome.LIVE_BIRTH' },
    { value: 'STILLBIRTH', labelKey: 'pregnancy.enums.outcome.STILLBIRTH' },
    { value: 'NEONATAL_DEATH', labelKey: 'pregnancy.enums.outcome.NEONATAL_DEATH' },
];

export const NEWBORN_SEX_OPTIONS: { value: NewbornSex; labelKey: string }[] = [
    { value: 'M', labelKey: 'pregnancy.enums.sex.M' },
    { value: 'F', labelKey: 'pregnancy.enums.sex.F' },
];

export const FEEDING_TYPE_OPTIONS: { value: FeedingType; labelKey: string }[] = [
    { value: 'BREAST', labelKey: 'pregnancy.enums.feedingType.BREAST' },
    { value: 'FORMULA', labelKey: 'pregnancy.enums.feedingType.FORMULA' },
    { value: 'MIXED', labelKey: 'pregnancy.enums.feedingType.MIXED' },
];

export const UTERINE_INVOLUTION_OPTIONS: { value: UterineInvolution; labelKey: string }[] = [
    { value: 'NORMAL', labelKey: 'pregnancy.enums.uterineInvolution.NORMAL' },
    { value: 'DELAYED', labelKey: 'pregnancy.enums.uterineInvolution.DELAYED' },
];

export const LOCHIA_OPTIONS: { value: Lochia; labelKey: string }[] = [
    { value: 'NORMAL', labelKey: 'pregnancy.enums.lochia.NORMAL' },
    { value: 'ABNORMAL', labelKey: 'pregnancy.enums.lochia.ABNORMAL' },
];

export const IMMUNIZATION_TYPE_OPTIONS: { value: ImmunizationType; labelKey: string }[] = [
    { value: 'INFLUENZA', labelKey: 'pregnancy.enums.immunizationType.INFLUENZA' },
    { value: 'COVID', labelKey: 'pregnancy.enums.immunizationType.COVID' },
    { value: 'ANTI_D', labelKey: 'pregnancy.enums.immunizationType.ANTI_D' },
];

export const RISK_FACTOR_OPTIONS: { value: string; labelKey: string }[] = [
    { value: 'AGE_35_PLUS', labelKey: 'pregnancy.riskFactors.AGE_35_PLUS' },
    { value: 'AGE_18_MINUS', labelKey: 'pregnancy.riskFactors.AGE_18_MINUS' },
    { value: 'PREVIOUS_CESAREAN', labelKey: 'pregnancy.riskFactors.PREVIOUS_CESAREAN' },
    { value: 'PREVIOUS_MISCARRIAGE', labelKey: 'pregnancy.riskFactors.PREVIOUS_MISCARRIAGE' },
    { value: 'DIABETES', labelKey: 'pregnancy.riskFactors.DIABETES' },
    { value: 'HYPERTENSION', labelKey: 'pregnancy.riskFactors.HYPERTENSION' },
    { value: 'OBESITY', labelKey: 'pregnancy.riskFactors.OBESITY' },
    { value: 'MULTIPLE_PREGNANCY', labelKey: 'pregnancy.riskFactors.MULTIPLE_PREGNANCY' },
    { value: 'SMOKING', labelKey: 'pregnancy.riskFactors.SMOKING' },
    { value: 'RH_INCOMPATIBILITY', labelKey: 'pregnancy.riskFactors.RH_INCOMPATIBILITY' },
];

export function authedFileUrl(path: string): Promise<string> {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    return fetch(`${API_URL}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
        .then((res) => res.blob())
        .then((blob) => URL.createObjectURL(blob));
}
