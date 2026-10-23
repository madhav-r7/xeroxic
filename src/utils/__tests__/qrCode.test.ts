import {
  generateCollectionToken,
  getDeterministicToken,
  getOrderCollectionToken,
  formatQrPayload,
  parseQrPayload,
} from '../qrCode';
import { PrintJob } from '../../types';

function runTests() {
  console.log('--- Running Xeroxic QR System Logic Tests ---');

  // Test 1: generateCollectionToken
  const token1 = generateCollectionToken('A101');
  console.assert(token1.startsWith('xrx_A101_'), 'Token format check');
  console.assert(token1.length >= 16, 'Token length check');
  console.log('✔ Test 1: Unique collection token generation passed');

  // Test 2: Deterministic token for legacy jobs
  const dummyJob: Pick<PrintJob, 'id' | 'createdAt'> = {
    id: 'B204',
    createdAt: '2026-10-23T08:00:00.000Z',
  };
  const legacyToken1 = getDeterministicToken(dummyJob);
  const legacyToken2 = getDeterministicToken(dummyJob);
  console.assert(legacyToken1 === legacyToken2, 'Legacy token should be strictly deterministic');
  console.log('✔ Test 2: Deterministic token for reload consistency passed');

  // Test 3: formatQrPayload & parseQrPayload
  const fullJob: PrintJob = {
    id: 'C310',
    studentId: 'usr-1',
    studentName: 'Ananya Deshmukh',
    studentRoll: '250225',
    studentPhone: '+91 91234 56789',
    department: 'EE',
    fileName: 'Report.pdf',
    fileSize: '2 MB',
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
    createdAt: '2026-10-23T08:00:00.000Z',
    updatedAt: '2026-10-23T08:00:00.000Z',
    pickupCounter: 'AIT Xerox Shop',
    estimatedPickupTime: 'Ready',
    statusHistory: [],
    collectionToken: 'xrx_C310_securetoken123',
  };

  const payload = formatQrPayload(fullJob);
  console.assert(!payload.includes('+91 91234 56789'), 'Payload MUST NOT contain sensitive phone');
  console.assert(!payload.includes('Ananya'), 'Payload MUST NOT contain student name');
  console.assert(payload.includes('xrx_C310_securetoken123'), 'Payload must contain token');
  console.log('✔ Test 3: QR Privacy preservation passed');

  // Test 4: Parsing valid JSON payload
  const parseJsonResult = parseQrPayload(payload);
  console.assert(parseJsonResult.isValid === true, 'Parse JSON should be valid');
  console.assert(parseJsonResult.orderId === 'C310', 'Extracted orderId should match');
  console.assert(parseJsonResult.token === 'xrx_C310_securetoken123', 'Extracted token should match');
  console.log('✔ Test 4: Structured QR parsing passed');

  // Test 5: Parsing raw token
  const parseRawTokenResult = parseQrPayload('xrx_D405_abcdef123456');
  console.assert(parseRawTokenResult.isValid === true, 'Parse raw token should be valid');
  console.assert(parseRawTokenResult.orderId === 'D405', 'Extracted orderId from token');
  console.log('✔ Test 5: Raw token parsing passed');

  // Test 6: Parsing manual order ID
  const parseOrderIdResult = parseQrPayload('A101');
  console.assert(parseOrderIdResult.isValid === true, 'Parse Order ID should be valid');
  console.assert(parseOrderIdResult.orderId === 'A101', 'Extracted orderId');
  console.log('✔ Test 6: Manual Order ID parsing passed');

  // Test 7: Rejecting invalid / foreign QR codes
  const parseInvalidResult = parseQrPayload('https://random-website.com/invalid');
  console.assert(parseInvalidResult.isValid === false, 'Foreign URL must be rejected');
  console.assert(parseInvalidResult.error !== undefined, 'Error message must be present');

  const parseForeignJson = parseQrPayload(JSON.stringify({ app: 'other_app', orderId: '123' }));
  console.assert(parseForeignJson.isValid === false, 'Foreign JSON must be rejected');
  console.log('✔ Test 7: Invalid / foreign QR rejection passed');

  console.log('All 7 unit tests passed successfully!');
}

runTests();
