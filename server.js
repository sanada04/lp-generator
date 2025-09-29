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
  const data = req.body;
  const templateStr = fs.readFileSync(path.join(__dirname, "views", "template.ejs"), "utf8");

  const html = ejs.render(templateStr, {
    title: data.title || "サンプルタイトル",
    description: data.description || "サンプル説明文",
    cta: data.cta || "詳細はこちら",
    bgColor: data.bgColor || "#ffffff",
    textColor: data.textColor || "#333333",
    accentColor: data.accentColor || "#ff0000",
    logoFile: req.files?.logo ? req.files.logo[0].originalname : null,
    mainvisualFile: req.files?.mainvisual ? req.files.mainvisual[0].originalname : null,
    anchors: [            // ← ここを追加
      { id: "section1", label: "特徴" },
      { id: "section2", label: "料金" }
    ],
    buttons: [
      { url: "#apply", label: "今すぐ申し込む" },
      { url: "#contact", label: "お問い合わせ" }
    ]
  });

  res.send(html);
});

app.listen(3000, () => {
  console.log("✅ 起動しました → http://localhost:3000");
});
