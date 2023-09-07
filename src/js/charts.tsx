import { h, render } from 'preact';
import PercentBarChart from './components/percent-bar-chart';
import { ChartOptions } from 'chart.js';

import { onElementInView } from './utils/on-element-in-view';
import { PREFERS_REDUCED_MOTION } from './utils/prefers-reduced-motion';
import { $$ } from './utils/dom';

// Colors for percentage chart
const colors = [
  '#022543',
  '#acd6eb',
  '#ffffff',
  '#1f9f8b',
  '#c26533',
  '#8f9a17'
];

// Colors for all other charts except percentage chart
const chart_colors = [
  '#0d395f',
  '#1f9f8b',
  '#c26533',
  '#8f9a17',
  '#f4b824',
  '#763649',
  '#907036',
  '#75a3cd',
  '#d3b885',
  '#962c28'
];

const theme: {[key: string]: string[]} = {
  'access': [
    '#022543',
    '#ffffff'
  ],
  'academic-excellence': [
    '#a7c504',
    '#ffffff'
  ],
  'experience': [
    '#f4b824',
    '#ffffff'
  ]
}

// Grab chart instance off window since we load chartjs only if there's a chart component
// on page and don't want to bundle it with the main js bundle.
const { Chart } = window;

// console.log(Chart);

const ALLOW_CHART_TYPES = [
  'pie',
  'doughnut',
  'bar',
  'horizontalBar',
  'line',
  'percentBar' // custom Preact component
];

// PercentbarChart is written with Preact and not part of the chart.js library, so
// this is a helper function to render it to the chart div.
// Also adds a wrapper class so we can change the position of the legend.
function renderPercentBarChart(el: HTMLElement, config: ChartConfig) {
  el.classList.add('chart--singlebar');
  
  render(<PercentBarChart {...config} colors={config.theme ? theme[config.theme] : colors} legend='inline' />, el);
}

export interface DataSet {
  data: number[];
  label: string;
}

interface ChartConfig {
  /**
   * Datasets
   * https://www.chartjs.org/docs/latest/?h=datasets
   */
  datasets: DataSet[];

  /**
   * Labels for each value within dataset.data array.
   * https://www.chartjs.org/docs/latest/getting-started/usage.html?h=labels
   */
  labels: string[];

  /**
   * The kinds of chart types we allow. Chart.js comes with more but we only configure a few
   * plus we add our custom percentBar as a type.
   *
   * https://www.chartjs.org/docs/latest/charts/
   */
  type: string;

  /**
   * Text title to display above chart.
   * https://www.chartjs.org/docs/latest/configuration/title.html?h=title
   */
  title?: string;

  /**
   * Forces a minimum number on the value axis.
   * So if a data array starts with 4, the min displayed on the axis will be 1 if min is set to 1.
   *
   * https://www.chartjs.org/docs/latest/axes/cartesian/linear.html#tick-configuration-options
   */
  min?: number;

  /**
   * Suggests a maximum number on the value axis.
   * So if a data array ends with 98, the max value displayed on the axis will be 100 if min is set to 100.
   *
   * https://www.chartjs.org/docs/latest/axes/cartesian/linear.html#tick-configuration-options
   */
  max?: number;

  /** label to display under the x axis on non pie/doughnut/percent charts */
  xLabel?: string;

  /** label to display to the left of the y axis on non pie/doughnut/percent charts */
  yLabel?: string;

  /** prefix text to add on the values axis. Can be used to add $ before dollar amounts, etc. */
  valuePrefix?: string;

  /**
   * suffix to append to value axis ticks. Can be used to add % to ticks if a bar
   * chart is presented as a percentage chart.
   */
  valueSuffix?: string;

  theme: string;
}

