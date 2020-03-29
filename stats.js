var ctx = document.getElementById('chart').getContext('2d');
var chart = new Chart(ctx, {
  // The type of chart we want to create
  type: 'line',

  // The data for our dataset
  data: {
    labels: _.range(1),
    datasets: [{
      label: 'new infections',
      data: 1
    }, {
      label: 'current infections',
      data: 1
    }, ]
  },

  // Configuration options go here
  options: {}
});

var imuneStats = []
var qurantineStats = []
var deaths = []
var infections = []

function addPoints(newi, dead, quarantined, imune) {
  infections.push(newi)
  deaths.push(dead)
  qurantineStats.push(quarantined)
  imuneStats.push(imune)

  updateData()
}

function updateData() {
  chart.data = {
    labels: _.range(infections.length),
    datasets: [{
      label: 'new infections',
      data: infections,
			borderColor: "red"
    }, {
      label: 'death count',
      data: deaths,
			borderColor: "black"
    }, {
      label: 'in quarantine',
      data: qurantineStats,
			borderColor: "yellow"
    }, {
      label: 'imune',
      data: imuneStats,
			borderColor: "rgb(0,255,0)"
    }, ]
  }

  chart.update();
}
