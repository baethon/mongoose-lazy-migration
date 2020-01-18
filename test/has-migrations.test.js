import test from 'ava';
import mongoose from 'mongoose';
import SchemaNumber from 'mongoose/lib/schema/number';
import {withMigrations, migration as m} from '../src';

const {Schema} = mongoose;
let User;

test.before(async () => {
	await mongoose.connect(process.env.MONGO_CONNECTION_STRING, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});

	const userSchema = new Schema({
		fullname: String,
		updates: {
			type: Number,
			default: 0
		}
	});

	const migrations = [
		m(1, user => ({
			...user,
			fullname: `${user.firstname} ${user.lastname}`,
			updates: user.updates + 1
		})),
		m(2, user => ({
			_id: user._id,
			fullname: user.fullname,
			updates: user.updates + 1
		}))
	];

	User = mongoose.model('User', withMigrations(userSchema, migrations));
});

test.after.always(() => {
	User.deleteMany({});
});

test('it extends schema', t => {
	const schemaVersion = User.schema.path('schemaVersion');

	t.true(schemaVersion instanceof SchemaNumber);
	t.is(2, schemaVersion.defaultValue);
	t.true(schemaVersion._index);
});

test('it extends schema | disabled index', t => {
	const schema = withMigrations(
		new Schema({}),
		[
			m(1, data => data)
		],
		{
			index: false
		}
	);

	t.false(schema.path('schemaVersion')._index);
});

test('it migrates document without any version', async t => {
	const {insertedId} = await User.collection.insertOne({
		firstname: 'Jon',
		lastname: 'Snow',
		updates: 0,
		schemaVersion: 0
	});

	const document = await User.findOne({_id: insertedId});

	t.is('Jon Snow', document.fullname);
	t.is(2, document.schemaVersion);
	t.is(2, document.updates);
});

test('it applies only missing migration', async t => {
	const {insertedId} = await User.collection.insertOne({
		firstname: 'Jon',
		lastname: 'Snow',
		fullname: 'Jon Snow',
		schemaVersion: 1,
		updates: 0
	});

	const document = await User.findOne({_id: insertedId});

	t.is(2, document.schemaVersion);
	t.is(1, document.updates);
});

test('it makes no update to most recent version', async t => {
	const {_id: insertedId} = await User.create({
		fullname: 'Jon Snow'
	});

	const document = await User.findOne({_id: insertedId});

	t.is('Jon Snow', document.fullname);
	t.is(2, document.schemaVersion);
	t.is(0, document.updates);
});

test('it saves migrated data', async t => {
	const {insertedId} = await User.collection.insertOne({
		firstname: 'Jon',
		lastname: 'Snow',
		fullname: 'Jon Snow',
		schemaVersion: 1,
		updates: 0
	});

	const document = await User.findOne({_id: insertedId});
	await document.save();

	const check = await User.findOne({_id: insertedId});

	t.is(2, check.schemaVersion);
	t.is(1, check.updates);
});
