/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/

"use strict";
import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import * as d3 from "d3";
import { VisualSettings } from "./settings";

export class Visual implements IVisual {
    private visualSettings: VisualSettings;
    private svg: d3.Selection<any, any, any, any>
    private path: d3.Selection<any, any, any, any>
    private drawXAxis: d3.Selection<any, any, any, any>
    private drawYAxis: d3.Selection<any, any, any, any>
    private drawGridline: d3.Selection<any, any, any, any>

    constructor(options: VisualConstructorOptions) {
        //Appends D3 elements 
        this.svg = d3.select(options.element).append('svg')
        this.drawGridline = this.svg.append("g")
        this.path = this.svg.append("path")
        this.drawXAxis = this.svg.append("g")
        this.drawYAxis = this.svg.append("g")
    }

    public update(options: VisualUpdateOptions) {

        //Creates dataView from the data inside of Power BI
        let dataView: DataView = options.dataViews[0];

        //Loads visualSettings 
        this.visualSettings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

        //Empty data arrays, later used for storing the data
        let dataValue = [],
            dataAxis = [],
            dataPoints = []

        //Sets dynamic width and height of the chart 
        let width = options.viewport.width;
        let height = options.viewport.height;
        this.svg
            .attr("width", width)
            .attr("height", height)

        //Global variables, will be used for spacing and margin
        let marginAxisPoints = 60,
            axisStartPos = 30;

        //Loops through the data which is added in Power BI 
        for (var i = 0; i < dataView.categorical.categories[0].values.length; i++) {
            var dataPointAxis = dataView.categorical.categories[0].values[i] //Binds axis data to variable 
            var dataPointValue = dataView.categorical.values[0].values[i]// Binds value data to variable
            dataPoints.push([dataPointAxis, dataPointValue]) //Creates data points inside a 2D array
            dataPoints.sort(); //Sorts the array, based on the first index (dataPointAxis)
            dataAxis.push([dataPointAxis]) //Pushes values to the dataAxis array
            dataValue.push([dataPointValue]) //Pushes values to dataValue array 
        }

        this.svg.append("text")
        .attr("x", 20)
        .attr("y", 20)
        .text(<any>dataView.categorical.values[0].values[0])

        //Sets minimum and maximum values of the data
        let maxAxis = d3.max(dataAxis, function () {
            return d3.max(dataAxis);
        })
        let minAxis = d3.min(dataAxis, function () {
            return d3.min(dataAxis);
        });
        let maxValue = d3.max(dataValue, function () {
            return d3.max(dataValue);
        })
        let minValue = d3.min(dataValue, function () {
            return d3.min(dataValue);
        });

        //Variables that decide the Y axis begin, stop and steps value
        let yAxisValueStart = minValue,
            yAxisValueStop = maxValue,
            yAxisSteps = (maxValue - minValue) / 2 - 1

        //Makes an X axis scale
        let xScale = d3.scaleLinear()
            .domain([minAxis, maxAxis]) //Sets the minimum and maximum value for the x Axis (the minimimum and maximum value of the dataYear array)
            .range([marginAxisPoints, width - (marginAxisPoints + axisStartPos)]); //Start and stop position of axis

        //Makes an Y axis scale
        let yScale = d3.scaleTime()
            .domain([minValue, maxValue]) //Sets the minimum and maximum value for the y Axis (the minimimum and maximum value of the dataAverage array)
            .range([height - marginAxisPoints, axisStartPos]); //Start and stop position of axis

        var circlePoints = this.svg
            .selectAll("circle")
            .data(dataPoints)

        circlePoints.enter().append("circle")
            .attr("r", "4")
            .merge(<any>circlePoints)
            .attr("fill", this.visualSettings.dataPoint.defaultColor)
            .attr("cx", function (d) {
                return xScale(d[0]) + axisStartPos
            })
            .attr("cy", function (d) {
                return yScale(d[1])
            })

        if (this.visualSettings.dataPoint.showAllDataPoints == true) {
            this.svg.selectAll("circle")
                .attr("visibility", "visible")
        } else {
            this.svg.selectAll("circle")
                .attr("visibility", "hidden")
        }

        let line = d3.line()
            .x(function (d) {
                return xScale(d[0]) + axisStartPos
            })
            .y(function (d) {
                return yScale(d[1])
            })

        this.path
            .datum(dataPoints)
            .attr("fill", "none")
            .attr("stroke", this.visualSettings.line.lineColor)
            .attr("stroke-width", 3)
            .attr("d", line)

        let yAxis = d3.axisLeft(yScale)
            .tickValues(d3.range(yAxisValueStart, yAxisValueStop, yAxisSteps))
            .tickFormat(d3.format("d"));

        this.drawYAxis
            .attr("class", "yAxis")
            .call(yAxis)
            .attr("transform", "translate(" + axisStartPos + ",0)")

        let xAxis = d3.axisBottom(xScale)
            .ticks(3)
            .tickFormat(d3.format("Y"))

        this.drawXAxis
            .attr("class", "xAxis")
            .attr("transform", "translate(" + axisStartPos + "," + (height - axisStartPos) + ")")
            .call(xAxis)


        let yGridline = d3.axisLeft(yScale)
            .tickValues(d3.range(yAxisValueStart, yAxisValueStop, yAxisSteps))
            .tickSize(-width - -50)

        this.drawGridline
            .attr("class", "gridline")
            .call(yGridline)
            .attr("transform", "translate(" + axisStartPos + ",0)")
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.visualSettings || VisualSettings.getDefault(), options);
    }
}