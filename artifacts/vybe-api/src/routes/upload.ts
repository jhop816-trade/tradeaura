import { Router } from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function getStorage() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  ).storage;
}

router.post("/avatar", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
  const ext = req.file.originalname.split(".").pop();
  const path = `avatars/${req.userId}.${ext}`;
  const { error } = await getStorage().from("vybe-uploads").upload(path, req.file.buffer, {
    contentType: req.file.mimetype,
    upsert: true,
  });
  if (error) { res.status(500).json({ error: error.message }); return; }
  const { data } = getStorage().from("vybe-uploads").getPublicUrl(path);
  res.json({ url: data.publicUrl });
});

router.post("/service-photo", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
  const ext = req.file.originalname.split(".").pop();
  const path = `services/${req.userId}-${Date.now()}.${ext}`;
  const { error } = await getStorage().from("vybe-uploads").upload(path, req.file.buffer, {
    contentType: req.file.mimetype,
    upsert: false,
  });
  if (error) { res.status(500).json({ error: error.message }); return; }
  const { data } = getStorage().from("vybe-uploads").getPublicUrl(path);
  res.json({ url: data.publicUrl });
});

router.post("/inspo", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
  const ext = req.file.originalname.split(".").pop();
  const path = `inspo/${req.userId}-${Date.now()}.${ext}`;
  const { error } = await getStorage().from("vybe-uploads").upload(path, req.file.buffer, {
    contentType: req.file.mimetype,
    upsert: false,
  });
  if (error) { res.status(500).json({ error: error.message }); return; }
  const { data } = getStorage().from("vybe-uploads").getPublicUrl(path);
  res.json({ url: data.publicUrl });
});

export default router;
