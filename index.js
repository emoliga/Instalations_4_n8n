const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("audio-concat OK");
});

app.post(
  "/concat",
  upload.fields([
    { name: "intro", maxCount: 1 },
    { name: "voz", maxCount: 1 },
    { name: "outro", maxCount: 1 },
  ]),
  (req, res) => {
    try {
      if (!req.files?.intro?.[0] || !req.files?.voz?.[0] || !req.files?.outro?.[0]) {
        return res.status(400).send("Faltan archivos: intro, voz o outro");
      }

      const intro = req.files.intro[0].path;
      const voz = req.files.voz[0].path;
      const outro = req.files.outro[0].path;
      const output = "output.mp3";

      const cmd = `ffmpeg -y -i "${intro}" -i "${voz}" -i "${outro}" -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1[out]" -map "[out]" "${output}"`;

      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          console.error("FFmpeg error:", err);
          console.error(stderr);
          return res.status(500).send("Error en ffmpeg");
        }

        res.download(output, "podcast_final.mp3", () => {
          [intro, voz, outro, output].forEach((file) => {
            if (fs.existsSync(file)) fs.unlinkSync(file);
          });
        });
      });
    } catch (e) {
      console.error(e);
      res.status(500).send("Error interno");
    }
  }
);

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
