/* EDITE AS NOTÍCIAS AQUI */

const START_DATE = "2026-05-24";

const DAILY_NEWS = [
  {
    edition: "Sunday Edition",
    topic: "Economy · United States · Brazil",
    image: "news/SUA-IMAGEM-AQUI.avif",
    imageCaption: "US Economy and Brazil Impact · The Fluency Times",

    levels: {
      1: {
        title: "Kevin Warsh Becomes Fed Chair",
        paragraphs: [
          "Kevin Warsh is now the chair of the US Federal Reserve.",
          "The Federal Reserve is the central bank of the United States.",
          "Its decisions can affect prices, jobs, and other countries."
        ],
        words: [
          "chair = presidente / chefe",
          "central bank = banco central",
          "prices = preços",
          "jobs = empregos"
        ],
        questions: [
          "Who is Kevin Warsh?",
          "What is the Federal Reserve?",
          "Can the Federal Reserve affect other countries?"
        ]
      },

      2: {
        title: "Kevin Warsh Takes Over the Federal Reserve",
        paragraphs: [
          "Kevin Warsh has become the new chair of the US Federal Reserve.",
          "He takes over at a difficult moment, as many Americans are worried about the cost of living.",
          "The Federal Reserve controls important interest rate decisions, which can affect the US economy and other countries, including Brazil."
        ],
        words: [
          "take over = assumir",
          "cost of living = custo de vida",
          "interest rates = taxas de juros",
          "including = incluindo"
        ],
        questions: [
          "Why is this a difficult moment for the United States?",
          "What does the Federal Reserve control?",
          "How can US interest rates affect Brazil?"
        ]
      },

      3: {
        title: "Kevin Warsh’s Appointment May Affect Global Markets",
        paragraphs: [
          "Kevin Warsh has been sworn in as chair of the US Federal Reserve at a time of economic uncertainty.",
          "His appointment comes as Donald Trump faces criticism over inflation, interest rates, and the cost of living.",
          "For Brazil, the decision may influence the dollar-real exchange rate, foreign capital flows, and pressure on the Selic rate."
        ],
        words: [
          "appointment = nomeação",
          "uncertainty = incerteza",
          "exchange rate = taxa de câmbio",
          "foreign capital flows = fluxo de capital estrangeiro",
          "pressure = pressão"
        ],
        questions: [
          "Why is Warsh’s appointment important for global markets?",
          "What problems is Trump facing in the economy?",
          "In your opinion, why should Brazilians pay attention to the Federal Reserve?"
        ]
      }
    }
  }

  /* COPIE O BLOCO ACIMA PARA ADICIONAR OUTRA DATA */
];

/* NÃO MEXE DAQUI PARA BAIXO */

let currentLevel = 1;

function formatHeaderDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).toUpperCase();
}

function getTodayIndex() {
  const today = new Date();
  const start = new Date(START_DATE + "T00:00:00");

  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);

  const diff = Math.floor((today - start) / 86400000);
  return ((diff % DAILY_NEWS.length) + DAILY_NEWS.length) % DAILY_NEWS.length;
}

function getCurrentNews() {
  return DAILY_NEWS[getTodayIndex()];
}

function renderNews() {
  const today = new Date();
  const news = getCurrentNews();
  const levelData = news.levels[currentLevel];

  document.getElementById("ddate").textContent = formatHeaderDate(today);

  document.getElementById("lvtxt").textContent = `Level ${currentLevel}`;

  document.getElementById("newsEdition").textContent = news.edition;
  document.getElementById("newsTopic").textContent = news.topic;

  document.getElementById("ahead").textContent = levelData.title;

  document.getElementById("abody").innerHTML = levelData.paragraphs
    .map(paragraph => `<p>${paragraph}</p>`)
    .join("");

  const image = document.getElementById("newsImage");
  if (image) {
    image.src = news.image;
    image.alt = levelData.title;
  }

  const caption = document.getElementById("imageCaption");
  if (caption) caption.textContent = news.imageCaption;

  const wordsBox = document.getElementById("words");
  if (wordsBox) {
    wordsBox.innerHTML = levelData.words
      .map(word => `<span>${word}</span>`)
      .join("");
  }

  const questionsContainer = document.getElementById("questionsContainer");
  if (questionsContainer) {
    questionsContainer.innerHTML = levelData.questions
      .map((question, index) => `
        <div class="qblock">
          <div class="qhdr">Question ${index + 1}</div>
          <div class="qbody">
            <p class="qtxt">${question}</p>
            <textarea class="atxt" name="question_${index + 1}" placeholder="Write your answer here..." required></textarea>
          </div>
        </div>
      `)
      .join("");
  }

  document.querySelectorAll(".lbtn").forEach(button => {
    button.classList.toggle(
      "active",
      Number(button.dataset.level) === currentLevel
    );
  });
}

document.querySelectorAll(".lbtn").forEach(button => {
  button.addEventListener("click", () => {
    currentLevel = Number(button.dataset.level);
    renderNews();
  });
});

renderNews();
