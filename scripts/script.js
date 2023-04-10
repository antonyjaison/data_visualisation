// for swiper
var swiper = new Swiper(".mySwiper", {
  spaceBetween: 30,
  effect: "fade",
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});

const product = {
  electronic: "Electronic accessories",
  health: "Health and beauty",
  food: "Food and beverages",
  sports: "Sports and travel",
  fasion: "Fashion accessories",
  home: "Home and lifestyle",
};

var salesData = [];
var f_count = 0,
  m_count = 0;
const ratingByLine = {};
const incomeByLine = {};
const paymentMethodData = {};
const paymentData = [];

var total = 0;
var avg_rating = 0;
var count = 0;

d3.selectAll("p", "h3")
  .style("opacity", 0)
  .transition()
  .duration(1000)
  .style("opacity", 1);

const total_sales = document.querySelector("#total_sales");
const rating = document.querySelector("#rating");
const avg_sales = document.querySelector("#avg_sales");
const star_section = document.querySelector("#star_section");

fetch("https://data-visualisation-backend.onrender.com/api/get-data").then(
  (res) => {
    res.json().then((json) => {
      analyseData(json);
    });
  }
);

const analyseData = (salesData) => {
  // loop through the dataset
  salesData.forEach((data) => {
    // for checking how many female and male customers
    if (data.Gender === "Female") {
      f_count++;
    } else m_count++;

    // here we get the total amount, average rating and the total quantity
    total += parseFloat(data.Total);
    avg_rating += parseFloat(data.rating);
    count++;

    const paymentMethod = data.Payment;
    const totalAmount = parseFloat(data.Total);
    const Tax = parseFloat(data.Tax);

    // if the payment method hasn't been seen before, create a new object for it
    if (!paymentMethodData[paymentMethod]) {
      paymentMethodData[paymentMethod] = {
        totalAmount: 0,
        count: 0,
        Tax: 0,
      };
    }

    // update the payment method data with the current transaction
    paymentMethodData[paymentMethod].totalAmount += totalAmount;
    paymentMethodData[paymentMethod].count++;
    paymentMethodData[paymentMethod].Tax += Tax;

    if (!incomeByLine[data.Product_line]) {
      incomeByLine[data.Product_line] = {
        totalIncome: 0,
        count: 0,
        Tax: 0,
      };
    }

    incomeByLine[data.Product_line].totalIncome += parseFloat(data.Total);
    incomeByLine[data.Product_line].Tax += parseFloat(data.Tax);
    incomeByLine[data.Product_line].count++;

    if (!ratingByLine[data.Product_line]) {
      ratingByLine[data.Product_line] = { totalRating: 0, count: 0 };
    }

    ratingByLine[data.Product_line].totalRating += parseFloat(data.rating);
    ratingByLine[data.Product_line].count++;
  });

  rating.innerHTML = Math.round(avg_rating / count)
    .toString()
    .padEnd(3, ".0");
  total_sales.innerHTML = formatNumber(total);
  avg_sales.innerHTML = (total / count).toFixed(2);

  // loop avg_rating times to get the stars
  for (let i = 0; i < Math.round(avg_rating / count); i++) {
    const star = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    star.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    star.setAttribute("width", "16");
    star.setAttribute("height", "16");
    star.setAttribute("fill", "yellow");
    star.setAttribute("class", "bi bi-star-fill star");
    star.setAttribute("viewBox", "0 0 16 16");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"
    );
    star.appendChild(path);
    star_section.appendChild(star);
  }

  // create animimation for the stars
  d3.select("#star_section")
    .style("opacity", 0) // set initial opacity to 0 for fade in animation
    .transition() // add transition for fade in animation
    .duration(1000)
    .style("opacity", 1);

  // convert the paymentMethod data object to peymentMethod array
  Object.keys(paymentMethodData).forEach((paymentMethod) => {
    const data = paymentMethodData[paymentMethod];
    const Tax = data.Tax;
    paymentData.push({
      payment_method: paymentMethod,
      total_sales: data.totalAmount,
      Tax: Tax,
    });
  });

  // the gender_data is the data for th pie chart
  var gender_data = [
    {
      name: "Male",
      count: m_count,
      percentage: ((m_count / (f_count + m_count)) * 100).toFixed(2),
      color: "#51ECC6",
    },
    {
      name: "Female",
      count: f_count,
      percentage: ((f_count / (f_count + m_count)) * 100).toFixed(2),
      color: "#E8D5B5",
    },
  ];

  // these are the functions for creating the four visualisations
  generateBarChart(incomeByLine);
  horizontalBarChart(paymentData);
  generatePieChart(gender_data);
  histogram(paymentData);
};

