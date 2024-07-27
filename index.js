const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorTab = document.querySelector(".error-no-city");

//Initial setup of variables and states
let currentTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
currentTab.classList.add("current-tab");
getfromSessionStorage();


userTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(userTab);
    
});

searchTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(searchTab);
    
});

function switchTab(newTab) {
    errorTab.classList.remove("active");
    if (newTab != currentTab) {
        //switch active tabs
        currentTab.classList.remove("current-tab");
        currentTab = newTab;
        currentTab.classList.add("current-tab");

        // If search weather is clicked
        if (!searchForm.classList.contains("active")) {
            //if form container is invisible, if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        //if your weather is clicked
        else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // If your weather is clicked, check for your coordiantes and then call API to update latest values
            // So let's check local storage first for coordinates, if we haved saved them there.
            getfromSessionStorage();
        }
    }
}


//check if cordinates are already present in session storage and if not, then updating them to local storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        //if local coordinates aren't found
        grantAccessContainer.classList.add("active");
    } else {
        //if local coordinates are there, use them to fetch results
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}

//function to use API to fetch data regarding user's place
async function fetchUserWeatherInfo(coordinates) {
    const {
        lat,
        lon
    } = coordinates;
    // make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API CALL asyncronously
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (err) {
        loadingScreen.classList.remove("active");
        console.log("Getting error while fetching results :-", err);
        grantAccessContainer.classList.add("active");
        //HW
    }

}

//function to render the weather info on the app
function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    console.log(weatherInfo);

    //fetch values from weatherINfo object and put it UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;

    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;

    temp.innerText = `${weatherInfo?.main?.feels_like} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        //show an alert for no gelolocation support available
        alert("Sorry! No Geolocation is available")
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
    // object description in session storage => {""user-coordinates" : data}
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    //to prevent reloading of page
    e.preventDefault();
    errorTab.classList.remove("active");
    let cityName = searchInput.value;
    searchInput.value = "";

    // if no name is given as input
    if (cityName === "")
        return;
    else
        fetchSearchWeatherInfo(cityName);
})

//function to fetch details of the city provided as input from user
async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        loadingScreen.classList.remove("active");

        //if the city value is not defined, throw a error
        if (data?.cod == '404') {
            throw "404 City not found";
        } else {
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        }

    } catch (err) {
        console.log(err);
        console.log(errorTab);
        //if a inappropriate city name is provided, show 404 city not found and remove loading screen
        loadingScreen.classList.remove("active");
        errorTab.classList.add("active");
    }
}