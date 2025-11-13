const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = 3000;

// 전역 상태 관리
let currentStatus = 'online';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 현재 상태 조회
app.get('/status', (req, res) => {
  res.json({ status: currentStatus });
});

// 수동 상태 변경 API
app.post('/set-status', (req, res) => {
  const { status } = req.body;
  
  if (!['online', 'offline', 'meeting', 'vacation', 'lunch', 'remote', 'dnd'].includes(status)) {
    return res.status(400).json({ 
      success: false, 
      message: '유효하지 않은 상태입니다.' 
    });
  }
  
  currentStatus = status;
  console.log(`상태 변경됨: ${status}`);
  
  res.json({ 
    success: true, 
    message: '상태가 변경되었습니다.', 
    status: currentStatus 
  });
});

// [시연 1] 백엔드 → AI 호출: 상태 메시지 감정 추측
app.post('/analyze-mood', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: '상태 메시지가 비어있습니다.' 
      });
    }

    console.log('감정 추측 요청:', message);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 사용자의 상태 메시지를 보고 감정을 추측하는 전문가입니다. 상태 메시지를 읽고 이 사람이 현재 느끼는 감정을 positive, negative, neutral 중 하나로 분류하세요.'
        },
        {
          role: 'user',
          content: `사용자의 상태 메시지를 보고 이 사람이 현재 느끼는 감정을 'positive', 'negative', 'neutral' 중 하나로만 JSON 형식으로 출력하세요.\n\n상태 메시지: "${message}"\n\n응답 형식: {"sentiment": "positive"}`
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    console.log('감정 추측 결과:', result);

    res.json({
      success: true,
      message: message,
      sentiment: result.sentiment,
      analysis: {
        positive: result.sentiment === 'positive',
        negative: result.sentiment === 'negative',
        neutral: result.sentiment === 'neutral'
      }
    });

  } catch (error) {
    console.error('감정 추측 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: 'AI 감정 추측 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
});

// [시연 2] AI → 백엔드 호출: AI Agent 기반 상태 변경
app.post('/agent', async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command || command.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: '명령이 비어있습니다.' 
      });
    }

    console.log('AI Agent 명령:', command);

    // AI에게 툴 선택을 요청
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 사용자의 명령을 분석하여 적절한 상태 변경 툴을 선택하는 AI Agent입니다.

사용 가능한 툴:
- setStatus_Online: 사용자를 온라인 상태로 변경
- setStatus_Offline: 사용자를 오프라인 상태로 변경
- setStatus_Meeting: 사용자를 회의 중 상태로 변경  
- setStatus_Vacation: 사용자를 휴가 중 상태로 변경
- setStatus_Lunch: 사용자를 점심시간/식사 중 상태로 변경
- setStatus_Remote: 사용자를 재택근무 상태로 변경
- setStatus_DND: 사용자를 방해금지 상태로 변경

사용자의 자연어 명령을 분석하여 가장 적절한 툴을 선택하세요.
응답은 반드시 JSON 형식으로 해야 합니다: {"tool": "setStatus_Meeting", "reasoning": "설명"}`
        },
        {
          role: 'user',
          content: `다음 명령에 가장 적합한 툴을 선택하세요:\n\n"${command}"\n\n응답 형식: {"tool": "툴이름", "reasoning": "선택 이유"}`
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    console.log('AI가 선택한 툴:', aiResponse);

    // AI가 선택한 툴을 실제 상태 값으로 매핑
    const toolToStatus = {
      'setStatus_Online': 'online',
      'setStatus_Offline': 'offline',
      'setStatus_Meeting': 'meeting',
      'setStatus_Vacation': 'vacation',
      'setStatus_Lunch': 'lunch',
      'setStatus_Remote': 'remote',
      'setStatus_DND': 'dnd'
    };

    const selectedStatus = toolToStatus[aiResponse.tool];

    if (!selectedStatus) {
      return res.status(400).json({
        success: false,
        message: 'AI가 유효하지 않은 툴을 선택했습니다.',
        aiResponse
      });
    }

    // 상태 변경 실행 (/set-status 내부 로직 재사용)
    currentStatus = selectedStatus;
    console.log(`AI Agent가 상태 변경: ${selectedStatus}`);

    res.json({
      success: true,
      message: `AI Agent가 상태를 변경했습니다.`,
      command: command,
      selectedTool: aiResponse.tool,
      reasoning: aiResponse.reasoning,
      status: currentStatus
    });

  } catch (error) {
    console.error('AI Agent 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: 'AI Agent 처리 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
  });
}