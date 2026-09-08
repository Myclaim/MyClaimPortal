import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Use UNPKG for the worker to avoid complex bundler setups
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Helper to convert the first page of a PDF file to a canvas
const convertPdfToCanvas = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  // We'll just read the first page since ID cards are typically one page
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2.0 }); // Scale up for better OCR
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: context,
    viewport: viewport
  };
  await page.render(renderContext).promise;
  
  return canvas;
};
// Helper to format date strings to YYYY-MM-DD for input[type="date"]
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  // match DD/MM/YYYY or DD-MM-YYYY
  const match = dateStr.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }
  // match YYYY (sometimes Aadhar only has Year of Birth)
  const yearMatch = dateStr.match(/^(\d{4})$/);
  if (yearMatch) {
    return `${yearMatch[1]}-01-01`; // Default to 1st Jan
  }
  return '';
};

export const extractAadharDetails = async (imageFile) => {
  try {
    let ocrInput = imageFile;
    if (imageFile.type === 'application/pdf') {
      ocrInput = await convertPdfToCanvas(imageFile);
    }

    const { data: { text } } = await Tesseract.recognize(ocrInput, 'eng', {
      logger: (m) => console.log(m),
    });

    console.log('Extracted Text (Aadhar):', text);

    const result = {
      aadharNo: '',
      name: '',
      dob: '',
      gender: 'Male',
      phone: '',
      address: '',
      rawText: text
    };

    // Aadhar Regex
    const aadharRegex = /(?:\d[ -]*?){12}/;
    const aadharMatch = text.match(aadharRegex);
    if (aadharMatch) {
      const digitsOnly = aadharMatch[0].replace(/\D/g, '');
      if (digitsOnly.length >= 12) {
        result.aadharNo = digitsOnly.substring(0, 12).replace(/(\d{4})(?=\d)/g, '$1 ');
      }
    }

    // DOB Regex
    const dobRegex = /(?:DOB|Year of Birth|YOB|Date of Birth).*?(\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4})/i;
    const dobMatch = text.match(dobRegex) || text.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
    if (dobMatch) {
      result.dob = formatDate(dobMatch[1] || dobMatch[0]);
    }

    // Gender Regex
    const genderRegex = /(MALE|FEMALE|TRANSGENDER)/i;
    const genderMatch = text.match(genderRegex);
    if (genderMatch) {
      result.gender = genderMatch[1].charAt(0).toUpperCase() + genderMatch[1].slice(1).toLowerCase();
    }

    // Phone Regex
    const phoneRegex = /\b([6-9]\d{9})\b/;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      result.phone = phoneMatch[1];
    }

    // Address extraction (Look for Address: or S/O, W/O, D/O, C/O)
    const addressMatch = text.match(/(?:Address|Add)[^\w]*([\s\S]*?)(?=\d{6}|$)/i);
    if (addressMatch) {
      // capture up to 6 digit pincode
      const pincodeMatch = text.match(/\b(\d{6})\b/);
      let addr = addressMatch[1].replace(/\n/g, ', ').replace(/\s+/g, ' ').trim();
      if (pincodeMatch) {
        result.pincode = pincodeMatch[1];
        if (!addr.includes(pincodeMatch[1])) {
          addr += ' ' + pincodeMatch[1];
        }
      }
      
      // Extract State
      const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"];
      const stateRegex = new RegExp(`\\b(${indianStates.join('|')})\\b`, 'i');
      const stateMatch = addr.match(stateRegex);
      if (stateMatch) {
        // Find correct case from array
        result.state = indianStates.find(s => s.toLowerCase() === stateMatch[1].toLowerCase()) || stateMatch[1];
      }

      // Extract City (rough estimation: the word before the state or pincode)
      if (result.state || result.pincode) {
        const target = result.state || result.pincode;
        // Match word characters preceding the state or pincode, optionally separated by comma/space
        const cityRegex = new RegExp(`([a-zA-Z]+)[\\s,]+${target}`, 'i');
        const cityMatch = addr.match(cityRegex);
        if (cityMatch) {
           result.city = cityMatch[1].charAt(0).toUpperCase() + cityMatch[1].slice(1).toLowerCase();
        }
      }

      // Remove any trailing commas or non-alphanumeric chars
      result.address = addr.replace(/^[^\w]+|[^\w]+$/g, '');
    }

    // Name Extraction: usually on the line directly above DOB, filtering out common header strings
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    let nameFound = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/(DOB|Year of Birth|YOB|Date of Birth|\d{2}[\/\-]\d{2}[\/\-]\d{4})/i)) {
        // Look at the line above
        if (i > 0) {
          const candidate = lines[i - 1];
          // Filter out header stuff
          if (!candidate.match(/(GOVERNMENT OF INDIA|GOVT OF INDIA|MALE|FEMALE)/i)) {
            result.name = candidate.replace(/[^A-Za-z\s]/g, '').trim();
            nameFound = true;
          }
        }
        break;
      }
    }

    return result;
  } catch (err) {
    console.error('Error during Aadhar OCR:', err);
    return null;
  }
};

