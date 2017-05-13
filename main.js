var leaderboard = {
    
};

var getQualifyingData = function(raceNum) {
    fetch(`http://ergast.com/api/f1/2017/0${raceNum}/qualifying.json`)
    .then((response) => response.json())
    .then(function(qualifyingData) {
        readQualifyingTimes(qualifyingData.MRData.RaceTable.Races[0], raceNum);
    })

}

var readQualifyingTimes = function(results, raceNum) {
    var driverTime;
    var driverName;

    for (time in results.QualifyingResults) {
        //Find fastest driver time
        driverTime = !undefined ? results.QualifyingResults[time].Q3 : undefined;
        driverTime = !undefined ? results.QualifyingResults[time].Q2 : undefined;
        driverTime = !undefined ? results.QualifyingResults[time].Q1 : undefined;

        driverName = results.QualifyingResults[time].Driver.code;

        leaderboard[driverName] = {
            [raceNum] : driverTime
        };
    }
}

var totalAllTimes = function() {
    leaderboard.total = {};
};

getQualifyingData(1);
getQualifyingData(2);


console.log(leaderboard);
