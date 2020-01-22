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
			index
		}
	});

	schema.post('init', document => {
		mutate(document._doc, applyPendingMigrations(migrations), {
			assign: (docRef, values) => {
				// Sync document with the input ref
				document.overwrite(values);
				Object.assign(docRef, values);
			},
			exclude: (docRef, keys) => {
				keys.forEach(name => {
					delete docRef[name];
				});
			}
		});

		document.set('schemaVersion', latestVersion);
	});

	schema.pre('save', function (next) {
		this.schemaVersion = latestVersion;
		next();
	});

	return schema;
};

module.exports = {migration, withMigrations};
