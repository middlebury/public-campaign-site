import { h, render } from 'preact';
import PercentBarChart from './components/percent-bar-chart';

import { $$ } from './utils/dom';

const colors = [
  '#022543',
  '#acd6eb',
  '#ffffff'
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

const ALLOW_CHART_TYPES = [
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
  config: ChartConfig;
  el: HTMLElement;
  isCircleChart: boolean;
  isGroupChart: boolean;

  constructor(el: HTMLElement, config: ChartConfig) {
    this.el = el;
    this.config = config;

    if (config.type === 'percentBar') {
      renderPercentBarChart(el, config);
    }
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
