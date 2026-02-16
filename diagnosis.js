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
      'crop-cabbage': '양배추',
      'crop-lettuce': '상추',
      'crop-garlic': '마늘',
      'crop-radish': '무',
      'crop-chinese-cabbage': '배추',
      'crop-select-placeholder': '작물을 선택해주세요.',
      'upload-image-button': '이미지 업로드',
      'image-preview-placeholder': '이미지 미리보기',
      'analyze-image-button': 'AI 분석 시작',
      'diagnosis-result-title': '진단 결과:',
      'pest-name': '병해충 이름: ',
      'confidence': '신뢰도: ',
      'recommendations': '권장 조치: ',
      'notes': '추가 참고사항: ',
      'control-info': '방제 정보: ', // 기존 controlInfo는 일반적인 조치 정보로 사용
      'ai-analysis-error': 'AI 분석 중 오류가 발생했습니다: ',
      'network-error': '서버와 통신 중 오류가 발생했습니다.',
      'copyright': '© 2026 세아이농장 스마트팜. All rights reserved.',
      'recent-diagnosis-records-title': '최근 진단 기록',
      'record-crop': '작물:',
      'record-pest': '병해충 이름:',
      'record-confidence': '신뢰도:',
      'record-recommendations': '권장 조치:',
      'record-notes': '추가 참고사항:',
      'record-timestamp': '진단 시간:'
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
      'crop-cabbage': 'Cabbage',
      'crop-lettuce': 'Lettuce',
      'crop-garlic': 'Garlic',
      'crop-radish': 'Radish',
      'crop-chinese-cabbage': 'Chinese Cabbage',
      'crop-select-placeholder': 'Please select a crop.',
      'upload-image-button': 'Upload Image',
      'image-preview-placeholder': 'Image Preview',
      'analyze-image-button': 'Start AI Analysis',
      'diagnosis-result-title': 'Diagnosis Result:',
      'pest-name': 'Pest Name: ',
      'confidence': 'Confidence: ',
      'recommendations': 'Recommendations: ',
      'notes': 'Additional Notes: ',
      'control-info': 'Control Information: ',
      'ai-analysis-error': 'An error occurred during AI analysis: ',
      'network-error': 'An error occurred while communicating with the server.',
      'copyright': '© 2026 Se-Ai Farm Smart Farm. All rights reserved.',
      'recent-diagnosis-records-title': 'Recent Diagnosis Records',
      'record-crop': 'Crop:',
      'record-pest': 'Pest Name:',
      'record-confidence': 'Confidence:',
      'record-recommendations': 'Recommendations:',
      'record-notes': 'Additional Notes:',
      'record-timestamp': 'Diagnosis Time:'
    }
  };

  const setLanguage = (lang) => {
    document.querySelectorAll('[data-key]').forEach(element => {
      const key = element.getAttribute('data-key');
      if (translations[lang][key]) {
        if (element.tagName === 'TITLE') {
          element.textContent = translations[lang][key];
        } else if (key === 'pest-name' || key === 'control-info' || key === 'confidence' || key === 'recommendations' || key === 'notes') {
          // Handled dynamically later, don't set placeholder here to avoid conflicts
        } else if (element.tagName === 'OPTION' && key.startsWith('crop-')) {
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
    } else {
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
    } else {
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
  // New detailed result displays
  const confidenceDisplay = document.createElement('p');
  confidenceDisplay.id = 'confidence';
  const recommendationsDisplay = document.createElement('p');
  recommendationsDisplay.id = 'recommendations';
  const notesDisplay = document.createElement('p');
  notesDisplay.id = 'notes';
  const controlInfoDisplay = document.getElementById('control-info'); // Keep existing for general control info

  // Append new elements to diagnosisResultsDiv if they aren't already there
  if (!document.getElementById('confidence')) diagnosisResultsDiv.appendChild(confidenceDisplay);
  if (!document.getElementById('recommendations')) diagnosisResultsDiv.appendChild(recommendationsDisplay);
  if (!document.getElementById('notes')) diagnosisResultsDiv.appendChild(notesDisplay);

  pestNameDisplay.textContent = '';
  confidenceDisplay.textContent = '';
  recommendationsDisplay.textContent = '';
  notesDisplay.textContent = '';
  controlInfoDisplay.textContent = '';
  
  const recentDiagnosisRecordsList = document.getElementById('recent-diagnosis-records-list');
  
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
        confidenceDisplay.textContent = '';
        recommendationsDisplay.textContent = '';
        notesDisplay.textContent = '';
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
      confidenceDisplay.textContent = '';
      recommendationsDisplay.textContent = '';
      notesDisplay.textContent = '';
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
      confidenceDisplay.textContent = '';
      recommendationsDisplay.textContent = '';
      notesDisplay.textContent = '';
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
          
          // Displaying new detailed fields
          pestNameDisplay.textContent = translations[currentLang]['pest-name'] + result.pestName;
          confidenceDisplay.textContent = translations[currentLang]['confidence'] + result.confidence;
          recommendationsDisplay.textContent = translations[currentLang]['recommendations'] + result.recommendations;
          notesDisplay.textContent = translations[currentLang]['notes'] + result.notes;
          // controlInfoDisplay can be set from result.controlInfo if it's still distinct,
          // otherwise it might be part of recommendations. For now, set it if provided.
          if (result.controlInfo) {
            controlInfoDisplay.textContent = translations[currentLang]['control-info'] + result.controlInfo;
          } else {
            controlInfoDisplay.textContent = ''; // Clear if not provided
          }

          fetchRecentDiagnosisRecords(); // Refresh recent records after a new analysis
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
      const response = await fetch('/api/diagnosis-records');
      const records = await response.json();

      recentDiagnosisRecordsList.innerHTML = '';

      if (records && records.length > 0) {
        records.forEach(record => {
          const recordElement = document.createElement('div');
          recordElement.classList.add('diagnosis-record-item');
          
          let imagePreviewHtml = '';
          if (record.image_data_preview) {
              imagePreviewHtml = `<img src="data:image/jpeg;base64,${record.image_data_preview}..." alt="진단 이미지 미리보기" style="width: 100px; height: auto; margin-bottom: 10px;">`;
          }

          recordElement.innerHTML = `
            ${imagePreviewHtml}
            <p><strong>${translations[htmlElement.lang || 'ko']['record-crop']}</strong> ${record.crop_name}</p>
            <p><strong>${translations[htmlElement.lang || 'ko']['record-pest']}</strong> ${record.pest_name}</p>
            <p><strong>${translations[htmlElement.lang || 'ko']['record-confidence']}</strong> ${record.confidence || 'N/A'}</p>
            <p><strong>${translations[htmlElement.lang || 'ko']['record-recommendations']}</strong> ${record.recommendations || 'N/A'}</p>
            <p><strong>${translations[htmlElement.lang || 'ko']['record-notes']}</strong> ${record.notes || 'N/A'}</p>
            <p><strong>${translations[htmlElement.lang || 'ko']['record-timestamp']}</strong> ${new Date(record.timestamp).toLocaleString()}</p>
          `;
          recentDiagnosisRecordsList.appendChild(recordElement);
        });
      } else {
        recentDiagnosisRecordsList.innerHTML = `<p>${translations[htmlElement.lang || 'ko']['no-recent-records'] || '최근 진단 기록이 없습니다.'}</p>`;
      }
    } catch (error) {
      console.error('최근 진단 기록을 불러오는 중 오류 발생:', error);
      recentDiagnosisRecordsList.innerHTML = `<p>${translations[htmlElement.lang || 'ko']['error-loading-records'] || '진단 기록을 불러올 수 없습니다.'}</p>`;
    }
  }

  fetchRecentDiagnosisRecords();

}); // End of DOMContentLoaded event listener