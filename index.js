#!/usr/bin/env node
"use strict";
const fs = require('fs');
const chalk = require('chalk');
const child = require('child_process');
const { PerformanceObserver, performance } = require('perf_hooks');
const fork = child.fork;

const defaults = {dir: './cases'};
const dir = process.argv[2] || defaults.dir;

const tests = ["[2, 1, 15, 15],9"];

fs.readdir(dir, (err, files) => {
	if(err)
		throw err;
	const times = 10000;

	files = files.filter(file => file.endsWith('.js'));
	console.log(process.release)
	console.log('testing: ', files)

	let count = 0;
	const limit = times * files.length;
	const scores = [];
	let i = files.length;
	while(i--) {
		const file = files[i];
		const fc = fork('runner.js', [dir + '/' + file, i])
		fc.on('message', raw => {
			const data = raw.data;
			switch(raw.type) {
				case 'time':
					// console.log(data);
				break;
				case 'score':
					scores[data.id] = data;
					console.log(chalk.bgBlue('path :', data.path), data.id);
					console.log('total:', data.total);
					console.log('avg  :', data.avg);
					console.log('times:', data.times);
					fc.send('process.exit()')
					if(++count === files.length)
						display_scores(scores)
			}
		});
		tests.forEach(test => {
			fc.send('run(' + times + ',' + test + ')')
		});
	}
})

function display_scores(scores) {
	scores.sort(function(a,b) {return a.avg-b.avg})
	console.log(chalk.red('loser is:'),chalk.bgRed(scores.pop().path));
	console.log(chalk.green('The winner is:'),chalk.bgGreen(scores.shift().path));
}

