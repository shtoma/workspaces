//var initialData = [{'QuestionId':'Q1','QuestionText':'This is 1st question', 'Options':{'0':'0 Score','1':'1 Score','2':'2 Score'},'MinScore':'5'},{'QuestionId':'Q2','QuestionText':'This is 2nd question', 'Options':{'0':'0 Score','1':'1 Score','2':'2 Score'},'MinScore':'5'},{'QuestionId':'Q3','QuestionText':'This is 3rd question', 'Options':{'0':'0 Score','1':'1 Score','2':'2 Score'},'MinScore':'5'}]; 

var initialData = [
    {
      "questionId" : "210",
      "question": "Earlier in the modern era, Olympic-level athletes ——- for several months, unlike the decade-long preparation now commonly seen.",
      "option": [
        "(A) had trained",
        "(B) trains",
        "(C) trained",
        "(D) have trained"
      ],
      "translation": "【問題文訳】「現在は一般的に見られる10年かけての準備ではなく、現代の初めの頃、オリンピックに出場できるレベルの選手たちは何か月か練習を積むだけだった」",
      "answer": "A",
      "explanation": "【解説】前半の内容がunlike以降と比較されていることに気づくこと。Earlier in the modern eraのことを述べており、過去のことだが、過去形である(C)のtrainedは正解ではない。過去のオリンピックまでのトレーニング期間のことを述べているので、過去形よりも古いことを描写する「過去完了形」を使わなければならない。したがって(A)のhad trainedが適切である。"
    }
  ]

