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

    var data = {"OkPercent": 3.86, "KoPercent": 96.14};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.00281, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0044, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [7.0E-4, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.023, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.0, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.0, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.0, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.0, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.0, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.0, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 50000, 48070, 96.14, 16978.54658000015, 1, 81001, 512.0, 20222.30000000001, 38269.95, 68602.98000000001, 202.14598174217494, 129.13615552075836, 36.08637814665489], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 5000, 5000, 100.0, 314.636199999999, 1, 17621, 58.0, 653.9000000000005, 886.8999999999996, 3796.959999999999, 22.186625014975974, 6.082081915238218, 4.232644720581645], "isController": false}, {"data": ["16 Get Stock Prices Request", 5000, 4978, 99.56, 15279.0272, 2, 69274, 973.0, 58208.80000000003, 68501.95, 68989.94, 22.191548570642357, 5.415171279919755, 4.168569707537581], "isController": false}, {"data": ["14 Register Request", 5000, 3322, 66.44, 65662.60400000005, 922, 81001, 79999.0, 80009.0, 80346.85, 80974.99, 52.8061170606003, 92.84834586488498, 4.924531395216822], "isController": false}, {"data": ["19 Place Stock Order Request", 5000, 4885, 97.7, 3409.9706000000024, 1, 69237, 485.0, 5716.900000000001, 21309.09999999999, 58313.349999999984, 22.18879111028273, 5.378762317552665, 6.914564694748801], "isController": false}, {"data": ["20 Get Stock Transactions Request", 5000, 5000, 100.0, 2577.522600000006, 1, 69277, 422.5, 3727.000000000011, 12179.849999999999, 55905.979999999996, 22.188988049011037, 5.379832830937662, 4.298102328401461], "isController": false}, {"data": ["17 Add Money Request", 5000, 5000, 100.0, 1024.9269999999979, 1, 36714, 333.0, 2222.8000000000065, 4805.95, 12486.11999999998, 22.18810185226274, 6.1477726543293425, 5.01297691938175], "isController": false}, {"data": ["18 Get Wallet Balance Request", 5000, 5000, 100.0, 913.8291999999994, 1, 30665, 422.0, 1972.2000000000044, 4076.399999999998, 12034.949999999999, 22.188298778756035, 6.147827217775934, 4.211295771686843], "isController": false}, {"data": ["22 Get Wallet Balance Request", 5000, 5000, 100.0, 316.5278000000004, 1, 19295, 72.0, 658.9000000000005, 835.8999999999996, 3661.99, 22.187018819029362, 6.1474725726846735, 4.211052837830642], "isController": false}, {"data": ["15 Login Request", 5000, 4885, 97.7, 78760.03839999979, 14387, 80777, 80000.0, 80003.0, 80014.0, 80078.0, 28.8094771656084, 73.12028739974302, 0.22331846284153634], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 5000, 5000, 100.0, 1526.3827999999971, 1, 68784, 342.0, 2161.9000000000005, 4937.299999999994, 32399.369999999988, 22.187117272227052, 5.716931107059497, 4.319407057611069], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 275, 0.5720823798627003, 0.55], "isController": false}, {"data": ["401/UNAUTHORIZED", 38948, 81.02350738506345, 77.896], "isController": false}, {"data": ["400/BAD REQUEST", 5, 0.01040149781568546, 0.01], "isController": false}, {"data": ["500/INTERNAL SERVER ERROR", 345, 0.7177033492822966, 0.69], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 8059, 16.765134179321823, 16.118], "isController": false}, {"data": ["Assertion failed", 438, 0.9111712086540462, 0.876], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 50000, 48070, "401/UNAUTHORIZED", 38948, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 8059, "Assertion failed", 438, "500/INTERNAL SERVER ERROR", 345, "502/Bad Gateway", 275], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 5000, 5000, "401/UNAUTHORIZED", 4885, "Assertion failed", 115, "", "", "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 5000, 4978, "401/UNAUTHORIZED", 4790, "502/Bad Gateway", 95, "Assertion failed", 93, "", "", "", ""], "isController": false}, {"data": ["14 Register Request", 5000, 3322, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3223, "502/Bad Gateway", 99, "", "", "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 5000, 4885, "401/UNAUTHORIZED", 4864, "502/Bad Gateway", 21, "", "", "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 5000, 5000, "401/UNAUTHORIZED", 4874, "Assertion failed", 115, "502/Bad Gateway", 11, "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 5000, 5000, "401/UNAUTHORIZED", 4885, "500/INTERNAL SERVER ERROR", 115, "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 5000, 5000, "401/UNAUTHORIZED", 4885, "500/INTERNAL SERVER ERROR", 115, "", "", "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 5000, 5000, "401/UNAUTHORIZED", 4885, "500/INTERNAL SERVER ERROR", 115, "", "", "", "", "", ""], "isController": false}, {"data": ["15 Login Request", 5000, 4885, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 4836, "502/Bad Gateway", 44, "400/BAD REQUEST", 5, "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 5000, 5000, "401/UNAUTHORIZED", 4880, "Assertion failed", 115, "502/Bad Gateway", 5, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
