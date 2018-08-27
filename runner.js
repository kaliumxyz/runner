func_path = process.argv[2];
id = process.argv[3];
func = require(process.argv[2]);
const { PerformanceObserver, performance } = require('perf_hooks');
let t0;
let t1;

function run(i = 1, args) {
	const scores = {path: func_path, total: 0, avg: 0, times: i, id: id};
	while(i--) {
		t0 = performance.now();
		func(args)
		t1 = performance.now();
		process.send({type: 'time', data: t1 - t0})
		scores.total += t1 - t0;
	}
	scores.avg = (scores.total / scores.times);
	process.send({type: 'score', data: scores})
}

process.on('message', x => eval(x));
