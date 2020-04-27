var ctx = document.getElementById("chart").getContext("2d");
var chart = new Chart(ctx, {
	// The type of chart we want to create
	type: "line",

	// The data for our dataset
	data: {
		labels: [1],
		datasets: [
			{
				label: "new infections",
				data: 1
			},
			{
				label: "current infections",
				data: 1
			}
		]
	},

	// Configuration options go here
	options: {
		animation: false
	}
});

var imuneStats = [];
var qurantineStats = [];
var deaths = [];
var infections = [];
var dayLabels = [1];

function addPoints(newi, total, dead, quarantined, imune, day) {
	infections.push(newi);
	deaths.push(dead);
	qurantineStats.push(quarantined);
	imuneStats.push(imune);
	dayLabels.push(day);
	tinfections.push(total + quarantined);
	if (infections.length > 100) {
		infections.splice(1);
		deaths.splice(1);
		qurantineStats.splice(1);
		imuneStats.splice(1);
		dayLabels.splice(1);
		tinfections.splice(1);
	}
	updateData();
}

function resetStats() {
	imuneStats = [];
	qurantineStats = [];
	deaths = [];
	infections = [];
	tinfections = [];
	dayLabels = [1];
}

function updateData() {
	chart.data = {
		labels: dayLabels,
		datasets: [
			{
				label: "new infections",
				data: infections,
				borderColor: "purple"
			},
			{
				label: "total infections",
				data: tinfections,
				borderColor: "red"
			},
			{
				label: "death count",
				data: deaths,
				borderColor: "black"
			},
			{
				label: "in quarantine",
				data: qurantineStats,
				borderColor: "yellow"
			},
			{
				label: "imune",
				data: imuneStats,
				borderColor: "rgb(0,255,0)"
			}
		]
	};

	chart.update();
}
