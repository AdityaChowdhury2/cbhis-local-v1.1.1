import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React from "react";

const PieChart = () => {
  const options = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: "pie",
      backgroundColor: "var(--whiteColor)",
    },
    title: {
      text: "",
    },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
    },
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    plotOptions: {
      pie: {
        innerSize: "60%",
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: false,
        },
        showInLegend: true,
      },
    },
    legend: {
      verticalAlign: "top",
      itemStyle: {
        color: "var(--textColor)",
      },
    },
    series: [
      {
        name: "Brands",
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
  };

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default PieChart;