export const extractPanDetails = async (imageFile) => {
  try {
    let ocrInput = imageFile;
    if (imageFile.type === 'application/pdf') {
      ocrInput = await convertPdfToCanvas(imageFile);
    }

    const { data: { text } } = await Tesseract.recognize(ocrInput, 'eng', {
      logger: (m) => console.log(m),
    });

    console.log('Extracted Text (PAN):', text);

    const result = {
      panNo: '',
      name: '',
      fatherName: '',
      dob: '',
      rawText: text
    };

    // PAN Regex
    // Tesseract often adds spaces, so we search in the text without spaces
    const cleanedText = text.replace(/\s+/g, '').toUpperCase();
    
    // First try strict match on cleaned text
    let panMatch = cleanedText.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
    
    // If no strict match, try a looser match (sometimes 0/O or 1/I/L get confused)
    // PAN format: 5 letters, 4 digits, 1 letter. We look for 10 chars that are roughly in that shape.
    if (!panMatch) {
      // Find any 10 character alphanumeric string that looks like a PAN
      const looseMatch = cleanedText.match(/[A-Z0-9]{10}/g);
      if (looseMatch) {
        for (let candidate of looseMatch) {
           // Basic check: starts with letters, ends with letter
           if (candidate.match(/^[A-Z]{3,5}[0-9]{2,5}[A-Z]{1,2}$/)) {
             panMatch = [candidate];
             break;
           }
        }
      }
    }

    if (panMatch) {
      result.panNo = panMatch[0].toUpperCase();
    }

    // DOB Regex
    const dobRegex = /(\d{2}[\/\-]\d{2}[\/\-]\d{4})/;
    const dobMatch = text.match(dobRegex);
    if (dobMatch) {
      result.dob = formatDate(dobMatch[1]);
    }

    // Name and Father's Name extraction
    // Usually PAN structure is:
    // INCOME TAX DEPARTMENT
    // GOVT OF INDIA
    // JOHN DOE  <-- Name
    // FATHER NAME <-- Father's name
    // 01/01/1990 <-- DOB
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    let dobIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/\d{2}[\/\-]\d{2}[\/\-]\d{4}/)) {
        dobIndex = i;
        break;
      }
    }

    if (dobIndex >= 2) {
      // Assuming name is 2 lines above DOB, and father name is 1 line above DOB
      // Though sometimes "FATHER'S NAME" literal text might be present
      
      const candidateFather = lines[dobIndex - 1].replace(/[^A-Za-z\s]/g, '').trim();
      const candidateName = lines[dobIndex - 2].replace(/[^A-Za-z\s]/g, '').trim();

      if (!candidateFather.match(/(FATHER|NAME|GOVT|INDIA)/i)) {
        result.fatherName = candidateFather;
      }
      if (!candidateName.match(/(INCOME|TAX|DEPARTMENT|GOVT|INDIA)/i)) {
        result.name = candidateName;
      }
    }

    return result;
  } catch (err) {
    console.error('Error during PAN OCR:', err);
    return null;
  }
};
