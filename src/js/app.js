const d3 = require("d3");

// var setupVisualsGoogleAnalytics = require('./analytics.js').setupVisualsGoogleAnalytics;
// var trackEvent = require('./analytics.js').trackEvent;

var pym = require('pym.js');

var pymChild = null;

import makeTimeline from "./timelines";
import makeTimer from "./timer";
import nixonData from "../data/nixon.json";
import trumpData from "../data/trump.json";

document.addEventListener("DOMContentLoaded", main());

function main() {
    var pymChild = new pym.Child();
}

var nixonTimeline = new makeTimeline({
    element: document.querySelector(`.nixon .chart`),
    data: nixonData,
    axisPos: "bottom",
    startDate: "1971-09-09",
    term: 1100, //days,
    onReady: function() {
        //console.log(this.daysLookup);
    }
});

var trumpTimeline = new makeTimeline({
    element: document.querySelector(`.trump .chart`),
    data: trumpData,
    axisPos: "top",
    startDate: "2016-06-14",
    term: 1100, //days,
    onReady: function() {
        //console.log(this.daysLookup);
    }
});

d3.select(window).on("resize", d => {
    nixonTimeline.update();
    trumpTimeline.update();
});



// var allDays = Object.keys(Object.assign(nixonTimeline.daysLookup, trumpTimeline.daysLookup));
// console.log(allDays);

var allDays = ["0", "109", "147", "229", "244", "245", "282", "294", "329", "330", "429", "509", "617", "624", "673", "772", "1049", "1052", "1064"];

var index = 0;

var timer = new makeTimer({
    speed: 3000,
    onUpdate: function() {
        updateTimelines(index);
        index++;
    }
});


var updateTimelines = function() {

	if (index >= allDays.length) {
		index = 0;
	} else if (index < 0) {
		index = allDays.length -1;
	}

    let days = allDays[index]

    nixonTimeline.updateScrubber(days);
    trumpTimeline.updateScrubber(days);

    if (trumpTimeline.daysLookup[days] || nixonTimeline.daysLookup[days]) {

        let nixonText = nixonTimeline.daysLookup[days] ? nixonTimeline.daysLookup[days] : null;
        let trumpText = trumpTimeline.daysLookup[days] ? trumpTimeline.daysLookup[days] : null;

        nixonTimeline.updateTextBox(nixonText);
        trumpTimeline.updateTextBox(trumpText);

    }
}

updateTimelines();
timer.start();

d3.select(".btn.play").on("click", d => {
    timer.start();
});

d3.select(".btn.pause").on("click", d => {
    timer.pause();
});

d3.select(".btn.next").on("click", d => {
	timer.pause();
	index++;
	updateTimelines();
});

d3.select(".btn.prev").on("click", d => {
	timer.pause();
	index--;
	updateTimelines();
});

trumpTimeline.plot.selectAll(".dot")
	.on("click", d=> {
		index = allDays.indexOf(String(d.days));
		timer.pause();
		updateTimelines();
	});

nixonTimeline.plot.selectAll(".dot")
	.on("click", d=> {
		index = allDays.indexOf(String(d.days));
		timer.pause();
		updateTimelines();
	});





