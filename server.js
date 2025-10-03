const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const app = express();

// 設定
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Multer 設定（メモリストレージを使用）
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

// ZIPファイルとしてエクスポート
app.post("/export-zip", upload.fields([{ name: "logo" }, { name: "mainvisual" }]), (req, res) => {
  try {
    const data = req.body;
    let parts = [];
    if (data.parts) {
      try {
        parts = JSON.parse(data.parts);
        console.log('ZIPエクスポート: パーツデータパース成功:', parts.length, '個のパーツ');
      } catch (e) {
        console.error('ZIPエクスポート: パーツデータのパースエラー:', e);
        parts = [];
      }
    }

    // ZIPファイルの設定
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="landing-page.zip"');

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('error', (err) => {
      console.error('ZIP作成エラー:', err);
      res.status(500).send('ZIPファイルの作成に失敗しました');
    });

    archive.pipe(res);

    // HTMLファイルを生成
    const templateStr = fs.readFileSync(path.join(__dirname, "views", "export-template.ejs"), "utf8");
    const html = ejs.render(templateStr, {
      bgColor: data.bgColor || "#ffffff",
      textColor: data.textColor || "#333333",
      accentColor: data.accentColor || "#ff0000",
      logoFile: req.files?.logo ? req.files.logo[0].originalname : null,
      mainvisualFile: req.files?.mainvisual ? req.files.mainvisual[0].originalname : null,
      parts: parts
    });

    archive.append(html, { name: 'index.html' });

    // CSSファイルを追加
    const baseCss = fs.readFileSync(path.join(__dirname, "public", "css", "base.css"), "utf8");
    const exportCss = fs.readFileSync(path.join(__dirname, "public", "css", "export.css"), "utf8");
    
    archive.append(baseCss, { name: 'css/base.css' });
    archive.append(exportCss, { name: 'css/export.css' });

    // JavaScriptファイルを追加
    const exportJs = fs.readFileSync(path.join(__dirname, "public", "js", "export.js"), "utf8");
    archive.append(exportJs, { name: 'js/export.js' });

    // 画像ファイルを追加
    parts.forEach((part, index) => {
      if (part.image && part.image.startsWith('data:image/')) {
        const base64Data = part.image.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const extension = part.image.split(';')[0].split('/')[1];
        archive.append(buffer, { name: `images/part-${index}.${extension}` });
      }
      if (part.mainvisual && part.mainvisual.startsWith('data:image/')) {
        const base64Data = part.mainvisual.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const extension = part.mainvisual.split(';')[0].split('/')[1];
        archive.append(buffer, { name: `images/mainvisual-${index}.${extension}` });
      }
      if (part.images && Array.isArray(part.images)) {
        part.images.forEach((image, imgIndex) => {
          if (image.startsWith('data:image/')) {
            const base64Data = image.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const extension = image.split(';')[0].split('/')[1];
            archive.append(buffer, { name: `images/gallery-${index}-${imgIndex}.${extension}` });
          }
        });
      }
    });

    // READMEファイルを追加
    const readme = `# ランディングページ

このZIPファイルには、LPジェネレーターで作成されたランディングページが含まれています。

## ファイル構成

- index.html: メインのHTMLファイル
- css/: スタイルシートファイル
  - base.css: ベーススタイル
  - export.css: エクスポート用スタイル
- js/: JavaScriptファイル
  - export.js: エクスポート用JavaScript
- images/: 画像ファイル
  - part-*.jpg/png: パーツ画像
  - mainvisual-*.jpg/png: メインビジュアル
  - gallery-*.jpg/png: ギャラリー画像

## 使用方法

1. ZIPファイルを解凍
2. index.htmlをブラウザで開く
3. 必要に応じてファイルを編集

## 注意事項

- 画像ファイルはBase64エンコードから通常のファイル形式に変換されています
- リンクは相対パスで設定されているため、フォルダ構造を変更しないでください
- 本番環境で使用する場合は、適切なWebサーバーにアップロードしてください

作成日: ${new Date().toLocaleString('ja-JP')}
`;

    archive.append(readme, { name: 'README.txt' });

    archive.finalize();

  } catch (error) {
    console.error('ZIPエクスポートエラー:', error);
    res.status(500).send('ZIPファイルの生成中にエラーが発生しました: ' + error.message);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ 起動しました → http://localhost:${PORT}`);
  console.log(`🌐 本番環境では https://your-domain.com でアクセス可能です`);
});
