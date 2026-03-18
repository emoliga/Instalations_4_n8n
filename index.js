const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/concat", upload.fields([
  { name: "intro" },
  { name: "voz" },
  { name: "outro" }
]), (req, res) => {

  const intro = req.files.intro[0].path;
  const voz = req.files.voz[0].path;
  const outro = req.files.outro[0].path;

  const output = "output.mp3";

  const cmd = `
    ffmpeg -i ${intro} -i ${voz} -i ${outro} \
    -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1[out]" \
    -map "[out]" ${output}
  `;

  exec(cmd, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error en ffmpeg");
    }

    res.download(output, () => {
      fs.unlinkSync(intro);
      fs.unlinkSync(voz);
      fs.unlinkSync(outro);
      fs.unlinkSync(output);
    });
  });
});

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});
