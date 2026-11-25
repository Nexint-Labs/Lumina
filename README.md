# Lumina

Lightweight Node.js Framework

## What is Lumina?

Lumina is a source-available Node.js framework for developing, hosting and managing modular applications.

We offer several ways for developers to integrate their applications into Lumina without having to implement their own application lifecycle, module loader, logging system or console interface.

Lumina is designed to be flexible and is not restricted to any particular application type or external library. Developers can use Lumina to host REST APIs, Discord bots, WebSocket clients and servers, background services, or other Node.js applications.

## Features

- Zero external runtime dependencies.
- Modular application architecture.
- Automatic and recursive module discovery.
- Application lifecycle management.
- Graceful shutdown, restarting and reloading.
- Selective module cache persistence.
- Configurable error handling policies.
- Integrated logging utilities.
- Extensible console commands.
- Environment variable and configuration management.
- Framework configuration defaults with application-specific overrides.
- Support for CommonJS and compatible ECMAScript modules.

## Deployments

Lumina is currently deployed on multiple Discord bots!

- Miku#0100 (Discord Bot)
- Teto#4311 (Discord Bot)
- Neru#7016 (Discord Bot)
- NexAPI Manager#4213 (API Management)
- Prism#8911 (Development Bot)

Additionally, Lumina powers both the production and development environments of the Nexint API.

- api.nexint.org (Production API)
- dev.nexint.org (Development version of Nexint API)

Finally, Lumina also powers the Nexint Sonolus Server, used by thousands of people!

- sono.nexint.ca (Sonolus Server)

## Disclosures

The vast majority of code in this project is my own, however AI assisted with pen-testing this program.

This readme was primarily generated with AI.

Node.js 24 or later is recommended. Some features may require newer versions of Node.js. Earlier versions have not been tested.

### Security

Lumina executes discovered modules within the host Node.js process. Applications, plugins, preloads and console commands are not sandboxed.

Only install and execute modules from trusted sources. Developers are responsible for securing their applications, dependencies, credentials and deployment environments.

## Getting Started

Install the package from npm:

```sh
npm install @nexint/lumina
```

Alternatively, install the latest development release:

```sh
npm install @nexint/lumina@dev
```

