import Tesseract from 'tesseract.js';

export const extractAadharDetails = async (imageFile) => {
  try {
    const { data: { text } } = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => console.log(m),
    });

    console.log('Extracted Text (Aadhar):', text);

    // Regular expression for 12 digit aadhar number, possibly with spaces
    // It looks for 12 consecutive digits or digits separated by spaces.
    const aadharRegex = /(?:\d[ -]*?){12}/;
    const aadharMatch = text.match(aadharRegex);
    
    let aadharNo = '';
    if (aadharMatch) {
      // Clean up the match to just be 12 digits
      const digitsOnly = aadharMatch[0].replace(/\D/g, '');
      if (digitsOnly.length >= 12) {
        // Format it with spaces as 1234 5678 9012
        aadharNo = digitsOnly.substring(0, 12).replace(/(\d{4})(?=\d)/g, '$1 ');
      }
    }

    return {
      aadharNo,
      rawText: text
    };
  } catch (err) {
    console.error('Error during Aadhar OCR:', err);
    return null;
  }
};

export const extractPanDetails = async (imageFile) => {
  try {
    const { data: { text } } = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => console.log(m),
    });

    console.log('Extracted Text (PAN):', text);

    // Regular expression for PAN card: 5 letters, 4 numbers, 1 letter
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/i;
    const panMatch = text.match(panRegex);
    
    let panNo = '';
    if (panMatch) {
      panNo = panMatch[0].toUpperCase();
    }

    return {
      panNo,
      rawText: text
    };
  } catch (err) {
    console.error('Error during PAN OCR:', err);
    return null;
  }
};
