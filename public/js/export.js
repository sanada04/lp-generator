// FAQ アコーディオンの機能
document.addEventListener('DOMContentLoaded', function() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const answer = this.nextElementSibling;
      const isOpen = answer.classList.contains('show');
      
      // すべての回答を閉じる
      document.querySelectorAll('.faq-answer').forEach(ans => {
        ans.classList.remove('show');
      });
      
      // クリックされた質問の回答を開く/閉じる
      if (!isOpen) {
        answer.classList.add('show');
      }
    });
  });
});

// スムーズスクロール機能
document.addEventListener('DOMContentLoaded', function() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

// 画像の遅延読み込み
document.addEventListener('DOMContentLoaded', function() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
});

// アニメーション効果
document.addEventListener('DOMContentLoaded', function() {
  const animatedElements = document.querySelectorAll('.feature-item, .pricing-plan, .testimonial-item, .gallery-item');
  
  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1
  });
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    animationObserver.observe(el);
  });
});

// フォーム送信の処理
document.addEventListener('DOMContentLoaded', function() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // フォームデータを取得
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      // ここでフォームデータを処理
      console.log('フォームデータ:', data);
      
      // 成功メッセージを表示
      alert('お問い合わせありがとうございます。後日担当者よりご連絡いたします。');
      
      // フォームをリセット
      form.reset();
    });
  });
});

// モバイルメニューの処理
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('active');
      this.classList.toggle('active');
    });
  }
});

// ページトップボタン
document.addEventListener('DOMContentLoaded', function() {
  const pageTopBtn = document.querySelector('.page-top-btn');
  
  if (pageTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        pageTopBtn.classList.add('show');
      } else {
        pageTopBtn.classList.remove('show');
      }
    });
    
    pageTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
