let d3 = require("d3");

class makeTimeline {

    constructor(opts) {
        this.element = opts.element;
        this.data = opts.data;
        this.startDate = opts.startDate;
        this.term = opts.term;
        this.axisPos = opts.axisPos ? opts.axisPos : "bottom";
        this.onReady = opts.onReady;
        this.scrubberWidth = 60;


        this._setSvg();
        this._setData();
        this.update();

    }


    _setSvg() {
        this.icons = {
            "data-breach": `M4.8,3.4L3.3,2.1C2.2,3.3,1.6,4.9,1.6,6.6h2C3.6,5.4,4,4.3,4.8,3.4z M14.4,9V6.6C14.4,2.9,11.5,0,8,0 C7.5,0,7.1,0,6.7,0.1l0.4,2C7.4,2,7.7,2,8,2c2.4,0,4.4,2,4.4,4.6V9H1v7h14V9H14.4z M8,14c-0.8,0-1.5-0.7-1.5-1.5S7.2,11,8,11 s1.5,0.7,1.5,1.5S8.8,14,8,14z`,
            "elected": `M16,4V2H8V0H0v8h8h8V6H8V4H16z M5.9,6.8L4.1,5.5L2.2,6.8l0.7-2.1L1.1,3.3h2.2L4,1.2l0.7,2.1H7L5.2,4.7L5.9,6.8z M0,10h16v2H0V10z M0,14h16v2H0V14z`,
            "investigator-fired": `M1,15h14V5H1V15z M3.5,7.7C3.5,7.3,3.8,7,4.2,7h7.7c0.4,0,0.7,0.3,0.7,0.7v0.7c0,0.4-0.3,0.7-0.7,0.7H4.2 C3.8,9,3.5,8.7,3.5,8.3V7.7z M0,1h16v3H0V1z`,
            "investigator-named": `M15.7,14.3l-4.2-4.2c0.8-1.1,1.2-2.3,1.2-3.7C12.8,2.9,9.9,0,6.4,0C2.9,0,0,2.9,0,6.4c0,3.5,2.9,6.4,6.4,6.4 c1.4,0,2.7-0.5,3.7-1.2l4.2,4.2c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3C16.1,15.3,16.1,14.7,15.7,14.3z M2,6.4C2,4,4,2,6.4,2 c2.4,0,4.4,2,4.4,4.4c0,1-0.3,1.9-0.9,2.6c-0.2,0-0.4,0.1-0.6,0.3S9.1,9.6,9,9.9c-0.7,0.6-1.6,0.9-2.6,0.9C4,10.8,2,8.8,2,6.4z`,
            "senate-hearing": `M16.3,1.7l-0.5-1.9l-16,4.4l0.5,1.9l1.8-0.5C1.3,7.1,0,9.6,0,10c0,0.5,1.2,0.9,2.7,0.9c1.5,0,2.7-0.4,2.7-0.9 c0-0.4-1.5-3.2-2.3-4.7l3.8-1V14H3v2h10v-2H9V3.7l3.5-1c-0.8,1.5-2,3.9-2,4.2c0,0.5,1.2,0.9,2.7,0.9c1.5,0,2.7-0.4,2.7-0.9 c0-0.4-1.4-3.1-2.2-4.6L16.3,1.7z`,
            "tapes": `M11.6,4.6c0.8,0,1.5,0.7,1.5,1.5s-0.7,1.5-1.5,1.5s-1.5-0.7-1.5-1.5S10.8,4.6,11.6,4.6z M4.7,4.6 c0.8,0,1.5,0.7,1.5,1.5S5.5,7.6,4.7,7.6S3.2,6.9,3.2,6.1S3.9,4.6,4.7,4.6z M14.6,1.3H1.3C0.6,1.3,0,1.9,0,2.7v9 C0,12.4,0.6,13,1.3,13h13.3c0.7,0,1.3-0.6,1.3-1.3v-9C16,1.9,15.4,1.3,14.6,1.3z M14.6,11.7h-2.3l-1.7-2.1H5.3l-1.7,2.1H1.3v-9h13.3 V11.7z`,
            "lead-to-investigation": `M15.77,8.22V7.78a29.47,29.47,0,0,1-3.08-1.43l-.27-.17c0-.1,0-.19.07-.3a30.25,30.25,0,0,1,1.17-3.22l-.31-.31a31.52,31.52,0,0,1-3.23,1.16l-.29.07c-.05-.09-.1-.16-.16-.25A30.26,30.26,0,0,1,8.22.23H7.79A31.53,31.53,0,0,1,6.33,3.33c-.05.1-.11.17-.16.26l-.31-.07A29.45,29.45,0,0,1,2.66,2.35l-.31.31A29.84,29.84,0,0,1,3.51,5.84c0,.12,0,.22.08.34l-.28.17A29.47,29.47,0,0,1,.23,7.78v.43A29.84,29.84,0,0,1,3.3,9.65l.28.18c0,.1,0,.19-.07.29a31.54,31.54,0,0,1-1.16,3.23l.31.31a30.26,30.26,0,0,1,3.22-1.17l.29-.07.16.25a31.53,31.53,0,0,1,1.46,3.11h.43a30.26,30.26,0,0,1,1.45-3.11c.05-.09.1-.16.16-.25l.33.08a30.24,30.24,0,0,1,3.17,1.15l.31-.31a29.47,29.47,0,0,1-1.17-3.19c0-.11,0-.21-.07-.31l.3-.19A30.23,30.23,0,0,1,15.77,8.22Z`,
            "investigation-event": `M2.79,8,8.21.31,13.64,8,8.21,15.66Z`
        }
    }