/**
 * Custom chart initializer for specific chart types, colors, styles, and additional custom percent bar chart.
 *
 * Charts can be added to a page via just a div with some data attributes
 * instead of having to initialize each one with JS manually.
 *
 * Only data-chart, data-datasets, data-labels are required attributes.
 *
 * @example
 * ```html
 * <div class="chart"
 * data-chart="bar"
 * data-datasets='[{"label": "fruits", "data": [1,2,3,4]}]'
 * data-labels='["oranges", "apples", "peaches", "pears"]'
 *
 * data-title="How many fruits I own"
 * data-y-label="Fruit names"
 * data-x-label="Number of fruits"
 *
 * data-max="100"
 * data-min="1"
 *
 * data-value-prefix=""
 * data-value-suffix="%"
 * />
 * ```
 */
class MiddChart {
  canvas?: HTMLCanvasElement;
  chart?: Chart;
  config: ChartConfig;
  el: HTMLElement;
  isCircleChart: boolean;
  isGroupChart: boolean;

  constructor(el: HTMLElement, config: ChartConfig) {
    this.el = el;
    this.config = config;

    this.isGroupChart = config.datasets.length > 1;
    this.isCircleChart = config.type === 'pie' || config.type === 'doughnut';

    if (config.type === 'percentBar') {
      renderPercentBarChart(el, config);
    } else {
      this.init();
    }
  }

  setDefaultGlobals() {
    // Chart.defaults.global.elements.line.tension = 0;

    Chart.defaults.global.defaultFontColor = '#222';
    Chart.defaults.global.defaultFontFamily =
      'Open Sans, arial, verdana, sans-serif';
    Chart.defaults.global.defaultFontSize = 14;

    Chart.defaults.doughnut.cutoutPercentage = 80;
  }

  getBaseOptions() {
    const {
      title,
      type,
      valuePrefix = '',
      valueSuffix = '',
      max,
      min,
      xLabel,
      yLabel
    } = this.config;

    const maxBarThickness = this.isGroupChart ? 16 : 32;
    const isHorizontalBars = type === 'horizontalBar';
    const isAxisChart = isHorizontalBars || type === 'bar' || type === 'line';

    const prefixTick = (value: any) => `${valuePrefix}${value}${valueSuffix}`;

    const xTickCallback = isHorizontalBars ? prefixTick : (tick: any) => tick;
    const yTickCallback = isHorizontalBars ? (tick: any) => tick : prefixTick;

    const options: ChartOptions = {
      animation: {
        duration: PREFERS_REDUCED_MOTION ? 0 : 1000
      },
      maintainAspectRatio: true,
      legend: {
        display: false // remove legend since we use html legend
      },
      tooltips: {
        displayColors: false,
        backgroundColor: '#fff',
        titleFontColor: '#222',
        titleFontSize: 16,
        bodyFontColor: '#222',
        bodyFontSize: 14,
        yPadding: 8,
        xPadding: 8,
        caretSize: 0,
        cornerRadius: 0,
        borderWidth: 1,
        borderColor: '#ccc'
      },
      elements: {
        point: {
          radius: 4
        },
        line: {
          borderWidth: 1,
          tension: 0,
          fill: false
        }
      }
    };

    if (title !== '') {
      options.title = {
        display: true,
        text: title,
        fontSize: 14,
        fontStyle: '500',
        padding: 24
      };
    }

    if (isAxisChart) {
      options.scales = {
        xAxes: [
          {
            scaleLabel: {
              display: Boolean(xLabel),
              labelString: xLabel
            },
            // @ts-ignore
            maxBarThickness,
            ticks: {
              suggestedMax: max,
              suggestedMin: min,
              beginAtZero: !min,
              callback: xTickCallback
            }
          }
        ],
        yAxes: [
          {
            scaleLabel: {
              display: Boolean(yLabel),
              labelString: yLabel
            },
            // @ts-ignore
            maxBarThickness,
            ticks: {
              suggestedMax: max,
              suggestedMin: min,
              beginAtZero: !min,
              callback: yTickCallback
            }
          }
        ]
      };
    }

    return options;
  }

  getItemColor(i: any) {
    if (this.isCircleChart) {
      return chart_colors;
    }

    return chart_colors[i];
  }

  init() {
    // this.setDefaultGlobals();
    this.draw();
  }

