var Display = {

	showSensorsLogs : (sensor)=>{

      api.getSensorLogs(deviceID,sensor,(err,res)=>{
        if(err) console(err);
        if(res?.length > 0 && typeof res[0][sensor] === "string" )
          Display.showList(sensor,res);
        else
          Display.drawLinearChart(sensor,res);
      })
    },

	showDeviceLogs : (sensor)=>{

      api.getDeviceLogs(deviceID,sensor,(err,res)=>{
        if(err) console(err);
        if(res?.length > 0 && typeof res[0][sensor] === "string" )
          Display.showList(sensor,res);
        else
          Display.drawLinearChart(sensor,res);
      })
    },

	drawLinearChart : (sensor,data)=>{
      let option = {
        legend:{
          data:[sensor],
          type:"scroll"
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            return 'date: '+moment.unix(Number(params[0].axisValue)).format('YYYY/MM/DD HH:mm') + '<br />' + sensor+': '+params[0].value;
          }
        },
        dataZoom:[{type:'inside'}],
        xAxis: {
          name: 'time',
          nameLocation: 'center',
          nameGap:20,
          nameTextStyle:{
            fontWeight:'bold',
          },
          data: data.map(function (item) {
            return moment(item.createdAt).unix();
          }),
          axisLabel: {
            formatter: function (value, idx) {
              return moment.unix(value).format('DD HH:mm');
            }
          },
        },
        yAxis: {
          /*
          name: 'values',
          nameLocation: 'center',
          nameGap:35,
          nameTextStyle:{
            fontWeight:'bold',
          },
          */
        },
        series: [
          {
            data: data.map(function (item) {
              if(sensor == "status"){
                return item[sensor] == "online" ? 1 : 0;
              }else return item[sensor];
            }),
            name:sensor,
            type: 'line',
            smooth: true
          }
        ]
      };

      ctx.setOption(option)
      ctx.resize();

      $('#modalChartLogs').modal('show');
    },

	showList : (sensor,data)=>{
      // Sort the array
      table_list.clear();
      Display.calculateTimeDifference(data);
      data.map((item,i)=>{
        if(data?.duration)
          data.duration = 0;
        table_list.row.add([
          moment(item.createdAt).format('YYYY/MM/DD HH:mm:ss'),item[sensor],item.duration
        ]).draw(true);
      })

      table_list.order([0, 'desc']).draw();
      $('#modalListLogs').modal('show');
    },

	calculateTimeDifference : (data)=>{

      data.slice(1).map((item, i) => {
        // convert both current and previous timestamps to milliseconds
        let current = moment(item.createdAt).unix();
        let previous = moment(data[i].createdAt).unix();

        data[i].duration = Display.getDifference(current,previous);
        return;
      });
      let previous = moment(data[data.length-1].createdAt).unix();
      let current = moment().unix();
      data[data.length-1].duration = Display.getDifference(current,previous);
    },

	getDifference : (current, previous)=>{
      // calculate difference in seconds
      let differenceInSeconds = (current - previous) % 60;
      differenceInSeconds = differenceInSeconds.toFixed(0);
      let sec_str = String(differenceInSeconds).padStart(2, '0');

      // you can convert the difference to minutes, hours etc.
      let differenceInMinutes = (current - previous) % 3600 / 60;
      differenceInMinutes = Math.floor(differenceInMinutes);
      let min_str = String(differenceInMinutes).padStart(2, '0');

      let differenceInHours = (current - previous) / 3600;
      differenceInHours = Math.floor(differenceInHours);
      let hour_str = String(differenceInHours).padStart(2, '0');
      let time = hour_str+":"+min_str+":"+sec_str;
      return time;
    }

}
