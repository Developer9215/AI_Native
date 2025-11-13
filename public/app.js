// API 기본 URL
const API_BASE_URL = 'http://localhost:3000';

// DOM 요소
const moodMessageInput = document.getElementById('moodMessage');
const analyzeMoodBtn = document.getElementById('analyzeMoodBtn');
const moodResultSection = document.getElementById('moodResultSection');
const moodIcon = document.getElementById('moodIcon');
const moodLabel = document.getElementById('moodLabel');
const moodDescription = document.getElementById('moodDescription');
const moodLoading = document.getElementById('moodLoading');

const agentChatMessages = document.getElementById('agentChatMessages');
const agentCommandInput = document.getElementById('agentCommand');
const agentRequestBtn = document.getElementById('agentRequestBtn');

const currentStatusEl = document.getElementById('currentStatus');
const sidebarStatusEl = document.getElementById('sidebarStatus');
const statusButtons = document.querySelectorAll('.status-btn');

// API 로그 관련
const moodApiLog = document.getElementById('moodApiLog');
const agentApiLog = document.getElementById('agentApiLog');
const clearMoodLogBtn = document.getElementById('clearMoodLog');
const clearAgentLogBtn = document.getElementById('clearAgentLog');

// 네비게이션
const navItems = document.querySelectorAll('.nav-item');
const demoPanels = document.querySelectorAll('.demo-panel');

// API 로그 추가 함수
function addApiLog(container, method, endpoint, requestData, responseData, isSuccess = true) {
  // placeholder 제거
  const placeholder = container.querySelector('.log-placeholder');
  if (placeholder) {
    placeholder.remove();
  }

  const timestamp = new Date().toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  const logItem = document.createElement('div');
  logItem.className = 'api-log-item';

  const requestJson = JSON.stringify(requestData, null, 2);
  const responseJson = JSON.stringify(responseData, null, 2);

  logItem.innerHTML = `
    <div class="log-timestamp">${timestamp}</div>
    
    <div class="log-section">
      <div class="log-section-header">
        <span class="log-method ${method.toLowerCase()}">${method} ${endpoint}</span>
        <button class="copy-btn" onclick="copyToClipboard(\`${requestJson.replace(/`/g, '\\`')}\`)">Copy</button>
      </div>
      <div class="log-section-body">
        <pre class="log-code">${syntaxHighlight(requestJson)}</pre>
      </div>
    </div>

    <div class="log-section">
      <div class="log-section-header">
        <span>Response <span class="log-status ${isSuccess ? 'success' : 'error'}">${isSuccess ? '200 OK' : 'ERROR'}</span></span>
        <button class="copy-btn" onclick="copyToClipboard(\`${responseJson.replace(/`/g, '\\`')}\`)">Copy</button>
      </div>
      <div class="log-section-body">
        <pre class="log-code">${syntaxHighlight(responseJson)}</pre>
      </div>
    </div>
  `;

  container.insertBefore(logItem, container.firstChild);
  
  // 스크롤을 최상단으로
  container.scrollTop = 0;
}

// JSON Syntax Highlighting
function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
      } else {
        cls = 'json-string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

// 클립보드 복사 함수
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('✓ 클립보드에 복사되었습니다', 'success');
  }).catch(() => {
    showToast('✗ 복사 실패', 'error');
  });
}

// 로그 클리어 버튼
clearMoodLogBtn.addEventListener('click', () => {
  moodApiLog.innerHTML = '<div class="log-placeholder">API 요청/응답이 여기에 표시됩니다</div>';
});

clearAgentLogBtn.addEventListener('click', () => {
  agentApiLog.innerHTML = '<div class="log-placeholder">API 요청/응답이 여기에 표시됩니다</div>';
});

// 네비게이션 핸들러
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const target = item.getAttribute('data-target');
    
    // 네비게이션 활성화
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    
    // 패널 전환
    demoPanels.forEach(panel => panel.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  });
});

