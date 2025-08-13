const Detail = require("../Schema/detailsSchema");

async function handleAdhar(req, res) {
  try {
    const data = req.body;
    const newDoc = await Detail.create(data); // creates and saves
    res.status(200).json({
      message: "Data Saved Successfully",
      detail: newDoc,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
}
async function handleAadhaarUnique(req, res) {
  try {
    const aadhaar = String(req.body?.aadhaar || "");
    if (!isValidAadhaar(aadhaar)) {
      return res.status(400).json({ error: "Invalid Aadhaar format." });
    }

    // Use .exists for fast existence check
    const exists = await Detail.exists({ aadhaarNumber: aadhaar });
    return res.status(200).json({ exists: Boolean(exists) });
  } catch (err) {
    console.error("handleAadhaarUnique error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

// POST /data/verifyPan  { pan: "ABCDE1234F" }  -> { exists: boolean }
async function handlePanUnique(req, res) {
  try {
    const panRaw = String(req.body?.pan || "");
    const pan = panRaw.toUpperCase();

    if (!isValidPan(pan)) {
      return res.status(400).json({ error: "Invalid PAN format." });
    }

    const exists = await Detail.exists({ panNumber: pan });
    return res.status(200).json({ exists: Boolean(exists) });
  } catch (err) {
    console.error("handlePanUnique error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
function isValidAadhaar(raw) {
  const s = (raw || "").replace(/\s+/g, "");
  if (!/^[2-9]\d{11}$/.test(s)) return false;
  if (/^(\d)\1{11}$/.test(s)) return false;

  // Verhoeff tables
  const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  ];
  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
  ];

  let c = 0;
  const digits = s.split("").map(Number).reverse();
  for (let i = 0; i < digits.length; i++) {
    c = d[c][p[i % 8][digits[i]]];
  }
  return c === 0;
}

const otpStore = new Map();
const panOtpStore = new Map();
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
}
async function generateAadhaarOtp(req, res) {
  const { aadhaar, name, consent } = req.body;
  console.log(req.body);

  if (!aadhaar || !name || !consent) {
    return res.status(400).json({ message: "Missing required fields." });
  }
  if (isValidAadhaar(aadhaar)) {
    return res.status(400).json({ message: "Invalid Aadhaar number." });
  }
   const exists = await Detail.exists({ adharNumber: aadhaar.toString() });
   if (exists) {
     return res.status(409).json({ message: "Aadhaar already registered." });
   }
  console.log(exists);
  const otp = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000; 

  otpStore.set(aadhaar, { otp, expiresAt });

  console.log(`Generated OTP for Aadhaar ${aadhaar}: ${otp}`);
  console.log(otpStore);
  res.json({ message: "OTP generated and sent (simulated).", otp });
}
async function verifyAadhaarOtp(req, res) {
  const { aadhaar, otp } = req.body;

  if (!aadhaar || !otp) {
    return res.status(400).json({ message: "Missing Aadhaar or OTP." });
  }

  const record = otpStore.get(aadhaar);

  if (!record) {
    return res
      .status(400)
      .json({ message: "No OTP generated for this Aadhaar." });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(aadhaar);
    return res
      .status(400)
      .json({ message: "OTP expired. Please request a new one." });
  }

  if (otp !== record.otp) {
    console.log("1");
    return res.status(400).json({ message: "Invalid OTP." });
  }

  otpStore.delete(aadhaar);

  res.json({ message: "Aadhaar verified successfully.",otp });
}
// PAN controller: generate & verify OTP (parallel to Aadhaar controller)

function isValidPAN(raw) {
  const s = (raw || "").toUpperCase().trim();
  // PAN format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(s);
}


async function generatePanOtp(req, res) {
  try {
    const { pan, name, email } = req.body || {};
    if (!pan || !name) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const panNorm = String(pan).toUpperCase().trim();
    if (!isValidPAN(panNorm)) {
      return res.status(400).json({ message: "Invalid PAN number." });
    }
      const exists = await Detail.exists({ panNumber: pan });
      if (exists) {
        return res.status(409).json({ message: "PAN already registered." });
      }

    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    panOtpStore.set(panNorm, { otp, expiresAt });

    console.log(`Generated OTP for PAN ${panNorm}: ${otp}`);
    res.json({ message: "OTP generated and sent (simulated).", otp });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
}

async function verifyPanOtp(req, res) {
  try {
    const { pan, otp,aadhaar,name } = req.body || {};

    if (!pan || !otp) {
      return res.status(400).json({ message: "Missing PAN or OTP." });
    }

    const panNorm = String(pan).toUpperCase().trim();
    const record = panOtpStore.get(panNorm);

    if (!record) {
      return res.status(400).json({ message: "No OTP generated for this PAN." });
    }

    if (Date.now() > record.expiresAt) {
      panOtpStore.delete(panNorm);
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    if (String(otp) !== String(record.otp)) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    panOtpStore.delete(panNorm);
    const data = await Detail.create({
      name,
      adharNumber: aadhaar,
      panNumber:pan
    });
    
    res.json({ message: "PAN verified successfully." ,data});
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
}



module.exports = {
  generatePanOtp,
  verifyPanOtp,
  isValidPAN,
  handleAdhar,
  generateAadhaarOtp,
  verifyAadhaarOtp,
  isValidAadhaar,
  handlePanUnique,
  handleAadhaarUnique,
};
