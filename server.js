const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

const app = express();

// 設定
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Multer 設定（複数ファイル: ロゴ & メインビジュアル）
const upload = multer({ dest: "uploads/" });

// 編集画面
app.get("/", (req, res) => {
  res.render("editor"); // views/editor.ejs
});

// プレビューAPI
app.post("/preview", upload.fields([{ name: "logo" }, { name: "mainvisual" }]), (req, res) => {
  try {
    const data = req.body;
    const templateStr = fs.readFileSync(path.join(__dirname, "views", "template.ejs"), "utf8");

    // パーツデータをパース
    let parts = [];
    if (data.parts) {
      try {
        parts = JSON.parse(data.parts);
        console.log('プレビューAPI: パーツデータパース成功:', parts.length, '個のパーツ');
      } catch (e) {
        console.error('プレビューAPI: パーツデータのパースエラー:', e);
        console.error('パーツデータ長:', data.parts.length);
        console.error('パーツデータ先頭:', data.parts.substring(0, 200) + '...');
        parts = [];
      }
    }

    const html = ejs.render(templateStr, {
      bgColor: data.bgColor || "#ffffff",
      textColor: data.textColor || "#333333",
      accentColor: data.accentColor || "#ff0000",
      logoFile: req.files?.logo ? req.files.logo[0].originalname : null,
      mainvisualFile: req.files?.mainvisual ? req.files.mainvisual[0].originalname : null,
      parts: parts
    });

    res.send(html);
  } catch (error) {
    console.error('プレビュー生成エラー:', error);
    res.status(500).send('プレビュー生成中にエラーが発生しました: ' + error.message);
  }
});

// 書き出し用プレビューAPI（編集用コントロールなし）
app.post("/export-preview", upload.fields([{ name: "logo" }, { name: "mainvisual" }]), (req, res) => {
  try {
    const data = req.body;
    const templateStr = fs.readFileSync(path.join(__dirname, "views", "export-template.ejs"), "utf8");

    // パーツデータをパース
    let parts = [];
    if (data.parts) {
      try {
        parts = JSON.parse(data.parts);
        console.log('書き出しAPI: パーツデータパース成功:', parts.length, '個のパーツ');
      } catch (e) {
        console.error('書き出しAPI: パーツデータのパースエラー:', e);
        console.error('パーツデータ長:', data.parts.length);
        console.error('パーツデータ先頭:', data.parts.substring(0, 200) + '...');
        parts = [];
      }
    }

    const html = ejs.render(templateStr, {
      bgColor: data.bgColor || "#ffffff",
      textColor: data.textColor || "#333333",
      accentColor: data.accentColor || "#ff0000",
      logoFile: req.files?.logo ? req.files.logo[0].originalname : null,
      mainvisualFile: req.files?.mainvisual ? req.files.mainvisual[0].originalname : null,
      parts: parts
    });

    res.send(html);
  } catch (error) {
    console.error('書き出しプレビュー生成エラー:', error);
    res.status(500).send('書き出しプレビュー生成中にエラーが発生しました: ' + error.message);
  }
});

app.listen(3000, () => {
  console.log("✅ 起動しました → http://localhost:3000");
});
