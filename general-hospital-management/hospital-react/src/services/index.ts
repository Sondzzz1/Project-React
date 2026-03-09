/**
 * Services Barrel — Single import point for all services
 * Usage: import { patientApi, doctorApi } from '../services';
 */

export * from './auth.services';
export { default as authApi } from './auth.services';

export * from './patient.services';
export { default as patientApi } from './patient.services';

export * from './doctor.services';
export { default as doctorApi } from './doctor.services';

export * from './nurse.services';
export { default as nurseApi } from './nurse.services';

export * from './bed.services';
export { default as bedApi } from './bed.services';

export * from './department.services';
export { default as departmentApi } from './department.services';

export * from './admission.services';
export { default as admissionApi } from './admission.services';

export * from './billing.services';
export { default as billingApi } from './billing.services';

export * from './surgery.services';
export { default as surgeryApi } from './surgery.services';

export * from './medicalRecord.services';
export { default as medicalRecordApi } from './medicalRecord.services';

export * from './report.services';
export { default as reportApi } from './report.services';

export * from './audit.services';
export { default as auditApi } from './audit.services';

export * from './userManagement.services';
export { default as userManagementApi } from './userManagement.services';
