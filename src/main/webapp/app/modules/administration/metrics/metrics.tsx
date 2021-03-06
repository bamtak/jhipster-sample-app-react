import * as React from 'react';
import { connect } from 'react-redux';
import { Table, Progress, Col, Row, Button } from 'reactstrap';
import { Translate, TextFormat } from 'react-jhipster';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

import { APP_WHOLE_NUMBER_FORMAT, APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT } from '../../../config/constants';
import { systemMetrics, systemThreadDump } from '../administration.reducer';
import MetricsModal from './metrics-modal';

export interface IMetricsPageProps {
  isFetching?: boolean;
  systemMetrics: Function;
  systemThreadDump: Function;
  metrics: any;
  threadDump: any;
}

export interface IMetricsPageState {
  showModal: boolean;
}

export class MetricsPage extends React.Component<any, IMetricsPageState> {
  state: IMetricsPageState = {
    showModal: false
  };

  componentDidMount() {
    this.props.systemMetrics();
  }

  getMetrics = () => {
    if (!this.props.isFetching) {
      this.props.systemMetrics();
    }
  };

  getThreadDump = () => {
    this.props.systemThreadDump();
    this.setState({
      showModal: true
    });
  };

  handleClose = () => {
    this.setState({
      showModal: false
    });
  };

  filterNaN = input => (isNaN(input) ? 0 : input);

  getStats = metrics => {
    const stat = {
      servicesStats: {},
      cachesStats: {}
    };
    if (!this.props.isFetching && metrics && metrics.timers) {
      Object.keys(metrics.timers).forEach((key, indexNm) => {
        if (key.indexOf('web.rest') !== -1 || key.indexOf('service') !== -1) {
          stat.servicesStats[key] = metrics.timers[key];
        }
        if (key.indexOf('net.sf.ehcache.Cache') !== -1) {
          // remove gets or puts
          const index = key.lastIndexOf('.');
          const newKey = key.substr(0, index);
          // Keep the name of the domain
          stat.cachesStats[newKey] = {
            name: newKey,
            value: metrics.timers[key]
          };
        }
      });
    }
    return stat;
  };

  renderModal = () => <MetricsModal handleClose={this.handleClose} showModal={this.state.showModal} threadDump={this.props.threadDump} />;

