const form = document.getElementById("editorForm");
const iframe = document.getElementById("previewIframe");
const partEditor = document.getElementById("part-editor");
const partEditorContent = document.getElementById("part-editor-content");

// パーツデータを管理
let parts = [];
let selectedPart = null;
let updateTimeout = null;
let hasUnsavedChanges = false;

// 変更を検知する関数
function markAsChanged() {
  hasUnsavedChanges = true;
  console.log('未保存の変更を検知しました');
}

// 変更を保存済みとしてマークする関数
function markAsSaved() {
  hasUnsavedChanges = false;
  console.log('変更を保存済みとしてマークしました');
}

// ページリロード時の警告
window.addEventListener('beforeunload', function(e) {
  if (hasUnsavedChanges) {
    const message = '未保存の変更があります。ページを離れると変更が失われます。';
    e.preventDefault();
    e.returnValue = message;
    return message;
  }
});

// パーツテンプレート
const partTemplates = {
  hero: {
    type: 'hero',
    title: 'メインタイトル',
    subtitle: 'サブタイトル',
    description: '説明文をここに入力してください',
    buttonText: '詳細を見る',
    buttonLink: '#',
    image: null,
    backgroundColor: '#667eea'
  },
  features: {
    type: 'features',
    title: '特徴',
    items: [
      { icon: '⭐', title: '特徴1', description: '説明文1', link: '#' },
      { icon: '🚀', title: '特徴2', description: '説明文2', link: '#' },
      { icon: '💎', title: '特徴3', description: '説明文3', link: '#' }
    ]
  },
  pricing: {
    type: 'pricing',
    title: '料金プラン',
    plans: [
      { name: 'ベーシック', price: '¥9,800', features: ['機能1', '機能2'], link: '#' },
      { name: 'プレミアム', price: '¥19,800', features: ['機能1', '機能2', '機能3'], link: '#' }
    ]
  },
  contact: {
    type: 'contact',
    title: 'お問い合わせ',
    description: 'お気軽にお問い合わせください',
    email: 'contact@example.com',
    phone: '03-1234-5678',
    emailLink: 'mailto:contact@example.com',
    phoneLink: 'tel:03-1234-5678'
  },
  testimonial: {
    type: 'testimonial',
    title: 'お客様の声',
    testimonials: [
      { name: '田中さん', comment: 'とても良いサービスでした' },
      { name: '佐藤さん', comment: '満足しています' }
    ]
  },
  about: {
    type: 'about',
    title: '私たちについて',
    description: '会社の理念やビジョンについて説明します。',
    image: null,
    features: [
      { title: 'ミッション', description: '私たちの使命' },
      { title: 'ビジョン', description: '目指す未来' },
      { title: 'バリュー', description: '大切にする価値観' }
    ]
  },
  gallery: {
    type: 'gallery',
    title: 'ギャラリー',
    description: '作品や商品の写真を紹介します。',
    images: []
  },
  blog: {
    type: 'blog',
    title: 'ブログ',
    description: '最新の情報をお届けします。',
    posts: [
      {
        title: 'ブログ記事1',
        date: '2024-01-01',
        excerpt: '記事の概要...',
        link: '#'
      }
    ]
  },
  faq: {
    type: 'faq',
    title: 'よくある質問',
    faqs: [
      {
        question: '質問1',
        answer: '回答1'
      },
      {
        question: '質問2',
        answer: '回答2'
      }
    ]
  },
  footer: {
    type: 'footer',
    companyName: '会社名',
    backgroundColor: '#2c3e50',
    textColor: '#ffffff',
    visible: true
  }
};

// デバウンス付きプレビュー更新
function updatePreview() {
  // 既存のタイムアウトをクリア
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  
  // 新しいタイムアウトを設定（100ms後に実行）
  updateTimeout = setTimeout(() => {
    performPreviewUpdate();
  }, 100);
}

