import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const LineChart = () => {
  const options = {
    chart: {
      type: "line",
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      backgroundColor: "var(--whiteColor)",
    },
    title: {
      text: "",
    },
    subtitle: {
      text: "",
    },
    xAxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: {
        style: {
          color: "var(--textColor)",
        },
      },
    },
    yAxis: {
      title: {
        text: "",
      },
      labels: {
        style: {
          color: "var(--textColor)",
        },
      },
      gridLineWidth: 0.1,
      gridLineColor: "var(--textColor)",
    },
    plotOptions: {
      line: {
        enableMouseTracking: false,
      },
      series: {
        borderWidth: 0.5,
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
        name: "RHM 2",
        data: [
          16.0, 18.2, 23.1, 27.9, 32.2, 36.4, 39.8, 38.4, 35.5, 29.2, 22.0,
          17.8,
        ],
        color: "var(--primaryColor)",
      },
      {
        name: "RHM 1",
        data: [2.9, 3.6, 0.6, 4.8, 10.2, 14.5, 17.6, 16.5, 12.0, 6.5, 2.0, 0.9],
        color: "",
      },
    ],
  };

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default LineChart;
