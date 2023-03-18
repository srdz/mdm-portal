Chart.defaults.global.defaultFontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji';
Chart.defaults.global.defaultFontColor = '#212529';

// Horizontal Bar - Change Request By Type
var changerequest_value = [];
var changerequest_label = [];
var changerequest_json = JSON.parse(sessionStorage.getItem("change-request-by-type"));
var changerequest_color = [];

// Sort
changerequest_json = changerequest_json.sort(function (a, b) {
    return b.y - a.y;
});

$.each(changerequest_json, function (index, s) {
    changerequest_label.push(s.label);
    changerequest_value.push(s.y);
    changerequest_color.push(fnGetRandomColor());
});

new Chart(document.getElementById("canvas-change-request-by-type"), {
    type: 'horizontalBar',
    data: {
        labels: changerequest_label,
        datasets: [{
            data: changerequest_value,
            backgroundColor: changerequest_color,
        }],
    },
    options: {
        legend: { display: false },
        title: {
            display: true,
            text: 'Change Request by Type',
            fontSize: 20
        },
        tooltips: {
            enabled: false
        },
        plugins: {
            datalabels: {
                align: function (context) {
                    return context.dataset.data[context.dataIndex] < 2500 ? 'end' : 'start';
                },
                color: function (context) {
                    return context.dataset.data[context.dataIndex] < 2500 ? 'black' : 'white';
                },
                anchor: 'end',
                offset: 4,
                padding: 0
            }
        }
    },
    responsive: true
});

// Vertical Bar - Number of Customer in Source
var customer_in_source_value = [];
var customer_in_source_label = [];
var customer_in_source_json = JSON.parse(sessionStorage.getItem("customer-in-source"));
var customer_in_source_color = [];

// Sort
customer_in_source_json = customer_in_source_json.sort(function (a, b) {
    return a.y - b.y;
});

$.each(customer_in_source_json, function (index, s) {
    customer_in_source_label.push(s.label);
    customer_in_source_value.push(s.y);
    customer_in_source_color.push(fnGetRandomColor());
});

new Chart(document.getElementById("canvas-customer-in-source"), {
    type: 'bar',
    data: {
        labels: customer_in_source_label,
        datasets: [{
            data: customer_in_source_value,
            backgroundColor: customer_in_source_color,
        }],
    },
    options: {
        legend: { display: false },
        title: {
            display: true,
            text: 'Number of Customers In Sources',
            fontSize: 20
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        },
        tooltips: {
            enabled: false
        },
        plugins: {
            datalabels: {
                align: function (context) {
                    return context.dataset.data[context.dataIndex] < 6000 ? 'end' : 'start';
                },
                color: function (context) {
                    return context.dataset.data[context.dataIndex] < 6000 ? 'black' : 'white';
                },
                anchor: 'end',
                offset: 4,
                padding: 0
            }
        }
    },
    responsive: true
});

// Vertical Bar - Top 10 Credentials
var credentials_value = [];
var credentials_label = [];
var credentials_json = JSON.parse(sessionStorage.getItem("top-ten-credentials"));
var credentials_color = [];

// Sort
credentials_json = credentials_json.sort(function (a, b) {
    return a.y - b.y;
});

$.each(credentials_json, function (index, s) {
    credentials_label.push(s.label);
    credentials_value.push(s.y);
    credentials_color.push(fnGetRandomColor());
});

new Chart(document.getElementById("canvas-top-ten-credentials"), {
    type: 'bar',
    data: {
        labels: credentials_label,
        datasets: [{
            data: credentials_value,
            backgroundColor: credentials_color,
        }],
    },
    options: {
        legend: { display: false },
        title: {
            display: true,
            text: 'Top 10 Credentials',
            fontSize: 20
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        },
        tooltips: {
            enabled: false
        },
        plugins: {
            datalabels: {
                align: function (context) {
                    return context.dataset.data[context.dataIndex] < 800 ? 'end' : 'start';
                },
                color: function (context) {
                    return context.dataset.data[context.dataIndex] < 800 ? 'black' : 'white';
                },
                anchor: 'end',
                offset: 4,
                padding: 0
            }
        }
    },
    responsive: true
});

// Doughnut - Stewardship Validation Status
var stewardship_validation_status_value = [];
var stewardship_validation_status_label = [];
var stewardship_validation_status_json = JSON.parse(sessionStorage.getItem("stewardship-validation-status"));
var stewardship_validation_status_color = [];

$.each(stewardship_validation_status_json, function (index, s) {
    stewardship_validation_status_label.push(s.label);
    stewardship_validation_status_value.push(s.y);
    stewardship_validation_status_color.push(fnGetRandomColor());
});