Create your start file (for this example, it's `index.js`):

```js
require("@nexint/lumina");
```

To start Lumina:

```sh
node index.js
```

Lumina automatically creates the required application directories upon startup. Application files and configuration are resolved relative to the current working directory.

## Integrating with Lumina

Lumina offers four primary integration mechanisms: applications, plugins, preloads and console commands.

### 1. Applications

The `apps/` directory contains applications managed by Lumina.

Applications can expose lifecycle methods that Lumina invokes during startup, reloading and shutdown.

Create a file under `apps/`, such as `apps/example.js`:

```js
const { log } = require("@nexint/lumina/core/log.mjs");

module.exports = {
    async execute() {
        log.info("Application started.");
    },

    async reload() {
        log.info("Application reloaded.");
    },

    async close() {
        log.info("Application closed.");
    }
};
```

The following lifecycle methods are supported:

| Method | Description |
|---|---|
| `execute()` | Initializes the application. |
| `reload()` | Executes application-specific refresh logic. |
| `close()` | Releases resources and shuts down the application. |

Developers are responsible for implementing the behaviour of each lifecycle method. For example, a web server should stop accepting connections and close its server instance when `close()` is called.

Lumina awaits asynchronous lifecycle methods before proceeding with the corresponding lifecycle operation.

### 2. Plugins

The `plugins/` directory allows developers to extend Lumina with additional functionality.

Plugins can be used to initialize services, register handlers, prepare application logic or perform other startup operations.

Create a file under `plugins/`:

```js
const { log } = require("@nexint/lumina/core/log.mjs");

module.exports = {
    async execute() {
        log.info("Plugin successfully loaded.");
    }
};
```

Plugins are loaded recursively, allowing developers to organize their plugins into separate categories and subdirectories.

Plugins are loaded before applications.

### 3. Preloads

The `preload/` directory contains modules that must be initialized before application plugins and applications.

Preloads are particularly useful for:

- Initializing database connections.
- Preparing shared resources.
- Validating configuration.
- Initializing shared services.
- Performing startup checks.

Create a file under `preload/`:

```js
module.exports = {
    async execute() {
        // Initialize shared resources here.
    }
};
```

Preloads remain initialized during normal refresh and reload operations and are closed during shutdown.

### 4. Console Commands

Developers can extend Lumina's console interface by creating modules under `console/`.

Each console command exposes a `command()` method that receives the input entered into the console.

```js
const { log } = require("@nexint/lumina/core/log.mjs");

module.exports = {
    async command(input) {
        if (input !== "hello") return false;

        log.info("Hello from Lumina!");
        return true;
    },

    async help() {
        return ["hello - Displays a greeting."];
    }
};
```

The `command()` method should return `true` if the command was handled, or `false` if the input does not match the command.

The optional `help()` method provides information about the available command.

## Directory Structure

Lumina separates application logic from framework functionality.

A typical application using Lumina may have the following directory structure:

```text
Application/
├── apps/
├── appHelpers/
├── config/
│   └── core/
├── console/
├── databases/
├── functions/
├── logs/
├── plugins/
├── preload/
├── test/
├── node_modules/
├── .env
├── index.js
└── package.json
```

| Directory | Purpose |
|---|---|
| `apps/` | Managed applications and services. |
| `appHelpers/` | Application-specific helper modules. |
| `config/` | Application configuration and framework configuration overrides. |
| `console/` | Custom console commands. |
| `databases/` | Database-related files. |
| `functions/` | Shared functions and utilities. |
| `logs/` | Application and framework logs. |
| `plugins/` | Extensible application functionality. |
| `preload/` | Early initialization modules. |
| `test/` | Automated tests. |

## Initialization Order

Lumina initializes its components in the following order:

1. Framework bootstrap, environment and configuration loading.
2. Directory preparation.
3. Framework preload initialization.
4. Framework plugin initialization.
5. Application preload initialization.
6. Application plugin initialization.
7. Application initialization.
8. Initial update checking, console interface and periodic update checking, when enabled.

When running Lumina as a standalone framework, framework and application directories are treated as the same directories and are not initialized twice.

Modules within the same directory should not assume a particular loading order. Explicit dependencies should be imported directly where necessary.

## Module Discovery

Lumina recursively discovers JavaScript modules with the following extensions:

- `.js`
- `.cjs`
- `.mjs`

CommonJS modules can expose their integration methods through `module.exports`.

ECMAScript modules may also be used, provided they are compatible with the Node.js runtime's synchronous `require()` support.

Modules intended for automatic startup must expose an `execute()` method and must not expose a `data` property.

### Module Persistence

Modules can opt out of Lumina's cache invalidation mechanism by exporting `persist: true`.

```js
module.exports = {
    persist: true
};
```

This is particularly useful for stateful utilities, lifecycle controllers and other modules that must retain their identity throughout the process lifetime.

Persistent modules are not removed from the CommonJS module cache during Lumina's refresh and reload operations.

Persistence does not prevent lifecycle methods from being invoked, nor does it automatically preserve the caches of a module's dependencies. Existing references to those dependencies may also remain unchanged.

A full process restart is required to reliably update persistent modules.

### Refreshing and Reloading

Lumina provides several built-in console commands for managing application lifecycles.

| Command | Description |
|---|---|
| `/refresh` | Clears selected module caches and invokes application `refresh()` methods. |
| `/reload` | Closes applications and plugins, clears selected module caches and initializes them again. |
| `/restart` | Shuts down the current instance and launches the configured restart command. |
| `/stop` | Shuts down the current instance. |

Refresh and reload operations may also invalidate framework module caches, allowing developers to work on Lumina itself.

Refreshing and reloading are experimental features. Existing module references may remain unchanged, and ECMAScript modules cannot be reliably reloaded through CommonJS cache invalidation.

A full restart is recommended when updating the framework, persistent modules or ECMAScript modules.

## Configuration

Lumina provides default framework configuration files. Applications may override these defaults by creating corresponding files under their own `config/` directory.

Configuration should be accessed using the `getConfig()` utility:

```js
const { getConfig } = require("@nexint/lumina/core/getConfig");

const { verbose, devMode } = getConfig("core/core");
```

The following built-in configurations are available:

| Configuration | Purpose |
|---|---|
| `core/core` | Framework behaviour and error handling. |
| `core/log` | Logging configuration. |
| `cosmetic/config` | Application name and version information. |

For example, an application may create `config/core/core.js`:

```js
module.exports = {
    verbose: true,
    autoUpdate: false
};
```

Lumina merges these values with the default framework configuration. Applications do not need to copy the entire framework configuration.

Configuration merging is shallow. Overriding a nested object replaces that object rather than merging its individual properties.

The `getConfig()` utility also supports arbitrary application-specific configuration files:

```js
const config = getConfig("example/settings");
```

Built-in configurations provide JSDoc type information for compatible editors. Application-specific configurations are dynamically resolved and are not automatically typed.

If neither a framework configuration nor an application configuration exists for the requested path, an empty object is returned.

Framework metadata can be accessed separately:

```js
const {
    frameName,
    frameVer,
    frameID
} = require("@nexint/lumina/framework");
```

## Import Aliases

Lumina uses import aliases internally to simplify accessing shared resources without long relative paths.

Applications consuming Lumina through npm can directly access its exported modules:

```js
const { log } = require("@nexint/lumina/core/log.mjs");
const { getConfig } = require("@nexint/lumina/core/getConfig");
```

Applications may also define their own import aliases in their `package.json`:

```json
{
    "imports": {
        "#config/*": "./config/*.js",
        "#functions/core/*.mjs": "@nexint/lumina/core/*.mjs",
        "#functions/core/*": "@nexint/lumina/core/*",
        "#functions/*": "./functions/*.js",
        "#preload/*": "./preload/*.js",
        "#console/*": "./console/*.js",
        "#apps/*": "./apps/*.js",
        "#appHelpers/*": "./appHelpers/*.js"
    }
}
```

This allows applications to use shorter imports:

```js
const { log } = require("#functions/core/log.mjs");
const { getConfig } = require("#functions/core/getConfig");
```

Import aliases are scoped to the package that defines them. Lumina's internal aliases are not automatically inherited by consuming applications.

## Error Handling

Lumina provides configurable error handling policies through its core configuration.

| Policy | Behaviour |
|---|---|
| `warn` | Logs the error and attempts to continue. |
| `continue` | Suppresses the affected framework error and attempts to continue. |
| `shutdown` | Initiates framework shutdown for errors where this policy applies. |

Developers should still implement appropriate application-specific error handling.

## Extending Lumina

Lumina is designed to serve as the foundation of an application rather than dictate how an application must be built.

Developers are free to integrate external libraries such as Express, Discord.js, Sequelize and WebSocket libraries into their applications.

Lumina manages initialization and lifecycle coordination, while developers retain control over their application logic, dependencies and architecture.

Multiple applications can operate within the same Lumina instance, allowing developers to share configuration, utilities and services across their projects.

## Licensing

Lumina is source-available software developed by Nexint Labs.

Usage, modification and distribution are subject to the terms provided in the accompanying `LICENSE` file.