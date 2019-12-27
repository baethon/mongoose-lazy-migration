const assert = require('assert');

const version = (number, migration) => {
	assert.ok(typeof number === 'number');
	assert.ok(migration instanceof Function);

	return {version: number, migration};
};

module.exports = {version};
