import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React from "react";

const PieChart = () => {
  const options = {
    chart: {
      type: "pie",
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      backgroundColor: "lightblue",
    },
    title: {
      text: "",
    },
    tooltip: {
      valueSuffix: "%",
    },
    subtitle: {
      text: "",
    },
    plotOptions: {
      pie: {
        innerSize: "60%", // Makes it a donut chart
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          distance: 20,
        },
      },
    },
    legend: {
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
      itemStyle: {
        color: "var(--textColor)",
        fontSize: "13px",
      },
      series: [
        {
          name: "Percentage",
          colorByPoint: true,
          data: [
            {
              name: "RHM 3",
              y: 55.02,
            },
            {
              name: "RHM 2",
              sliced: true,
              selected: true,
              y: 26.71,
            },
            {
              name: "RHM 1",
              y: 10.09,
            },
          ],
        },
      ],
    },
  };

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default PieChart;
