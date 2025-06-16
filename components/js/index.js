// select the elements

let countOfQuestions;
let allData = [];
let submitBtn = document.getElementById("submit-btn");
let bullets = document.querySelector(".bullets");
let answers = [];
let time;
let duration = 5; // 3 minutes in seconds

let index = 0;
let rightallData = 0;

async function getData() {
  try {
    if (localStorage.getItem("quizCompleted") === "true") {
      document.querySelector(".quiz-area").innerHTML = `<div class='alert alert-success text-center'>
        <h3>لقد قمت بحل الاختبار بالفعل!</h3>
      </div>`;
      document.querySelector(".answer-quiz").style.display = "none";
      return;
    }

    const res = await fetch(`/components/json/quiz.json`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();

    allData = data[0].questions;
    countOfQuestions = data[0].questions.length;

    // تحميل البيانات من localStorage
    index = parseInt(localStorage.getItem("currentIndex")) || 0;
    rightallData = parseInt(localStorage.getItem("rightAnswers")) || 0;

    displayQuestion(allData[index].question);
    displayallData(allData[index].options);
    createBullets(countOfQuestions);

    // تفعيل البولتات السابقة
    let allBullets = document.querySelectorAll(".bullets span");
    for (let i = 0; i < index; i++) {
      allBullets[i].classList.add("active");
    }
    allBullets[index]?.classList.add("active");

    timer(duration);
    document.querySelector(".quiz-count").innerHTML = countOfQuestions;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
getData();

function displayQuestion(data) {
  const quiz = document.querySelector(".quiz-area");
  quiz.innerHTML = "";
  const h2 = document.createElement("h2");
  h2.textContent = data;
  quiz.appendChild(h2);
}

function displayallData(data) {
  let allDataContainer = document.querySelector(".x");
  allDataContainer.innerHTML = "";

  let fragment = document.createDocumentFragment();

  for (let i = 0; i < data.length; i++) {
    let div = document.createElement("div");
    div.classList.add("form-check");

    let input = document.createElement("input");
    input.className = "form-check-input";
    input.type = "radio";
    input.name = "answer";
    input.id = `answer-${i}`;
    input.value = i;

    let label = document.createElement("label");
    label.className = "form-check-label";
    label.htmlFor = `answer-${i}`;
    label.textContent = data[i];

    div.appendChild(input);
    div.appendChild(label);
    fragment.appendChild(div);
  }

  allDataContainer.appendChild(fragment);
}

submitBtn.onclick = function () {
  clearInterval(time);
  compareAnswer();

  // حفظ التقدم في التخزين المحلي
  

  index++;
  localStorage.setItem("currentIndex", index);
  localStorage.setItem("rightAnswers", rightallData);

  if (index < countOfQuestions) {
    displayQuestion(allData[index].question);
    displayallData(allData[index].options);
    timer(duration);

    document.querySelectorAll(".bullets span")[index]?.classList.add("active");
  } else {
    console.log("خلصت الأسئلة");
    submitBtn.disabled = true;
    localStorage.setItem("quizCompleted", "true");

    // حذف بيانات التقدم
    localStorage.removeItem("currentIndex");
    localStorage.removeItem("rightAnswers");

    // حساب النتيجة
    let resultDiv = document.querySelector(".result");
    let scoreText = `
      <div class="alert alert-info text-center mt-4">
        لقد أجبت بشكل صحيح على 
        <strong>${rightallData}</strong> من أصل 
        <strong>${countOfQuestions}</strong> سؤال.
        <br>
        النسبة: <strong>${Math.round((rightallData / countOfQuestions) * 100)}%</strong>
      </div>
    `;
    resultDiv.innerHTML = scoreText;
  }
};

function compareAnswer() {
  let selectedAnswer = document.querySelector("input[name='answer']:checked");
  if (!selectedAnswer) {
    console.log("لم يتم اختيار إجابة");
    return;
  }

  if (parseInt(selectedAnswer.value) === allData[index].answer) {
    rightallData++;
    console.log("Correct answer");
  } else {
    console.log("Wrong answer");
  }
}

function createBullets(x) {
  let y = document.createDocumentFragment();
  for (let i = 0; i < x; i++) {
    const bullet = document.createElement("span");
    bullet.classList.add("bullet");
    y.appendChild(bullet);
  }
  bullets.appendChild(y);
}

function timer(durationValue) {
  let duration = durationValue;

  if (index < countOfQuestions) {
    let min, sec;
    time = setInterval(() => {
      min = Math.floor(duration / 60);
      sec = duration % 60;
      min = min < 10 ? `0${min}` : min;
      sec = sec < 10 ? `0${sec}` : sec;
      document.getElementById("timer").innerHTML = `${min}:${sec}`;

      if (--duration < 0) {
        console.log("Time's up!");
        clearInterval(time);
        submitBtn.click();
        return;
      }
    }, 1000);
  }
}