    _setData() {

        this.daysLookup = {};

        this.data = this.data.filter(d => {
            return d.include === "TRUE" ? true : false;
        });

        let startDateObj = this.startDate.split("-");
        let startDate = new Date(+startDateObj[0], (+startDateObj[1]) - 1, +startDateObj[2]);
        this.startDateObj = startDate;

        this.data.forEach(d => {
            let dateObj = d.date.split("-");
            let thisDate = new Date(+dateObj[0], (+dateObj[1]) - 1, +dateObj[2]);

            d.dateVal = thisDate;
            d.days = this.daydiff(startDate, thisDate);

            this.daysLookup[d.days] = d;

        });

    }

    _setDimensions() {
        // define width, height and margin

        this.mobile = window.innerWidth <= 375 ? true : false;

        this.margin = {
            top: this.mobile ? 15 : 0,
            right: this.mobile ? 0 : 15,
            bottom: this.mobile ? 15 : 0,
            left: this.mobile ? 0 : 15
        };

        this.width = this.element.offsetWidth - this.margin.left - this.margin.right;
        this.height = this.element.offsetHeight - this.margin.top - this.margin.bottom; //Determine desired height here


    }


    daydiff(first, second) {

        //console.log(first, second);

        var oneDay = 24 * 60 * 60 * 1000;
        var diffDays = Math.round(Math.abs((first.getTime() - second.getTime()) / (oneDay)));
        return diffDays;
    }



    update() {
        this._setDimensions();
        this._setScales();
        this.draw();
        this.onReady();
    }





    _setScales() {

        this.parseTime = d3.timeParse("%Y-%m-%d");

        let startDate = this.parseTime(this.startDate);
        this.endDate = addDays(startDate, this.term)

        this.scrubberDate = startDate;

        let rangeMax = this.mobile ? this.height : this.width;

        this.xScale = d3.scaleTime()
            .rangeRound([0, rangeMax])
            .domain([startDate, this.endDate]);

        if (this.mobile) {
            this.xAxis = this.axisPos === "bottom" ? d3.axisRight(this.xScale) : d3.axisLeft(this.xScale);
        } else {
            this.xAxis = this.axisPos === "bottom" ? d3.axisBottom(this.xScale) : d3.axisTop(this.xScale);
        }

        var yearFormat = this.mobile ? d3.timeFormat("%y") : d3.timeFormat("%Y");

        this.xAxis.tickFormat(d => {
                return this.mobile ? `'${yearFormat(d)}` : yearFormat(d);
            })
            .tickArguments([d3.timeYear.every(1)])
            .tickSizeInner(10)
            .tickSizeOuter(0);

        this.yPos = this.axisPos === "top" ? this.height / 3 : this.height - (this.height / 3);

    }

