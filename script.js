var canvas = document.getElementById("canvas")
var qcanvas = document.getElementById("qcanvas")
var dayCounter = document.getElementById("dayCounter")

var actors = []
var agentCount = 1500
var infectionRate = 0.1
var deathRate = 0.01
var healingTime = 40
var infectionRadius = 30
var resistanceDuration = 10
var socialDistancing = 5 //TODO how????
var quarantineDelay = 20

var totalTime = 0
var fatalities = []
var quarantine = []

function updateAgents(input) {
  agentCount = input
  startSimulation()
}

function updateDeath(input) {
  deathRate = input
}

function updateInfection(input) {
  infectionRate = input
}

function updateDistancing(input) {
  socialDistancing = (1 - input) * 5
}

function updateRadius(input) {
  infectionRadius = input
}

function updateRecovery(input) {
  healingTime = input
}

function updateResistance(input) {
  resistanceDuration = input
}

function updateQuarantine(input) {
  quarantineDelay = input
}

function startSimulation() {
  totalTime = 0
  actors = []
  fatalities = []
  quarantine = []
  for (var i = 0; i < agentCount; i++) {
    actors.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      resistanceTimer: 0,
      infectionTimer: 0,
      vx: Math.random() - 0.5,
      vy: Math.random() - 0.5,
      dead: false
    })
  }
  actors[0].infectionTimer = 1
}

function updateSimulation(steps) {
  var newInfections = 0

  for (var i = 0; i < actors.length; i++) {
    var a = actors[i]
    //move everyone around
    a.x += a.vx * steps * socialDistancing
    a.y += a.vy * steps * socialDistancing
    a.y = (a.y + canvas.height) % canvas.height
    a.x = (a.x + canvas.width) % canvas.width

    //infect everyone
    if (a.infectionTimer > 0) {
      for (var j = 0; j < actors.length; j++) {
        var t = actors[j]
        if (Math.abs(t.x - a.x) < infectionRadius)
          if (Math.abs(t.y - a.y) < infectionRadius)
            if (t.infectionTimer == 0 && t.resistanceTimer == 0)
              if (Math.random() < infectionRate) {
                t.infectionTimer = 1
                newInfections++
              }

      }

      if (a.infectionTimer > quarantineDelay)
        quarantine.push(a)

      a.infectionTimer++

      if (a.infectionTimer > healingTime) {
        if (Math.random() < deathRate) {
          a.dead = true
          a.infectionTimer = 0
          fatalities.push(a)
        } else {
          a.infectionTimer = 0
          a.resistanceTimer = 1
        }
      }
    }

    //immunity
    if (a.resistanceTimer > 0) {
      a.resistanceTimer++
      if (a.resistanceTimer >= resistanceDuration)
        a.resistanceTimer = 0
    }
  }
  actors = actors.filter((el) => !fatalities.includes(el) && !quarantine.includes(el));

  for (var patient of quarantine) {
    patient.infectionTimer++

    if (patient.infectionTimer > healingTime) {
      if (Math.random() < deathRate) {
        patient.dead = true
        patient.infectionTimer = 0
        fatalities.push(a)
      } else {
        patient.infectionTimer = 0
        patient.resistanceTimer = 1
        actors.push(patient)
      }
    }
  }
  quarantine = quarantine.filter((el) => el.infectionTimer != 0);

  totalTime += steps

  if ((totalTime % 20)==0)
    addPoints(newInfections, fatalities.length, quarantine.length, actors.filter((el) => el.resistanceTimer > 0).length, totalTime)
}

function animate() {
  requestAnimationFrame(animate)
  updateSimulation(1)

  draw(canvas.getContext("2d"))
  qdraw(qcanvas.getContext("2d"))

  dayCounter.textContent = "day: " + totalTime
}

function draw(ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = "black"
  for (var i = 0; i < fatalities.length; i++) {
    ctx.fillRect(fatalities[i].x - 5, fatalities[i].y - 5, 10, 10);
  }

  ctx.beginPath()
  ctx.lineWidth = "1"
  ctx.strokeStyle = "red"
  for (var i = 0; i < actors.length; i++) {
    //"hsl("+actors[i].infectionTimer*360/healingTime+",100%,50%)"
    ctx.fillStyle = "green"
    if (actors[i].infectionTimer > 0) {
      //ctx.fillStyle = "hsl(0,100%," + (50 - (actors[i].infectionTimer * 25.0 / healingTime)) + "%)"
      ctx.fillStyle = "hsl(" + actors[i].infectionTimer * 120 / healingTime + ",100%,50%)"
      ctx.rect(actors[i].x - (infectionRadius / 2), actors[i].y - (infectionRadius / 2), infectionRadius, infectionRadius)
    }
    if (actors[i].resistanceTimer > 0)
      ctx.fillStyle = "hsl(120,100%," + (50 - (actors[i].resistanceTimer * 25.0 / resistanceDuration)) + "%)"

    ctx.fillRect(actors[i].x - 5, actors[i].y - 5, 10, 10);
  }
  ctx.stroke()
}

function qdraw(ctx) {
  ctx.clearRect(0, 0, qcanvas.width, qcanvas.height)

  for (var i = 0; i < quarantine.length; i++) {
    ctx.fillStyle = "hsl(" + quarantine[i].infectionTimer * 120 / healingTime + ",100%,50%)"
    ctx.fillRect((i * 11) % qcanvas.width, Math.floor((i * 11) / qcanvas.width) * 11, 10, 10);
  }
}

startSimulation()
animate()
