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

    var data = {"OkPercent": 66.233, "KoPercent": 33.767};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.34024, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.04395, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.2725, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [1.0, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.41975, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.30255, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.0191, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.0234, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.02225, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [1.0, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.2989, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 33767, 33.767, 26631.215719999982, 0, 80136, 49238.5, 80001.0, 80001.0, 80001.0, 275.69171050164863, 231.3060989554041, 81.0766162986527], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 5448, 54.48, 45195.97879999999, 275, 80068, 45227.5, 80001.0, 80001.0, 80001.0, 32.47069519758418, 30.182107327824134, 9.277549862811313], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 225, 2.25, 8371.7214, 17, 68448, 1228.0, 30498.8, 53808.85, 68181.97, 121.64710175780063, 39.15991271820449, 47.51839912414087], "isController": false}, {"data": ["14 Register Request", 10000, 0, 0.0, 18.339499999999973, 3, 265, 13.0, 32.0, 45.0, 139.9499999999989, 201.11821728812197, 39.67371083222718, 52.7736951827159], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 669, 6.69, 10979.254600000002, 8, 80033, 1266.0, 55843.9, 69083.84999999999, 80001.0, 37.599073558827506, 25.98713577072461, 17.503396841301832], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 3663, 36.63, 8865.273700000007, 4, 80003, 1083.0, 28434.899999999994, 69469.65, 80001.0, 37.71748846787791, 27.39800940650589, 14.435477340747333], "isController": false}, {"data": ["17 Add Money Request", 10000, 5223, 52.23, 61711.58969999991, 9, 80102, 80000.0, 80001.0, 80001.0, 80003.0, 61.667488899851996, 90.5099455688055, 12.629206638119758], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 7721, 77.21, 63125.76179999996, 337, 80132, 80000.0, 80001.0, 80001.0, 80004.0, 41.296887453592625, 74.00691793843873, 5.599712754337205], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 6926, 69.26, 61259.67059999982, 288, 80136, 80000.0, 80001.0, 80001.0, 80002.0, 29.17476266330573, 43.143875501623576, 5.478148604206417], "isController": false}, {"data": ["15 Login Request", 10000, 0, 0.0, 5.43340000000001, 0, 201, 3.0, 10.0, 19.0, 50.0, 202.37589298362778, 83.59863548054156, 47.827115334021414], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 3892, 38.92, 6779.133699999972, 2, 80003, 1020.0, 14821.699999999995, 49746.29999999933, 80000.0, 37.8908440564422, 14.098838947572334, 14.752903741152489], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 693, 2.0522995824325525, 0.693], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 20743, 61.42979832380727, 20.743], "isController": false}, {"data": ["Assertion failed", 12331, 36.51790209376018, 12.331], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 33767, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 20743, "Assertion failed", 12331, "502/Bad Gateway", 693, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 5448, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2740, "Assertion failed", 2708, "", "", "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 225, "502/Bad Gateway", 225, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 669, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 466, "502/Bad Gateway", 203, "", "", "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 3663, "Assertion failed", 3169, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 347, "502/Bad Gateway", 147, "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 10000, 5223, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 5223, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 7721, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 6546, "Assertion failed", 1175, "", "", "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 6926, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 5217, "Assertion failed", 1709, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 3892, "Assertion failed", 3570, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 204, "502/Bad Gateway", 118, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
