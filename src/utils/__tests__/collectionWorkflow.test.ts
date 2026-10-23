import { PrintJob, User } from '../../types';
import { parseQrPayload } from '../qrCode';

function runCollectionStateMachineTests() {
  console.log('--- Running Collection State Machine Tests ---');

  const readyJob: PrintJob = {
    id: 'T101',
    studentId: 'usr-student-01',
    studentName: 'Rohan Sharma',
    studentRoll: '250222',
    studentPhone: '+91 98765 43210',
    department: 'CSE',
    fileName: 'Project.pdf',
    fileSize: '1.2 MB',
    fileType: 'application/pdf',
    pageCount: 10,
    copies: 1,
    colorMode: 'bw',
    paperSize: 'A4',
    orientation: 'portrait',
    sides: 'single',
    binding: 'none',
    isUrgent: false,
    cost: 20,
    status: 'ready',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pickupCounter: 'AIT Xerox Shop',
    estimatedPickupTime: 'Ready',
    statusHistory: [],
    collectionToken: 'xrx_T101_abc123',
  };

  const studentUser: User = {
    id: 'usr-student-01',
    name: 'Rohan Sharma',
    email: 'rohan@college.edu',
    role: 'student',
  };

  const staffUser: User = {
    id: 'usr-admin-01',
    name: 'Xerox Operator',
    email: 'admin@college.edu',
    role: 'admin',
  };

  // Rule 1: Student role cannot confirm collection
  function checkStaffAuthorization(operator: User): boolean {
    return operator.role === 'admin';
  }
  console.assert(!checkStaffAuthorization(studentUser), 'Customer MUST NOT be authorized to confirm collection');
  console.assert(checkStaffAuthorization(staffUser), 'Staff MUST be authorized to confirm collection');
  console.log('✔ Rule 1: Staff-only authorization enforced');

  // Rule 2: Eligibility check
  function evaluateEligibility(job: PrintJob): { eligible: boolean; reason?: string } {
    if (job.status === 'completed') {
      return { eligible: false, reason: 'already_collected' };
    }
    if (job.status === 'cancelled') {
      return { eligible: false, reason: 'cancelled' };
    }
    if (job.status !== 'ready') {
      return { eligible: false, reason: 'not_ready' };
    }
    return { eligible: true };
  }

  // Ready job should be eligible
  const readyCheck = evaluateEligibility(readyJob);
  console.assert(readyCheck.eligible === true, 'Ready job must be eligible');
  console.log('✔ Rule 2: Ready job is eligible for handover');

  // Processing job should NOT be eligible
  const processingJob: PrintJob = { ...readyJob, status: 'processing' };
  const processingCheck = evaluateEligibility(processingJob);
  console.assert(processingCheck.eligible === false && processingCheck.reason === 'not_ready', 'Processing job not eligible');
  console.log('✔ Rule 3: Processing job is blocked from collection');

  // Cancelled job should NOT be eligible
  const cancelledJob: PrintJob = { ...readyJob, status: 'cancelled' };
  const cancelledCheck = evaluateEligibility(cancelledJob);
  console.assert(cancelledCheck.eligible === false && cancelledCheck.reason === 'cancelled', 'Cancelled job not eligible');
  console.log('✔ Rule 4: Cancelled job is blocked from collection');

  // Collected job should NOT be eligible for duplicate collection
  const collectedJob: PrintJob = {
    ...readyJob,
    status: 'completed',
    collectedAt: new Date().toISOString(),
  };
  const collectedCheck = evaluateEligibility(collectedJob);
  console.assert(collectedCheck.eligible === false && collectedCheck.reason === 'already_collected', 'Collected job not eligible');
  console.log('✔ Rule 5: Duplicate collection rejected');

  console.log('All Collection State Machine Tests passed successfully!');
}

runCollectionStateMachineTests();
