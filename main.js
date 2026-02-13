document.addEventListener('DOMContentLoaded', () => {
  const modeToggle = document.getElementById('mode-toggle');
  const languageSwitcher = document.getElementById('language-switcher');
  const htmlElement = document.documentElement;

  // --- Dark/Light Mode ---
  const currentTheme = localStorage.getItem('theme');
      if (currentTheme) {
        document.body.classList.add(currentTheme);
        if (currentTheme === 'dark-mode') {
          modeToggle.textContent = '라이트 모드';
        } else {
          modeToggle.textContent = '다크 모드';
        }
      } else {
        // Default to light mode and set button text
        document.body.classList.add('light-mode');
        modeToggle.textContent = '다크 모드';
      }
  
      modeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('dark-mode')) {
          document.body.classList.remove('dark-mode');
          document.body.classList.add('light-mode');
          localStorage.setItem('theme', 'light-mode');
          modeToggle.textContent = '다크 모드';
        } else {
          document.body.classList.remove('light-mode');
          document.body.classList.add('dark-mode');
          localStorage.setItem('theme', 'dark-mode');
          modeToggle.textContent = '라이트 모드';
        }
      });
  // --- Language Switcher ---
  const translations = {
    'ko': {
      'title': '세아이농장 스마트팜',
      'mode-toggle-label': '다크 모드',
      'nav-home': '홈',
      'nav-produce-sales': '농산물 판매',
      'nav-smartfarm-consulting': '스마트팜 시설 컨설팅',
      'nav-contact-us': '문의',
      'nav-pest-diagnosis': '병해충 진단',
      'farm-name': '세아이농장 스마트팜',
      'farm-inquiry': '농산물스마트팜문의',
      'slogan-1': '신선한 농산물 & 스마트팜 솔루션',
      'slogan-2': '청정 자연에서 재배한 프리미엄 농산물과 최첨단 스마트팜 시설',
      'produce-sales': '농산물 판매',
      'eco-friendly-veg': '친환경 채소',
      'fresh-healthy-food': '신선하고 건강한 먹거리',
      'organic-rice': '유기농 쌀',
      'special-products': '특산물',
      'smartfarm-consulting': '스마트팜 시설 컨설팅',
      'auto-env-control': '자동 환경 제어',
      'efficient-agri': '최신 기술로 효율적인 농업',
      'remote-monitoring': '원격 모니터링',
      'energy-management': '에너지 관리',
      'contact-us': '문의하기',
      'ceo-label': '대표자',
      'location-label': '경상북도 영주시',
      'copyright': '© 2026 세아이농장 스마트팜. All rights reserved.',
      'form-name-label': '이름:',
      'form-email-label': '이메일:',
      'form-message-label': '메시지:',
      'form-submit-button': '문의 보내기',
      'pest-diagnosis-title': '병해충 진단',
      'pest-diagnosis-description': '작물 이미지를 업로드하여 병해충을 진단하고 방제 정보를 받아보세요.',
      'upload-image-button': '이미지 업로드',
      'image-preview-placeholder': '이미지 미리보기',
      'analyze-image-button': 'AI 분석 시작',
      'diagnosis-result-title': '진단 결과:',
      'pest-name': '병해충 이름: ',
      'control-info': '방제 정보: ',
    },
    'en': {
      'title': 'Three Kids Farm',
      'mode-toggle-label': 'Dark Mode',
      'nav-home': 'Home',
      'nav-produce-sales': 'Produce Sales',
      'nav-smartfarm-consulting': 'Smartfarm Consulting',
      'nav-contact-us': 'Contact Us',
      'nav-pest-diagnosis': 'Pest Diagnosis',
      'farm-name': 'Three Kids Farm',
      'farm-inquiry': 'Agricultural Products Smart Farm Inquiry',
      'slogan-1': 'Fresh Agricultural Products & Smart Farm Solutions',
      'slogan-2': 'Premium agricultural products grown in pristine nature and state-of-the-art smart farm facilities',
      'produce-sales': 'Agricultural Product Sales',
      'eco-friendly-veg': 'Eco-Friendly Vegetables',
      'fresh-healthy-food': 'Fresh and healthy food',
      'organic-rice': 'Organic Rice',
      'special-products': 'Special Products',
      'smartfarm-consulting': 'Smart Farm Facility Consulting',
      'auto-env-control': 'Automatic Environmental Control',
      'remote-monitoring': 'Remote Monitoring',
      'energy-management': 'Energy Management',
      'contact-us': 'Contact Us',
      'ceo-label': 'CEO',
      'location-label': 'Yeongju-si, Gyeongsangbuk-do',
      'copyright': '© 2026 Se-Ai Farm Smart Farm. All rights reserved.',
      'form-name-label': 'Name:',
      'form-email-label': 'Email:',
      'form-message-label': 'Message:',
      'form-submit-button': 'Send Inquiry',
      'pest-diagnosis-title': 'Pest and Disease Diagnosis',
      'pest-diagnosis-description': 'Upload a plant image to diagnose pests and diseases and get control information.',
      'upload-image-button': 'Upload Image',
      'image-preview-placeholder': 'Image Preview',
      'analyze-image-button': 'Start AI Analysis',
      'diagnosis-result-title': 'Diagnosis Result:',
      'pest-name': 'Pest Name: ',
      'control-info': 'Control Information: ',
    }
  };

  const setLanguage = (lang) => {
    document.querySelectorAll('[data-key]').forEach(element => {
      const key = element.getAttribute('data-key');
      if (translations[lang][key]) {
        if (element.tagName === 'TITLE') {
          element.textContent = translations[lang][key];
        } else {
          // Handle cases where the text might be inside a strong tag or directly in the element
          if (element.firstElementChild && element.firstElementChild.tagName === 'STRONG') {
            element.firstElementChild.textContent = translations[lang][key];
          } else {
            element.textContent = translations[lang][key];
          }
        }
      }
    });
    htmlElement.lang = lang;
    if (lang === 'en') {
      modeToggle.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    } else { // ko
      modeToggle.textContent = document.body.classList.contains('dark-mode') ? '라이트 모드' : '다크 모드';
    }
  };

  const savedLang = localStorage.getItem('lang') || 'ko';
  languageSwitcher.value = savedLang;
  setLanguage(savedLang);

  languageSwitcher.addEventListener('change', (event) => {
    const newLang = event.target.value;
    localStorage.setItem('lang', newLang);
    setLanguage(newLang);
  });

  // Update mode toggle button text when language changes, if the mode toggle button is clicked
  modeToggle.addEventListener('click', () => {
    const currentLang = htmlElement.lang;
    if (currentLang === 'en') {
      modeToggle.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    } else { // ko
      modeToggle.textContent = document.body.classList.contains('dark-mode') ? '라이트 모드' : '다크 모드';
    }
  });
});