    draw() {


        this.element.innerHTML = "";

        d3.select(this.element).classed("timeline", true)
            .classed("is-mobile", this.mobile);

        this.textBox = d3.select(this.element).append('div').classed("text-box", true);

        this.dayCount = d3.select(this.element)
            .append('div')
            .classed("day-count", true)
            .style("width", `${this.scrubberWidth}px`);

        this.svg = d3.select(this.element).append('svg');

        //Set svg dimensions
        this.svg.attr('width', this.width + this.margin.left + this.margin.right);
        this.svg.attr('height', this.height + this.margin.top + this.margin.bottom);


        // create the chart group.
        this.plot = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
            .attr("class", "chart-g");

        this.plot.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", d => {
                return this.mobile ? `translate(${this.width / 2},0)` : `translate(0,${this.yPos})`;
            })
            .call(this.xAxis);

        this.scrubber = this.plot.append("g")
            .attr("class", "scrubber")
            .attr("transform", d => {
                if (this.mobile) {
                    return this.axisPos === "top" ? `translate(0,0)` : `translate(${this.width/2},0)`;
                } else {
                    return this.axisPos === "top" ? `translate(0,0)` : `translate(0,${this.yPos})`;
                }
            }).moveToBack();

        this.scrubber.append("rect")
            .classed("is-mobile", this.mobile)
            .classed("draggable", true)
            .attr("width", d => {
                return this.mobile ? this.width / 2 : this.scrubberWidth;
            })
            .attr("height", d => {
                return this.mobile ? this.scrubberWidth : this.yPos;
            });

        this.scrubber.append("line")
            .attr("x1", d => {
                return this.mobile ? 0 : this.scrubberWidth / 2;
            })
            .attr("y1", d => {
                return this.mobile ? this.scrubberWidth / 2 : 0;
            })
            .attr("x2", d => {
                return this.mobile ? this.width / 2 : this.scrubberWidth / 2;
            })
            .attr("y2", d => {
                return this.mobile ? this.scrubberWidth / 2 : this.yPos;
            })
            .style("stroke-width", 1)

        // this.scrubber.append("rect")
        //     .classed("drag-handle", true)
        //     .attr("width", d => {
        //         return this.mobile ? this.width / 2 : (this.scrubberWidth/3);
        //     })
        //     .attr("height", d => {
        //         return this.mobile ? (this.scrubberWidth/3) : this.yPos;
        //     })
        //     .attr("y", d=> {
        //         return this.mobile ? (this.scrubberWidth/3) : 0;
        //     })
        //     .attr("x", d=> {
        //         return this.mobile ? 0 : (this.scrubberWidth/3);
        //     });


        this.drawDots();

    }

    drawDots() {

        let dots = this.plot.selectAll(".dot")
            .data(this.data)
            .enter().append("g")
            .attr("class", "dot")
            .attr("days", d => {
                return d.days;
            })
            .attr("transform", d => {
                let xPos = this.mobile ? this.width / 2 : this.xScale(this.parseTime(d.date));
                let yPos = this.mobile ? this.xScale(this.parseTime(d.date)) : this.yPos;
                return "translate(" + (xPos) + "," + (yPos) + ")";
            });

        dots.filter((d, i) => {
                //let nm = d.category.replace("_", "-");
                let nm = d.new_category.replace(/_/g, "-");

                //console.log(nm, this.icons[nm]);

                return !this.icons[nm];
            }).append("circle")
            .attr("class", "dot")
            .attr("r", 5);

        let icons = dots.filter(d => {
                //let nm = d.category.replace("_", "-");
                let nm = d.new_category.replace(/_/g, "-");
                return this.icons[nm];
            })
            .append("g")
            .attr("transform", "translate(-7, -7)")

        // icons.append("rect")
        //     .attr("width", 16)
        //     .attr("height", 16)
        //     .attr("fill", "#fff");

        icons.append("path")
            .attr("d", d => {
                //let nm = d.category.replace("_", "-");
                let nm = d.new_category.replace(/_/g, "-");
                return this.icons[nm];
            })





    }



    updateScrubber(val) {

        this.scrubberDate = addDays(this.startDateObj, +val);

        this.scrubber.attr("transform", d => {
            let pos = this.xScale(this.scrubberDate) - this.scrubberWidth / 2;

            if (this.mobile) {
                return this.axisPos === "top" ? `translate(0,${pos})` : `translate(${this.width/2},${pos})`;
            } else {
                return this.axisPos === "top" ? `translate(${pos}, 0)` : `translate(${pos},${this.yPos})`;
            }

        });

        //Update day count
        let dayPos = this.xScale(this.scrubberDate) + this.margin.left - (this.scrubberWidth / 2);
        let dayText = val == "0" ? `Day 0` : `${numberWithCommas(val)} days`;

        this.dayCount.style("left", d => {
                return this.mobile ? `-${this.scrubberWidth/2}px` : `${dayPos}px`;
            })
            .style("top", d => {
                return this.mobile ? `${dayPos + this.margin.top + 20}px` : -10;
            });

        this.dayCount.html(dayText);


    }


    updateTextBox(obj) {

        if (!obj) {

            this.textBox.classed("active", true);

            this.textBox.style("opacity", 0)
                //.classed("active", false);

            this.plot.selectAll(".dot").classed("active", false);
            return false;
        }

        this.plot.selectAll(".dot").classed("active", false);
        this.plot.selectAll(`.dot[days='${obj.days}']`).classed("active", true).moveToFront();

        this.textBox.classed("active", true)
            .style("left", d => {

                let pos = this.xScale(obj.dateVal);
                var ttw = +this.textBox.style("width").split("px")[0];

                if (this.mobile) {
                    return this.axisPos === "top" ? `${(this.width/2 + 10)}px` : "auto";
                } else {
                    return pos + ttw > this.width ? "auto" : `${pos}px`;
                }

            })
            .style("right", d => {
                if (this.mobile) {
                    return this.axisPos === "top" ? "auto" : `${(this.width/2 + 10)}px`;
                } else {
                    let pos = this.xScale(obj.dateVal);
                    var ttw = +this.textBox.style("width").split("px")[0];
                    return pos + ttw > this.width ? 0 : "auto";
                }
            })
            .style("top", d => {
                if (this.mobile) {
                    let pos = this.xScale(obj.dateVal);
                    var tth = +this.textBox.style("height").split("px")[0];
                    return pos + tth > this.height ? `${this.height-tth}px` : `${pos}px`;
                } else {
                    return this.axisPos === "top" ? `${(this.yPos) + 10 }px` : "auto";
                }
            })
            .style("bottom", d => {
                if (this.mobile) {
                    return "auto";
                } else {
                    return this.axisPos === "top" ? "auto" : `${(this.height - this.yPos) + 10 }px`;
                }
            })
            .html(
                `<h2>${obj.displayDate}</h2>
                <p>${obj.title}</p>`
            );

        this.textBox.style("opacity", 1)
            //.classed("active", true);


        if (this.mobile) {
            this.textBox.style("width", `${this.width + 20}px`);
        }



    }




}




function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function numberWithCommas(val) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


/* HELPER FUNCTIONS */
//Move to front and back controls z-index of features on mouseover and mouseout.
d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};

d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        const firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};





export default makeTimeline;