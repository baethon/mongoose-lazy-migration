const assert = require('assert');

const migration = (number, migrationFn) => {
	assert.ok(typeof number === 'number');
	assert.ok(migrationFn instanceof Function);

	return {version: number, migration: migrationFn};
};

module.exports = {migration};
