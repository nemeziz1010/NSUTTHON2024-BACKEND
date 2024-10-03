const express = require("express");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const shortUUID = require("short-uuid");
const sharp = require("sharp");

const GCP_SERVICE_ACCOUNT_KEY_PATH = require("../../vaulted-bonsai-437410-h8-0cc8128f5454.json");
console.log(GCP_SERVICE_ACCOUNT_KEY_PATH);
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const GCP_BUCKET_NAME = process.env.GCP_BUCKET_NAME;

const router = express.Router();

const storage = new Storage({
  projectId: GCP_PROJECT_ID,
  credentials: {
    "type": "service_account",
    "project_id": "vaulted-bonsai-437410-h8",
    "private_key_id": "0cc8128f545452dbd6d4703efc66476eed7eaa61",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCu9qGwSxmuvleU\ncNRCMeJMp0zHTRp62ZPv0mi+Kkjwj4g2m6jgNjuSgQmQBtfsGNfmvLBrfNZsJCHx\nzqhJi4iCL6rH3IK80Fgfcge/g3JWD322ivnwJHSMMBGeihRPSefoWsIj30sEbCKF\nwhiaiRXXTCm8uKgimR3LnpU0Jde8+sZurgrcox8K0oZ63bOyxQKnnS6NWPTvMs40\nuUq06/lW1QflLNNDk5RREjuLrsIbRZHlGj6JMCCcr9aBVts6dRNQA0Mu0XmndI9T\nAy48lsX+0lMkVA9018YsUnYXL89RdfsVk2Vj3PfQyzLtnUUtc70tbLAl2VwoRQRv\nHDPKoG+ZAgMBAAECggEAD2thdw+7UPTp84VZE4dhbgd9gwAG0iZcPRHCVOYVnQvN\nQaDIyo/FAsWYAec0ftR2rJlbA/IR1KB/lFe16ZtgObb5Olly9TB4X7cVOznaqP5/\nAggv/Eu+ML+owdvh69Xz1/ytqOssKZTdGwQu1mm38Mw/zmfIu5nacCBG/nxKTdd3\nqTkSJqdtYDteNIZxTNMRWuajsv5+pZUnLDkeLOorimZotA0NP3dB3HtkBh/k1aPw\nVVPTrYCFA8Ck5nU2dUgfPeNxWO27f1GbEH2fcdsLPANU1rJi/nW/Jk698q6trSp5\nEkbf7V6W5iBxb2W67xLm4kVxnrOqAs9oY36S+x81IQKBgQDgPzKEzw5aioYdP7EY\nm6SLMgbflIZF9+0jrJzfLxBfGL8MQ7b+9dnN/XBO+rhiPsgdSH3UvGFWozlNMvfA\n/vBNF5LPPg5nW/64q4GhOakOLQkurbNPAK2GdwsO7x1Q5fDA/XPExPV2A+2Eehuu\neJ0VXYDhmnkxzkJaeTh8uSkGMQKBgQDHvPDi2Eo/b4tohAB6i5S383clEcpgsAgI\n0A6S0GIUyw7l0HnWoTr+5+Hy4bNqOGeERKqkDGF3BcRLctKGIGlTemrV5oq9adm0\nNfxlQ/k0cV5f0nHTwJQnhwKfxZG9tZx2xdQode0+/tvF1rpAmykTk5Uo4T1GCy9j\nac66qSpd6QKBgDj19JglnCjFfRGa5xowFtjAqVxLdtv5AQSJyQMsCkWNnKG55ZbX\nzi5zzP5S01kpR12g102dWEBQj7KbWrFsUI/UiBcaVUBN7uLrta7FXbrbF7UCrERK\nEMnSHT364QB2l/P9rVVzDkKe9ssq1TM5MfWGXcFwoo5TLSmcFwwfYFtRAoGBAKnV\neQmZmYBY6zPiUbnhZ4IGLX/Coc8Wvq4nosypDUza3/7/Bio+i7hlGNV5niGqdjKc\nZG/66wDWUXNJ3cIYWxaVF7RrQ/sMvwUhhkvgwUwbPYDCovDHZfI6NTv/NQ4XF0RS\nsDP7GdCfyeVt0I7Qn9u6eHD7HCurpQ6l0Bcdch3JAoGBAN5Sfj1pq0SzbNFcsqPN\n4adD+6L7DfZVNHlhlPKxYqfTcnoVUC/pwyjFpAE7LmN+lY76+3fY+DrT20/qINGI\n/fa0IDHRfRUV3eDrdwgP0j1sp9W6OPzygxhzLbYRuY7irVg0gibwtqytIBPDaQsn\nwRs68HYYC7zcTAvUrY+G+UW/\n-----END PRIVATE KEY-----\n",
    "client_email": "nsutthon@vaulted-bonsai-437410-h8.iam.gserviceaccount.com",
    "client_id": "116883469178923015587",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/nsutthon%40vaulted-bonsai-437410-h8.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  },
});
const bucketName = GCP_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // Optional: limit to 50MB
  },
});

router.post("/upload", multerMid.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).send("No file uploaded.");
      return;
    }

    const translator = shortUUID();
    const uuid = translator.new();

    const filenameParts = req.file.originalname.split(".");
    const newFilename = `${filenameParts[0]}-${uuid}.${
      filenameParts[1] || "png"
    }`;
    const compressedFilename = `${filenameParts[0]}-${uuid}-compressed.${
      filenameParts[1] || "png"
    }`;

    // First, save the original image
    const originalBlob = bucket.file(newFilename);
    const originalBlobStream = originalBlob.createWriteStream();

    originalBlobStream.on("error", (err) => {
      console.log(err);
      res.status(500).send(err);
    });

    originalBlobStream.on("finish", async () => {
      // After the original image is saved, save the compressed one
      const compressedImageBuffer = await sharp(req.file.buffer)
        .resize(500) // or any other size you prefer
        .jpeg({ quality: 70 }) // adjust quality as needed
        .toBuffer();

      const compressedBlob = bucket.file(compressedFilename);
      const compressedBlobStream = compressedBlob.createWriteStream();

      compressedBlobStream.on("error", (err) => {
        console.log(err);
        res.status(500).send(err);
      });

      compressedBlobStream.on("finish", () => {
        const publicUrl = {
          original: `https://storage.googleapis.com/${bucket.name}/${originalBlob.name}`,
          compressed: `https://storage.googleapis.com/${bucket.name}/${compressedBlob.name}`,
        };
        res.status(200).send(publicUrl);
      });

      compressedBlobStream.end(compressedImageBuffer);
    });

    originalBlobStream.end(req.file.buffer);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});
module.exports = router;