  renderGauges = metrics => (
    <Row>
      <Col sm="12">
        <h3>JVM Metrics</h3>
        <Row>
          <Col md="4">
            <b>Memory</b>
            <p>
              <span>Total Memory</span> (
              <TextFormat value={metrics.gauges['jvm.memory.total.used'].value / 1048576} type="number" format={APP_WHOLE_NUMBER_FORMAT} />
              M /{' '}
              <TextFormat value={metrics.gauges['jvm.memory.total.max'].value / 1048576} type="number" format={APP_WHOLE_NUMBER_FORMAT} />
              M)
            </p>
            <Progress
              animated
              value={metrics.gauges['jvm.memory.total.used'].value}
              min="0"
              max={metrics.gauges['jvm.memory.total.max'].value}
              color="success"
            >
              <span>
                <TextFormat
                  value={metrics.gauges['jvm.memory.total.used'].value * 100 / metrics.gauges['jvm.memory.total.max'].value}
                  type="number"
                  format={APP_WHOLE_NUMBER_FORMAT}
                />
                %
              </span>
            </Progress>
            <p>
              <span>Heap Memory</span> (
              <TextFormat value={metrics.gauges['jvm.memory.heap.used'].value / 1048576} type="number" format={APP_WHOLE_NUMBER_FORMAT} />
              M /{' '}
              <TextFormat value={metrics.gauges['jvm.memory.heap.max'].value / 1048576} type="number" format={APP_WHOLE_NUMBER_FORMAT} />
              M)
            </p>
            <Progress
              animated
              min="0"
              max={metrics.gauges['jvm.memory.heap.max'].value}
              value={metrics.gauges['jvm.memory.heap.used'].value}
              color="success"
            >
              <span>
                <TextFormat
                  value={metrics.gauges['jvm.memory.heap.used'].value * 100 / metrics.gauges['jvm.memory.heap.max'].value}
                  type="number"
                  format={APP_WHOLE_NUMBER_FORMAT}
                />
                %
              </span>
            </Progress>

            <p>
              <span>Non-Heap Memory</span> (
              <TextFormat
                value={metrics.gauges['jvm.memory.non-heap.used'].value / 1048576}
                type="number"
                format={APP_WHOLE_NUMBER_FORMAT}
              />
              M /{' '}
              <TextFormat
                value={metrics.gauges['jvm.memory.non-heap.committed'].value / 1048576}
                type="number"
                format={APP_WHOLE_NUMBER_FORMAT}
              />
              M)
            </p>
            <Progress
              animated
              min="0"
              max={metrics.gauges['jvm.memory.non-heap.committed'].value}
              value={metrics.gauges['jvm.memory.non-heap.used'].value}
              color="success"
            >
              <span>
                <TextFormat
                  value={metrics.gauges['jvm.memory.non-heap.used'].value * 100 / metrics.gauges['jvm.memory.non-heap.committed'].value}
                  type="number"
                  format={APP_WHOLE_NUMBER_FORMAT}
                />
                %
              </span>
            </Progress>
          </Col>
          <Col md="4">
            <b>Threads</b> (Total: {metrics.gauges['jvm.threads.count'].value}){' '}
            <FontAwesomeIcon icon="eye" className="hand" onClick={this.getThreadDump} />
            <p>
              <span>Runnable</span> {metrics.gauges['jvm.threads.runnable.count'].value}
            </p>
            <Progress
              animated
              min="0"
              value={metrics.gauges['jvm.threads.runnable.count'].value}
              max={metrics.gauges['jvm.threads.count'].value}
              color="success"
            >
              <span>
                <TextFormat
                  value={metrics.gauges['jvm.threads.runnable.count'].value * 100 / metrics.gauges['jvm.threads.count'].value}
                  type="number"
                  format={APP_WHOLE_NUMBER_FORMAT}
                />
                %
              </span>
            </Progress>
            <p>
              <span>Timed Waiting</span> ({metrics.gauges['jvm.threads.timed_waiting.count'].value})
            </p>
            <Progress
              animated
              min="0"
              value={metrics.gauges['jvm.threads.timed_waiting.count'].value}
              max={metrics.gauges['jvm.threads.count'].value}
              color="warning"
            >
              <span>
                <TextFormat
                  value={metrics.gauges['jvm.threads.timed_waiting.count'].value * 100 / metrics.gauges['jvm.threads.count'].value}
                  type="number"
                  format={APP_WHOLE_NUMBER_FORMAT}
                />
                %
              </span>
            </Progress>
            <p>
              <span>Waiting</span> ({metrics.gauges['jvm.threads.waiting.count'].value})
            </p>
            <Progress
              animated
              min="0"
              value={metrics.gauges['jvm.threads.waiting.count'].value}
              max={metrics.gauges['jvm.threads.count'].value}
              color="warning"
            >
              <span>
                <TextFormat
                  value={metrics.gauges['jvm.threads.waiting.count'].value * 100 / metrics.gauges['jvm.threads.count'].value}
                  type="number"
                  format={APP_WHOLE_NUMBER_FORMAT}
                />
                %
              </span>
            </Progress>
            <p>
              <span>Blocked</span> ({metrics.gauges['jvm.threads.blocked.count'].value})
            </p>
            <Progress
              animated
              min="0"
              value={metrics.gauges['jvm.threads.blocked.count'].value}
              max={metrics.gauges['jvm.threads.count'].value}
              color="success"
            >
              <span>
                <TextFormat
                  value={metrics.gauges['jvm.threads.blocked.count'].value * 100 / metrics.gauges['jvm.threads.count'].value}
                  type="number"
                  format={APP_WHOLE_NUMBER_FORMAT}
                />
                %
              </span>
            </Progress>
          </Col>
          <Col md="4">
            <b>Garbage collections</b>
            <Row>
              <Col md="9">Mark Sweep count</Col>
              <Col md="3" className="text-right">
                {metrics.gauges['jvm.garbage.PS-MarkSweep.count'].value}
              </Col>
            </Row>
            <Row>
              <Col md="9">Mark Sweep time</Col>
              <Col md="3" className="text-right">
                {metrics.gauges['jvm.garbage.PS-MarkSweep.time'].value}ms
              </Col>
            </Row>
            <Row>
              <Col md="9">Scavenge count</Col>
              <Col md="3" className="text-right">
                {metrics.gauges['jvm.garbage.PS-Scavenge.count'].value}
              </Col>
            </Row>
            <Row>
              <Col md="9">Scavenge time</Col>
              <Col md="3" className="text-right">
                {metrics.gauges['jvm.garbage.PS-Scavenge.time'].value}ms
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  );

