const stories = [
  {
    date: "May 24, 2026",
    title: "A New AI Tool Is Changing Education",

    levels: {
      1: {
        text: "Many students are using artificial intelligence to study English and other subjects. Teachers say technology can help if students use it correctly.",

        questions: [
          "What are students using?",
          "Can technology help students?",
          "How should students use AI?"
        ]
      },

      2: {
        text: "Artificial intelligence is becoming more common in education. Many students use AI tools to practice languages, organize notes, and improve productivity. Some teachers believe these tools are useful when used responsibly.",

        questions: [
          "Why are students using AI?",
          "What do teachers think about it?",
          "How can AI improve productivity?"
        ]
      },

      3: {
        text: "Artificial intelligence has rapidly expanded into educational environments, transforming how students engage with information. From language acquisition to productivity enhancement, AI-powered platforms are reshaping study routines. However, educators continue debating the ethical and pedagogical implications of relying too heavily on these systems.",

        questions: [
          "How is AI transforming education?",
          "What concerns do educators have?",
          "What are the benefits of AI platforms?"
        ]
      }
    }
  }
];

let currentLevel = 1;
let currentStory = stories[0];

const titleEl = document.getElementById("newsTitle");
const dateEl = document.getElementById("newsDate");
const textEl = document.getElementById("newsText");
const questionsContainer = document.getElementById("questionsContainer");

function renderStory() {

  titleEl.textContent = currentStory.title;
  dateEl.textContent = currentStory.date;

  textEl.textContent =
    currentStory.levels[currentLevel].text;

  questionsContainer.innerHTML = "";

  currentStory.levels[currentLevel].questions.forEach((q, index) => {

    questionsContainer.innerHTML += `
      <div class="qblock">
        <strong>Question ${index + 1}</strong>
        <p>${q}</p>
      </div>
    `;

  });

  document.querySelectorAll(".lbtn").forEach(btn => {

    btn.classList.remove("active");

    if(btn.dataset.level == currentLevel){
      btn.classList.add("active");
    }

  });

}

document.querySelectorAll(".lbtn").forEach(btn => {

  btn.addEventListener("click", () => {

    currentLevel = Number(btn.dataset.level);

    renderStory();

  });

});


// =========================
// BROWSER READING
// =========================

const synth = window.speechSynthesis;

let utterance;


// START BUTTON

document.getElementById("startBtn")
.addEventListener("click", () => {

  synth.cancel();

  utterance = new SpeechSynthesisUtterance(
    currentStory.levels[currentLevel].text
  );

  utterance.lang = "en-US";

  utterance.rate = 0.95;

  synth.speak(utterance);

});


// PAUSE BUTTON

document.getElementById("pauseBtn")
.addEventListener("click", () => {

  if (synth.speaking && !synth.paused) {

    synth.pause();

  } else if (synth.paused) {

    synth.resume();

  }

});


// RESTART BUTTON

document.getElementById("restartBtn")
.addEventListener("click", () => {

  synth.cancel();

  utterance = new SpeechSynthesisUtterance(
    currentStory.levels[currentLevel].text
  );

  utterance.lang = "en-US";

  utterance.rate = 0.95;

  synth.speak(utterance);

});

renderStory();