// function for creating the pieChart
const generatePieChart = (pieData) => {
  const total_customers = document.querySelector("#total_customers");
  const female = document.querySelector("#female");
  const male = document.querySelector("#male");

  total_customers.innerHTML = `Total customers : ${
    pieData[0].count + pieData[1].count
  }`;
  female.innerHTML = `Female : <span class='count'>${pieData[1].count}</span>`;
  male.innerHTML = `Male : <span class='count'>${pieData[0].count}</span>`;

  // set the width,height and radius of the pie chart
  var width = 300,
    height = 300,
    radius = 140;

  // It defines the shape of the pie chart slices, setting the outer radius as radius and inner radius as 0.
  var arc = d3.arc().outerRadius(radius).innerRadius(0);

  var pie = d3
    .pie()
    .sort(null)
    .value(function (d) {
      return d.count;
    });

  var svg = d3
    .select("#chart")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var g = svg.selectAll(".arc").data(pie(pieData)).enter().append("g");

  g.append("path")
    .attr("d", arc)
    .style("fill", function (d, i) {
      return d.data.color;
    })
    .style("opacity", 0) // set initial opacity to 0 for fade in animation
    .transition() // add transition for fade in animation
    .duration(1000) // set duration of animation in milliseconds
    .style("opacity", 1); // set final opacity to 1 for fade in animation

  g.append("text")
    .attr("transform", function (d) {
      var _d = arc.centroid(d);
      _d[0] *= 0.9; //multiply by a constant factor
      _d[1] *= 0.2; //multiply by a constant factor
      return "translate(" + _d + ")";
    })
    .attr("dy", ".50em")
    .style("text-anchor", "middle")
    .text(function (d) {
      if (d.data.percentage < 8) {
        return "";
      }
      return d.data.percentage + "%";
    });
};

const generateBarChart = (totalIncomeBySales) => {
  const data = Object.entries(totalIncomeBySales).map(
    ([Product_line, { totalIncome, count }]) => ({
      line: Product_line.split(" ")[0],
      totalIncome,
      count,
    })
  );

  // Set the dimensions of the chart
  const margin = { top: 10, right: 10, bottom: 40, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create the SVG element and set its dimensions
  const svg = d3
    .select("#bar_chart")
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", [
      0,
      0,
      width + margin.left + margin.right,
      height + margin.top + margin.bottom,
    ]);

  // Append a group element to the SVG and translate it to the correct position
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Define the x and y scales
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.line))
    .range([0, width])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.totalIncome)])
    .nice()
    .range([height, 0]);

  // Create the x and y axes
  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y);

  // Append the x and y axes to the chart
  g.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  g.append("g").attr("class", "y axis").call(yAxis);

  // Create the bars
  const bars = g
    .selectAll(".bar")
    .data(data)
    .join("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.line))
    .attr("y", height)
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("fill", "#CCA3A3");

  // animation
  bars
    .transition()
    .duration(1000)
    .attr("y", (d) => y(d.totalIncome))
    .attr("height", (d) => height - y(d.totalIncome));
};

