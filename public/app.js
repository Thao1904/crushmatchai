const translations = {
  eng: {
    eyebrow: "Pink Lab",
    title: "Are You Two A Perfect Match?",
    subtitle:
      "A quick compatibility read powered by AI, astrology, zodiac energy, and cosmic signals.",
    notePill: "Optional accuracy buff",
    noteText: "Add birthdays if you want the universe to act extra confident about its nonsense.",
    yourNameLabel: "Your name",
    crushNameLabel: "Their name",
    dobTitle: "Birthday boost",
    dobHint: "Optional. Tiny detail, huge dramatic energy.",
    yourDobLabel: "Your birthday",
    crushDobLabel: "Their birthday",
    submit: "Reveal the compatibility chart",
    resultBadge: "Official result",
    prankTitle: "Oopsie hehe",
    contactButton: "Beg @mee.ltt",
    insightEyebrow: "Locked readout",
    insightTitle: "What the system totally almost revealed",
    chartOneTitle: "Attraction pulse",
    chartOneText: "Heartbeat overlap, eye-contact physics, and impossible overthinking levels.",
    chartTwoTitle: "Future chemistry",
    chartTwoText: "Soft life potential, chaotic date survival, and texting rhythm alignment.",
    chartThreeTitle: "Drama index",
    chartThreeText: "Petty argument probability, jealousy weather, and comeback power."
  },
  vie: {
    eyebrow: "Lab tình iu",
    title: "Bạn & Người Ấy Có Hợp Nhau?",
    subtitle:
      "Khám phá mức độ tương hợp với AI power, chiêm tinh học và tín hiệu vũ trụ.",
    notePill: "Buff chính xác",
    noteText: "Điền ngày sinh nếu thích để vũ trụ nói chuyện rất tự tin dù chẳng ai kiểm chứng.",
    yourNameLabel: "Tên bạn",
    crushNameLabel: "Tên người ấy",
    dobTitle: "Thêm ngày sinh",
    dobHint: "Không bắt buộc. Nhỏ thôi nhưng tăng độ kiểm chứng!",
    yourDobLabel: "Ngày sinh bạn",
    crushDobLabel: "Ngày sinh người ấy",
    submit: "Xem chart hợp nhau",
    resultBadge: "Kết quả chính thức",
    prankTitle: "Ố là la",
    contactButton: "Năn nỉ @mee.ltt",
    insightEyebrow: "Bảng phân tích khoá",
    insightTitle: "Những gì hệ thống suýt bật mí",
    chartOneTitle: "Nhịp rung động",
    chartOneText: "Độ va ánh mắt, tần suất nhớ nhung, và năng lượng tự diễn biến.",
    chartTwoTitle: "Tương lai tình ái",
    chartTwoText: "Khả năng hợp đi chơi, hợp rep tin nhắn, và hợp làm phiền nhau.",
    chartThreeTitle: "Chỉ số drama",
    chartThreeText: "Nguy cơ dỗi linh tinh, độ ghen vu vơ, và sức công phá khi cap màn hình."
  },
  cn: {
    eyebrow: "粉红实验室",
    title: "你和TA真的合拍吗？",
    subtitle:
      "用 AI、星座能量和宇宙信号，快速看看你们有多来电。",
    notePill: "玄学加成",
    noteText: "想让结果看起来更像那么回事, 可以顺手填生日, 宇宙会装得更认真一点。",
    yourNameLabel: "你的名字",
    crushNameLabel: "TA的名字",
    dobTitle: "生日小加成",
    dobHint: "非必填, 但很会增加命运感。",
    yourDobLabel: "你的生日",
    crushDobLabel: "TA的生日",
    submit: "解锁配对图表",
    resultBadge: "官方结果",
    prankTitle: "哎呀呀",
    contactButton: "求求 @mee.ltt",
    insightEyebrow: "已锁定读数",
    insightTitle: "系统差点公开的内容",
    chartOneTitle: "心动脉冲",
    chartOneText: "包括对视热度, 想太多指数, 还有脑内小剧场同步率。",
    chartTwoTitle: "未来化学反应",
    chartTwoText: "一起约会的适配度, 回消息节奏, 和日常互相打扰能力。",
    chartThreeTitle: "抓马指数",
    chartThreeText: "吃醋天气, 小脾气概率, 以及吵架后的嘴硬强度。"
  }
};

