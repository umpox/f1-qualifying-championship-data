var leaderboard = [];

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

    for (time in results.QualifyingResults) {
        //Find fastest driver time
        if (results.QualifyingResults[time].Q3 !== undefined) {
            driverTime = formatTiming(results.QualifyingResults[time].Q3);
        }
        else if (results.QualifyingResults[time].Q2 !== undefined) {
            driverTime = formatTiming(results.QualifyingResults[time].Q2);
        }
        else if (results.QualifyingResults[time].Q1 !== undefined) {
            driverTime = formatTiming(results.QualifyingResults[time].Q1);
        }

        driverName = results.QualifyingResults[time].Driver.code;

        if (leaderboard[driverName] !== undefined) {
            driverTime = (leaderboard[driverName].totalTime + driverTime);
        }

        leaderboard[driverName] = {
            totalTime : driverTime
        };
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

getQualifyingData(1);
getQualifyingData(2);
getQualifyingData(3);
getQualifyingData(4);


