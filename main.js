var leaderboard = {};
var participation = {};
var teams = {};
var driver1Area = document.getElementsByClassName('driver1')[0];
var driver2Area = document.getElementsByClassName('driver2')[0];
var leaderboardComparison = document.getElementById('leaderboard');
var driverComparison = document.getElementById('driverComparison');

var getQualifyingData = function(raceNum) {

    //Display leaderboard
    leaderboardComparison.classList.remove('hidden');

    fetch(`http://ergast.com/api/f1/2017/0${raceNum}/qualifying.json`)
    .then((response) => response.json())
    .then(function(qualifyingData) {
        readQualifyingTimes(qualifyingData.MRData.RaceTable.Races[0], raceNum);
    });
};

var compareDriverTimes = function(raceNum, driv1, driv2) {
    //Display leaderboard
    driverComparison.classList.remove('hidden');

    driver1Area.innerHTML = driv1;
    driver2Area.innerHTML = driv2;
  
    fetch(`http://ergast.com/api/f1/2017/0${raceNum}/qualifying.json`)
    .then((response) => response.json())
    .then(function(qualifyingData) {
        getDriverTimes(qualifyingData.MRData.RaceTable.Races[0], raceNum, driv1, driv2);
    });
};

var getDriverTimes = function(results, raceNum, driv1, driv2) {
    var driverName;
    var driv1Time;
    var driv2Time;
    var differenceTime;
    var differenceStyle;
    var differenceType;
    var comparisonArea = document.getElementById('comparisonBody');
    var raceName = results.raceName;

    for (var time in results.QualifyingResults) {
        //Save driver name
        driverName = results.QualifyingResults[time].Driver.code;

        if (driverName == driv1) {
            driv1Time = (findFastestTime(time, results)).toFixed(3);
        }
        else if (driverName == driv2) {
            driv2Time = (findFastestTime(time, results)).toFixed(3);
        }
    }

    differenceTime = (driv2Time - driv1Time).toFixed(3);

    //Check if difference is negative
    if (differenceTime < 0) {
        differenceStyle = 'color: #01b729';
        differenceType = '';
    }
    else {
        differenceStyle = 'color: #D80027';    
        differenceType = '+';    
    }

    comparisonArea.innerHTML = comparisonArea.innerHTML + 
    `<tr>
        <th class="raceName">${raceName}</th>
        <th class="driver1">${driv1Time}</th>
        <th class="driver2">${driv2Time}</th>
        <th style="${differenceStyle}" class="difference">${differenceType}${differenceTime}</th>
    </tr>`;  
};

var readQualifyingTimes = function(results, raceNum) {
    var driverTime;
    var driverName;
    for (var time in results.QualifyingResults) {

        driverTime = findFastestTime(time, results);

        //Save driver name
        driverName = results.QualifyingResults[time].Driver.code;

        //If a driver has an existing qualifying time, add the latest time to it
        if (leaderboard[driverName] !== undefined) {
            driverTime = (leaderboard[driverName] + driverTime);
        }

        //Update the drivers qualifying time
        leaderboard[driverName] = driverTime;

        //Save the drivers participation for this session
        if (participation[driverName] === undefined) {
            participation[driverName] = 1;
        }
        else {
            participation[driverName]++;
        }

        //Save the drivers team
        if (teams[driverName] === undefined) {
            teams[driverName] = results.QualifyingResults[time].Constructor.name;
        }
    }

    //Remove GIO from leaderboards
    delete leaderboard['GIO'];
};

var findFastestTime = function(time, results) {
    driverTime = 0;

    //Find fastest driver time from Q1,Q2,Q3
    if (results.QualifyingResults[time].Q1 !== undefined) {
        driverTime = formatTiming(results.QualifyingResults[time].Q1);
    }
    if (formatTiming(results.QualifyingResults[time].Q2) < driverTime) {
        driverTime = formatTiming(results.QualifyingResults[time].Q2);        
    }
    if (formatTiming(results.QualifyingResults[time].Q3) < driverTime) {
        driverTime = formatTiming(results.QualifyingResults[time].Q3);        
    }

    return driverTime;
};

var formatTiming = function(time) {
    if (time === undefined) {
        return;
    }

    var minutes = Number(time.split(':')[0]);
    var seconds = Number(time.split(':')[1]);

    //Convert minutes to seconds
    minutes = minutes * 60;
    
    //Calculate total time
    time = (minutes + seconds);

    return time;
};

var calculateAverageTimes = function() {

    //Calculate average time from the number of races a driver has
    for (var time in leaderboard) {
        leaderboard[time] = leaderboard[time] / participation[time];
    }

    //Sort leaderboard based on average times
    displayLeaderboard(Object.keys(leaderboard).sort(function(a,b){return leaderboard[a]-leaderboard[b]}));
};

var displayLeaderboard = function(data) {
    var leaderboardArea = document.getElementById('leaderboardBody');

    for (var time in data) {
        leaderboardArea.innerHTML = leaderboardArea.innerHTML + 
        `<tr>
            <th class="position">${parseInt(time) + 1}</th>
            <th class="driver">${data[time]}</th>
            <th class="driver">${teams[data[time]]}</th>
            <th class="time">${(leaderboard[data[time]]).toFixed(3)}</th>
            <th class="status">
                <img style="width:25%" src="minus.svg">
                <span style="margin-left:10px">0</span>
            </th>
        </tr>`;
    }
};

var compareDrivers = function (races, driv1, driv2) {
    var i = 1;
    var executionProcess = setInterval(function(){
        compareDriverTimes(i, driv1, driv2);
        i++;
        if (counter === races) {
            clearInterval(executionProcess);
        }
    }, 500);
};

var qualifyingData = function(races) {
    for (var i=1; i < races; i++) {
        getQualifyingData(i);
    }

    setTimeout(calculateAverageTimes, 1000);        
};

//Area to call functions
//TODO::::: ADD % DIFFERENCE BETWEEN TIMES TO ACCOUNT FOR TRACK DIFFERENCES
compareDrivers(7, 'HAM', 'VET');

//qualifyingData(7);
