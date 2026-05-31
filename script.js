const stories = [
  {
    date: "May 25, 2026",
    title: "Israel Expands Offensive in Lebanon",

    levels: {
      1: {
        text: "Israel has captured Beaufort Castle in southern Lebanon. The castle is an important place because it is high above the Litani valley. Israeli leaders say this is an important moment in the conflict with Hezbollah. Many countries are worried because more people are leaving their homes in southern Lebanon.",

        questions: [
          "What place did Israel capture?",
          "Why is Beaufort Castle important?",
          "Why are many countries worried?"
        ]
      },

      2: {
        text: "The Israeli military has captured Beaufort Castle in southern Lebanon as it expands its ground offensive against Hezbollah. The site is both strategic and symbolic because it overlooks the Litani valley and has played an important role in past conflicts. Israel says the operation is meant to weaken Hezbollah and protect communities near the border. However, Lebanon’s prime minister accused Israel of collective punishment, while the UK, France, and Germany criticized the escalation and called for diplomacy.",

        questions: [
          "Why is Beaufort Castle important?",
          "What does Israel say the operation is meant to do?",
          "How did other countries react to the escalation?"
        ]
      },

      3: {
        text: "Israel’s capture of Beaufort Castle marks a significant expansion of its ground offensive in southern Lebanon. The site carries both strategic and historical weight, as it overlooks the Litani valley and was also captured by Israeli forces during the First Lebanon War. Prime Minister Benjamin Netanyahu described the operation as a decisive shift in Israel’s policy toward Hezbollah. International criticism has intensified, with the UK, France, and Germany warning that further escalation could deepen civilian displacement and reduce chances for diplomacy. Lebanon’s government accused Israel of collective punishment as evacuation orders expanded across the south.",

        questions: [
          "Why is the capture of Beaufort Castle strategically and symbolically important?",
          "How has the international community responded to Israel’s offensive?",
          "What are the possible humanitarian consequences of the escalation?"
        ]
      }
    }
  },

  {
    date: "May 26, 2026",
    title: "High Gas Prices Push Inflation Higher",

    levels: {
      1: {
        text: "Gas prices went up again because of the war with Iran. This made inflation higher in the United States. Many families are spending more money and saving less. A new report says Americans are saving at the lowest rate in almost four years.",

        questions: [
          "What made inflation higher?",
          "Are Americans saving more or less money?",
          "Why are families feeling financial pressure?"
        ]
      },

      2: {
        text: "Higher gas prices pushed inflation up again in the United States last month. The Federal Reserve’s preferred inflation measure rose to 3.8% in April. Consumer spending still increased, but when inflation is included, spending grew only slightly. The report also showed that Americans are saving less, with the personal saving rate falling to 2.6%, the lowest level since 2022. Economists warn that many households are struggling to keep up with rising costs.",

        questions: [
          "How did gas prices affect inflation?",
          "What happened to Americans’ personal saving rate?",
          "Why are economists worried about household finances?"
        ]
      },

      3: {
        text: "A new economic report showed that rising gas prices, driven by the Iran war’s oil shock, pushed inflation higher in April. The Personal Consumption Expenditures price index rose to 3.8%, while consumer spending slowed after adjusting for inflation. Although Americans continued to spend, the data revealed growing financial strain. Disposable income fell, inflation-adjusted income dropped more sharply, and the personal saving rate declined to 2.6%, its lowest level in nearly four years. Economists warn that this pattern may be unsustainable, especially for lower-income and middle-class households.",

        questions: [
          "How did the oil price shock influence inflation in April?",
          "What signs show that American households are under financial pressure?",
          "Why might this spending pattern be unsustainable?"
        ]
      }
    }
  },

  {
    date: "May 27, 2026",
    title: "Experts Warn About Quantum Cybersecurity Risk",

    levels: {
      1: {
        text: "Experts are worried about a future problem called Q-Day. This is the day when quantum computers may be strong enough to break online security codes. These codes protect emails, bank information, medical files, and many other things. Google says this could happen by 2029, so companies and governments need to prepare.",

        questions: [
          "What is Q-Day?",
          "What information could be at risk?",
          "Why do companies and governments need to prepare?"
        ]
      },

      2: {
        text: "Cybersecurity experts are warning about Q-Day, the future moment when quantum computers may be able to break many of today’s encryption systems. Encryption protects online banking, emails, medical records, and private data. Google recently said this risk could become real by 2029, which gives companies and governments less time to prepare. Some attackers may already be collecting encrypted information now, hoping to decrypt it later when quantum computers become powerful enough.",

        questions: [
          "What does Q-Day mean?",
          "Why is encryption important for internet security?",
          "What is a “harvest now, decrypt later” attack?"
        ]
      },

      3: {
        text: "Cybersecurity specialists are increasingly concerned about Q-Day, the point at which quantum computers become powerful and stable enough to break conventional encryption. This could expose financial transactions, medical records, emails, location data, and crypto wallets protected by today’s algorithms. Google has warned that some encrypted systems may be vulnerable by 2029, accelerating the timeline for governments and companies to adopt post-quantum cryptography. Experts also warn that adversaries may already be stealing encrypted data and storing it for future decryption, a strategy known as “harvest now, decrypt later.”",

        questions: [
          "Why does Q-Day represent a major cybersecurity threat?",
          "How could quantum computing affect today’s encryption systems?",
          "Why is the “harvest now, decrypt later” strategy dangerous?"
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
