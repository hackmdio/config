# @hackmd/config [![Build Status](https://travis-ci.org/hackmdio/config.svg?branch=master)](https://travis-ci.org/hackmdio/config)

This project is a configuration management tool for HackMD.

It inspired by [node-config](https://github.com/lorenwest/node-config).

## Introduction

@hackmd/config is a tool to manage mass configuration source, 
such as config file, environment, or docker secret.

We use config-provider to load difference config source. 
The config-provider is a plugin for @hackmd/config.

## How to use?

1. You must setup which config type and config loaded order in your `package.json`

```json

{
  "name": "example-project",
  "dependencies": {
    "@hackmd/config": "0.0.1-alpha.1"
  },
  "config": {
    "type": "./config/type.js",
    "reader": [
      "file:./config/default.js",
      "env:APP"
    ]
  }
}

```  

2. Define your config type

```js
module.exports = {
    host: String,
    port: Number,
    db: {
        host: String,
        port: String,
        user: String,
        pass: String,
    },
    allowHost: Array
}
```

3. initialize `@hackmd/config` before your program

```js
const config = require('@hackmd/config')

await config.buildAsync()

main();

```

4. in your program, you can use `require('@hackmd/config').getConfig()` to get your config object
