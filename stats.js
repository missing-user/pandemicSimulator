var ctx = document.getElementById('chart').getContext('2d');
var chart = new Chart(ctx, {
  // The type of chart we want to create
  type: 'line',

  // The data for our dataset
  data: {
    labels: [1],
    datasets: [{
      label: 'new infections',
      data: 1
    }, {
      label: 'current infections',
      data: 1
    }, ]
  },

  // Configuration options go here
  options: {
    animation: false
  }
});

var imuneStats = []
var qurantineStats = []
var deaths = []
var infections = []
var dayLabels = [1]

function addPoints(newi, dead, quarantined, imune, day) {
  infections.push(newi)
  deaths.push(dead)
  qurantineStats.push(quarantined)
  imuneStats.push(imune)
  dayLabels.push(day)

  updateData()
}

function resetStats(){
  imuneStats = []
  qurantineStats = []
  deaths = []
  infections = []
  dayLabels = [1]
}

function updateData() {
  chart.data = {
    labels: dayLabels,
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
