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

// Helper to crop the left portion of an image (canvas or file) to remove QR code noise
const cropLeftPortion = async (input, ratio = 0.55) => {
  let bitmap = await createImageBitmap(input);
  const cropWidth = Math.floor(bitmap.width * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = cropWidth;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, cropWidth, bitmap.height, 0, 0, cropWidth, bitmap.height);
  bitmap.close();
  return canvas;
};

const cropLeftHalf = (input) => cropLeftPortion(input, 0.55);

export const extractAadharDetails = async (imageFile) => {
  try {
    let ocrInput = imageFile;
    if (imageFile.type === 'application/pdf') {
      ocrInput = await convertPdfToCanvas(imageFile);
    }

    // Run OCR on the FULL image for name / DOB / gender / Aadhaar number
    const { data: { text } } = await Tesseract.recognize(ocrInput, 'eng', {
      logger: (m) => console.log(m),
    });

    console.log('Extracted Text (Aadhar - full):', text);

    // Run OCR on left-55% crop to get a clean address (eliminates QR-code noise on the right)
    let textForAddress = text; // fallback: use full text
    try {
      const croppedInput = await cropLeftHalf(ocrInput);
      const { data: { text: croppedText } } = await Tesseract.recognize(croppedInput, 'eng', {
        logger: (m) => console.log(m),
      });
      console.log('Extracted Text (Aadhar - left crop):', croppedText);
      textForAddress = croppedText;
    } catch (_) {
      // Crop failed — fall back to full text for address too
    }

    const result = {
      aadharNo: '',
      name: '',
      fatherName: '',
      dob: '',
      gender: 'Male',
      phone: '',
      address: '',
      rawText: text
    };

    // Care of / Son of / Daughter of / Father's Name from Aadhaar
    const careOfMatch = text.match(/(?:S\/O|D\/O|C\/O|Care of|Father['’]?s?\s*Name)[:\s]+([A-Za-z\s]{3,})/i);
    if (careOfMatch) {
      const cand = careOfMatch[1].split(/,|\n/)[0].replace(/[^A-Za-z\s]/g, '').trim();
      if (cand.length >= 3) {
        result.fatherName = cand;
      }
    }

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

    // ── Address extraction ────────────────────────────────────────────────
    const indianStates = [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
      "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
      "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
      "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
      "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
      "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
      "Chandigarh"
    ];

    const alphaRatio = (s) => {
      const letters = (s.match(/[a-zA-Z]/g) || []).length;
      return s.length > 0 ? letters / s.length : 0;
    };

    const isAddressLine = (line) => {
      const trimmed = line.trim();
      if (trimmed.length < 2) return false;
      if (/^\d{6}$/.test(trimmed)) return true;
      return alphaRatio(trimmed) >= 0.4;
    };

    const allLines = textForAddress.split('\n');
    const addrLabelIdx = allLines.findIndex(l => /(?:Address|Add)[^a-zA-Z]/i.test(l));

    if (addrLabelIdx !== -1) {
      const addrRawLines = allLines.slice(addrLabelIdx, addrLabelIdx + 9);
      addrRawLines[0] = addrRawLines[0].replace(/.*(?:Address|Add)[^a-zA-Z]*/i, '');

      const cleanLines = addrRawLines
        .map(l => {
          let stripped = l
            .replace(/^[^a-zA-Z0-9]+/, '')
            .replace(/[^a-zA-Z0-9]+$/, '')
            .trim();

          const parts = stripped.split(/,\s*/);
          const cleanParts = parts
            .map(part => {
              const words = part.trim().split(/\s+/);
              const goodWords = words.filter(w => {
                if (w.length < 2) return false;
                const letters = (w.match(/[a-zA-Z]/g) || []).length;
                return letters / w.length >= 0.5;
              });
              return goodWords.join(' ').trim();
            })
            .filter(p => p.length >= 2);

          return cleanParts.join(', ');
        })
        .filter(isAddressLine);

      const addrFull = cleanLines.join(', ').replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();

      const pincodeMatch = addrFull.match(/\b(\d{6})\b/) || textForAddress.match(/\b(\d{6})\b/) || text.match(/\b(\d{6})\b/);
      if (pincodeMatch) result.pincode = pincodeMatch[1];

      const stateRegex = new RegExp(`\\b(${indianStates.join('|')})\\b`, 'i');
      const stateMatch = addrFull.match(stateRegex);
      if (stateMatch) {
        result.state = indianStates.find(
          s => s.toLowerCase() === stateMatch[1].toLowerCase()
        ) || stateMatch[1];
      }

      if (result.state || result.pincode) {
        const pivot = result.state || result.pincode;
        const cityRegex = new RegExp(`([A-Z][a-zA-Z]+(?:\\s+[A-Z][a-zA-Z]+){0,2})[\\s,]+${pivot}`, 'i');
        const cityMatch = addrFull.match(cityRegex);
        if (cityMatch) {
          result.city = cityMatch[1].trim()
            .split(/\s+/)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
        }
      }

      let finalAddr = addrFull.replace(/^[\s,\-–]+/, '').replace(/[\s,]+$/, '');
      if (result.pincode && !finalAddr.includes(result.pincode)) {
        finalAddr = `${finalAddr} - ${result.pincode}`;
      }

      const pincodeIdx = finalAddr.indexOf(result.pincode);
      if (pincodeIdx !== -1 && result.pincode) {
        finalAddr = finalAddr.substring(0, pincodeIdx + result.pincode.length);
      }

      result.address = finalAddr.replace(/^[\s,\-–]+/, '').replace(/[\s,]+$/, '');
    }

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/(DOB|Year of Birth|YOB|Date of Birth|\d{2}[\/\-]\d{2}[\/\-]\d{4})/i)) {
        if (i > 0) {
          const candidate = lines[i - 1];
          if (!candidate.match(/(GOVERNMENT OF INDIA|GOVT OF INDIA|MALE|FEMALE)/i)) {
            result.name = candidate.replace(/[^A-Za-z\s]/g, '').trim();
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

    // Modern Indian PAN cards feature a prominent QR code taking up the right 30-35% of the card.
    // Tesseract's page segmenter groups text horizontally across into the QR code blocks,
    // which mangles Father's Name and applicant name. Cropping the left 70% isolates all text cleanly.
    let text = '';
    try {
      const croppedInput = await cropLeftPortion(ocrInput, 0.70);
      const { data: { text: croppedText } } = await Tesseract.recognize(croppedInput, 'eng', {
        logger: (m) => console.log(m),
      });
      text = croppedText;
    } catch (cropErr) {
      console.warn('PAN card crop failed, falling back to full image:', cropErr);
    }

    // Fallback to the full image if the crop misses the PAN number, even when
    // it still contains enough unrelated text to pass the length check.
    const croppedPanCandidate = text.replace(/\s+/g, '').toUpperCase().match(/[A-Z]{5}[0-9]{4}[A-Z]/);
    if (!text || text.trim().length < 20 || !croppedPanCandidate) {
      const { data: { text: fullText } } = await Tesseract.recognize(ocrInput, 'eng', {
        logger: (m) => console.log(m),
      });
      text = `${text}\n${fullText}`;
    }

    console.log('Extracted Text (PAN):', text);

    const result = {
      panNo: '',
      name: '',
      fatherName: '',
      dob: '',
      rawText: text
    };

    // 1. PAN Regex
    const cleanedText = text.replace(/\s+/g, '').toUpperCase();
    let panMatch = cleanedText.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
    if (!panMatch) {
      const looseMatch = cleanedText.match(/[A-Z0-9]{10}/g);
      if (looseMatch) {
        for (let candidate of looseMatch) {
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

    // 2. DOB Regex
    const dobRegex = /(?:dob|date\s*of\s*birth|birth|जन्म)?[\s:]*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i;
    const dobMatch = text.match(dobRegex) || text.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
    if (dobMatch) {
      result.dob = formatDate(dobMatch[1]);
    }

    // 3. Name and Father's Name extraction
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length >= 2);

    const isHeaderOrNoise = (l) => {
      return /(income\s*tax|department|govt|government|india|permanent\s*account|number\s*card|signature|हस्ताक्षर|तारीख|date\s*of\s*birth)/i.test(l);
    };

    const isPureLabel = (str) => {
      const stripped = str
        .replace(/(?:father(?:['’]?s)?\s*name|\bF[\/\.]O\b|\bS[\/\.]O\b|पिता\s*(?:का\s*)?नाम|नाम|name|date\s*of\s*birth|जन्म\s*(?:की\s*)?तारीख)/gi, '')
        .replace(/[^A-Za-z]/g, '')
        .trim();
      return stripped.length < 3;
    };

    const cleanName = (str) => {
      if (!str) return '';
      return str
        .replace(/\b\d{4,}\b/g, '') // remove 4+ digit numbers like years / issue dates
        .replace(/[^A-Za-z\s]/g, ' ') // keep only letters and spaces
        .split(/\s+/)
        .filter(w => {
          if (w.length <= 1) return false;
          // Filter stray lowercase OCR noise (e.g. 'van', 'ee', 're') since PAN cards are in uppercase
          if (w === w.toLowerCase() && w.length <= 3) return false;
          return true;
        })
        .join(' ')
        .trim();
    };

    const fatherLabelRegex = /(?:father(?:['’]?s)?\s*name|\bF[\/\.]O\b|\bS[\/\.]O\b|पिता)/i;
    const nameLabelRegex = /(?:^|[\s\/|])name(?:[\s\/|]|$)|नाम/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Father's name check
      if (fatherLabelRegex.test(line) && !result.fatherName) {
        const parts = line.split(fatherLabelRegex);
        const after = cleanName(parts[parts.length - 1] || '');
        if (after.length >= 3 && !isHeaderOrNoise(after)) {
          // Value is on the same line after label
          result.fatherName = after;
        } else {
          // Value is on the next line(s)
          for (let j = i + 1; j < Math.min(lines.length, i + 3); j++) {
            const nextClean = cleanName(lines[j]);
            if (nextClean.length >= 3 && !isHeaderOrNoise(lines[j]) && !isPureLabel(lines[j])) {
              result.fatherName = nextClean;
              break;
            }
          }
        }
      }

      // Name check
      if (nameLabelRegex.test(line) && !result.name && !fatherLabelRegex.test(line)) {
        const parts = line.split(nameLabelRegex);
        const after = cleanName(parts[parts.length - 1] || '');
        if (after.length >= 3 && !isHeaderOrNoise(after)) {
          result.name = after;
        } else {
          for (let j = i + 1; j < Math.min(lines.length, i + 3); j++) {
            const nextClean = cleanName(lines[j]);
            if (nextClean.length >= 3 && !isHeaderOrNoise(lines[j]) && !isPureLabel(lines[j])) {
              result.name = nextClean;
              break;
            }
          }
        }
      }
    }

    // Fallback: If name was not found by label, look above father's name
    if (!result.name && result.fatherName) {
      let fatherIdx = lines.findIndex(l => l.includes(result.fatherName) || fatherLabelRegex.test(l));
      if (fatherIdx > 0) {
        for (let k = fatherIdx - 1; k >= Math.max(0, fatherIdx - 4); k--) {
          const cand = cleanName(lines[k]);
          if (cand.length >= 3 && !isHeaderOrNoise(lines[k]) && !isPureLabel(lines[k])) {
            result.name = cand;
            break;
          }
        }
      }
    }

    // Fallback: If neither was found by labels (older unlabelled cards), scan upwards from DOB
    let dobIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/\d{2}[\/\-]\d{2}[\/\-]\d{4}/)) {
        dobIndex = i;
        break;
      }
    }

    if (dobIndex >= 1) {
      let fatherFound = !!result.fatherName;
      let nameFound = !!result.name;

      for (let i = dobIndex - 1; i >= Math.max(0, dobIndex - 6); i--) {
        const clean = cleanName(lines[i]);
        if (!clean || clean.length < 3 || isHeaderOrNoise(lines[i]) || isPureLabel(lines[i])) continue;

        if (!fatherFound) {
          result.fatherName = clean;
          fatherFound = true;
        } else if (!nameFound) {
          result.name = clean;
          nameFound = true;
          break;
        }
      }
    }

    return result;
  } catch (err) {
    console.error('Error during PAN OCR:', err);
    return null;
  }
};