const histogram = (data) => {
  const histogram_data = document.querySelector(".histogram_data");
  // Define the dimensions of the chart
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const containerWidth = document
    .querySelector("#histogram")
    .getBoundingClientRect().width;
  const width = containerWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create the SVG element
  const svg = d3
    .select("#histogram")
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Create the x and y scales
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.payment_method))
    .range([0, width])
    .paddingInner(0.2);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.Tax)])
    .range([height, 0]);

  // Create the x and y axes
  const xAxis = d3.axisBottom(xScale);

  const yAxis = d3.axisLeft(yScale);

  // Add the x and y axes to the chart
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis)
    .attr("class", "x axis");

  svg.append("g").call(yAxis).attr("class", "y axis");

  // Create the bars
  svg
    .selectAll("rect")
    .data(data, (d) => d.payment_method)
    .join(
      (enter) =>
        enter
          .append("rect")
          .attr("x", (d) => xScale(d.payment_method))
          .attr("y", height)
          .attr("width", xScale.bandwidth())
          .attr("height", 0)
          .attr("fill", "#48bda9")
          .call((enter) =>
            enter
              .transition()
              .duration(1000)
              .attr("y", (d) => yScale(d.Tax))
              .attr("height", (d) => height - yScale(d.Tax))
          ),
      (update) =>
        update.call((update) =>
          update
            .transition()
            .duration(1000)
            .attr("y", (d) => yScale(d.Tax))
            .attr("height", (d) => height - yScale(d.Tax))
        ),
      (exit) =>
        exit.call((exit) =>
          exit
            .transition()
            .duration(1000)
            .attr("y", height)
            .attr("height", 0)
            .remove()
        )
    );
  histogram_data.innerHTML = `The analysis of the histogram data can have implications for
    businesses and policymakers. For businesses, it can provide
    insights into customer preferences and payment method
    adoption, which can inform their payment strategies. For
    policymakers, it can provide information on the
    effectiveness of different payment methods in tax collection
    and help in policy decisions related to tax payment options.`;
};

const horizontalBarChart = (data) => {
  const bar_chart_data1 = document.querySelector(".bar_chart_data1");
  const bar_chart_data2 = document.querySelector(".bar_chart_data2");
  // Define the dimensions of the chart
  const margin = { top: 20, right: 20, bottom: 20, left: 100 };
  const container = document.querySelector("#horizontal_bar");
  const width = container.clientWidth - margin.left - margin.right;
  const height = container.clientHeight - margin.top - margin.bottom;

  // Calculate the total sales across all payment methods
  const total_sales = data.reduce((acc, cur) => acc + cur.total_sales, 0);

  // Calculate the percentage of total sales for each payment method
  data.forEach((d) => {
    d.percent_sales = (d.total_sales / total_sales) * 100;
  });

  // Update the scales for the chart
  const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
  const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d.payment_method))
    .range([0, height])
    .padding(0.1);

  // Create the SVG element for the chart
  const svg = d3
    .select("#horizontal_bar")
    .append("svg")
    .attr("width", "100%") // Set responsive width
    .attr("height", "100%") // Set responsive height
    .attr("viewBox", `0 0 ${container.clientWidth} ${container.clientHeight}`) // Set viewBox for responsiveness
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create the horizontal stacked bar chart
  svg
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", 0)
    .attr("y", (d) => yScale(d.payment_method))
    .attr("width", (d) => xScale(d.percent_sales))
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => {
      if (d.payment_method === "Ewallet") {
        return "#4CAF50";
      } else if (d.payment_method === "Credit card") {
        return "#2196F3";
      } else {
        return "#F44336";
      }
    })
    .transition()
    .duration(1000)
    .attr("width", (d) => xScale(d.percent_sales));

  // Add labels to the bars
  svg
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("x", (d) => xScale(d.percent_sales))
    .attr("y", (d) => yScale(d.payment_method) + yScale.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("fill", "#fff")
    .attr("dx", 6)
    .text((d) => `${d.percent_sales.toFixed(2)}%`);

  // Add axes to the chart
  const xAxis = d3.axisBottom(xScale).tickFormat((d) => `${d}%`);
  const yAxis = d3.axisLeft(yScale);
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);
  svg.append("g").attr("class", "y-axis").call(yAxis);
  svg.style("opacity", 0).transition().duration(1000).style("opacity", 1);
  bar_chart_data1.innerHTML =
    "The data suggests that e-wallet has the highest market share among the three payment methods.";

  bar_chart_data2.innerHTML = `Businesses may integrate e-wallet options into their payment
    systems if e-wallet is the most popular payment method to
    align with customer preferences and potentially boost sales
    and customer satisfaction.`;
};

//

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "m";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}