  render() {
    const { metrics, isFetching } = this.props;
    const data = metrics || {};
    const { servicesStats, cachesStats } = this.getStats(data);
    return (
      <div>
        <h2>Application Metrics</h2>
        <p>
          <Button onClick={this.getMetrics} color={isFetching ? 'btn btn-danger' : 'btn btn-primary'} disabled={isFetching}>
            <FontAwesomeIcon icon="sync" />&nbsp;
            <Translate component="span" contentKey="health.refresh.button">
              Refresh
            </Translate>
          </Button>
        </p>
        <hr />
        {metrics.gauges ? this.renderGauges(metrics) : ''}

        {metrics.meters && metrics.timers ? (
          <Row>
            <Col sm="12">
              <h3>HTTP requests (events per second)</h3>
              <p>
                <span>Active requests:</span>{' '}
                <b>
                  <TextFormat
                    value={metrics.counters['com.codahale.metrics.servlet.InstrumentedFilter.activeRequests'].count}
                    type="number"
                    format={APP_WHOLE_NUMBER_FORMAT}
                  />
                </b>{' '}
                - <span>Total requests:</span>{' '}
                <b>
                  <TextFormat
                    value={metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count}
                    type="number"
                    format={APP_WHOLE_NUMBER_FORMAT}
                  />
                </b>
              </p>
              <Table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Count</th>
                    <th className="text-right">Mean</th>
                    <th className="text-right">
                      <span>Average</span> (1 min)
                    </th>
                    <th className="text-right">
                      <span>Average</span> (5 min)
                    </th>
                    <th className="text-right">
                      <span>Average</span> (15 min)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr key={0}>
                    <td>OK</td>
                    <td>
                      <Progress
                        min="0"
                        max={metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count}
                        value={metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.ok'].count}
                        color="success"
                        animated
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.ok'].mean_rate)}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.ok'].m1_rate)}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.ok'].m5_rate)}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.ok'].m15_rate)}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                  </tr>
                  <tr key={1}>
                    <td>Not Found</td>
                    <td>
                      <Progress
                        min="0"
                        max={metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count}
                        value={metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.notFound'].count}
                        color="success"
                        animated
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(
                          metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.notFound'].mean_rate
                        )}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(
                          metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.notFound'].m1_rate
                        )}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(
                          metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.notFound'].m5_rate
                        )}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(
                          metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.notFound'].m15_rate
                        )}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                  </tr>
                  <tr key={2}>
                    <td>Server Error</td>
                    <td>
                      <Progress
                        min="0"
                        max={metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count}
                        value={metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.serverError'].count}
                        color="success"
                        animated
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(
                          metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.serverError'].mean_rate
                        )}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(
                          metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.serverError'].m1_rate
                        )}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(
                          metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.serverError'].m5_rate
                        )}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(
                          metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.serverError'].m15_rate
                        )}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        ) : (
          ''
        )}
        {servicesStats ? (
          <Row>
            <Col sm="12">
              <h3>Services statistics (time in millisecond)</h3>
            </Col>
            <Table>
              <thead>
                <tr>
                  <th>Service name</th>
                  <th>Count</th>
                  <th>Mean</th>
                  <th>Min</th>
                  <th>p50</th>
                  <th>p75</th>
                  <th>p95</th>
                  <th>p99</th>
                  <th>Max</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(servicesStats).map((key, index) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{servicesStats[key].count}</td>
                    <td>
                      <TextFormat value={servicesStats[key].mean * 1024} type="number" format={APP_WHOLE_NUMBER_FORMAT} />
                    </td>
                    <td>
                      <TextFormat value={servicesStats[key].min * 1024} type="number" format={APP_WHOLE_NUMBER_FORMAT} />
                    </td>
                    <td>
                      <TextFormat value={servicesStats[key].p50 * 1024} type="number" format={APP_WHOLE_NUMBER_FORMAT} />
                    </td>
                    <td>
                      <TextFormat value={servicesStats[key].p75 * 1024} type="number" format={APP_WHOLE_NUMBER_FORMAT} />
                    </td>
                    <td>
                      <TextFormat value={servicesStats[key].p95 * 1024} type="number" format={APP_WHOLE_NUMBER_FORMAT} />
                    </td>
                    <td>
                      <TextFormat value={servicesStats[key].p99 * 1024} type="number" format={APP_WHOLE_NUMBER_FORMAT} />
                    </td>
                    <td>
                      <TextFormat value={servicesStats[key].max * 1024} type="number" format={APP_WHOLE_NUMBER_FORMAT} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Row>
        ) : (
          ''
        )}

        {cachesStats ? (
          <Row>
            <Col sm="12">
              <h3>Ehcache statistics</h3>
              <Table>
                <thead>
                  <tr>
                    <th>Cache Name</th>
                    <th>Object</th>
                    <th>Misses</th>
                    <th>Eviction Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(cachesStats).map((k, v) => (
                    <tr key={k}>
                      <td>{k}</td>
                      <td>{metrics.gauges[`${k}.objects`].value}</td>
                      <td>{metrics.gauges[`${k}.hits`].value}</td>
                      <td>{metrics.gauges[`${k}.misses`].value}</td>
                      <td>{metrics.gauges[`${k}.eviction-count`].value}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        ) : (
          ''
        )}

        {metrics.gauges &&
        metrics.gauges['HikariPool-1.pool.TotalConnections'] &&
        metrics.gauges['HikariPool-1.pool.TotalConnections'].value > 0 ? (
          <Row>
            <Col sm="12">
              <h3>DataSource statistics (time in millisecond)</h3>
              <Table>
                <thead>
                  <tr>
                    <th>
                      <span>Usage</span>
                      ({metrics.gauges['HikariPool-1.pool.ActiveConnections'].value} /{' '}
                      {metrics.gauges['HikariPool-1.pool.TotalConnections'].value})
                    </th>
                    <th className="text-right">Count</th>
                    <th className="text-right">Mean</th>
                    <th className="text-right">Min</th>
                    <th className="text-right">p50</th>
                    <th className="text-right">p75</th>
                    <th className="text-right">p95</th>
                    <th className="text-right">p99</th>
                    <th className="text-right">Max</th>
                  </tr>
                </thead>
                <tbody>
                  <tr key="DB">
                    <td>
                      <Progress
                        min="0"
                        max={metrics.gauges['HikariPool-1.pool.TotalConnections'].value}
                        value={metrics.gauges['HikariPool-1.pool.ActiveConnections'].value}
                      >
                        <span>
                          <TextFormat
                            value={
                              metrics.gauges['HikariPool-1.pool.ActiveConnections'].value *
                              100 /
                              metrics.gauges['HikariPool-1.pool.TotalConnections'].value
                            }
                            type="number"
                            format={APP_WHOLE_NUMBER_FORMAT}
                          />
                          %
                        </span>
                      </Progress>
                    </td>
                    <td className="text-right">{metrics.histograms['HikariPool-1.pool.Usage'].count}</td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(metrics.histograms['HikariPool-1.pool.Usage'].mean)}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(metrics.histograms['HikariPool-1.pool.Usage'].min)}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(metrics.histograms['HikariPool-1.pool.Usage'].p50)}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(metrics.histograms['HikariPool-1.pool.Usage'].p75)}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(metrics.histograms['HikariPool-1.pool.Usage'].p95)}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(metrics.histograms['HikariPool-1.pool.Usage'].p99)}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                    <td className="text-right">
                      <TextFormat
                        value={this.filterNaN(metrics.histograms['HikariPool-1.pool.Usage'].max)}
                        type="number"
                        format={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        ) : (
          ''
        )}

        {this.renderModal()}
      </div>
    );
  }
}

const mapStateToProps = storeState => ({
  metrics: storeState.administration.metrics,
  isFetching: storeState.administration.isFetching,
  threadDump: storeState.administration.threadDump
});

const mapDispatchToProps = { systemMetrics, systemThreadDump };

export default connect(mapStateToProps, mapDispatchToProps)(MetricsPage);
