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

    var data = {"OkPercent": 21.428571428571427, "KoPercent": 78.57142857142857};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.21428571428571427, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "4 Login Request"], "isController": false}, {"data": [0.0, 500, 1500, "6 Add Google Stock Request"], "isController": false}, {"data": [0.0, 500, 1500, "11 Place Stock Order Request"], "isController": false}, {"data": [0.0, 500, 1500, "8 Add Apple Stock Request"], "isController": false}, {"data": [0.0, 500, 1500, "9 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0, 500, 1500, "7 Create Apple Stock Request"], "isController": false}, {"data": [0.0, 500, 1500, "2 Register Request"], "isController": false}, {"data": [0.0, 500, 1500, "13 Get Stock Transactions Request"], "isController": false}, {"data": [0.0, 500, 1500, "3 Failed Login Request"], "isController": false}, {"data": [1.0, 500, 1500, "12 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0, 500, 1500, "10 Place Stock Order Request"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.0, 500, 1500, "1 Register Request"], "isController": false}, {"data": [0.0, 500, 1500, "5 Create Google Stock Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 14, 11, 78.57142857142857, 19.857142857142858, 3, 64, 14.0, 51.5, 64.0, 64.0, 2.0028612303290414, 0.867310443490701, 0.938142659155937], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4 Login Request", 1, 0, 0.0, 18.0, 18, 18, 18.0, 18.0, 18.0, 18.0, 55.55555555555555, 34.12543402777778, 12.966579861111112], "isController": false}, {"data": ["6 Add Google Stock Request", 1, 1, 100.0, 11.0, 11, 11, 11.0, 11.0, 11.0, 11.0, 90.9090909090909, 24.59161931818182, 57.26207386363637], "isController": false}, {"data": ["11 Place Stock Order Request", 1, 1, 100.0, 19.0, 19, 19, 19.0, 19.0, 19.0, 19.0, 52.63157894736842, 12.335526315789474, 35.77302631578947], "isController": false}, {"data": ["8 Add Apple Stock Request", 1, 1, 100.0, 10.0, 10, 10, 10.0, 10.0, 10.0, 10.0, 100.0, 27.05078125, 62.98828125], "isController": false}, {"data": ["9 Get Stock Portfolio Request", 1, 1, 100.0, 11.0, 11, 11, 11.0, 11.0, 11.0, 11.0, 90.9090909090909, 20.063920454545457, 52.46803977272727], "isController": false}, {"data": ["7 Create Apple Stock Request", 1, 1, 100.0, 11.0, 11, 11, 11.0, 11.0, 11.0, 11.0, 90.9090909090909, 26.63352272727273, 55.22017045454546], "isController": false}, {"data": ["2 Register Request", 1, 1, 100.0, 32.0, 32, 32, 32.0, 32.0, 32.0, 32.0, 31.25, 7.8125, 8.11767578125], "isController": false}, {"data": ["13 Get Stock Transactions Request", 1, 1, 100.0, 12.0, 12, 12, 12.0, 12.0, 12.0, 12.0, 83.33333333333333, 65.83658854166667, 48.33984375], "isController": false}, {"data": ["3 Failed Login Request", 1, 1, 100.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 38.39111328125, 14.6484375], "isController": false}, {"data": ["12 Get Stock Portfolio Request", 1, 0, 0.0, 11.0, 11, 11, 11.0, 11.0, 11.0, 11.0, 90.9090909090909, 20.063920454545457, 52.46803977272727], "isController": false}, {"data": ["10 Place Stock Order Request", 1, 1, 100.0, 39.0, 39, 39, 39.0, 39.0, 39.0, 39.0, 25.64102564102564, 6.009615384615385, 17.427884615384617], "isController": false}, {"data": ["Debug Sampler", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 502.2786458333333, 0.0], "isController": false}, {"data": ["1 Register Request", 1, 1, 100.0, 64.0, 64, 64, 64.0, 64.0, 64.0, 64.0, 15.625, 3.90625, 4.0740966796875], "isController": false}, {"data": ["5 Create Google Stock Request", 1, 1, 100.0, 21.0, 21, 21, 21.0, 21.0, 21.0, 21.0, 47.61904761904761, 13.950892857142856, 28.971354166666664], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["No results for path: $['success']", 2, 18.181818181818183, 14.285714285714286], "isController": false}, {"data": ["400/BAD REQUEST", 6, 54.54545454545455, 42.857142857142854], "isController": false}, {"data": ["Value in json path '$.success' expected to match regexp 'false', but it did not match: 'true'", 1, 9.090909090909092, 7.142857142857143], "isController": false}, {"data": ["Assertion failed", 2, 18.181818181818183, 14.285714285714286], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 14, 11, "400/BAD REQUEST", 6, "No results for path: $['success']", 2, "Assertion failed", 2, "Value in json path '$.success' expected to match regexp 'false', but it did not match: 'true'", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["6 Add Google Stock Request", 1, 1, "400/BAD REQUEST", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["11 Place Stock Order Request", 1, 1, "No results for path: $['success']", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["8 Add Apple Stock Request", 1, 1, "400/BAD REQUEST", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["9 Get Stock Portfolio Request", 1, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7 Create Apple Stock Request", 1, 1, "400/BAD REQUEST", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2 Register Request", 1, 1, "400/BAD REQUEST", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["13 Get Stock Transactions Request", 1, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["3 Failed Login Request", 1, 1, "Value in json path '$.success' expected to match regexp 'false', but it did not match: 'true'", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["10 Place Stock Order Request", 1, 1, "No results for path: $['success']", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1 Register Request", 1, 1, "400/BAD REQUEST", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["5 Create Google Stock Request", 1, 1, "400/BAD REQUEST", 1, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
