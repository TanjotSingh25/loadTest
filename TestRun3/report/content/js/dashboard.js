/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 20.0, "KoPercent": 80.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.11812058823529412, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.18229411764705883, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.0, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.0, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.0, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.0, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.0, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.9989117647058824, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.0, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 170000, 136000, 80.0, 2569.850694117641, 0, 69056, 364.0, 2498.0, 2712.0, 3674.0, 1324.905892713797, 432.66458058934927, 511.09490716160343], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 17000, 17000, 100.0, 3085.4133529411706, 0, 35906, 2537.0, 5812.0, 7456.949999999999, 14392.800000000032, 147.554074228379, 48.848467933027806, 59.07926800159706], "isController": false}, {"data": ["16 Get Stock Prices Request", 17000, 17000, 100.0, 27.138470588235368, 0, 697, 15.0, 54.0, 84.0, 247.0, 143.15548369711667, 47.39229391926031, 56.89871275852197], "isController": false}, {"data": ["14 Register Request", 17000, 0, 0.0, 3267.3943529411886, 2, 69056, 3036.0, 5856.0, 7179.0, 12640.860000000022, 142.54689373548325, 28.119602084538695, 38.70071192216101], "isController": false}, {"data": ["19 Place Stock Order Request", 17000, 17000, 100.0, 3063.5921176470524, 2, 69016, 2656.0, 5280.9, 6686.449999999988, 12928.570000000229, 143.2519886746663, 47.4242423444452, 70.78662721619253], "isController": false}, {"data": ["20 Get Stock Transactions Request", 17000, 17000, 100.0, 3039.307294117637, 1, 51056, 2776.5, 5025.0, 6096.0, 10950.900000000016, 143.45023120801972, 47.489871464373714, 57.85639207901576], "isController": false}, {"data": ["17 Add Money Request", 17000, 17000, 100.0, 3345.2695882352973, 1, 51065, 2976.5, 5717.799999999999, 7116.949999999999, 14441.610000000062, 143.1518672897983, 47.391096690665655, 62.34934844848638], "isController": false}, {"data": ["18 Get Wallet Balance Request", 17000, 17000, 100.0, 3226.6718823529523, 1, 51066, 2848.0, 5585.0, 7079.949999999999, 13832.170000000133, 143.15789473684208, 47.39309210526316, 57.17927631578947], "isController": false}, {"data": ["22 Get Wallet Balance Request", 17000, 17000, 100.0, 3346.815529411771, 1, 51057, 2754.5, 6023.499999999998, 7859.699999999993, 17145.99, 145.14655533072067, 48.051447516713196, 57.973575322524184], "isController": false}, {"data": ["15 Login Request", 17000, 0, 0.0, 35.10817647058832, 1, 752, 20.0, 73.0, 112.0, 295.0, 143.0422563653804, 60.06657249718123, 36.06310733796257], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 17000, 17000, 100.0, 3261.796176470579, 1, 50055, 2863.0, 5515.0, 7014.0, 13964.12000000014, 143.85080133358156, 47.62248208211342, 58.15842944541285], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 136000, 100.0, 80.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 170000, 136000, "500/Internal Server Error", 136000, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 17000, 17000, "500/Internal Server Error", 17000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 17000, 17000, "500/Internal Server Error", 17000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["19 Place Stock Order Request", 17000, 17000, "500/Internal Server Error", 17000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 17000, 17000, "500/Internal Server Error", 17000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 17000, 17000, "500/Internal Server Error", 17000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 17000, 17000, "500/Internal Server Error", 17000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 17000, 17000, "500/Internal Server Error", 17000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 17000, 17000, "500/Internal Server Error", 17000, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