// 実際のプレビュー更新処理
async function performPreviewUpdate() {
  try {
    // ローディング状態を表示
    showPreviewLoading();
    
  const formData = new FormData(form);
    
    // パーツデータを追加（画像データが大きすぎる場合は圧縮）
    const partsToSend = parts.map(part => {
      const partCopy = { ...part };
      // 画像データが大きすぎる場合は警告を表示
      if (partCopy.image && partCopy.image.length > 1000000) { // 1MB
        console.warn('画像データが大きすぎます:', partCopy.type, partCopy.image.length);
      }
      return partCopy;
    });
    
    formData.append('parts', JSON.stringify(partsToSend));
    console.log('プレビュー更新:', partsToSend.length, '個のパーツ');

  const res = await fetch("/preview", {
    method: "POST",
    body: formData
  });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('プレビューエラー:', res.status, errorText);
      hidePreviewLoading();
      alert('プレビューの更新に失敗しました: ' + errorText);
      return;
    }

  const html = await res.text();
    
    // スムーズな更新のため、新しいiframeを作成してから置き換え
    const newIframe = document.createElement('iframe');
    newIframe.id = 'previewIframe';
    newIframe.style.width = '100%';
    newIframe.style.height = '100%';
    newIframe.style.border = 'none';
    newIframe.style.opacity = '0';
    newIframe.style.transition = 'opacity 0.3s ease';
    
    // 新しいiframeを挿入
    const previewContainer = document.querySelector('.preview');
    previewContainer.appendChild(newIframe);
    
    // コンテンツを設定
    newIframe.srcdoc = html;
    
    // ロード完了後にフェードイン
    newIframe.onload = () => {
      setTimeout(() => {
        newIframe.style.opacity = '1';
        hidePreviewLoading();
        
        // フッターのコントロールボタンのイベントリスナーを設定（少し遅延）
        setTimeout(() => {
          setupFooterControls();
        }, 100);
        
        // 古いiframeを削除
        const oldIframe = document.getElementById('previewIframe');
        if (oldIframe && oldIframe !== newIframe) {
          oldIframe.remove();
        }
        
        // 新しいiframeのIDを設定
        newIframe.id = 'previewIframe';
        
        // プレビュー更新後にパーツのインタラクションを再設定
        setTimeout(() => {
          try {
            const iframeDoc = newIframe.contentDocument || newIframe.contentWindow.document;
            setupPartInteractions(iframeDoc);
            
            // グローバル関数を再設定
            setupGlobalFunctions(iframeDoc);
            
            // 移動ボタンの状態を更新
            updateMoveButtons(iframeDoc);
          } catch (e) {
            console.log('パーツインタラクション再設定をスキップしました');
          }
        }, 100);
      }, 50);
    };
    
    console.log('プレビュー更新完了');
  } catch (error) {
    console.error('プレビュー更新エラー:', error);
    hidePreviewLoading();
  }
}

