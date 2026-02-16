document.addEventListener('DOMContentLoaded', () => {
  console.log('diagnosis.js loaded and DOMContentLoaded event listener added.');

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
      'title-diagnosis': '병해충 AI 진단',
      'mode-toggle-label': '다크 모드',
      'nav-home': '홈',
      'nav-pest-diagnosis': '병해충 AI 진단',
      'pest-diagnosis-title': '병해충 AI 진단',
      'pest-diagnosis-description': '작물 이미지를 업로드하여 병해충을 진단하고 방제 정보를 받아보세요.',
      'crop-select-label': '-- 작물을 선택하세요 --',
      'crop-pepper': '고추',
      'crop-tomato': '토마토',
      'crop-cucumber': '오이',
      'crop-potato': '감자',
      'crop-select-placeholder': '작물을 선택해주세요.',
      'upload-image-button': '이미지 업로드',
      'image-preview-placeholder': '이미지 미리보기',
      'analyze-image-button': 'AI 분석 시작',
      'diagnosis-result-title': '진단 결과:',
      'pest-name': '병해충 이름: ',
      'control-info': '방제 정보: ',
      'ai-analysis-error': 'AI 분석 중 오류가 발생했습니다: ',
      'network-error': '서버와 통신 중 오류가 발생했습니다.',
      'copyright': '© 2026 세아이농장 스마트팜. All rights reserved.',
      'recent-diagnosis-records-title': '최근 진단 기록'
    },
    'en': {
      'title-diagnosis': 'Pest AI Diagnosis',
      'mode-toggle-label': 'Dark Mode',
      'nav-home': 'Home',
      'nav-pest-diagnosis': 'Pest AI Diagnosis',
      'pest-diagnosis-title': 'Pest and Disease AI Diagnosis',
      'pest-diagnosis-description': 'Upload a plant image to diagnose pests and diseases and get control information.',
      'crop-select-label': '-- Select a crop --',
      'crop-pepper': 'Pepper',
      'crop-tomato': 'Tomato',
      'crop-cucumber': 'Cucumber',
      'crop-potato': 'Potato',
      'crop-select-placeholder': 'Please select a crop.',
      'upload-image-button': 'Upload Image',
      'image-preview-placeholder': 'Image Preview',
      'analyze-image-button': 'Start AI Analysis',
      'diagnosis-result-title': 'Diagnosis Result:',
      'pest-name': 'Pest Name: ',
      'control-info': 'Control Information: ',
      'ai-analysis-error': 'An error occurred during AI analysis: ',
      'network-error': 'An error occurred while communicating with the server.',
      'copyright': '© 2026 Se-Ai Farm Smart Farm. All rights reserved.',
      'recent-diagnosis-records-title': 'Recent Diagnosis Records'
    }
  };

  const setLanguage = (lang) => {
    document.querySelectorAll('[data-key]').forEach(element => {
      const key = element.getAttribute('data-key');
      if (translations[lang][key]) {
        if (element.tagName === 'TITLE') {
          element.textContent = translations[lang][key];
        } else if (key === 'pest-name' || key === 'control-info') {
          // Handled dynamically later, don't set placeholder here to avoid conflicts
        } else if (element.tagName === 'OPTION' && key.startsWith('crop-')) { // Handle crop options
          element.textContent = translations[lang][key];
        } else if (element.tagName === 'SELECT' && key === 'crop-select-label') {
          const defaultOption = element.querySelector('option[value=""]');
          if (defaultOption) {
            defaultOption.textContent = translations[lang][key];
          }
        } else {
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

  modeToggle.addEventListener('click', () => {
    const currentLang = htmlElement.lang;
    if (currentLang === 'en') {
      modeToggle.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    } else { // ko
      modeToggle.textContent = document.body.classList.contains('dark-mode') ? '라이트 모드' : '다크 모드';
    }
  });

  // --- Pest Diagnosis Functionality ---
  const plantImageUpload = document.getElementById('plant-image-upload');
  const uploadButtonLabel = document.querySelector('label[for="plant-image-upload"]');
  const uploadedImagePreview = document.getElementById('uploaded-image-preview');
  const imagePreviewPlaceholder = document.querySelector('.image-preview-area p[data-key="image-preview-placeholder"]');
  const analyzeImageButton = document.getElementById('analyze-image-button');
  const cropSelect = document.getElementById('crop-select');

  const diagnosisResultsDiv = document.getElementById('diagnosis-results');
  const pestNameDisplay = document.getElementById('pest-name');
  const controlInfoDisplay = document.getElementById('control-info');
  const recentDiagnosisRecordsList = document.getElementById('recent-diagnosis-records-list'); // New element

  pestNameDisplay.textContent = '';
  controlInfoDisplay.textContent = '';
  
  let selectedFile = null;

  if (uploadButtonLabel) {
    uploadButtonLabel.addEventListener('click', () => {
      plantImageUpload.click();
    });
  }

  plantImageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedImagePreview.src = e.target.result;
        uploadedImagePreview.style.display = 'block';
        imagePreviewPlaceholder.style.display = 'none';
        
        pestNameDisplay.textContent = '';
        controlInfoDisplay.textContent = '';
      };
      reader.readAsDataURL(file);
    } else {
      selectedFile = null;
      uploadedImagePreview.removeAttribute('src');
      uploadedImagePreview.alt = '업로드된 이미지 미리보기';
      uploadedImagePreview.style.display = 'none';
      imagePreviewPlaceholder.style.display = 'block';
      
      pestNameDisplay.textContent = '';
      controlInfoDisplay.textContent = '';
    }
  });

  analyzeImageButton.addEventListener('click', async () => {
    if (!selectedFile) {
      alert('이미지를 먼저 업로드해주세요.');
      return;
    }

    const selectedCrop = cropSelect.value;
    if (!selectedCrop) {
      const currentLang = htmlElement.lang || 'ko';
      alert(translations[currentLang]['crop-select-placeholder']);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = async () => {
      const base64Image = reader.result;

      analyzeImageButton.textContent = '분석 중...';
      analyzeImageButton.disabled = true;
      pestNameDisplay.textContent = '';
      controlInfoDisplay.textContent = '';

      try {
        const response = await fetch('/analyze-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageData: base64Image, cropName: selectedCrop }),
        });

        const result = await response.json();

        if (response.ok) {
          const currentLang = htmlElement.lang || 'ko';
          
          pestNameDisplay.textContent = translations[currentLang]['pest-name'] + result.pestName;
          controlInfoDisplay.textContent = translations[currentLang]['control-info'] + result.controlInfo;
          // Refresh recent records after a new analysis
          fetchRecentDiagnosisRecords();
        } else {
          const currentLang = htmlElement.lang || 'ko';
          alert(translations[currentLang]['ai-analysis-error'] + (result.error || '알 수 없는 오류'));
          console.error('백엔드 오류:', result.error || '알 수 없는 오류', result.details ? '세부 정보: ' + result.details : '');
        }
      } catch (error) {
        const currentLang = htmlElement.lang || 'ko';
        alert(translations[currentLang]['network-error']);
        console.error('네트워크 또는 서버 오류:', error);
      } finally {
        analyzeImageButton.textContent = 'AI 분석 시작';
        analyzeImageButton.disabled = false;
      }
    };
  });

  // --- Drag and Drop Functionality ---
  const imageUploadContainer = document.querySelector('.image-upload-container');

  if (imageUploadContainer) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      imageUploadContainer.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      imageUploadContainer.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      imageUploadContainer.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
      imageUploadContainer.classList.add('highlight');
    }

    function unhighlight(e) {
      imageUploadContainer.classList.remove('highlight');
    }

    imageUploadContainer.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
      const dt = e.dataTransfer;
      const files = dt.files;

      handleFiles(files);
    }

    function handleFiles(files) {
      // Simulate file input change event
      if (files.length > 0) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(files[0]);
        plantImageUpload.files = dataTransfer.files;
        plantImageUpload.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  // --- Recent Diagnosis Records Functionality ---
  async function fetchRecentDiagnosisRecords() {
    try {
      // Fetching records from a new endpoint. This endpoint needs to be created.
      const response = await fetch('/api/diagnosis-records'); // Assuming a new endpoint
      const records = await response.json();

      recentDiagnosisRecordsList.innerHTML = ''; // Clear previous records

      if (records && records.length > 0) {
        records.forEach(record => {
          const recordElement = document.createElement('div');
          recordElement.classList.add('diagnosis-record-item');
          recordElement.innerHTML = `
            <p><strong>작물:</strong> ${record.crop_name}</p>
            <p><strong>병해충 이름:</strong> ${record.pest_name}</p>
            <p><strong>진단 시간:</strong> ${new Date(record.timestamp).toLocaleString()}</p>
            <!-- 이미지 미리보기는 Base64가 길기 때문에 생략하거나 서버에서 URL을 받아서 처리해야 함 -->
            <!-- <img src="data:image/jpeg;base64,${record.image_data_preview}..." alt="진단 이미지 미리보기" style="width: 100px; height: auto;"> -->
          `;
          recentDiagnosisRecordsList.appendChild(recordElement);
        });
      } else {
        recentDiagnosisRecordsList.innerHTML = '<p>최근 진단 기록이 없습니다.</p>';
      }
    } catch (error) {
      console.error('최근 진단 기록을 불러오는 중 오류 발생:', error);
      recentDiagnosisRecordsList.innerHTML = '<p>진단 기록을 불러올 수 없습니다.</p>';
    }
  }

  // Fetch records when the page loads
  fetchRecentDiagnosisRecords();

}); // End of DOMContentLoaded event listener