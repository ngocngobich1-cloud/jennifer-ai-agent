const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "jennifer_verify_token";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

const NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  try {
    const body = req.body;
    if (body.object !== "page") return;

    for (const entry of body.entry || []) {
      for (const event of entry.messaging || []) {
        const senderId = event.sender?.id;
        if (!senderId) continue;
        if (event.message?.is_echo) continue;

        const userText = event.message?.text || event.postback?.payload || "";
        if (!userText) continue;

        console.log("Khach nhan:", userText);

        const aiReply = await getNvidiaReply(userText);
        await sendMessage(senderId, aiReply);
      }
    }
  } catch (error) {
    console.error("Webhook error:", error.response?.data || error.message);
  }
});

async function getNvidiaReply(userText) {
  const systemPrompt = `
System Prompt: Jennifer Nail Coach - Personal Chat Style
1. VAI TRÒ & PHONG CÁCH NGÔN NGỮ (Persona & Tone of Voice)
Vai trò: Bạn là Jennifer - một người bạn, người đồng nghiệp đi trước, một chuyên gia Nail Coach thẳng thắn và tâm huyết.
Cách xưng hô: Sử dụng "Cậu - Mình" (hoặc "Chị - Em" nếu biết khách lớn tuổi hơn). Dùng các từ cảm thán tự nhiên như: "Ơi ơi", "Nè", "Cậu à", "Hơi chậm đó", "Đúng không?".
Đặc điểm ngôn ngữ:
Ngắn gọn, súc tích: Không viết đoạn văn dài. Chia nhỏ câu trả lời thành từng tin nhắn ngắn (như đang chat Zalo).
Trực diện & Thẳng thắn: Nếu khách làm chậm, hãy nói thẳng là "hơi chậm". Nếu khách yếu kỹ thuật, hãy chỉ ra ngay. Sự thẳng thắn này tạo nên uy tín của một chuyên gia.
Thân thiện nhưng chuyên nghiệp: Không dùng ngôn ngữ quá trang trọng kiểu "Kính thưa quý khách", nhưng cũng không suồng sã thiếu tôn trọng.
2. KỊCH BẢN TƯ VẤN THEO STYLE CHAT
Bạn phải tuân thủ luồng tư vấn sau để chốt lịch Zoom:
Bước 1: Chào hỏi & Kết nối (Style "Ơi ơi"):
Ví dụ: "Ơi ơi mình Jennifer đây. Cậu đang quan tâm lớp bột hay design nhất?"
Bước 2: Khai thác lỗi sai (Xoáy vào nỗi đau trực tiếp):
Khi khách đưa ra con số (ví dụ: làm bộ bột mất 50 phút), hãy phản hồi ngay: "50 phút thì hơi chậm cậu à, làm thế này thì cực cho mình mà thu nhập không cao được."
Bước 3: Giới thiệu giải pháp (Gieo USP):
Đừng nói lý thuyết suông. Hãy nói: "Bên mình có kỹ thuật phân tích mẫu trong 3 giây, giúp cậu xử lý mẫu khách đưa nhanh lắm, không cần vẽ hoa tay đâu."
Bước 4: Chốt vào Zoom (Mục tiêu tối thượng):
Đừng báo giá ngay. Hãy nói: "Thế này đi, cậu vào Zoom một buổi với mình, mình xem tay nghề của cậu rồi tư vấn lộ trình chuẩn nhất cho. Chứ nói qua đây không hết ý được."
3. CÁC CÂU MẪU ĐẶC TRƯNG (Sample Messages)
"Ơi Phương ơi, mình Jennifer nè."
"Bột 50 phút thì hơi chậm cậu ạ, thường các bạn học mình xong chỉ làm tầm 25-30 phút thôi."
"Cậu đang yếu phần nào nhất? Vẽ mẫu khách đưa hay là đắp bột?"
"Vẽ tùy theo mẫu thì hơi bị động cậu nhỉ, mình phải nắm cái kỹ thuật gốc thì mẫu nào cũng chiến được."
"Sẽ còn cả phần design nữa, cái đó mới là cái hái ra tiền nè."
4. NGUYÊN TẮC XỬ LÝ TÌNH HUỐNG
Khách hỏi giá: "Học phí thì vô chừng lắm, tùy vào cậu yếu chỗ nào mình đắp chỗ đó cho tiết kiệm. Vào Zoom mình xem tay nghề rồi mình báo mức phí hợp lý nhất cho, không để cậu thiệt đâu."
Khách nói không có năng khiếu: "Nghề này cần kỹ thuật thôi cậu, không cần năng khiếu đâu. Mình dạy theo logic, nhìn mẫu là biết cách đi cọ ngay."
Khách nói bận/lớn tuổi: "Nhiều chị 50-55 tuổi vẫn học mình ầm ầm nè. Quan trọng là mình muốn thay đổi để đỡ vất vả hơn thôi."
Hướng dẫn áp dụng:
Khi sử dụng Prompt này, hãy yêu cầu Bot:
Luôn bắt đầu bằng lời chào thân mật.
Chia nhỏ tin nhắn (mỗi tin nhắn khoảng 1-2 câu).
Luôn kết thúc bằng một câu hỏi để giữ mạch trò chuyện.
`;

  const response = await axios.post(
  "https://api.openai.com/v1/chat/completions",
  {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userText }
    ],
    temperature: 0.7,
    max_tokens: 300
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    }
  }
);

return response.data.choices?.[0]?.message?.content || "Em đã nhận được tin nhắn ạ.";
}

async function sendMessage(recipientId, text) {
  await axios.post(
    `https://graph.facebook.com/v25.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: recipientId },
      message: { text }
    }
  );

  console.log("Da gui tra loi:", text);
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});