// 초기 상태 로드
async function loadCurrentStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/status`);
    const data = await response.json();
    updateStatusUI(data.status);
  } catch (error) {
    console.error('상태 로드 실패:', error);
  }
}

// 상태 UI 업데이트
function updateStatusUI(status) {
  const statusTextMap = {
    'online': '온라인',
    'offline': '오프라인',
    'meeting': '회의 중',
    'vacation': '휴가 중',
    'lunch': '점심시간',
    'remote': '재택근무',
    'dnd': '방해금지'
  };

  const statusText = statusTextMap[status] || status;

  // 메인 상태 표시 업데이트
  currentStatusEl.classList.remove('online', 'offline', 'meeting', 'vacation', 'lunch', 'remote', 'dnd');
  currentStatusEl.classList.add(status);
  currentStatusEl.querySelector('.status-text').textContent = statusText;

  // 사이드바 상태 업데이트
  sidebarStatusEl.classList.remove('online', 'offline', 'meeting', 'vacation', 'lunch', 'remote', 'dnd');
  sidebarStatusEl.classList.add(status);
  sidebarStatusEl.textContent = statusText;

  // 애니메이션 효과
  currentStatusEl.style.transform = 'scale(1.05)';
  setTimeout(() => {
    currentStatusEl.style.transform = 'scale(1)';
  }, 200);
}

// [시연 1] 감정 분석 - 프로필 카드 스타일
analyzeMoodBtn.addEventListener('click', async () => {
  const message = moodMessageInput.value.trim();

  if (!message) {
    showToast('상태 메시지를 입력해주세요', 'error');
    return;
  }

  // 로딩 시작
  moodLoading.classList.remove('hidden');
  moodResultSection.classList.add('hidden');
  analyzeMoodBtn.disabled = true;

  const requestData = { message };

  try {
    const response = await fetch(`${API_BASE_URL}/analyze-mood`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();

    // API 로그 추가
    addApiLog(moodApiLog, 'POST', '/analyze-mood', requestData, data, data.success);

    if (data.success) {
      // 감정별 아이콘, 라벨, 설명 설정
      const sentimentConfig = {
        'positive': {
          icon: '😊',
          label: '긍정적',
          description: '밝고 긍정적인 감정이 느껴집니다'
        },
        'negative': {
          icon: '😔',
          label: '부정적',
          description: '조금 힘들거나 부정적인 감정이 있어 보입니다'
        },
        'neutral': {
          icon: '😐',
          label: '중립적',
          description: '평온하고 중립적인 상태입니다'
        }
      };

      const config = sentimentConfig[data.sentiment];

      // 결과 표시
      moodIcon.textContent = config.icon;
      moodLabel.textContent = config.label;
      moodDescription.textContent = config.description;
      
      moodResultSection.classList.remove('hidden');
      showToast('✓ 감정 분석이 완료되었습니다', 'success');
    } else {
      showToast('✗ 분석 실패: ' + data.message, 'error');
    }
  } catch (error) {
    console.error('감정 분석 오류:', error);
    
    // 에러 로그 추가
    addApiLog(moodApiLog, 'POST', '/analyze-mood', requestData, { error: error.message }, false);
    
    showToast('✗ 서버와 통신 중 오류가 발생했습니다', 'error');
  } finally {
    moodLoading.classList.add('hidden');
    analyzeMoodBtn.disabled = false;
  }
});

// 엔터키로 분석
moodMessageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    analyzeMoodBtn.click();
  }
});

// 메시지 추가 함수 (Agent용)
function addMessage(container, type, content, meta = null) {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${type}`;
  
  const avatarEl = document.createElement('div');
  avatarEl.className = 'message-avatar';
  avatarEl.textContent = type === 'user' ? 'YOU' : 'AI';
  
  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';
  
  const textEl = document.createElement('div');
  textEl.className = 'message-text';
  textEl.textContent = content;
  
  contentEl.appendChild(textEl);
  
  if (meta) {
    const metaEl = document.createElement('div');
    metaEl.className = 'message-meta';
    metaEl.innerHTML = meta;
    contentEl.appendChild(metaEl);
  }
  
  messageEl.appendChild(avatarEl);
  messageEl.appendChild(contentEl);
  
  container.appendChild(messageEl);
  container.scrollTop = container.scrollHeight;
  
  return messageEl;
}

