/**
 * plugin to export highchart as csv file, 
 * xAxis -> date-time category
 */
(function(Highcharts) {

  var each = Highcharts.each;

  Highcharts.Chart.prototype.getCSV = function() {

    var exportThisPoint = false;
    var dataToExport = {}; //pack all data inside
    dataToExport.time = []; //first row
    var myCSV = ""; //cvs string
    var seriesNo = 0; //count number of series

    var options = (this.options.exporting || {}).csv || {};

    // Options           
    var itemDelimiter = options.itemDelimiter || ';'; // use ';' for direct import to Excel
    var lineDelimiter = options.lineDelimiter || '\n';

    each(this.series, function(series) {
      //if the chart is visible in chart
      if (series.visible && series.name != "Navigator") {

        //if the option exportThisPoint is not set to true
        if (series.options.includeInCSVExport !== false) {

          if (series.xAxis) {

            var xData = series.xData.slice();

            if (series.xAxis.isDatetimeAxis) {

              var objectName = series.name; //name of the object (room temperature)
              var seriesDataLenght = series.xData.length; //how menu points serie has	

              //create first row
              //dataToExport['time']]['object-name-1, object-name-2....]						
              dataToExport['time'].push(objectName);

              var maxValue = series.xAxis.max; //last zoomed point on chart	
              var minValue = series.xAxis.min; //first zoomed point on chart

              //loop for each point
              for (i = 0; i < seriesDataLenght; ++i) {

                //if is it displayed on chart
                if (series.xData[i] > minValue && series.xData[i] < maxValue) {

                  //get the date and time as epoche and covert it to friendly name 
                  //formatted for excel date time format (eu)
                  var dateTime = '="' + Highcharts.dateFormat('%d.%m.%y %H:%M', series.xData[i]) + '"';

                  //round value to 2 decimals
                  var roundedVal = Highcharts.numberFormat(series.yData[i], 2, ',')

                  //check if that key already exist
                  //if exist add value
                  //if do not exist create it and add value
                  //dataToExport[date and time][series-1-val,series-2-val,series-3-val...]
                  if (dataToExport[dateTime] === undefined) {

                    //if it is first column, it has no need to fulfil previous columns
                    if (seriesNo === 0) {
                      dataToExport[dateTime] = [roundedVal];

                      //it is not the first column but it's first time that that time is appear
                      //->means fulfil previous row with an "-" sign						
                    } else {

                      //fcreate array with that time 
                      dataToExport[dateTime] = [];

                      //then add for each missing column an ""
                      for (j = 0; j < seriesNo; ++j) {
                        dataToExport[dateTime].push("");
                      }

                      //and then add value of current series
                      dataToExport[dateTime].push(roundedVal);
                    }

                    //this time array already exist									
                  } else {
                    dataToExport[dateTime].push(roundedVal);
                  }
                }
              }

              //increase counter
              seriesNo++;
            }
          }
        }
      }
    });



    var noOfColumns = dataToExport['time'].length; //check how menu columns have first (time) row
    var keys = Object.keys(dataToExport); //cache object keys -> 23.05.14 08:30
    var i;
    var len = keys.length;

    keys.sort(); //sort array by keys (sort time)

    //append first row - title
    myCSV += "Date & Time" + itemDelimiter;
    myCSV += dataToExport['time'].join(itemDelimiter) + lineDelimiter

    //loop
    for (i = 0; i < len; i++) {


      var dataRow = []; //values row				
      var k = keys[i]; //keys[

      //add time column 12.01.2014 08:07
      dataRow.push(k);

      //add data columns
      //in a case when the previues series has more points than the rest, fulfil the row with empty values
      for (j = 0; j < noOfColumns; ++j) {

        //check if this entry do exist if not just add empty cells	
        var dta = (dataToExport[k][j] === undefined) ? "" : dataToExport[k][j];
        dataRow.push(dta);
      }

      //add line to the csv file
      myCSV += dataRow.join(itemDelimiter) + lineDelimiter;
    }

    return myCSV;
  };



  // Now we want to add "Download CSV" to the exporting menu. We post the CSV
  // to a simple PHP script that returns it with a content-type header as a 
  // downloadable file.
  // The source code for the PHP script can be viewed at 
  // https://raw.github.com/highslide-software/highcharts.com/master/studies/csv-export/csv.php
  if (Highcharts.getOptions().exporting) {
    Highcharts.getOptions().exporting.buttons.contextButton.menuItems.push({
      text: Highcharts.getOptions().lang.downloadCSV || "Download CSV",
      onclick: function() {
        Highcharts.post('http://www.highcharts.com/studies/csv-export/csv.php', {
          csv: this.getCSV()
        });
      }
    });
  }
}(Highcharts));