const prankMessages = {
  eng: (yourName, crushName) => `
    <span><strong>${escapeHtml(yourName)}</strong> and <strong>${escapeHtml(crushName)}</strong> are such a cute little duo. Are you compatible? No clue, but the count of adorable prank victims is now +1 haha.</span>
    <br /><br />
    <span>This result is being sent to the admin.</span>
    <br /><br />
    <strong>Happy April Fool's ♡</strong>
    <br /><br />
    <span>To redeem this result or bury it in mystery forever, DM IG @mee.ltt.</span>
  `,
  vie: (yourName, crushName) => `
    <span><strong>${escapeHtml(yourName)}</strong> và <strong>${escapeHtml(crushName)}</strong> quả là hai cái tên đáng iu, độ hợp nhau thì mình hong biết nhưng số lượng cừu con bị lừa đã +1 haha.</span>
    <br /><br />
    <span>Kết quả này sẽ được gửi đến cho admin.</span>
    <br /><br />
    <strong>Cá tháng tư dui dẻ ♡</strong>
    <br /><br />
    <span>Để chuộc kết quả này hoặc chôn giấu bí mật này mãi mãi, hãy liên hệ IG @mee.ltt.</span>
  `,
  cn: (yourName, crushName) => `
    <span><strong>${escapeHtml(yourName)}</strong> 和 <strong>${escapeHtml(crushName)}</strong> 这两个名字还蛮可爱的。到底配不配先不说, 但上当的小绵羊数量已经 +1 啦哈哈。</span>
    <br /><br />
    <span>这个结果会发送给管理员。</span>
    <br /><br />
    <strong>愚人节快乐 ♡</strong>
    <br /><br />
    <span>想赎回结果, 或者让它永远变成小秘密, 就去联系 IG @mee.ltt。</span>
  `
};

const state = {
  lang: localStorage.getItem("crushmatch-lang") || "eng"
};

const form = document.getElementById("compatibility-form");
const resultModal = document.getElementById("resultModal");
const resultMessage = document.getElementById("resultMessage");
const submitBtn = document.getElementById("submitBtn");
const langButtons = Array.from(document.querySelectorAll(".lang-btn"));
const closeModalBtn = document.getElementById("closeModalBtn");

setLanguage(state.lang);

langButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = {
    yourName: String(formData.get("yourName") || "").trim(),
    crushName: String(formData.get("crushName") || "").trim(),
    yourBirthDate: String(formData.get("yourBirthDate") || "").trim(),
    crushBirthDate: String(formData.get("crushBirthDate") || "").trim(),
    locale: state.lang
  };

  if (!payload.yourName || !payload.crushName) {
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "...";

  try {
    const response = await fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Submit failed");
    }

    await response.json();
    resultMessage.innerHTML = prankMessages[state.lang](payload.yourName, payload.crushName);
    openModal();
  } catch (error) {
    resultMessage.textContent = "Something broke in the love lab. Try again.";
    openModal();
  } finally {
    applyTranslations();
    submitBtn.disabled = false;
  }
});

closeModalBtn.addEventListener("click", closeModal);

document.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && target.dataset.closeModal === "true") {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

function setLanguage(lang) {
  state.lang = translations[lang] ? lang : "eng";
  localStorage.setItem("crushmatch-lang", state.lang);
  langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === state.lang);
  });
  applyTranslations();
}

function applyTranslations() {
  const dict = translations[state.lang];
  document.documentElement.lang = state.lang;

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (dict[key]) {
      node.textContent = dict[key];
    }
  });

  if (submitBtn && !submitBtn.disabled) {
    submitBtn.textContent = dict.submit;
  }
}

function openModal() {
  resultModal.classList.remove("hidden");
  resultModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  resultModal.classList.add("hidden");
  resultModal.setAttribute("aria-hidden", "true");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
