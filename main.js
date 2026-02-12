document.addEventListener('DOMContentLoaded', () => {
  const modeToggle = document.getElementById('mode-toggle');
  const languageSwitcher = document.getElementById('language-switcher');
  const htmlElement = document.documentElement;

  // --- Dark/Light Mode ---
  const currentTheme = localStorage.getItem('theme');
      if (currentTheme) {
        document.body.classList.add(currentTheme); // Changed from htmlElement
        if (currentTheme === 'dark-mode') {
          modeToggle.textContent = '라이트 모드';
        } else {
          modeToggle.textContent = '다크 모드';
        }
      } else {
        // Default to light mode and set button text
        document.body.classList.add('light-mode'); // Changed from htmlElement
        modeToggle.textContent = '다크 모드';
      }
  
      modeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('dark-mode')) { // Changed from htmlElement
          document.body.classList.remove('dark-mode'); // Changed from htmlElement
          document.body.classList.add('light-mode'); // Changed from htmlElement
          localStorage.setItem('theme', 'light-mode');
          modeToggle.textContent = '다크 모드';
        } else {
          document.body.classList.remove('light-mode'); // Changed from htmlElement
          document.body.classList.add('dark-mode'); // Changed from htmlElement
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
    },
    'en': {
      'title': 'Three Kids Farm',
      'mode-toggle-label': 'Dark Mode',
      'nav-home': 'Home',
      'nav-produce-sales': 'Produce Sales',
      'nav-smartfarm-consulting': 'Smartfarm Consulting',
      'nav-contact-us': 'Contact Us',
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
      'efficient-agri': 'Efficient agriculture with the latest technology',
      'remote-monitoring': 'Remote Monitoring',
      'energy-management': 'Energy Management',
      'contact-us': 'Contact Us',
      'ceo-label': 'CEO',
      'location-label': 'Yeongju-si, Gyeongsangbuk-do',
      'copyright': '© 2026 Se-Ai Farm Smart Farm. All rights reserved.',
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
      modeToggle.textContent = htmlElement.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    } else { // ko
      modeToggle.textContent = htmlElement.classList.contains('dark-mode') ? '라이트 모드' : '다크 모드';
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
      modeToggle.textContent = htmlElement.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    } else { // ko
      modeToggle.textContent = htmlElement.classList.contains('dark-mode') ? '라이트 모드' : '다크 모드';
    }
  });
});