import test from 'ava';
import {migration} from '../src';

const stub = () => {};

test('it returns version object', t => {
	t.deepEqual(migration(1, stub), {version: 1, migration: stub});
});

test('it ensures version is a number', t => {
	t.throws(() => {
		migration('1', stub);
	});
});

test('it ensures migration is a function', t => {
	t.throws(() => {
		migration(1, 1);
	});
});
