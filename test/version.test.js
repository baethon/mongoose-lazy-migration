import test from 'ava';
import {version} from '../src';

const stub = () => {};

test('it returns version object', t => {
	t.deepEqual(version(1, stub), {version: 1, migration: stub});
});

test('it ensures version is a number', t => {
	t.throws(() => {
		version('1', stub);
	});
});

test('it ensures migration is a function', t => {
	t.throws(() => {
		version(1, 1);
	});
});
