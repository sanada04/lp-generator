const form = document.getElementById("editorForm");
const iframe = document.getElementById("previewIframe");

async function updatePreview() {
  const formData = new FormData(form);

  const res = await fetch("/preview", {
    method: "POST",
    body: formData
  });

  if (!res.ok) return;

  const html = await res.text();
  iframe.srcdoc = html;  // ここで iframe に即反映
}

// フォームの値が変わった瞬間に更新
form.addEventListener("input", updatePreview);
form.addEventListener("change", updatePreview);

// 初期表示
window.addEventListener("DOMContentLoaded", updatePreview);