new Chart(document.getElementById("canvas-stewardship-validation-status"), {
    type: 'doughnut',
    data: {
        labels: stewardship_validation_status_label,
        datasets: [{
            data: stewardship_validation_status_value,
            backgroundColor: stewardship_validation_status_color,
        }],
    },
    options: {
        legend: { display: true },
        title: {
            display: true,
            text: 'Stewardship Validation Status',
            fontSize: 20
        },
        tooltips: {
            enabled: false
        },
        plugins: {
            datalabels: {
                formatter: (value, ctx) => {

                    let datasets = ctx.chart.data.datasets;

                    if (datasets.indexOf(ctx.dataset) === datasets.length - 1) {
                        let sum = datasets[0].data.reduce((a, b) => a + b, 0);
                        let percentage = Math.round((value / sum) * 100) + '%';
                        return percentage;
                    } else {
                        return percentage;
                    }
                },
                color: '#fff',
            }
        }
    },
    responsive: true
});

// Vertical Bar - Stewardship Request Per Year
var stewardship_request_per_year_value = [];
var stewardship_request_per_year_label = [];
var stewardship_request_per_year_json = JSON.parse(sessionStorage.getItem("stewardship-request-per-year"));
var stewardship_request_per_year_color = [];

// Sort
stewardship_request_per_year_json = stewardship_request_per_year_json.sort(function (a, b) {
    //return b.y - a.y;
    return a.label - b.label;
});

$.each(stewardship_request_per_year_json, function (index, s) {
    stewardship_request_per_year_label.push(s.label);
    stewardship_request_per_year_value.push(s.y);
    stewardship_request_per_year_color.push(fnGetRandomColor());
});

new Chart(document.getElementById("canvas-stewardship-request-per-year"), {
    type: 'bar',
    data: {
        labels: stewardship_request_per_year_label,
        datasets: [{
            data: stewardship_request_per_year_value,
            backgroundColor: stewardship_request_per_year_color,
        }],
    },
    options: {
        legend: { display: false },
        title: {
            display: true,
            text: 'Stewardship Request Per Year',
            fontSize: 20
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        },
        tooltips: {
            enabled: false
        },
        plugins: {
            datalabels: {
                align: function (context) {
                    return context.dataset.data[context.dataIndex] < 5 ? 'end' : 'start';
                },
                color: function (context) {
                    return context.dataset.data[context.dataIndex] < 5 ? 'black' : 'white';
                },
                anchor: 'end',
                offset: 4,
                padding: 0
            }
        }
    },
    responsive: true
});

// Vertical Bar - Change Request Per Year
var change_request_per_year_value = [];
var change_request_per_year_label = [];
var change_request_per_year_json = JSON.parse(sessionStorage.getItem("change-request-per-year"));
var change_request_per_year_color = [];

// Sort
//change_request_per_year_json = change_request_per_year_json.sort(function (a, b) {
//    return a.y - b.y;
//});

$.each(change_request_per_year_json, function (index, s) {
    change_request_per_year_label.push(s.label);
    change_request_per_year_value.push(s.y);
    change_request_per_year_color.push(fnGetRandomColor());
});

new Chart(document.getElementById("canvas-change-request-per-year"), {
    type: 'bar',
    data: {
        labels: change_request_per_year_label,
        datasets: [{
            data: change_request_per_year_value,
            backgroundColor: change_request_per_year_color,
        }],
    },
    options: {
        legend: { display: false },
        title: {
            display: true,
            text: 'Change Request Per Year',
            fontSize: 20
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        },
        tooltips: {
            enabled: false
        },
        plugins: {
            datalabels: {
                align: function (context) {
                    return context.dataset.data[context.dataIndex] < 5000 ? 'end' : 'start';
                },
                color: function (context) {
                    return context.dataset.data[context.dataIndex] < 5000 ? 'black' : 'white';
                },
                anchor: 'end',
                offset: 4,
                padding: 0
            }
        }
    },
    responsive: true
});

// Fix naming convention
function fnUcFirstAllWords(str) {
    var pieces = str.split(" ");

    for (var i = 0; i < pieces.length; i++) {
        var j = pieces[i].charAt(0).toUpperCase();

        pieces[i] = j + pieces[i].substr(1).toLowerCase();
    }

    return pieces.join(" ");
}

// Create random colors
function fnGetRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';

    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
}

// Validation if parameter is empty
function fnIsEmpty(val) {
    // []        true, empty array
    // {}        true, empty object
    // null      true
    // undefined true
    // ""        true, empty string
    // ''        true, empty string
    // 0         false, number
    // true      false, boolean
    // false     false, boolean
    // Date      false
    // function  false

    if (val === undefined) {
        return true;
    }

    if (typeof (val) == 'function' || typeof (val) == 'number' || typeof (val) == 'boolean' || Object.prototype.toString.call(val) === '[object Date]') {
        return false;
    }

    if (typeof (val) == 'undefined') {
        return true;
    }

    if (val == null || val.length === 0) {
        // null or 0 length array
        return true;
    }

    if (typeof (val) == "object") {
        // empty object
        var r = true;

        for (var f in val) {
            r = false;
        }

        return r;
    }
}