var ViewModel = function (data) {
    
    var selections = []; //Array containing user choices
    var quiz = $('#quiz'); //Quiz div object
    var answers = $('#answers'); //Answer table object

    var completed = ko.observable(false);
    var answerValues = ['A','B','C','D',];
    var self = this;
    self.questionCounter = ko.observable(0); //Tracks question number

    ko.utils.arrayForEach(data || [], function (item) {
        item.SelectedValue = ko.observable();
        //item.Options = options;
        item.result = ko.computed(function (){
            return item.SelectedValue() == item.answer ? '○' : '× (yours:' + item.SelectedValue() + ')' ;
        });
        //item.showResult = ko.observable(false);
    });
    self.questions = ko.observableArray(data);

    // Display initial question
    self.displayNext = function() {
        quiz.fadeOut(function() {
            $('#question').remove();
            if(self.questionCounter() < self.questions().length){
                var nextQuestion = self.createQuestionElement(self.questionCounter());
                quiz.append(nextQuestion).fadeIn();
                var currentQuestionSelectedValue = selections[self.questionCounter()];
                if ($.inArray(currentQuestionSelectedValue, answerValues) >= 0 ) {
                    $('input[value='+answerValues.indexOf(currentQuestionSelectedValue)+']').prop('checked', true);
                }
                
                // Controls display of 'prev' button
                if(self.questionCounter() == 1){
                    $('#prev').show();
                } else if(self.questionCounter() == 0){
                    $('#prev').hide();
                    $('#next').show();
                }
                answers.hide();
            } else {
                var scoreElem = self.displayScore();
                quiz.append(scoreElem).fadeIn();
                $('#next').hide();
                $('#prev').hide();
                $('#start').show();
                self.displayAnswers();
                answers.show();
            }
        });
    };


    // Creates and returns the div that contains the questions and 
    // the answer selections
    self.createQuestionElement = function(index) {
        var qElement = $('<div>', {
          id: 'question'
        });
        
        var header = $('<h2>Question ' + (index + 1) + ':</h2>');
        qElement.append(header);
        
        var question = $('<p>').append(self.questions()[index].question);
        qElement.append(question);
        var radioButtons = self.createRadios(index);
        qElement.append(radioButtons);
        
        return qElement;
    }

    self.createRadios = function(index, radioFlag) {
        if (radioFlag == undefined) {
            radioFlag = true
        }
        var radioList = $('<ul>');
        var item;
        var input = '';
        for (var i = 0; i < self.questions()[index].option.length; i++) {
            item = $('<li>');
            if (radioFlag) {
                input = '<input type="radio" name="answer" value=' + i + ' />  ';
                input += self.questions()[index].option[i];
            } else {
                input = self.questions()[index].option[i];
            }
            
            item.append(input);
            radioList.append(item);
        }
        return radioList;
    }

      // Reads the user selection and pushes the value to an array
    self.choose = function() {
        checkedValue = $('input[name="answer"]:checked').val();
        selections[self.questionCounter()] = answerValues[checkedValue];;
    }

    self.goNext = function(){
        // Suspend click listener during fade animation
        if(quiz.is(':animated')) {        
            return false;
        }
        self.choose();
        
        // If no user selection, progress is stopped
        if (selections[self.questionCounter()] == undefined || $.inArray(selections[self.questionCounter()], answerValues) == - 1) {
            alert('Please make a selection!');
        } else {
            self.questionCounter.increment();
            self.displayNext();
        }
    }

    self.goPrev = function (){
        // Click handler for the 'prev' button
        if(quiz.is(':animated')) {
            return false;
        }
        self.choose();
        self.questionCounter.decrement();
        self.displayNext();
    }

    self.giveUp = function (){
        $('<img>', {src: 'http://img.laughy.jp/7441/default_b03fdbd239852cf1ba0eea0dc63e4cbe.jpg'}).bPopup();
    }
    // Computes score and returns a paragraph element to be displayed
    self.displayScore = function() {
        var score = $('<p>',{id: 'question'});
        var numCorrect = 0;
        for (var i = 0; i < selections.length; i++) {
            if (selections[i] === self.questions()[i].answer) {
                numCorrect++;
            }
        }
        percentage = (numCorrect / self.questions().length) * 100;

        score.append('Score : ' + percentage + '%. You got ' + numCorrect + ' questions out of ' +
                     self.questions().length + ' right!!!');
        return score;
    }

    self.displayAnswers = function(){
        var tableContents;
        for (var i = 0; i < selections.length; i++) {
                var row = '';
                isCorrect = selections[i] === self.questions()[i].answer;
                if (isCorrect) {
                    row += '<tr id ="' + i + '" >';                
                } else {
                    row += '<tr id ="' + i + '" class="danger" >';
                }
                row += '<td>' + self.questions()[i].questionId + '</td>'; //ID
                row += '<td>' + self.questions()[i].question + '</td>';// Question
                row += '<td>' + self.createRadios(i, false).html() + '</td>';// Options
                row += '<td>' + selections[i] + '</td>';// Your selection
                if (isCorrect) {
                    row += '<td>○</td>';// Result
                } else {
                    row += '<td>×</td><';// Result
                }
                row += '<td>' + self.questions()[i].answer + '</td>';// Answer
                row += '<td>' + self.questions()[i].explanation + '</td>';// Explanation
                row += '</tr>';
                tableContents += row;
        }
        answers.append(tableContents);
    }
    
    // Following TotalScore is a computed value to show the total score of the quiz taker
    self.TotalScore = ko.computed(function () {
        var total = 0;
        $.each(self.questions(), function () { 
            if (this.result() == '○')
                total += 1;
        });
        return total;
    });

    self.restQuestions = ko.computed(function () {
        return self.questions().length - self.questionCounter();
    });

    self.questionCountdownView = ko.computed(function () {
        return "残り" + self.restQuestions() +  "問";
    });

    self.displayNext();
};

$(function () {
    ko.applyBindings(new ViewModel(initialData));
    // or for all
    ko.observable.fn.increment = function (incValue) {
        this(this() + (incValue || 1));
    };

    ko.observable.fn.decrement = function (decValue) {
        this(this() - (decValue || 1));
    };

    // $.getJSON("./data/answers/day1.json", function(data){
    //     var arr = Object.keys(data).map(function(k) { return data[k] });
    //     var model = new ViewModel(arr.slice(0,5));
    //     ko.applyBindings(model);
    // }).fail(function(error){
    //     alert(error.statusText);
    // });

    
});