var canvas = document.getElementById("canvas")
var qcanvas = document.getElementById("qcanvas")
var dayCounter = document.getElementById("dayCounter")
var statsCheck = document.getElementById("statsCheck")

var actors = []
var agentCount = 1500
var infectionRate = 0.1
var deathRate = 0.01
var infectionDuration = 40
var infectionRadius = 30
var resistanceDuration = 10
var socialDistancing = 5 //TODO how????
var quarantineDelay = 20
var distancingRadius = 20
var distancingStrength = 0

var totalTime = 0
var fatalities = []
var quarantine = []
var tickrate = 250
var activeTimeout
var myWorker

var myTree = new Quadtree({
  x: 0,
  y: 0,
  width: 769,
  height: 1000
});

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

  for (var a of actors) {
    a.width = infectionRadius
    a.height = infectionRadius
  }
}

function updateRecovery(input) {
  infectionDuration = input
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
      dead: false,
      width: infectionRadius,
      height: infectionRadius
    })
  }
  actors[0].infectionTimer = 1
  resetStats()
  clearTimeout(activeTimeout)
  activeTimeout = window.setTimeout(updateSimulation, tickrate, 1)
  console.log('sim started with timer: ', activeTimeout);

  if (window.Worker) {
    console.log('starting distancing thread');
    if (myWorker)
      myWorker.terminate();
    myWorker = new Worker('distancing.js');
    myWorker.postMessage({
      tree: myTree,
      actors: actors
    });

    myWorker.onmessage = function(e) {
      console.log('Message received from worker', e);
      if (e.data == actors)
        console.log("nothing happened");
    }
  }
}

function updateSimulation(steps) {
  var newInfections = 0
  healthy = actors.filter((el) => el.infectionTimer == 0 && el.resistanceTimer == 0);

  myTree.clear();

  //update myObjects and insert them into the tree again
  for (var i = 0; i < healthy.length; i = i + 1) {
    myTree.insert(healthy[i]);
  }

  //infect everyone
  infected = actors.filter((el) => el.infectionTimer > 0);
  if (healthy.length > 0)
    for (var infe of infected) {
      var candidates = myTree.retrieve(infe);
      for (var cand of candidates) {
        if (Math.abs(infe.x - cand.x) < infectionRadius)
          if (Math.abs(infe.y - cand.y) < infectionRadius)
            if (Math.random() < infectionRate) {
              cand.infectionTimer = 1
              newInfections++
            }
      }
    }

  for (var i = 0; i < actors.length; i++) {
    var a = actors[i]

    if (a.infectionTimer > 0) {
      a.infectionTimer++

      if (Math.random() < deathRate / infectionDuration) {
        a.dead = true
        a.infectionTimer = 0
        a.resistanceTimer = 0
        a.qDeath = false
        fatalities.push(a)
      }

      if (a.infectionTimer > quarantineDelay)
        quarantine.push(a)

      if (a.infectionTimer > infectionDuration) {
        a.infectionTimer = 0
        a.resistanceTimer = 1
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
    if (Math.random() < deathRate / infectionDuration) {
      patient.dead = true
      patient.infectionTimer = 0
      patient.qDeath = true
      fatalities.push(patient)
    }

    if (patient.infectionTimer > infectionDuration) {
      patient.infectionTimer = 0
      patient.resistanceTimer = 1
      actors.push(patient)
    }
  }
  quarantine = quarantine.filter((el) => el.infectionTimer != 0);

  totalTime += steps

  if ((totalTime % 5) == 0 && statsCheck.checked)
    addPoints(newInfections, infected.length, fatalities.length, quarantine.length, actors.filter((el) => el.resistanceTimer > 0).length, totalTime)
  activeTimeout = window.setTimeout(updateSimulation, tickrate, 1)
  if (healthy.length == actors.length)
    startSimulation()
}

function animate() {
  for (var i = 0; i < actors.length; i++) {
    var a = actors[i]
    //move everyone around
    a.x += a.vx * socialDistancing
    a.y += a.vy * socialDistancing
    a.y = (a.y + canvas.height) % canvas.height
    a.x = (a.x + canvas.width) % canvas.width
  }

  requestAnimationFrame(animate)

  draw(canvas.getContext("2d"))
  qdraw(qcanvas.getContext("2d"))

  dayCounter.textContent = "day: " + totalTime
}



function reportWindowSize() {
  canvas.getContext("2d").canvas.width = document.getElementById("cont").offsetWidth * 0.618;
  canvas.getContext("2d").canvas.height = document.getElementById("cont").offsetHeight;

  qcanvas.getContext("2d").canvas.width = document.getElementById("cont").offsetWidth * 0.382;
  qcanvas.getContext("2d").canvas.height = document.getElementById("cont").offsetHeight;

  myTree = new Quadtree({
    x: 0,
    y: 0,
    width: document.getElementById("cont").offsetWidth * 0.618,
    height: document.getElementById("cont").offsetHeight
  });
}

window.onresize = reportWindowSize;

function draw(ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = "black"
  for (var i = 0; i < fatalities.length; i++) {
    if (!fatalities[i].qDeath)
      ctx.fillRect(fatalities[i].x - 5, fatalities[i].y - 5, 10, 10);
  }

  ctx.beginPath()
  ctx.lineWidth = "1"
  ctx.strokeStyle = "red"
  for (var i = 0; i < actors.length; i++) {
    //"hsl("+actors[i].infectionTimer*360/infectionDuration+",100%,50%)"
    ctx.fillStyle = "green"
    if (actors[i].infectionTimer > 0) {
      //ctx.fillStyle = "hsl(0,100%," + (50 - (actors[i].infectionTimer * 25.0 / infectionDuration)) + "%)"
      ctx.fillStyle = "hsl(" + actors[i].infectionTimer * 120 / infectionDuration + ",100%,50%)"
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
    ctx.fillStyle = "hsl(" + quarantine[i].infectionTimer * 120 / infectionDuration + ",100%,50%)"
    ctx.fillRect(Math.floor(((i * 15) % qcanvas.width) / 15) * 15, Math.floor((i * 15) / qcanvas.width) * 15, 10, 10);
  }

  ctx.fillStyle = "black"
  qf = fatalities.filter((el) => el.qDeath);
  for (var i = 0; i < qf.length; i++) {
    ctx.fillRect(Math.floor(((i * 15) % qcanvas.width) / 15) * 15, qcanvas.height - (Math.floor((i * 15) / qcanvas.width) * 15), 10, 10);
  }
}

startSimulation()
animate()