// 로딩 메시지 추가
function addLoadingMessage(container) {
  const loadingEl = document.createElement('div');
  loadingEl.className = 'loading-message';
  loadingEl.innerHTML = `
    <div class="message-avatar">AI</div>
    <div class="message-content">
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  container.appendChild(loadingEl);
  container.scrollTop = container.scrollHeight;
  return loadingEl;
}

// [시연 2-1] 수동 상태 변경
statusButtons.forEach(button => {
  button.addEventListener('click', async () => {
    const status = button.getAttribute('data-status');
    
    statusButtons.forEach(btn => btn.disabled = true);

    const requestData = { status };

    try {
      const response = await fetch(`${API_BASE_URL}/set-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      // API 로그 추가
      addApiLog(agentApiLog, 'POST', '/set-status', requestData, data, data.success);

      if (data.success) {
        updateStatusUI(data.status);
        showToast('✓ 상태가 변경되었습니다', 'success');
      } else {
        showToast('✗ 상태 변경 실패: ' + data.message, 'error');
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      
      // 에러 로그 추가
      addApiLog(agentApiLog, 'POST', '/set-status', requestData, { error: error.message }, false);
      
      showToast('✗ 서버와 통신 중 오류가 발생했습니다', 'error');
    } finally {
      statusButtons.forEach(btn => btn.disabled = false);
    }
  });
});

// [시연 2-2] AI Agent 상태 변경
agentRequestBtn.addEventListener('click', async () => {
  const command = agentCommandInput.value.trim();

  if (!command) {
    return;
  }

  // 사용자 메시지 추가
  addMessage(agentChatMessages, 'user', command);
  agentCommandInput.value = '';

  // 로딩 표시
  const loadingEl = addLoadingMessage(agentChatMessages);
  agentRequestBtn.disabled = true;

  const requestData = { command };

  try {
    const response = await fetch(`${API_BASE_URL}/agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();
    loadingEl.remove();

    // API 로그 추가
    addApiLog(agentApiLog, 'POST', '/agent', requestData, data, data.success);

    if (data.success) {
      updateStatusUI(data.status);

      const statusEmoji = {
        'online': '🟢',
        'offline': '⚫',
        'meeting': '🔴',
        'vacation': '🏖️',
        'lunch': '🍽️',
        'remote': '🏠',
        'dnd': '🔕'
      };

      const statusText = {
        'online': '온라인',
        'offline': '오프라인',
        'meeting': '회의 중',
        'vacation': '휴가 중',
        'lunch': '점심시간',
        'remote': '재택근무',
        'dnd': '방해금지'
      };

      const meta = `
        <div class="agent-result-detail">
          <div><strong>선택한 툴:</strong> ${data.selectedTool}</div>
          <div><strong>선택 이유:</strong> ${data.reasoning}</div>
          <div><strong>최종 상태:</strong> ${statusEmoji[data.status]} ${statusText[data.status]}</div>
        </div>
      `;

      addMessage(
        agentChatMessages,
        'ai',
        '명령을 처리하여 상태를 변경했습니다.',
        meta
      );

      showToast('✓ AI Agent가 상태를 변경했습니다', 'success');
    } else {
      addMessage(agentChatMessages, 'ai', '❌ 처리 실패: ' + data.message);
      showToast('✗ AI Agent 처리 실패', 'error');
    }
  } catch (error) {
    loadingEl.remove();
    console.error('AI Agent 오류:', error);
    
    // 에러 로그 추가
    addApiLog(agentApiLog, 'POST', '/agent', requestData, { error: error.message }, false);
    
    addMessage(agentChatMessages, 'ai', '❌ 서버와 통신 중 오류가 발생했습니다.');
    showToast('✗ 서버 통신 오류', 'error');
  } finally {
    agentRequestBtn.disabled = false;
  }
});

// 엔터키로 전송
agentCommandInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    agentRequestBtn.click();
  }
});

// 토스트 알림
function showToast(message, type = 'success') {
  // 기존 토스트 제거
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  const colors = {
    success: '#2ea043',
    error: '#f85149'
  };
  
  toast.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    padding: 12px 20px;
    background: ${colors[type]};
    color: white;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 애니메이션 스타일 추가
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// 초기 로드
loadCurrentStatus();

// 콘솔에 환영 메시지
console.log('%c🚀 AI-Native Backend Demo', 'color: #2ea043; font-size: 20px; font-weight: bold;');
console.log('%cGitHub Style Dark Theme Loaded', 'color: #58a6ff; font-size: 12px;');