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

const withMigrations = (schema, migrations, options = {}) => {
	const {
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

	schema.post('init', document => {
		mutate(document._doc, applyPendingMigrations(migrations), {
			assign: (_, values) => {
				document.set(values);
			},
			exclude: (_, keys) => {
				keys.forEach(name => {
					document.set(name, undefined);
				});
			}
		});

		document.set('schemaVersion', latestVersion);
	});

	return schema;
};

module.exports = {migration, withMigrations};
