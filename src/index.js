const assert = require('assert');
const {mutate} = require('@baethon/pure-mutation');

const migration = (number, migrationFn) => {
	assert.ok(typeof number === 'number');
	assert.ok(migrationFn instanceof Function);

	return {version: number, migration: migrationFn};
};

const applyPendingMigrations = migrations => document => {
	const {schemaVersion} = document;

	return migrations.reduce(
		(newDoc, {version, migration}) => {
			return (!schemaVersion || schemaVersion < version) ?
				migration(newDoc) :
				newDoc;
		},
		document
	);
};

const hasMigrations = (schema, options) => {
	const {
		migrations = [],
		index = true
	} = options;

	const [{version: latestVersion}] = migrations.slice(-1);

	schema.add({
		schemaVersion: {
			type: Number,
			default: latestVersion,
			index
		}
	});

	schema.pre('init', document => {
		mutate(document, applyPendingMigrations(migrations));
	});

	return schema;
};

module.exports = {migration, hasMigrations};
