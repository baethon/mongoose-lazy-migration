# 🖤💛 mongoose-lazy-migration [![Build Status](https://travis-ci.org/baethon/mongoose-lazy-migration.svg?branch=master)](https://travis-ci.org/baethon/mongoose-lazy-migration)

Migrates on-fly fetched Mongoose documents.

## Installation

```
npm i @baethon/mongoose-lazy-migration
```

## Usage

Define model schema:

```js
const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
    fullname: String
})
```

Wrap it with `withMigrations()` helper:

```js
const { withMigrations, migration: m } = require('@baethon/mongoose-lazy-migration')

const migrations = [
    m(1, (user) => ({
        fullname: `${user.firstname} ${user.lastname}`
    }))
]

const User = mongoose.model('User', withMigrations(userSchema, migrations))
```

Use `User` model as always.

## Under the hood

### Migrations

The `migrations` array contains list of objects that contain:

- schema version number

- migration callback that is applied to the document

`m()` is a convenience wrapper.

Schema versioning is not opinionated (it can be consecutive numbers, or date of writing), however, it's required to use an integer value.

Migration callback should be a pure function. Due to the structure of Mongoose hooks, the migration callback **has to be synchronous**.

### Schema

The `withMigrations()` function appends `schemaVersion` property to the model. It defines the _latest_ schema version used at the time of saving. The _latest_ version is taken from the last element of the `migrations` array.

By default `schemaVersion` is indexed. This, can be disabled by setting the `index: false` option.

```js
const User = mongoose.model('User', withMigrations(userSchema, migrations, { index: false }))
```

### Runtime

Whenever a document is fetched the library will compare its `schemaVersion` with the _latest_ schema version.

On mismatch it will apply the migration callbacks in following way:

- when `schemaVersion === NULL`:
  
  - apply all of the migration callbacks

- otherwise:
  
  - determine the index of the `schemaVersion` in the `migrations` array
  
  - apply following migration callbacks

- update the `schemaVersion` property

The document **is not saved** after the migration.

## Testing

The package provides both unit tests and integration tests. The test suite requires access to MongoDB instance (see `ava.config.js`).

You can use `docker-compose` to setup local instance:

```
docker-compose up -d
```

To run the tests use:

```
yarn test
```
