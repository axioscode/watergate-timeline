let d3 = require("d3");

class makeTimeline {

    constructor(opts) {
        this.element = opts.element;
        this.data = opts.data;
        this.startDate = opts.startDate;
        this.term = opts.term;
        this.axisPos = opts.axisPos ? opts.axisPos : "bottom";
        this.onReady = opts.onReady;


        this._setData();
        this.update();

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
            d.days = daydiff(startDate, thisDate);

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

        this.xAxis.tickFormat(d3.timeFormat("%Y"))
            .tickArguments([d3.timeYear.every(1)])
            .tickSizeInner(10)
            .tickSizeOuter(0);

        this.yPos = this.axisPos === "top" ? this.height/3 : this.height - (this.height/3);

    }

    draw() {


        this.element.innerHTML = "";

        d3.select(this.element).classed("timeline");

        this.textBox = d3.select(this.element).append('div').classed("text-box", true);

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
            });

        this.scrubber.append("rect")
            .attr("width", d => {
                return this.mobile ? this.width / 2 : 1;
            })
            .attr("height", d => {
                return this.mobile ? 1 : this.yPos;
            });

        this.drawDots();

    }

    drawDots() {

        const dots = this.plot.selectAll(".dot")
            .data(this.data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("days", d => {
                return d.days;
            })
            .attr("r", 6)
            .attr("cx", d => {
                return this.mobile ? this.width / 2 : this.xScale(this.parseTime(d.date));
            })
            .attr("cy", (d, i) => {
                return this.mobile ? this.xScale(this.parseTime(d.date)) : this.yPos;
            });

    }



    updateScrubber(val) {

        this.scrubberDate = addDays(this.startDateObj, +val);

        console.log(this.startDateObj, +val);

        this.scrubber.attr("transform", d => {
            let pos = this.xScale(this.scrubberDate);

            if (this.mobile) {
                return this.axisPos === "top" ? `translate(0,${pos})` : `translate(${this.width/2},${pos})`;
            } else {
                return this.axisPos === "top" ? `translate(${pos}, 0)` : `translate(${pos},${this.yPos})`;
            }

        });

        //return this.axisPos === "top" ? `translate(0,0)` : `translate(0,${this.yPos})`;


    }


    updateTextBox(obj) {

        if (!obj) {

            this.textBox.classed("active", true);

            this.textBox.transition(300).style("opacity", 0)
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
                    return `${pos}px`;
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

        this.textBox.transition(300)
            .style("opacity", 1)
            //.classed("active", true);


        if (this.mobile) {
            this.textBox.style("width", `${this.width + 20}px`);
        }



    }




}

function daydiff(first, second) {
    var oneDay = 24 * 60 * 60 * 1000;
    var diffDays = Math.round(Math.abs((first.getTime() - second.getTime()) / (oneDay)));
    return diffDays;
}


function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
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