// プレビューローディング表示
function showPreviewLoading() {
  const preview = document.querySelector('.preview');
  let loadingDiv = preview.querySelector('.preview-loading');
  
  if (!loadingDiv) {
    loadingDiv = document.createElement('div');
    loadingDiv.className = 'preview-loading';
    loadingDiv.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">更新中...</div>
    `;
    preview.appendChild(loadingDiv);
  }
  
  loadingDiv.style.display = 'flex';
}

// プレビューローディング非表示
function hidePreviewLoading() {
  const loadingDiv = document.querySelector('.preview-loading');
  if (loadingDiv) {
    loadingDiv.style.display = 'none';
  }
}

// パーツアイテムの設定
function setupPartItems() {
  const partItems = document.querySelectorAll('.part-item');
  console.log('パーツアイテム設定:', partItems.length, '個のパーツアイテム');

  partItems.forEach((item, index) => {
    console.log(`パーツアイテム ${index}:`, item.dataset.part);
    
    // 既存のイベントリスナーを削除
    item.replaceWith(item.cloneNode(true));
  });
  
  // 新しい要素を取得
  const newPartItems = document.querySelectorAll('.part-item');
  
  newPartItems.forEach((item, index) => {
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', item.dataset.part);
      console.log('ドラッグ開始:', item.dataset.part);
    });

    item.addEventListener('dragend', (e) => {
      console.log('ドラッグ終了');
    });

    // クリックでもパーツを追加できるようにする
    item.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('パーツクリック:', item.dataset.part);
      addPart(item.dataset.part);
    });
  });
}

// ドラッグ&ドロップ機能
function initDragAndDrop() {
  const preview = document.querySelector('.preview');
  
  // パーツアイテムのイベントリスナーを設定
  setupPartItems();

  // プレビューエリア全体にドロップゾーンを設定
  preview.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    preview.style.backgroundColor = '#f0f8ff';
    preview.style.border = '2px dashed #007bff';
    console.log('ドラッグオーバー');
  });

  preview.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('ドラッグエンター');
  });

  preview.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    // プレビューエリアから完全に離れた時のみ背景を戻す
    if (!preview.contains(e.relatedTarget)) {
      preview.style.backgroundColor = '#fff';
      preview.style.border = 'none';
    }
    console.log('ドラッグリーブ');
  });

  preview.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    preview.style.backgroundColor = '#fff';
    preview.style.border = 'none';
    
    const partType = e.dataTransfer.getData('text/plain');
    console.log('ドロップ:', partType);
    if (partType) {
      addPart(partType);
    }
  });

  // iframeにもドロップイベントを設定
  const iframe = document.getElementById('previewIframe');
  iframe.addEventListener('dragover', (e) => {
    e.preventDefault();
    preview.style.backgroundColor = '#f0f8ff';
    preview.style.border = '2px dashed #007bff';
  });

  iframe.addEventListener('drop', (e) => {
    e.preventDefault();
    preview.style.backgroundColor = '#fff';
    preview.style.border = 'none';
    
    const partType = e.dataTransfer.getData('text/plain');
    console.log('iframeドロップ:', partType);
    if (partType) {
      addPart(partType);
    }
  });
}

// パーツを追加
function addPart(partType) {
  console.log('パーツ追加:', partType);
  console.log('利用可能なテンプレート:', Object.keys(partTemplates));
  console.log('選択されたテンプレート:', partTemplates[partType]);
  
  if (!partTemplates[partType]) {
    console.error('パーツテンプレートが見つかりません:', partType);
    return;
  }
  
  const newPart = { ...partTemplates[partType], id: Date.now() };
  
  // フッター以外のパーツは常に最後のフッターの前に追加
  if (partType !== 'footer') {
    // フッターが存在する場合は、その前に挿入
    const footerIndex = parts.findIndex(p => p.type === 'footer');
    if (footerIndex !== -1) {
      parts.splice(footerIndex, 0, newPart);
    } else {
      parts.push(newPart);
    }
  } else {
    // フッターの場合は常に最後に追加
    parts.push(newPart);
  }
  
  console.log('現在のパーツ:', parts);
  markAsChanged();
  updatePreview();
  selectPart(newPart);
}

// パーツを選択
function selectPart(part) {
  selectedPart = part;
  showPartEditor(part);
}

// パーツエディターを表示
function showPartEditor(part) {
  // パーツ編集タブに切り替え
  switchToTab('parts');
  
  partEditorContent.innerHTML = generatePartEditorHTML(part);
  
  // フッター以外の場合のみ削除ボタンを追加
  if (part.type !== 'footer') {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'パーツを削除';
    deleteButton.style.background = '#dc3545';
    deleteButton.style.color = 'white';
    deleteButton.style.border = 'none';
    deleteButton.style.padding = '8px 16px';
    deleteButton.style.borderRadius = '4px';
    deleteButton.style.cursor = 'pointer';
    deleteButton.style.marginTop = '10px';
    deleteButton.onclick = () => deletePart(part);
    
    partEditorContent.appendChild(deleteButton);
  }
  
  // DOM更新後にイベントリスナーを追加
  setTimeout(() => {
    addPartEditorListeners(part);
  }, 10);
}

// パーツエディターのHTMLを生成
function generatePartEditorHTML(part) {
  switch(part.type) {
    case 'hero':
      return `
        <div class="part-editor-form">
          <label>タイトル<input type="text" value="${part.title}" data-field="title"></label>
          <label>サブタイトル<input type="text" value="${part.subtitle}" data-field="subtitle"></label>
          <label>説明文<textarea data-field="description">${part.description}</textarea></label>
          <label>ボタンテキスト<input type="text" value="${part.buttonText}" data-field="buttonText"></label>
          <label>ボタンリンク<input type="url" value="${part.buttonLink || '#'}" data-field="buttonLink" placeholder="https://example.com"></label>
          <label>背景色<input type="color" value="${part.backgroundColor || '#667eea'}" data-field="backgroundColor"></label>
          <label>画像<input type="file" data-field="image" accept="image/*"></label>
        </div>
      `;
    case 'features':
      return `
        <div class="part-editor-form">
          <label>タイトル<input type="text" value="${part.title}" data-field="title"></label>
          <div class="features-list">
            ${part.items.map((item, index) => `
              <div class="feature-item">
                <label>アイコン<input type="text" value="${item.icon}" data-field="items.${index}.icon"></label>
                <label>タイトル<input type="text" value="${item.title}" data-field="items.${index}.title"></label>
                <label>説明<input type="text" value="${item.description}" data-field="items.${index}.description"></label>
                <label>リンク<input type="url" value="${item.link || '#'}" data-field="items.${index}.link" placeholder="https://example.com"></label>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    case 'pricing':
      return `
        <div class="part-editor-form">
          <label>タイトル<input type="text" value="${part.title}" data-field="title"></label>
          <div class="pricing-controls">
            <button type="button" class="add-plan-btn" onclick="addPricingPlan('${part.id || parts.indexOf(part)}')" ${part.plans.length >= 4 ? 'disabled' : ''}>プランを追加</button>
            <span class="plan-count">${part.plans.length}/4 プラン</span>
          </div>
          <div class="pricing-list">
            ${part.plans.map((plan, index) => `
              <div class="pricing-item">
                <div class="pricing-item-header">
                  <h4>プラン ${index + 1}</h4>
                  ${part.plans.length > 1 ? `<button type="button" class="remove-plan-btn" onclick="removePricingPlan('${part.id || parts.indexOf(part)}', ${index})">削除</button>` : ''}
                </div>
                <label>プラン名<input type="text" value="${plan.name}" data-field="plans.${index}.name"></label>
                <label>価格<input type="text" value="${plan.price}" data-field="plans.${index}.price"></label>
                <label>リンク<input type="url" value="${plan.link || '#'}" data-field="plans.${index}.link" placeholder="https://example.com"></label>
                <div class="features-edit">
                  <label>機能一覧<textarea data-field="plans.${index}.features" placeholder="機能1&#10;機能2&#10;機能3">${plan.features.join('\n')}</textarea></label>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    case 'contact':
      return `
        <div class="part-editor-form">
          <label>タイトル<input type="text" value="${part.title}" data-field="title"></label>
          <label>説明文<textarea data-field="description">${part.description}</textarea></label>
          <label>メールアドレス<input type="email" value="${part.email}" data-field="email"></label>
          <label>メールリンク<input type="url" value="${part.emailLink || 'mailto:' + part.email}" data-field="emailLink" placeholder="mailto:example@email.com"></label>
          <label>電話番号<input type="tel" value="${part.phone}" data-field="phone"></label>
          <label>電話リンク<input type="url" value="${part.phoneLink || 'tel:' + part.phone}" data-field="phoneLink" placeholder="tel:03-1234-5678"></label>
        </div>
      `;
    case 'testimonial':
      return `
        <div class="part-editor-form">
          <label>タイトル<input type="text" value="${part.title}" data-field="title"></label>
          <div class="testimonials-list">
            ${part.testimonials.map((testimonial, index) => `
              <div class="testimonial-item">
                <label>名前<input type="text" value="${testimonial.name}" data-field="testimonials.${index}.name"></label>
                <label>コメント<textarea data-field="testimonials.${index}.comment">${testimonial.comment}</textarea></label>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    case 'about':
      return `
        <div class="part-editor-form">
          <label>タイトル<input type="text" value="${part.title}" data-field="title"></label>
          <label>説明文<textarea data-field="description">${part.description}</textarea></label>
          <label>画像<input type="file" data-field="image" accept="image/*"></label>
          <div class="about-features-list">
            <h4>特徴項目</h4>
            ${part.features.map((feature, index) => `
              <div class="about-feature-item">
                <label>タイトル<input type="text" value="${feature.title}" data-field="features.${index}.title"></label>
                <label>説明<textarea data-field="features.${index}.description">${feature.description}</textarea></label>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    case 'gallery':
      return `
        <div class="part-editor-form">
          <label>タイトル<input type="text" value="${part.title}" data-field="title"></label>
          <label>説明文<textarea data-field="description">${part.description}</textarea></label>
          <label>画像を追加<input type="file" data-field="galleryImages" accept="image/*" multiple></label>
          <div class="gallery-images-list">
            <h4>ギャラリー画像</h4>
            ${part.images && part.images.length > 0 ? part.images.map((image, index) => `
              <div class="gallery-image-item">
                <img src="${image}" alt="ギャラリー画像" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">
                <button type="button" onclick="removeGalleryImage('${part.id || parts.indexOf(part)}', ${index})">削除</button>
              </div>
            `).join('') : '<p>画像がありません</p>'}
          </div>
        </div>
      `;
    case 'blog':
      return `
        <div class="part-editor-form">
          <label>タイトル<input type="text" value="${part.title}" data-field="title"></label>
          <label>説明文<textarea data-field="description">${part.description}</textarea></label>
          <div class="blog-posts-list">
            <h4>ブログ記事</h4>
            ${part.posts.map((post, index) => `
              <div class="blog-post-item">
                <label>記事タイトル<input type="text" value="${post.title}" data-field="posts.${index}.title"></label>
                <label>日付<input type="date" value="${post.date}" data-field="posts.${index}.date"></label>
                <label>概要<textarea data-field="posts.${index}.excerpt">${post.excerpt}</textarea></label>
                <label>リンク<input type="url" value="${post.link || '#'}" data-field="posts.${index}.link" placeholder="https://example.com"></label>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    case 'faq':
      return `
        <div class="part-editor-form">
          <label>タイトル<input type="text" value="${part.title}" data-field="title"></label>
          <div class="faq-list">
            <h4>よくある質問</h4>
            ${part.faqs.map((faq, index) => `
              <div class="faq-item">
                <label>質問<input type="text" value="${faq.question}" data-field="faqs.${index}.question"></label>
                <label>回答<textarea data-field="faqs.${index}.answer">${faq.answer}</textarea></label>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    case 'footer':
      return `
        <div class="part-editor-form">
          <label>会社名<input type="text" value="${part.companyName}" data-field="companyName"></label>
          <label>背景色<input type="color" value="${part.backgroundColor || '#2c3e50'}" data-field="backgroundColor"></label>
          <label>文字色<input type="color" value="${part.textColor || '#ffffff'}" data-field="textColor"></label>
        </div>
      `;
    default:
      return `<p>このパーツの編集は準備中です。</p>`;
  }
}

// パーツエディターのイベントリスナーを追加
function addPartEditorListeners(part) {
  const inputs = partEditorContent.querySelectorAll('input, textarea');
  console.log('パーツエディターリスナー設定:', inputs.length, '個の入力フィールド');
  console.log('選択中のパーツ:', part.type, part);
  
  inputs.forEach((input, index) => {
    console.log(`入力フィールド ${index}:`, input.type, input.dataset.field, input.value);
    
    // 既存のイベントリスナーを削除
    input.removeEventListener('input', handlePartInput);
    input.removeEventListener('change', handlePartChange);
    
    // 新しいイベントリスナーを追加
    input.addEventListener('input', handlePartInput);
    input.addEventListener('change', handlePartChange);
    
    console.log(`入力フィールド ${index} にイベントリスナーを追加しました`);
  });
}

// パーツ入力のハンドラー
function handlePartInput(e) {
  const field = e.target.dataset.field;
  const part = selectedPart;
  if (part && field) {
    console.log('パーツ入力変更:', field, e.target.value);
    updatePartField(part, field, e.target.value);
    markAsChanged();
  }
}

// パーツ変更のハンドラー
function handlePartChange(e) {
  const part = selectedPart;
  if (part && e.target.type === 'file') {
    console.log('パーツファイル変更');
    handleImageUpload(part, e.target);
  } else if (part && e.target.type === 'checkbox') {
    const field = e.target.dataset.field;
    const value = e.target.checked;
    console.log('パーツチェックボックス変更:', field, value);
    updatePartField(part, field, value);
  }
}

// 料金プランの追加
function addPricingPlan(partId) {
  const part = parts.find(p => String(p.id || parts.indexOf(p)) === String(partId));
  if (part && part.type === 'pricing' && part.plans.length < 4) {
    const newPlan = {
      name: `プラン${part.plans.length + 1}`,
      price: '¥0',
      features: ['機能1', '機能2'],
      link: '#'
    };
    part.plans.push(newPlan);
    console.log('プラン追加:', part.plans.length, '個のプラン');
    updatePreview();
    // エディターを再表示
    showPartEditor(part);
  }
}

// 料金プランの削除
function removePricingPlan(partId, planIndex) {
  const part = parts.find(p => String(p.id || parts.indexOf(p)) === String(partId));
  if (part && part.type === 'pricing' && part.plans.length > 1) {
    part.plans.splice(planIndex, 1);
    console.log('プラン削除:', part.plans.length, '個のプラン');
    updatePreview();
    // エディターを再表示
    showPartEditor(part);
  }
}

// ギャラリー画像削除
function removeGalleryImage(partId, imageIndex) {
  const part = parts.find(p => String(p.id || parts.indexOf(p)) === String(partId));
  if (part && part.type === 'gallery' && part.images && part.images.length > 0) {
    part.images.splice(imageIndex, 1);
    console.log('ギャラリー画像削除:', part.images.length, '個の画像');
    updatePreview();
    showPartEditor(part);
  }
}

// フッターの表示・非表示を制御
function toggleFooterVisibility() {
  let footer = parts.find(p => p.type === 'footer');
  if (!footer) {
    // フッターが存在しない場合は作成
    footer = { ...partTemplates.footer, id: Date.now() };
    parts.push(footer);
  }
  footer.visible = !footer.visible;
  console.log('フッター表示状態:', footer.visible);
  updatePreview();
}

// 親ウィンドウからフッターの編集を処理
window.editPartFromParent = function(partId) {
  console.log('親ウィンドウからパーツ編集:', partId);
  let part = parts.find(p => String(p.id || parts.indexOf(p)) === String(partId));
  
  // デフォルトフッターの場合は新しく作成
  if (partId === 'default-footer' && !part) {
    part = {
      id: Date.now(),
      type: 'footer',
      companyName: 'Your Company',
      backgroundColor: '#2c3e50',
      textColor: '#ffffff',
      visible: true
    };
    parts.push(part);
  }
  
  if (part) {
    selectPart(part);
  }
};

// フッターの表示/非表示を切り替え
window.toggleFooterVisibility = function(partId) {
  try {
    console.log('toggleFooterVisibility called with partId:', partId);
    
    let part = parts.find(p => String(p.id || parts.indexOf(p)) === String(partId));
    
    // デフォルトフッターの場合は新しく作成
    if (partId === 'default-footer' && !part) {
      part = {
        id: Date.now(),
        type: 'footer',
        companyName: 'Your Company',
        backgroundColor: '#2c3e50',
        textColor: '#ffffff',
        visible: true
      };
      parts.push(part);
      console.log('デフォルトフッターを作成しました:', part);
    }
    
    if (part && part.type === 'footer') {
      part.visible = !part.visible;
      console.log('フッター表示切り替え:', part.visible ? '表示' : '非表示');
      
      // フッターの表示/非表示はプレビュー画面でのみ制御
      
      updatePreview();
    } else {
      console.error('フッターパーツが見つかりません:', partId);
    }
  } catch (error) {
    console.error('toggleFooterVisibility でエラーが発生しました:', error);
  }
};

// モーダルの開閉
function openNoticeModal() {
  const modal = document.getElementById('noticeModal');
  if (modal) {
    modal.style.display = 'block';
    // 背景のスクロールを無効化
    document.body.style.overflow = 'hidden';
    // ESCキーで閉じる
    document.addEventListener('keydown', handleModalKeydown);
  }
}

function closeNoticeModal() {
  const modal = document.getElementById('noticeModal');
  if (modal) {
    modal.style.display = 'none';
    // 背景のスクロールを有効化
    document.body.style.overflow = 'hidden'; // 元々hiddenなので維持
    // イベントリスナーを削除
    document.removeEventListener('keydown', handleModalKeydown);
  }
}

function handleModalKeydown(e) {
  if (e.key === 'Escape') {
    closeNoticeModal();
  }
}

// モーダル外をクリックしたら閉じる
window.onclick = function(event) {
  const modal = document.getElementById('noticeModal');
  if (event.target === modal) {
    closeNoticeModal();
  }
};

// フッターのコントロールボタンのイベントリスナーを設定
function setupFooterControls() {
  const iframe = document.getElementById('previewIframe') || document.getElementById('preview');
  if (iframe && iframe.contentDocument) {
    const footerControls = iframe.contentDocument.querySelectorAll('.footer-controls button');
    console.log('フッターコントロールボタン発見:', footerControls.length);
    footerControls.forEach(button => {
      try {
        // data-part-id属性からpartIdを取得
        const partId = button.getAttribute('data-part-id');
        if (partId) {
          console.log('フッターボタンのpartId:', partId);
          
          // 複数のイベントで確実にキャッチ
          button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('フッターボタンクリック:', partId, button.className);
            
            if (button.classList.contains('part-edit-btn')) {
              editPartFromParent(partId);
            } else if (button.classList.contains('toggle-footer-btn')) {
              toggleFooterVisibility(partId);
            }
          }, true);
        } else {
          console.warn('フッターボタンにdata-part-id属性がありません:', button);
        }
      } catch (error) {
        console.error('フッターボタンの設定でエラー:', error, button);
      }
    });
  }
}


// パーツのフィールドを更新
function updatePartField(part, field, value) {
  if (field.includes('.')) {
    const [parent, child, index] = field.split('.');
    part[parent][index][child] = value;
  } else {
    part[field] = value;
  }
  
  // パーツ編集時は即座に更新（デバウンスなし）
  console.log('パーツフィールド更新:', field, value);
  performPreviewUpdate();
}

// 画像アップロード処理
function handleImageUpload(part, fileInput) {
  const files = fileInput.files;
  if (files.length === 0) return;
  
  // ギャラリーの場合は複数ファイル処理
  if (part.type === 'gallery' && fileInput.dataset.field === 'galleryImages') {
    if (!part.images) part.images = [];
    
    Array.from(files).forEach(file => {
      // ファイルサイズをチェック（5MB制限）
      if (file.size > 5 * 1024 * 1024) {
        alert(`画像ファイル「${file.name}」は5MB以下にしてください。`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        
        // 画像を圧縮
        compressImage(imageDataUrl, (compressedDataUrl) => {
          part.images.push(compressedDataUrl);
          console.log('ギャラリー画像追加:', part.images.length, '個の画像');
          updatePreview();
          showPartEditor(part);
        });
      };
      reader.onerror = (e) => {
        console.error('画像読み込みエラー:', e);
        alert('画像の読み込みに失敗しました。');
      };
      reader.readAsDataURL(file);
    });
  } else {
    // 単一画像の処理
    const file = files[0];
    // ファイルサイズをチェック（5MB制限）
    if (file.size > 5 * 1024 * 1024) {
      alert('画像ファイルは5MB以下にしてください。');
      fileInput.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target.result;
      
      // 画像を圧縮
      compressImage(imageDataUrl, (compressedDataUrl) => {
        part.image = compressedDataUrl;
        console.log('画像アップロード完了:', part.type, '元ファイルサイズ:', file.size, '圧縮後サイズ:', compressedDataUrl.length);
        updatePreview();
      });
    };
    reader.onerror = (e) => {
      console.error('画像読み込みエラー:', e);
      alert('画像の読み込みに失敗しました。');
      fileInput.value = '';
    };
    reader.readAsDataURL(file);
  }
}

// 画像圧縮関数
function compressImage(dataUrl, callback) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 最大サイズを設定（1920x1080）
    const maxWidth = 1920;
    const maxHeight = 1080;
    
    let { width, height } = img;
    
    // アスペクト比を保ちながらリサイズ
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // 画像を描画
    ctx.drawImage(img, 0, 0, width, height);
    
    // JPEG形式で圧縮（品質80%）
    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    callback(compressedDataUrl);
  };
  
  img.onerror = () => {
    console.error('画像圧縮エラー');
    callback(dataUrl); // 圧縮に失敗した場合は元の画像を使用
  };
  
  img.src = dataUrl;
}

// フォームの値が変わった瞬間に更新
form.addEventListener("input", updatePreview);
form.addEventListener("change", updatePreview);

// 表示/非表示チェックボックスのイベントハンドラー
document.addEventListener('change', function(e) {
  if (e.target && e.target.id === 'part-visible') {
    const part = selectedPart;
    if (part) {
      part.visible = e.target.checked;
      console.log('パーツ表示切り替え:', part.visible ? '表示' : '非表示', part.type);
      updatePreview();
    }
  }
});

// iframeからのpostMessageを処理
window.addEventListener('message', function(event) {
  console.log('Received message from iframe:', event.data);
  
  if (event.data && event.data.type === 'toggleFooterVisibility') {
    const partId = event.data.partId;
    console.log('Processing toggleFooterVisibility for partId:', partId);
    toggleFooterVisibility(partId);
  } else if (event.data && event.data.type === 'editPartFromParent') {
    const partId = event.data.partId;
    console.log('Processing editPartFromParent for partId:', partId);
    editPartFromParent(partId);
  }
});

// グローバル関数の設定
function setupGlobalFunctions(iframeDoc) {
  if (iframeDoc && iframeDoc.defaultView) {
    iframeDoc.defaultView.editPart = function(partId) {
      console.log('パーツ編集:', partId);
      const part = parts.find(p => String(p.id || parts.indexOf(p)) === String(partId));
      if (part) {
        selectPart(part);
      }
    };

    iframeDoc.defaultView.deletePartFromPreview = function(partId) {
      console.log('プレビューからパーツ削除:', partId);
      const part = parts.find(p => String(p.id || parts.indexOf(p)) === String(partId));
      if (part) {
        // フッターは削除できない
        if (part.type === 'footer') {
          alert('フッターは削除できません。');
          return;
        }
        deletePart(part);
      }
    };

    iframeDoc.defaultView.movePartUp = function(partId) {
      console.log('パーツ上移動:', partId);
      const partIndex = parts.findIndex(p => String(p.id || parts.indexOf(p)) === String(partId));
      const part = parts[partIndex];
      
      // フッターの移動は禁止
      if (part && part.type === 'footer') {
        console.log('フッターは移動できません');
        return;
      }
      
      if (partIndex > 0) {
        parts.splice(partIndex, 1);
        parts.splice(partIndex - 1, 0, part);
        console.log('上移動完了:', parts.map(p => p.type));
        markAsChanged();
        updatePreview();
        updateMoveButtons(iframeDoc);
      }
    };

    iframeDoc.defaultView.movePartDown = function(partId) {
      console.log('パーツ下移動:', partId);
      const partIndex = parts.findIndex(p => String(p.id || parts.indexOf(p)) === String(partId));
      const part = parts[partIndex];
      
      // フッターの移動は禁止
      if (part && part.type === 'footer') {
        console.log('フッターは移動できません');
        return;
      }
      
      if (partIndex < parts.length - 1) {
        parts.splice(partIndex, 1);
        parts.splice(partIndex + 1, 0, part);
        console.log('下移動完了:', parts.map(p => p.type));
        markAsChanged();
        updatePreview();
        updateMoveButtons(iframeDoc);
      }
    };
  }
}

// 移動ボタンの状態を更新
function updateMoveButtons(iframeDoc) {
  const partElements = iframeDoc.querySelectorAll('.part');
  
  partElements.forEach((partElement, index) => {
    const upBtn = partElement.querySelector('.part-move-up-btn');
    const downBtn = partElement.querySelector('.part-move-down-btn');
    const partId = partElement.dataset.partId;
    const part = parts.find(p => String(p.id || parts.indexOf(p)) === String(partId));
    
    if (upBtn) {
      upBtn.disabled = index === 0 || (part && part.type === 'footer');
    }
    
    if (downBtn) {
      downBtn.disabled = index === parts.length - 1 || (part && part.type === 'footer');
    }
  });
}

// プレビュー内のパーツクリック処理とドラッグ&ドロップ
function setupPreviewClickHandler() {
  iframe.addEventListener('load', () => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      setupPartInteractions(iframeDoc);
      setupGlobalFunctions(iframeDoc);
    } catch (e) {
      // クロスオリジンエラーの場合は無視
      console.log('プレビューのイベント設定をスキップしました');
    }
  });
}

// パーツのインタラクション設定
function setupPartInteractions(iframeDoc) {
  const editButtons = iframeDoc.querySelectorAll('.part-edit-btn');
  const partElements = iframeDoc.querySelectorAll('.part');
  
  // 編集ボタンのクリックイベント
  editButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const partId = button.closest('.part').dataset.partId;
      const part = parts.find(p => String(p.id || parts.indexOf(p)) === String(partId));
      if (part) {
        selectPart(part);
      }
    });
  });

  // パーツのクリック処理（ドラッグ&ドロップは無効化）
  partElements.forEach(partElement => {
    partElement.draggable = false;
    
    // パーツクリックで編集（空のパーツは除外）
    const partId = partElement.dataset.partId;
    const part = parts.find(p => String(p.id || parts.indexOf(p)) === String(partId));
    
    // 空のパーツの場合はクリックイベントを設定しない
    if (partElement.classList.contains('empty-part')) {
      console.log('空のパーツ要素 - クリックイベントを設定しません');
      return;
    }
    
    // パーツが存在し、フッターでない場合のみクリックイベントを設定
    if (part && part.type !== 'footer') {
      partElement.addEventListener('click', (e) => {
        // ボタンがクリックされた場合は無視
        if (e.target.classList.contains('part-edit-btn') || 
            e.target.classList.contains('part-delete-btn') ||
            e.target.classList.contains('part-move-up-btn') ||
            e.target.classList.contains('part-move-down-btn')) {
          return;
        }
        
        selectPart(part);
      });
    }
  });
}


// パーツを削除
function deletePart(part) {
  // フッターは削除できない
  if (part.type === 'footer') {
    alert('フッターは削除できません。');
    return;
  }
  
  if (confirm('このパーツを削除しますか？')) {
    const partIndex = parts.findIndex(p => p === part);
    if (partIndex !== -1) {
      parts.splice(partIndex, 1);
      console.log('パーツ削除:', part.type);
      markAsChanged();
      updatePreview();
      
      // パーツエディターをリセット
      partEditorContent.innerHTML = '<p class="no-part-selected">パーツを選択して編集してください</p>';
      selectedPart = null;
      
      // 一般設定タブに戻る
      switchToTab('general');
    }
  }
}


// タブ切り替え機能
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;
      switchToTab(targetTab);
    });
  });
}

// アコーディオンメニュー初期化
function initAccordion() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const accordionItem = header.parentElement;
      const content = accordionItem.querySelector('.accordion-content');
      const icon = header.querySelector('.accordion-icon');
      
      // 他のアコーディオンを閉じる
      accordionHeaders.forEach(otherHeader => {
        if (otherHeader !== header) {
          const otherItem = otherHeader.parentElement;
          const otherContent = otherItem.querySelector('.accordion-content');
          const otherIcon = otherHeader.querySelector('.accordion-icon');
          
          otherHeader.classList.remove('active');
          otherContent.classList.remove('active');
          otherIcon.style.transform = 'rotate(0deg)';
        }
      });
      
      // 現在のアコーディオンを切り替え
      header.classList.toggle('active');
      content.classList.toggle('active');
      
      if (header.classList.contains('active')) {
        icon.style.transform = 'rotate(180deg)';
      } else {
        icon.style.transform = 'rotate(0deg)';
      }
    });
  });
}

function switchToTab(tabName) {
  // すべてのタブボタンからactiveクラスを削除
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // すべてのタブコンテンツからactiveクラスを削除
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // 選択されたタブをアクティブにする
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
  
  // 一般設定タブに切り替わった場合、パーツアイテムを再設定
  if (tabName === 'general') {
    setTimeout(() => {
      setupPartItems();
    }, 100);
  }
}

// プレビュー機能
function initPreviewButtons() {
  const openPreviewBtn = document.getElementById('openPreviewBtn');
  const downloadHtmlBtn = document.getElementById('downloadHtmlBtn');
  
  if (openPreviewBtn) {
    openPreviewBtn.addEventListener('click', openPreviewInNewTab);
  }
  
  if (downloadHtmlBtn) {
    downloadHtmlBtn.addEventListener('click', downloadHtml);
  }
}

// 新しいタブでプレビューを開く
async function openPreviewInNewTab() {
  try {
    const formData = new FormData(form);
    
    // パーツデータを安全に送信
    const partsToSend = parts.map(part => {
      const partCopy = { ...part };
      // 画像データが大きすぎる場合は警告を表示
      if (partCopy.image && partCopy.image.length > 1000000) {
        console.warn('書き出しプレビュー: 画像データが大きすぎます:', partCopy.type);
      }
      return partCopy;
    });
    
    formData.append('parts', JSON.stringify(partsToSend));
    
    const res = await fetch("/export-preview", {
      method: "POST",
      body: formData
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error('プレビュー生成に失敗しました: ' + errorText);
    }
    
    const html = await res.text();
    const newWindow = window.open('', '_blank');
    newWindow.document.write(html);
    newWindow.document.close();
  } catch (error) {
    console.error('プレビューエラー:', error);
    alert('プレビューの生成に失敗しました: ' + error.message);
  }
}

// HTMLをダウンロード（ZIPファイルとして）
async function downloadHtml() {
  try {
    const formData = new FormData(form);
    
    // パーツデータを安全に送信
    const partsToSend = parts.map(part => {
      const partCopy = { ...part };
      // 画像データが大きすぎる場合は警告を表示
      if (partCopy.image && partCopy.image.length > 1000000) {
        console.warn('HTMLダウンロード: 画像データが大きすぎます:', partCopy.type);
      }
      return partCopy;
    });
    
    formData.append('parts', JSON.stringify(partsToSend));
    
    const res = await fetch("/export-zip", {
      method: "POST",
      body: formData
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error('ZIP生成に失敗しました: ' + errorText);
    }
    
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'landing-page.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('ダウンロードエラー:', error);
    alert('ZIPファイルのダウンロードに失敗しました: ' + error.message);
  }
}

// 初期化
window.addEventListener("DOMContentLoaded", () => {
  console.log('DOM読み込み完了');
  
  // 少し遅延させてから初期化
  setTimeout(() => {
    console.log('初期化開始');
    initTabs();
    initAccordion();
    initDragAndDrop();
    setupPreviewClickHandler();
    initPreviewButtons();
    
    // フッターが存在しない場合は自動追加
    if (!parts.find(p => p.type === 'footer')) {
      const footer = { ...partTemplates.footer, id: Date.now() };
      parts.push(footer);
      console.log('フッターを自動追加');
    }
    
    updatePreview();
  }, 100);
});
