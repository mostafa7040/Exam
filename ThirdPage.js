var arr = [];
var CurrentQuestion = 0;

function Answer(key, title) {
    this.key = key;
    this.title = title;
}

function Question(title, correctanswer) {
    this.title = title;
    this.selectedAnswer;
    this.correctAnswer = correctanswer;
    this.answers = [];
}

/* A method to add answers to the array of answers in the Question class */
Question.prototype.AddAnswers = function (...AnswersArray) {
    for (let i = 0; i < AnswersArray.length; i++) {
        this.answers.push(AnswersArray[i]);
    }
}

Question.prototype.SelectAnswer = function (selected) {
    /* To Get Answer Key Like A,B,C,D */
    this.selectedAnswer = selected.split('-')[0].trim();
    /* Save Question number as a key and it's correctivness as value in localstorage */
    localStorage.setItem(`Q-${CurrentQuestion}`, this.selectedAnswer === this.correctAnswer)
}

/* Create Questions objects and it's array of answers and push it to the array */
let CreateQuestion = function (data) {
    data.forEach(e => {
        let keys = Object.keys(e);
        let values = Object.values(e);

        let question = new Question(e.question, e.answer);

        for (let i = 1; i < 5; i++) {
            let answer = new Answer(keys[i], values[i]);
            question.answers.push(answer);
        }
        arr.push(question);
    });
}

/* Randomize Questions */
let Randomize = () => {
    for (let i = 0; i < arr.length; i++) {
        let x = Math.floor(Math.random() * arr.length);
        let y = Math.floor(Math.random() * arr.length);
        [arr[x], arr[y]] = [arr[y], arr[x]];
    }
}

/* Display Questions in DOM */
function CreateDOM() {
    for (let i = 0; i < arr.length; i++) {
        let ele = $(`<div class="DivTabs" ${CurrentQuestion === i ? "id =ActiveTap" : ''}>
        <h2 class="Question_Title"></h2>
        <div class="Answers_Container"></div>
        </div>`);

        ele.find('.Question_Title').text(arr[i].title)
        for (let j = 0; j < arr[i].answers.length; j++) {
            $(ele).find('.Answers_Container').append(`<p>${arr[i].answers[j].key} - ${arr[i].answers[j].title}</p>`);
        }
        $('#Exam_Wrapper').append($(ele));
    }
}

/* Change Current Question */
function ChangeQuestion() {

    /* Remove ID of Active from the previous Question and add it to the current Question */
    $('#ActiveTap').removeAttr('id');
    $($('#Exam_Wrapper .DivTabs')[CurrentQuestion]).attr('id', 'ActiveTap');

    /* Hide all the Questions and thier answers and display the new current one */
    $('#Exam_Wrapper .DivTabs').fadeOut('fast');
    $('#ActiveTap').fadeIn('slow');

    CurrentQuestion === 0 ? $('#Prev_button').hide() : $('#Prev_button').show();
    CurrentQuestion === arr.length - 1 ? $('#Next_button').hide() : $('#Next_button').show();

    $('.Question_Title').text(`${(+CurrentQuestion) + 1}- ${arr[CurrentQuestion].title}`);

    /* Select answer method in the Question Object and change style */
    $('.Answers_Container p').click(function () {
        arr[CurrentQuestion].SelectAnswer($(this).text());
        $(this).parent().children().css('background-color', '#424E5B')
        $(this).css('background-color', '#727F8D');
    });

    /* Change BookMark icon */
    if (localStorage.getItem(`QMarked-${CurrentQuestion}`) !== null) {
        $('#Mark_button').html(`<lord-icon src="https://cdn.lordicon.com/hntobqbr.json"trigger="in"state="morph-checked"style="width:3rem;height:3rem"></lord-icon>`);
    } else {
        $('#Mark_button').html(`<lord-icon src="https://cdn.lordicon.com/hntobqbr.json"trigger="click"style="width:3rem;height:3rem"></lord-icon>`);
    }

    /* Change the number of the current question in the button div */
    $('#Curr_Question').text((+CurrentQuestion) + 1);
}


/* Clear all the local storage and keep the User Data */
let ClearStorage = () => {
    let User = localStorage.getItem('User');
    localStorage.clear();
    localStorage.setItem('User', User);
}

/* Start Exam fires only one time as make all previous functions */
let StartExam = (data) => {
    ClearStorage();
    CreateQuestion(data);
    Randomize();
    CreateDOM();
    ChangeQuestion(CurrentQuestion);
}

let SubmitExam = () => {
    let score = 0;
    for (let i = 0; i < arr.length; i++) {
        localStorage.getItem(`Q-${i}`) === 'true' ? score++ : null;
    }
    ClearStorage();
    localStorage.setItem('score', score);
    localStorage.setItem('Array',JSON.stringify(arr))
    window.location = './GradesPage.html'
}
let TimeOutExam = () => {
    ClearStorage();
    window.location = './TimeOut.html';
}

fetch('../JS/BackEndData.json').then(res => {
    return res.json();
}).then(data => {
    StartExam(data);
})

$('#Prev_button').click(function () {
    CurrentQuestion === 0 ? null : --CurrentQuestion;
    ChangeQuestion();
})


$('#Next_button').click(function () {
    CurrentQuestion === arr.length ? null : ++CurrentQuestion;
    ChangeQuestion();
})


$('#Mark_button').click(function () {
    /* If the Question is already Marked so remove it from marked questions */
    /* If not add it to the marked questions */
    if (localStorage.getItem(`QMarked-${CurrentQuestion}`) === null) {
        $('#Marked_questions').append(`<p id=${CurrentQuestion} onclick="ReturnToQuestion(this)"
        class="MarkedPrgph">Question number  ${CurrentQuestion + 1}</p>`);
        localStorage.setItem(`QMarked-${CurrentQuestion}`, '');
        $('#Mark_button').html(`<lord-icon src="https://cdn.lordicon.com/hntobqbr.json"trigger="in"state="morph-checked"style="width:3rem;height:3rem"></lord-icon>`);
    } else {
        localStorage.removeItem(`QMarked-${CurrentQuestion}`);
        $(`#Marked_questions #${CurrentQuestion}`).remove();
        $('#Mark_button').html(`<lord-icon
        src="https://cdn.lordicon.com/hntobqbr.json"
        trigger="in"
        style="width:3rem;height:3rem">
    </lord-icon>`);
    }
})


let x = setInterval(() => {
    if ($('#Time_progress_bar').val() === 120) {
        clearInterval(x);
        TimeOutExam();
    } else {
        $('#Time_progress_bar').val($('#Time_progress_bar').val() + 1);
    }
}, 1000)

function ReturnToQuestion(x) {
    CurrentQuestion = +($(x).attr('id'));
    ChangeQuestion();
}

$('#Submit_Button').click(SubmitExam)