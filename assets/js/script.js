console.log("Script connected");

// Global variables
var cityList = [];
var cityname;

// local storage functions
initCityList();
initWeather();

// This function displays the city entered by the user into the DOM
function showCities(){
    $("#cityList").empty();
    $("#city-name").val("");
    
    for (i=0; i<cityList.length; i++){
        var cityistEl = $("<li class='bg-primary px-2'>");
        cityistEl.addClass("city");
        cityistEl.attr("data-name", cityList[i]);
        cityistEl.text(cityList[i]);
        $("#cityList").prepend(cityistEl);
    } 
}

// This function pulls the city list array from local storage
function initCityList() {
    var storedCities = JSON.parse(localStorage.getItem("cities"));
    
    if (storedCities !== null) {
        cityList = storedCities;
    }
    
    showCities();
    }

// Function call current and 5 day forcast from local storage and display on page load
function initWeather() {
    var storedWeather = JSON.parse(localStorage.getItem("currentCity"));

    if (storedWeather !== null) {
        cityname = storedWeather;

        displayCurrentWeather();
        displayFiveDayWeather();
    }
}

//  Function saves searched city to local storage
function saveSearchedCity() {
    localStorage.setItem("cities", JSON.stringify(cityList));
    }

// Function saves the current city to local storage
function saveCurrentCity() {
    localStorage.setItem("currentCity", JSON.stringify(cityname));
}
      

// Click event for search city
$("#citySearchBtn").on("click", function(event){
    event.preventDefault();

    cityname = $("#city-name").val().trim();
    if(cityname === ""){
        alert("Please enter a city to look up")

    }else if (cityList.length >= 5){  
        cityList.shift();
        cityList.push(cityname);

    }else{
    cityList.push(cityname);
    }
    saveCurrentCity();
    saveSearchedCity();
    showCities();
    displayCurrentWeather();
    displayFiveDayWeather();
});

// Keypress when user hits enter instead of click
$("#city-name").keypress(function(e){
    if(e.which == 13){
        $("#citySearchBtn").click();
    }
})

// function for API, Current weather and 5 day forcast
async function displayCurrentWeather() {

    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityname + "&units=imperial&appid=3ef6c5fde4febcc1f92f88e51b64bc82";

    var response = await $.ajax({
        url: queryURL,
        method: "GET"
      })
        

        var currentWeatherDiv = $("<div class='card-body' id='currentWeather'>");
        var getCurrentCity = response.name;
        var date = new Date();
        var val=(date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear();
        var getCurrentWeatherIcon = response.weather[0].icon;
        var CurrentWeatherIcon = $("<img src = http://openweathermap.org/img/wn/" + getCurrentWeatherIcon + "@2x.png />");
        var currentCityEl = $("<h3 class ='card-title'>").text(getCurrentCity+" ("+val+")");
        currentCityEl.append(CurrentWeatherIcon);
        currentWeatherDiv.append(currentCityEl);
        var getTemp = response.main.temp.toFixed(1);
        var tempEl = $("<p class='card-text'>").text("Temperature: "+getTemp+"° F");
        currentWeatherDiv.append(tempEl);
        var getHumidity = response.main.humidity;
        var humidityEl = $("<p class='card-text'>").text("Humidity: "+getHumidity+"%");
        currentWeatherDiv.append(humidityEl);
        var getWindSpeed = response.wind.speed.toFixed(1);
        var windSpeedEl = $("<p class='card-text'>").text("Wind Speed: "+getWindSpeed+" mph");
        currentWeatherDiv.append(windSpeedEl);
        var getLong = response.coord.lon;
        var getLat = response.coord.lat;
        
        var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=3ef6c5fde4febcc1f92f88e51b64bc82&lat="+getLat+"&lon="+getLong;
        var uvResponse = await $.ajax({
            url: uvURL,
            method: "GET"
        })

        // Get UV info and assign class based on value
        var getUVIndex = uvResponse.value;
        var uvNum = $("<span>");
        if (getUVIndex > 0 && getUVIndex <= 2.99){
            uvNum.addClass("p-2 bg-primary low");
        }else if(getUVIndex >= 3 && getUVIndex <= 5.99){
            uvNum.addClass("p-2 bg-success moderate");
        }else if(getUVIndex >= 6 && getUVIndex <= 7.99){
            uvNum.addClass("p-2 bg-warning high");
        }else if(getUVIndex >= 8 && getUVIndex <= 10.99){
            uvNum.addClass("p-2 bg-danger very-high");
        }else{
            uvNum.addClass("bg-danger extreme");
        } 
        uvNum.text(getUVIndex);
        var uvIndexEl = $("<p class='card-text'>").text("UV Index: ");
        uvNum.appendTo(uvIndexEl);
        currentWeatherDiv.append(uvIndexEl);
        $("#selectedCityWeather").html(currentWeatherDiv);
}

// Function calls 5 day forecast and adds to #selectedCityWeatherForcast
async function displayFiveDayWeather() {

    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q="+cityname+"&units=imperial&appid=3ef6c5fde4febcc1f92f88e51b64bc82";

    var response = await $.ajax({
        url: queryURL,
        method: "GET"
      })
      var forecastDiv = $("<div  id='fiveDayForecast'>");
      var forecastHeader = $("<h3 class='card-title'>").text("5 Day Forecast");
      forecastDiv.append(forecastHeader);
      var cardDeck = $("<div  class='card-deck'>");
      forecastDiv.append(cardDeck);
      

      for (i=0; i<5;i++){
          var forecastCard = $("<div class='bg-info card mb-3 mt-3'>");
          var cardBody = $("<div class='card-body'>");
          var date = new Date();
          var val=(date.getMonth()+1)+"/"+(date.getDate()+i+1)+"/"+date.getFullYear();
          var forecastDate = $("<h5 class='card-title'>").text(val);
          
          cardBody.append(forecastDate);

          var getCurrentWeatherIcon = response.list[i].weather[0].icon;
          var CurrentWeatherIcon = $("<img src = http://openweathermap.org/img/wn/" + getCurrentWeatherIcon + ".png />");
          
          cardBody.append(CurrentWeatherIcon);
          
          var getTemp = response.list[i].main.temp;
          var tempEl = $("<p class='card-text'>").text("Temp: "+getTemp+"° F");
          
          cardBody.append(tempEl);

          var getHumidity = response.list[i].main.humidity;
          var humidityEl = $("<p class='card-text'>").text("Humidity: "+getHumidity+"%");
          
          cardBody.append(humidityEl);
          forecastCard.append(cardBody);
          cardDeck.append(forecastCard);
      }
      $("#selectedCityWeatherForcast").html(forecastDiv);
    }

// This function is used to pass the city in the history list to the displayCurrentWeather function
function searchedWeather(){
    cityname = $(this).attr("data-name");
    displayCurrentWeather();
    displayFiveDayWeather();
    
}

$(document).on("click", ".city", searchedWeather);