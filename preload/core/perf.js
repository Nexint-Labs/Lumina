const { log } = require("#functions/core/log.mjs");
const { monitorEventLoopDelay, performance } = require("node:perf_hooks");
const delay = require("#functions/core/delay");
const { cpuUsage } = require("node:process");
const { center, bar } = require("#functions/core/gradient");

const histogram = monitorEventLoopDelay({
    resolution: 10
});

histogram.enable();

/**
 * CPU Performance of current process
 * @param {boolean} [quiet=true] Suppress console logging.
 * @returns {Promise<number>} CPU utilization percentage.
 */
const cpuPerf = async function (quiet = true) {
    const startCPU = cpuUsage();
    const startTime = performance.now();

    await delay(100);

    const usage = cpuUsage(startCPU);
    const elapsed = (performance.now() - startTime) * 1000;

    const cpu = (usage.user + usage.system) / elapsed * 100;

    if (!quiet) {
        log.info(center(`CPU Usage: ${cpu.toFixed(2)}%`));
        log.info(center(bar(cpu)));
    }
    return cpu
}

/**
 * Memory Performance of current process
 * @param {boolean} [quiet=true] Suppress console logging.
 * @returns {Promise<NodeJS.MemoryUsage>}
 */
const memPerf = async function (quiet = true) {
    const memory = process.memoryUsage();
    const toMiB = bytes => (bytes / 1024 ** 2).toFixed(2);

    const heap = memory.heapUsed / memory.heapTotal * 100;

    if (!quiet) {
        log.info(center(`RSS: ${toMiB(memory.rss)} MiB`));
        log.info(center(`Heap: ${toMiB(memory.heapUsed)} MiB / ${toMiB(memory.heapTotal)} MiB`));
        log.info(center(bar(heap)));
        log.info(center(`External: ${toMiB(memory.external)} MiB`));
        log.info(center(`Array Buffers: ${toMiB(memory.arrayBuffers)} MiB`));
    }

    return memory
}

/**
 * Event performance
 * @param {boolean} [quiet=true] Suppress console logging.
 * @returns {Promise<{
 *     mean: number,
 *     p50: number,
 *     p95: number,
 *     p99: number,
 *     max: number,
 *     utilization: number
 * }>}
 */
const eventPerf = async function (quiet = true) {
    const toMs = ns => (ns / 1e6).toFixed(3);
    const elu = performance.eventLoopUtilization();

    if (!quiet) {
        log.info(center(`Mean: ${toMs(histogram.mean)} ms`));
        log.info(center(`P50: ${toMs(histogram.percentile(50))} ms`));
        log.info(center(`P95: ${toMs(histogram.percentile(95))} ms`));
        log.info(center(`P99: ${toMs(histogram.percentile(99))} ms`));
        log.info(center(`Max: ${toMs(histogram.max)} ms`));
        log.info(center(`Utilization: ${(elu.utilization * 100).toFixed(2)}%`));
        log.info(center(bar(elu.utilization * 100)));
    }
    return {
        mean: histogram.mean / 1e6,
        p50: histogram.percentile(50) / 1e6,
        p95: histogram.percentile(95) / 1e6,
        p99: histogram.percentile(99) / 1e6,
        max: histogram.max / 1e6,
        utilization: elu.utilization
    }
}

module.exports = {
    cpuPerf,
    memPerf,
    eventPerf,
    persist: true
};