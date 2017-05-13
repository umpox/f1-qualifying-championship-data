var leaderboard = {};
var participation = {};
var teams = {};

var getQualifyingData = function(raceNum) {
    fetch(`http://ergast.com/api/f1/2017/0${raceNum}/qualifying.json`)
    .then((response) => response.json())
    .then(function(qualifyingData) {
        readQualifyingTimes(qualifyingData.MRData.RaceTable.Races[0], raceNum);
    });
};

var readQualifyingTimes = function(results, raceNum) {
    var driverTime;
    var driverName;
    for (var time in results.QualifyingResults) {

        //Find fastest driver time from Q1,Q2,Q3
        if (results.QualifyingResults[time].Q3 !== undefined) {
            driverTime = formatTiming(results.QualifyingResults[time].Q3);
        }
        else if (results.QualifyingResults[time].Q2 !== undefined) {
            driverTime = formatTiming(results.QualifyingResults[time].Q2);
        }
        else if (results.QualifyingResults[time].Q1 !== undefined) {
            driverTime = formatTiming(results.QualifyingResults[time].Q1);
        }
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
};

var formatTiming = function(time) {
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
            <th class="status"></th>
        </tr>`;
    }
};


getQualifyingData(1);
getQualifyingData(2);
getQualifyingData(3);
getQualifyingData(4);
getQualifyingData(5);

setTimeout(calculateAverageTimes, 1000);

