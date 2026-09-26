const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  {
    key: 'iepf-claims',
    name: 'IEPF Claims',
    tag: 'Unclaimed Wealth',
    description: 'Recover shares, matured debentures, and unpaid dividends transferred to the IEPF (Investor Education and Protection Fund) Authority under the Ministry of Corporate Affairs (MCA).',
    icon: 'account_balance_rounded',
    colorHex: '0xFF10B981',
    bgLightHex: '0xFFEDFDF5',
    bgDarkHex: '0xFF0D2118',
    stats: '₹1.18L Cr+ Unclaimed',
    estimatedTime: '60 - 90 Days',
    steps: [
      'Comprehensive IEPF Search & Portfolio Discovery',
      'Eligibility Verification & Shareholder Audit',
      'Documentation & Advance Stamped Receipt Preparation',
      'Form IEPF-5 Filing on MCA Portal & Verification Report',
      'RTA Coordination & Direct Credit to Demat Account',
    ],
    documentsRequired: [
      'Client Master List (CML) of Active Demat Account',
      'Self-attested PAN Card & Aadhaar Card',
      'Original Share Certificates or Folio Allotment Proof (if available)',
      'Bank Verification / Cancelled Cheque with Holder Name',
      'Indemnity Bond & Advance Stamped Receipt (Form IEPF-5)',
    ],
    serviceMapping: 'IEPF Claim (Unclaimed Shares & Dividends)',
    actionLabel: 'Free IEPF Search',
    sortOrder: 1,
    isActive: true,
  },
  {
    key: 'share-transfer',
    name: 'Share Transfer',
    tag: 'Transmission & Gifting',
    description: 'Seamless transmission of physical shares or mutual funds to legal heirs, transmission after deceased holder, transfer between family members, and complete dematerialization.',
    icon: 'swap_horiz_rounded',
    colorHex: '0xFF059669',
    bgLightHex: '0xFFECFDF5',
    bgDarkHex: '0xFF0D2016',
    stats: '100% Legal Backing',
    estimatedTime: '30 - 45 Days',
    steps: [
      'Folio Audit & Legal Heir Hierarchy Verification',
      'Form ISR-1, ISR-2 & Transmission Dossier Preparation',
      'Execution of Indemnity Bond, Affidavit & NOC from Legal Heirs',
      'Submission to Registrar & Share Transfer Agent (RTA)',
      'Issuance of Letter of Confirmation & Demat Conversion',
    ],
    documentsRequired: [
      'Original Death Certificate of Deceased Shareholder',
      'Succession Certificate, Legal Heir Certificate, or Will Probate',
      'No Objection Certificate (NOC) from Other Legal Heirs',
      'Banker Attestation on Form ISR-2 with Bank Seal',
      'Original Physical Share Certificates & CML of Claimant',
    ],
    serviceMapping: 'Physical Shares Transmission / Transfer',
    actionLabel: 'Apply for Share Transfer',
    sortOrder: 2,
    isActive: true,
  },
  {
    key: 'duplicate-certificate',
    name: 'Duplicate Certificate',
    tag: 'Lost / Damaged Shares',
    description: 'Retrieve and replace lost, stolen, destroyed, or torn physical share certificates with official Letters of Confirmation from Company RTAs for immediate demat conversion.',
    icon: 'file_copy_rounded',
    colorHex: '0xFFF59E0B',
    bgLightHex: '0xFFFFF7ED',
    bgDarkHex: '0xFF1F1508',
    stats: 'End-to-End RTA Liaison',
    estimatedTime: '45 - 60 Days',
    steps: [
      'Verification of Folio, Distinctive Numbers & Certificate Nos.',
      'Filing of Police Complaint / FIR / Non-Cognizable Report',
      'Publication of Public Notice in English & Regional Newspapers',
      'Execution of Indemnity Bond (Form A) & Affidavit (Form B)',
      'Approval from Board/RTA and Issuance of Letter of Confirmation (ISR-4)',
    ],
    documentsRequired: [
      'Copy of Police Intimation / FIR for Lost Share Certificate',
      'Clippings of Public Notices in English & Vernacular Newspapers',
      'Form ISR-4 (Request for Duplicate Certificate)',
      'Executed Indemnity Bond with Sureties & Government Stamped Affidavit',
      'Self-attested PAN, Aadhaar & CML of Registered Holder',
    ],
    serviceMapping: 'Loss of Share Certificates (Duplicate)',
    actionLabel: 'Request Duplicate Certificate',
    sortOrder: 3,
    isActive: true,
  },
  {
    key: 'kyc-name-update',
    name: 'KYC & Name Update',
    tag: 'SEBI Compliance',
    description: 'Rectify signature mismatch, name change after marriage, address mismatch, and ensure full compliance with mandatory SEBI circulars (ISR-1, ISR-2, ISR-3 & SH-13).',
    icon: 'manage_accounts_rounded',
    colorHex: '0xFFEC4899',
    bgLightHex: '0xFFFDF2F8',
    bgDarkHex: '0xFF1F0A14',
    stats: 'Unfreeze Blocked Folios',
    estimatedTime: '15 - 30 Days',
    steps: [
      'Mismatch Identification & RTA Objection Review',
      'Attestation of Signature & Bank Details via Form ISR-2',
      'Name Change Documentation (Gazette or Marriage Certificate)',
      'Submission of Complete KYC Dossier (ISR-1, ISR-2, SH-13) to RTA',
      'Confirmation of KYC Updation & Folio Unfreezing',
    ],
    documentsRequired: [
      'Form ISR-1 (Request for Registering/Changing KYC Details)',
      'Form ISR-2 (Banker Attestation with Bank Seal & Officer Code)',
      'Original Cancelled Cheque with Printed Name',
      'Marriage Certificate or Official Gazette Notification (for Name Change)',
      'Self-attested PAN Card & Aadhaar Card (linked to PAN)',
    ],
    serviceMapping: 'Name / Signature / Address Mismatch',
    actionLabel: 'Start KYC Update',
    sortOrder: 4,
    isActive: true,
  },
];

// GET /api/categories — Fetch all active categories
router.get('/', async (req, res) => {
  try {
    let categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });

    // Auto-seed if database is empty
    if (!categories || categories.length === 0) {
      categories = await Category.insertMany(DEFAULT_CATEGORIES);
    }

    res.json({
      success: true,
      data: categories,
    });
  } catch (err) {
    console.error('[Category GET]', err);
    // Return default categories as graceful fallback
    res.json({
      success: true,
      data: DEFAULT_CATEGORIES,
    });
  }
});

// GET /api/categories/:key — Fetch single category by key
router.get('/:key', async (req, res) => {
  try {
    let cat = await Category.findOne({ key: req.params.key });
    if (!cat) {
      cat = DEFAULT_CATEGORIES.find((c) => c.key === req.params.key);
    }
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
