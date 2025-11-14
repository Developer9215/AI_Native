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

// API 로그 추가 함수 (단계별 프로세스 표시)
function addApiLog(container, logData) {
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

  let stepsHTML = '';

  // 1. User Request
  stepsHTML += `
    <div class="log-step">
      <div class="log-step-header">
        <span class="step-number">1</span>
        <span class="step-title">📤 User Request</span>
      </div>
      <div class="log-step-body">
        <pre class="log-code">${syntaxHighlight(JSON.stringify(logData.request, null, 2))}</pre>
      </div>
    </div>
  `;

  // 2. AI Processing (있는 경우)
  if (logData.aiPrompts) {
    stepsHTML += `
      <div class="log-step ai-step">
        <div class="log-step-header">
          <span class="step-number">2</span>
          <span class="step-title">⬇️ AI Processing</span>
        </div>
      </div>
    `;

    // System Prompt
    if (logData.aiPrompts.system) {
      stepsHTML += `
        <div class="log-substep">
          <div class="log-substep-header">
            <span class="substep-icon">🤖</span>
            <span class="substep-title">AI System Prompt</span>
            <button class="copy-btn-small" onclick="copyToClipboard(\`${logData.aiPrompts.system.replace(/`/g, '\\`')}\`)">Copy</button>
          </div>
          <div class="log-substep-body">
            <pre class="log-code prompt-text">${escapeHtml(logData.aiPrompts.system)}</pre>
          </div>
        </div>
      `;
    }

    // User Prompt
    if (logData.aiPrompts.user) {
      stepsHTML += `
        <div class="log-substep">
          <div class="log-substep-header">
            <span class="substep-icon">🤖</span>
            <span class="substep-title">AI User Prompt</span>
            <button class="copy-btn-small" onclick="copyToClipboard(\`${logData.aiPrompts.user.replace(/`/g, '\\`')}\`)">Copy</button>
          </div>
          <div class="log-substep-body">
            <pre class="log-code prompt-text">${escapeHtml(logData.aiPrompts.user)}</pre>
          </div>
        </div>
      `;
    }

    // AI Generated Output
    if (logData.aiGenerated) {
      stepsHTML += `
        <div class="log-step">
          <div class="log-step-header">
            <span class="step-number">3</span>
            <span class="step-title">✨ AI Generated Output</span>
          </div>
          <div class="log-step-body">
            <pre class="log-code">${syntaxHighlight(JSON.stringify(logData.aiGenerated, null, 2))}</pre>
          </div>
        </div>
      `;
    }

    // Backend Processing
    if (logData.backendProcessing) {
      stepsHTML += `
        <div class="log-step">
          <div class="log-step-header">
            <span class="step-number">4</span>
            <span class="step-title">⚙️ Backend Processing</span>
          </div>
          <div class="log-step-body">
            <pre class="log-code processing-text">${escapeHtml(logData.backendProcessing)}</pre>
          </div>
        </div>
      `;
    }
  }

  // Final Response
  const finalStepNumber = logData.aiPrompts ? (logData.backendProcessing ? '5' : '4') : '2';
  const statusClass = logData.response.success ? 'success' : 'error';
  const statusText = logData.response.success ? '200 OK' : 'ERROR';

  stepsHTML += `
    <div class="log-step">
      <div class="log-step-header">
        <span class="step-number">${finalStepNumber}</span>
        <span class="step-title">📥 Final Response</span>
        <span class="log-status ${statusClass}">${statusText}</span>
      </div>
      <div class="log-step-body">
        <pre class="log-code">${syntaxHighlight(JSON.stringify(logData.response, null, 2))}</pre>
      </div>
    </div>
  `;

  logItem.innerHTML = `
    <div class="log-timestamp">${timestamp}</div>
    <div class="log-endpoint">
      <span class="log-method post">POST</span>
      <span class="log-path">${logData.endpoint}</span>
    </div>
    ${stepsHTML}
  `;

  container.insertBefore(logItem, container.firstChild);
  container.scrollTop = 0;
}

// HTML 이스케이프 함수
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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

    // API 로그 추가 (단계별 프로세스)
    addApiLog(moodApiLog, {
      endpoint: '/analyze-mood',
      request: requestData,
      aiPrompts: {
        system: '당신은 사용자의 상태 메시지를 보고 감정을 추측하는 전문가입니다. 상태 메시지를 읽고 이 사람이 현재 느끼는 감정을 positive, negative, neutral 중 하나로 분류하세요.',
        user: `사용자의 상태 메시지를 보고 이 사람이 현재 느끼는 감정을 'positive', 'negative', 'neutral' 중 하나로만 JSON 형식으로 출력하세요.\n\n상태 메시지: "${message}"\n\n응답 형식: {"sentiment": "positive"}`
      },
      aiGenerated: {
        sentiment: data.sentiment
      },
      backendProcessing: `AI 응답을 분석하여 감정 분류:\n- Sentiment: ${data.sentiment}\n- Analysis 객체 생성 (positive/negative/neutral 플래그)`,
      response: data
    });

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
    addApiLog(moodApiLog, {
      endpoint: '/analyze-mood',
      request: requestData,
      response: { 
        success: false, 
        error: error.message 
      }
    });
    
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

      // API 로그 추가 (전통적인 방식)
      addApiLog(agentApiLog, {
        endpoint: '/set-status',
        request: requestData,
        backendProcessing: `직접 상태 변경 실행:\ncurrentStatus = "${status}"`,
        response: data
      });

      if (data.success) {
        updateStatusUI(data.status);
        showToast('✓ 상태가 변경되었습니다', 'success');
      } else {
        showToast('✗ 상태 변경 실패: ' + data.message, 'error');
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      
      // 에러 로그 추가
      addApiLog(agentApiLog, {
        endpoint: '/set-status',
        request: requestData,
        response: { 
          success: false, 
          error: error.message 
        }
      });
      
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

  const toolDefinitions = `사용 가능한 툴:
- setStatus_Online: 사용자를 온라인 상태로 변경
- setStatus_Offline: 사용자를 오프라인 상태로 변경
- setStatus_Meeting: 사용자를 회의 중 상태로 변경  
- setStatus_Vacation: 사용자를 휴가 중 상태로 변경
- setStatus_Lunch: 사용자를 점심시간/식사 중 상태로 변경
- setStatus_Remote: 사용자를 재택근무 상태로 변경
- setStatus_DND: 사용자를 방해금지 상태로 변경`;

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

    // API 로그 추가 (AI Agent 프로세스)
    addApiLog(agentApiLog, {
      endpoint: '/agent',
      request: requestData,
      aiPrompts: {
        system: `당신은 사용자의 명령을 분석하여 적절한 상태 변경 툴을 선택하는 AI Agent입니다.\n\n${toolDefinitions}\n\n사용자의 자연어 명령을 분석하여 가장 적절한 툴을 선택하세요.`,
        user: `다음 명령에 가장 적합한 툴을 선택하세요:\n\n"${command}"`
      },
      aiGenerated: {
        tool: data.selectedTool,
        reasoning: data.reasoning
      },
      backendProcessing: `AI가 선택한 툴 실행:\n- Selected Tool: ${data.selectedTool}\n- Mapped Status: ${data.status}\n- Execute: currentStatus = "${data.status}"`,
      response: data
    });

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
    addApiLog(agentApiLog, {
      endpoint: '/agent',
      request: requestData,
      response: { 
        success: false, 
        error: error.message 
      }
    });
    
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