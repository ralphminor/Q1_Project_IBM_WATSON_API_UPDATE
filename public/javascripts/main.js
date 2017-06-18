$(document).ready(function () {
  "use strict";
  $("select").material_select();
  $(".button-collapse").sideNav();

  // Listen for the user to select a news source.
  // When selected, run the getNews function using the
  // option value as source to pass to the function.
  $("#select1").change(function () {
    event.preventDefault();
    var source = $("select option:selected").val();
    getNews(source);  //Function that get the news article info.
  });

  //  The graphIt function utilizes the D3 framework to add a bar graph
  //  to the page using DOM manipulation and pulling bar graph values from
  //  local storage values created after the API call.
  function graphIt(chartNum) {
    var chartClass = "." + chartNum;
    var emotions = ["anger", "disgust", "fear", "joy", "sadness"];
    var colors = ["rgba(255, 0, 0, .8)", "green", "purple", "yellow", "blue"];
    var data = [];
    for (var i = 0; i < emotions.length; i++) {
      data[i] = Number.parseFloat(localStorage.getItem(emotions[i]));
    }

    var x = d3.scaleLinear()
        .domain([0, d3.max(data)])
        .range([0, 40]);
    var colorIndex = 0;
    d3.select(chartClass)
      .selectAll("div")
        .data(data)
      .enter().append("div")
        .style("width", function(d) { return x(d) + "em"; })
        .style("background-color", function(d) { return colors[colorIndex++]})
        .text(function(d) { return d; });
    for (var i = 0; i < 5; i++) {
      var $bar = $(chartClass)[0].childNodes[i];
      var barText = $bar.innerHTML;
      barText = emotions[i] + ": " + barText; //Add name of emotion to bar text.
      $bar.innerHTML = barText;
    }
  }

  function analyzeURL(url, chart) {
    localStorage.clear();
    var urlToAnalyze = url;
    var urlBase = '/analysis';
    $.ajax({
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({ "url": urlToAnalyze }),
      processData: false,
      url: urlBase,
      type: 'POST',
      success: function (data) {
        var emoObj = data.emotion.document.emotion;
        for (var emotion in emoObj) {
          localStorage.setItem(emotion, emoObj[emotion]);
        }
        graphIt(chart);
      }
    })
  }

  //  The getNews function is triggered when a news source is selected.
  //  It hits the newsapi and receive an object of top news articles (max 10);
  function getNews(source) {
    localStorage.clear();
    var urlBase = '/news';
    $.ajax({
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({ "source": source }),
      processData: false,
      url: urlBase,
      type: 'POST',
      success: function (data) {
        localStorage.setItem("articles", data);
        addArticles(data);
        }
      })
  }

  // The addArticles function receives the new articles object and dynamically
  // creates and adds the news stories to the page including modals that
  // appear when clicked and show the Watson API emotion analysis results on
  // a bar graph.
  function addArticles(obj) {
    $("#articlesList").html("");  //Clears the current articles on the page.
    var rawArticles = obj;

    // Start of dynamic creation and addition of news stories with materialize
    // cards and modals on the page.
    for (var i = 0; i < rawArticles.articles.length; i++) {
      var element = rawArticles.articles[i];
      //  Ternary operators to eliminate null values.
      var $author = element.author ? element.author : "Not available.";
      var $title = element.title ? element.title : "Not available.";
      var $desc = element.description ? element.description.substring(0, 300) : "Not avialble";
      var $url = element.url ? element.url : "#";
      var $urlImg = element.urlToImage ? element.urlToImage : "assets/images/thumbna.png";
      var $pub = element.publishedAt;

      var $div1 = $("<div>").addClass("col s10 offset-s1");
      var $div2 = $("<div>").addClass("card small horizontal");
      var $div3 = $("<div>").addClass("card-image wrp");
      var $div4 = $("<div>").addClass("card-stacked");
      var $div5 = $("<div>").addClass("card-content");
      var $div6 = $("<div>").addClass("card-action");
      var $img = $("<img>").attr("src", $urlImg);
      $img.css("width", "300px");

      $div2.css("overflow", "hidden");

      var $h51 = $("<h5>").text($title);
      var $h61 = $("<h6>").text("Author: "+$author);
      var $h62 = $("<h6>").text("Published: "+$pub);
      var $br = $("<br>");
      var $p = $("<p>").text($desc);
      var $a1 = $("<a>").attr("href", $url);
      var $a1 = $a1.attr("target", "_blank");
      $a1.append("Link to Story");
      $div5.append($h51,$h61,$h62,$p);
      $div5.addClass("card-content");
      $div6.append($a1);

      // Dynamic Modal Creation and assembly.
      var $pM = $("<p>").addClass("chart"+(i+10));
      var $aM1 = $("<a>").attr("href", "#modal"+(i+10)).addClass("modal-trigger waves-effect waves-light btn").append("Emotion Analysis").attr("id", "b"+(i+10)).attr("data-url", $url).attr("data-chart", "chart"+(i+10));
      var $aM2 = $("<a>").attr("href", "#!").addClass("modal-action modal-close waves-effect waves-green btn-flat").append("Close");
      var $divM1 = $("<div>").addClass("modal modal-fixed-footer").attr("id", "modal"+(i+10));
      var $divM2 = $("<div>").addClass("modal-content");
      var $divM3 = $("<div>").addClass("modal-footer");
      var $h4M = $("<h4>").text("Emotional Analysis");
      $divM3.append($aM2);
      $divM2.append($h4M, $pM);
      $divM1.append($divM2, $divM3);

      // Final card assembly and append of news items to the page.
      $div6.append($aM1,$divM1);
      $div4.append($div5,$div6);
      $div3.append($img);
      $div2.append($div3,$div4);
      $div1.append($div2);
      $("#articlesList").append($div1);
    }
    $(".modal").modal();  //Initialize Materialize modal function.

    // Set a button listener on the newly created modals & buttons
    // now on the page.  Listen for the modal button click.
    $(".modal-trigger").click(function(event){
      event.preventDefault();
      var sendURL = $(event.target).attr("data-url");
      var sendChart = $(event.target).attr("data-chart");
      analyzeURL(sendURL, sendChart); // Function that will hit Watson API.
    })
  }

  // This function displays a custom error message if the getNews api call
  // fails.
  function displayError() {
    $("#articlesList").html("");
    let errorMsg1 = "We're sorry, but the news source you've requested is currently unavailable."
    let errorMsg2 = "Please try again later or select another news source."
    $p1 = $("<h5>").text(errorMsg1).addClass("center");
    $p2 = $("<h5>").text(errorMsg2).addClass("center");
    $("#articlesList").append($p1,$p2);
  }

});
