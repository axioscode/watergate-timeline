
// var setupVisualsGoogleAnalytics = require('./analytics.js').setupVisualsGoogleAnalytics;
// var trackEvent = require('./analytics.js').trackEvent;

const d3 = require("d3");
const analytics = require('./analytics.js')
const pym = require('pym.js');

let pymChild = null;

analytics.setupVisualsGoogleAnalytics();

import makeTimeline from "./timelines";
import makeTimer from "./timer";
import nixonData from "../data/nixon.json";
import trumpData from "../data/trump.json";

import watergateData from "../data/watergate-timeline.json";

document.addEventListener("DOMContentLoaded", main());

function main() {
    var pymChild = new pym.Child();

    var nixonTimeline = new makeTimeline({
        element: document.querySelector(`.nixon .chart`),
        data: nixonData,
        axisPos: "bottom",
        startDate: "1972-06-17",
        term: 800, //days,
        onReady: function() {
            //console.log(this.daysLookup);
        }
    });

    var trumpTimeline = new makeTimeline({
        element: document.querySelector(`.trump .chart`),
        data: trumpData,
        axisPos: "top",
        startDate: "2016-06-14",
        term: 800, //days,
        onReady: function() {
            //console.log(this.daysLookup);
        }
    });

    d3.select(window).on("resize", d => {
        nixonTimeline.update();
        trumpTimeline.update();
        updateTimelines();
        setListeners();
        nixonTimeline.updateScrubber(dayCount);
        trumpTimeline.updateScrubber(dayCount);
    });



    // var writeAllDays = Object.keys(Object.assign(nixonTimeline.daysLookup, trumpTimeline.daysLookup));
    // console.log(writeAllDays);

    const allDays = ["0", "109", "136", "147", "194", "227", "229", "244", "245", "294", "329", "332", "335", "337", "342", "359", "391", "490", "767", "770", "782"];
    let index = 0;
    let dayCount = 0;

    var timer = new makeTimer({
        speed: 70,
        onUpdate: function() {
            dayCount++;

            if (dayCount > +allDays[allDays.length - 1]) {
                dayCount = 0;
            }

            nixonTimeline.updateScrubber(dayCount);
            trumpTimeline.updateScrubber(dayCount);

            setActiveDates(dayCount);
        }
    });


    var updateTimelines = function() {

        if (index >= allDays.length) {
            index = 0;
        } else if (index < 0) {
            index = allDays.length - 1;
        }

        let days = allDays[index]

        if (trumpTimeline.daysLookup[days] || nixonTimeline.daysLookup[days]) {

            let nixonText = nixonTimeline.daysLookup[days] ? nixonTimeline.daysLookup[days] : null;
            let trumpText = trumpTimeline.daysLookup[days] ? trumpTimeline.daysLookup[days] : null;

            if (allDays.indexOf(String(dayCount)) > -1) {
                if (timer.isPlaying) {
                    pauseTimer();
                    setTimeout(function() {
                        startTimer();
                    }, 1000);
                }
            }

            nixonTimeline.updateTextBox(nixonText);
            trumpTimeline.updateTextBox(trumpText);

        }
    }

    updateTimelines();
    timer.start();


    function dragstarted(d) {
        //console.log("dragstarted");
        pauseTimer();
        //timer.pause();
        //d3.select(this).raise().classed("active", true);
    }

    function dragged(d) {

        let xPos = d3.event.x < 0 ? 0 : d3.event.x;
        let yPos = d3.event.y < 0 ? 0 : d3.event.y;

        if (yPos > nixonTimeline.height) {
            yPos = nixonTimeline.height;
        }

        xPos = xPos > nixonTimeline.width ? nixonTimeline.width : xPos;

        let dateVal = nixonTimeline.mobile ? nixonTimeline.xScale.invert(yPos) : nixonTimeline.xScale.invert(xPos);
        dayCount = nixonTimeline.daydiff(nixonTimeline.startDateObj, dateVal);

        setActiveDates(dayCount);

    }




    function setActiveDates(days) {
        nixonTimeline.updateScrubber(days);
        trumpTimeline.updateScrubber(days);

        let textDay = closestVal(days, allDays);

        if (allDays.indexOf(String(textDay)) > -1) {
            index = allDays.indexOf(String(textDay));
            updateTimelines();
        }
    }



    function dragended(d) {
        analytics.trackEvent('drag-handle','single');
    }



    function closestVal(num, arr) {

        if (arr.indexOf(String(num)) > -1) {
            return num;
        }

        var mid;
        var lo = 0;
        var hi = +arr[arr.length - 1];
        while (hi - lo > 1) {
            mid = Math.floor((lo + hi) / 2);
            if (arr[mid] < num) {
                lo = mid;
            } else {
                hi = mid;
            }
        }

        return arr[lo];

        // if (num - arr[lo] <= arr[hi] - num) {
        //     return arr[lo];
        // }
        // return arr[hi];
    }



    function pauseTimer() {
        timer.pause();
        d3.select(".ac-pause").classed("active", false);
        d3.select(".ac-start").classed("active", true);
        analytics.trackEvent('pauseButton','single');
    }

    function startTimer() {
        timer.start();
        d3.select(".ac-start").classed("active", false);
        d3.select(".ac-pause").classed("active", true);
        analytics.trackEvent('startButton','single');
    }




    /* ===================================== */
    /* ============== BUTTONS ============== */


    function setListeners() {


        trumpTimeline.plot.selectAll(".dot")
            .on("click", d => {
                index = allDays.indexOf(String(d.days));
                timer.pause();
                pauseTimer();
                setActiveDates(+d.days)
                    //updateTimelines();
                analytics.trackEvent('trumpDotClick',d.date);
            });

        nixonTimeline.plot.selectAll(".dot")
            .on("click", d => {
                index = allDays.indexOf(String(d.days));
                timer.pause();
                pauseTimer();
                setActiveDates(+d.days)
                analytics.trackEvent('nixonDotClick',d.date);
            });

        nixonTimeline.scrubber.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        trumpTimeline.scrubber.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        d3.select(".ac-start").on("click", function() {
            startTimer();
        });

        d3.select(".ac-pause").on("click", function() {
            pauseTimer();
        });

        d3.selectAll(".ac-next").on("click", d => {
            goToNext();
        });

        d3.selectAll(".ac-prev").on("click", d => {
            goToPrev();
        });


        document.onkeydown = checkKey;

        function checkKey(e) {
            var event = window.event ? window.event : e;

            if (event.keyCode === 39 || event.keyCode === 40) {
                goToNext(); //Next
            } else if (event.keyCode === 37 || event.keyCode === 38) {
                goToPrev(); //Prev
            }
        }


        function goToNext() {
            analytics.trackEvent('nextButton','single');
            pauseTimer();
            index++;

            if (index > allDays.length - 1) {
                index = 0;
            }

            dayCount = +allDays[index];
            setActiveDates(dayCount);
        }

        function goToPrev() {
            analytics.trackEvent('prevButton','single');
            pauseTimer();
            index--;

            if (index < 0) {
                index = 0;
            }

            dayCount = +allDays[index];
            setActiveDates(dayCount);
        }



    }

    setListeners();

}

// d3.select(".btn.pause").on("click", d => {
//     timer.pause();
// });



/* ===================================== */