  draw() {
    this.el.classList.add('chart--loaded');

    const { labels, datasets, type } = this.config;

    this.el.classList.add('chart', `chart--${type}`);

    if (type === 'bar' || type === 'horizontalBar' || type === 'line') {
      this.el.classList.add('chart--axis');
    }

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '500px';
    this.canvas.style.height = '400px';

    this.el.appendChild(this.canvas);

    const options = this.getBaseOptions();

    const PLUGIN_KEY = '$lazy';

    this.chart = new Chart(this.canvas, {
      type,
      data: {
        datasets: datasets.map((d: any, i: number) => {
          const color = this.getItemColor(i);
          return {
            ...d,
            borderColor: type === 'line' ? color : 'white',
            backgroundColor: color
          };
        }),
        labels
      },
      options,
      plugins: [
        {
          // basic recreation of chartjs-plugin-deferred but using intersection observer
          // and allowing us to not install the extra dependency
          beforeInit(chart: any) {
            // create the plugin config to store values
            chart[PLUGIN_KEY] = {};

            const model = chart[PLUGIN_KEY];

            // Don't restart for chart animation
            // since there's no animation duration anyway.
            if (PREFERS_REDUCED_MOTION) {
              return;
            }

            // add an is in view flag which is checked before datasets update
            model.isInView = false;

            model.io = onElementInView(chart.canvas, () => {
              model.isInView = true;

              // delay the chart update slightly since it may not have enough of it in view
              setTimeout(() => {
                // update the chart now that it's in view
                chart.update();
              }, 400);
            });
          },
          beforeDatasetsUpdate(chart: any) {
            // only update the dataset once it's in view
            return chart[PLUGIN_KEY].isInView;
          },
          destroy(chart: any) {
            chart[PLUGIN_KEY].io.unobserve();
          }
        }
      ]
    });

    this.addLegend();
  }

  addLegend() {
    if (!this.chart) return;

    // do not show single dataset legend label
    if (!this.isGroupChart && !this.isCircleChart) {
      return;
    }

    // add html legend
    const legend = this.chart.generateLegend() as string; // returned type for generatedLegend is wrong?
    // console.log(legend);
    const legendtag = document.createElement('div');
    legendtag.innerHTML = legend;

    // add classes for better styling
    legendtag.classList.add('chart-legend');
    if (!this.isCircleChart) {
      legendtag.classList.add('chart-legend--inline');
    }

    legendtag.querySelector('ul')?.classList.add('chart-legend__list');
    legendtag.querySelectorAll('li').forEach((li) => {
      li.classList.add('chart-legend__item');
      li.querySelector('span')?.classList.add('chart-legend__icon');
    });

    this.el.appendChild(legendtag);
  }
}

function parseJsonData(data: string) {
  let result;
  try {
    result = JSON.parse(data);
  } catch (error) {
    console.warn('error parsing chart config json', data);
  }

  return result;
}

function parseConfig(el: HTMLElement): ChartConfig | void {
  // el.dataset is data-* attributes, not to be confused with chart datasets
  const {
    datasets,
    labels,
    chart = 'pie',
    min,
    max,
    valuePrefix,
    valueSuffix,
    title,
    theme
  } = el.dataset;

  if (!datasets || !labels) {
    console.warn('Cannot create a chart without labels and datasets.', el);
    return;
  }

  const isValidChartType = ALLOW_CHART_TYPES.includes(chart);

  if (!isValidChartType) {
    console.warn(
      `Invalid chart type: ${chart}. Choose one from: ${ALLOW_CHART_TYPES}`
    );
    return;
  }

  return {
    datasets: parseJsonData(datasets),
    labels: parseJsonData(labels),
    type: chart,
    title,
    theme,
    valuePrefix,
    valueSuffix,
    min: Number(min),
    max: Number(max)
  };
}

const els = $$('[data-chart]');

els.forEach((el) => {
  const config = parseConfig(el);

  if (!config) return;
  new MiddChart(el, config);
});
