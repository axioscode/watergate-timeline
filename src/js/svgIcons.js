let d3 = require("d3");

class getSvg {

    constructor(opts) {
        this.element = opts.element;
        this.iconArray = ["data-breach", "elected", "investigator-fired", "investigator-named", "senate-hearing", "tapes"];
        this._setData();
    }


    _setData() {

        this.iconArray.forEach(d => {
            d3.xml(`../data/${d}.svg`).mimeType("image/svg+xml").get((error, xml)=> {
                if (error) throw error;

                d3.select(xml.documentElement).attr("id", d);

                d3.select(xml.documentElement)
                    .select("path", "rect", "polygon")
                    .attr("class", "icon-path")
                    .attr("fill", "blue");

                this.element.appendChild(xml.documentElement);
            });
        })

    }

}

export default getSvg;



