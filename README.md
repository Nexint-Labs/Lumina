# Lumina

Lightweight Node.js Framework

## What is Lumina?

Lumina is a source-available Node.js framework for developing, hosting and managing modular applications.

We offer several ways for developers to integrate their applications into Lumina without having to implement their own application lifecycle, module loader, logging system or console interface.

Lumina is designed to be flexible and is not restricted to any particular application type or external library. Developers can use Lumina to host REST APIs, Discord bots, WebSocket clients and servers, background services, or other Node.js applications.

## Features

- Modular application architecture.
- Automatic and recursive module discovery.
- Application lifecycle management.
- Graceful shutdown, restarting and reloading.
- Configurable error handling policies.
- Integrated logging utilities.
- Extensible console commands.
- Environment variable and configuration management.
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

Node.js 24 or later is recommended. Earlier versions may work but have not been tested.

### Security

Lumina executes discovered modules within the host Node.js process. Applications, plugins, preloads and console commands are not sandboxed.

Only install and execute modules from trusted sources. Developers are responsible for securing their applications, dependencies, credentials and deployment environments.

## Getting Started

Install the required dependencies:

```sh
npm install
```

Create and configure your `.env` file, and review the framework configuration under `config/core/`.

To start Lumina:

```sh
npm start
```

## Integrating with Lumina

Lumina offers four primary integration mechanisms: applications, plugins, preloads and console commands.

### 1. Applications

The `apps/` directory contains applications managed by Lumina.

Applications can expose lifecycle methods that Lumina invokes during startup, reloading and shutdown.

Create a file under `apps/`, such as `apps/example.js`:

```js
const { log } = require("#functions/core/log.mjs");

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
| `reload()` | Executes application-specific reload logic. |
| `close()` | Releases resources and shuts down the application. |

Developers are responsible for implementing the behaviour of each lifecycle method. For example, a web server should stop accepting connections and close its server instance when `close()` is called.

Lumina awaits asynchronous lifecycle methods before proceeding with the corresponding lifecycle operation.

### 2. Plugins

The `plugins/` directory allows developers to extend Lumina with additional functionality.

Plugins can be used to initialize services, register handlers, prepare application logic or perform other startup operations.

Create a file under `plugins/`:

```js
const { log } = require("#functions/core/log.mjs");

module.exports = {
    async execute() {
        log.info("Plugin successfully loaded.");
    }
};
```

Plugins are loaded recursively, allowing developers to organize their plugins into separate categories and subdirectories.

Plugins are loaded before applications.

### 3. Preloads

The `preload/` directory contains modules that must be initialized before plugins and applications.

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

Lumina initializes preloads before proceeding to plugins and applications.

### 4. Console Commands

Developers can extend Lumina's console interface by creating modules under `console/`.

Each console command exposes a `command()` method that receives the input entered into the console.

```js
const { log } = require("#functions/core/log.mjs");

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

```text
Lumina/
├── apps/
├── appHelpers/
├── config/
│   └── core/
├── console/
├── databases/
├── functions/
│   └── core/
├── logs/
├── plugins/
├── preload/
├── test/
├── .env
├── boot.js
├── index.js
└── package.json
```

| Directory | Purpose |
|---|---|
| `apps/` | Managed applications and services. |
| `appHelpers/` | Application-specific helper modules. |
| `config/` | Framework and application configuration. |
| `console/` | Custom console commands. |
| `databases/` | Database-related files. |
| `functions/` | Shared functions and utilities. |
| `logs/` | Application and framework logs. |
| `plugins/` | Extensible application functionality. |
| `preload/` | Early initialization modules. |
| `test/` | Automated tests. |

## Initialization Order

Lumina initializes its components in the following order:

1. Framework bootstrap and configuration.
2. Environment and directory preparation.
3. Preload initialization.
4. Plugin initialization.
5. Application initialization.
6. Console interface and periodic update checking, when enabled.

Modules within the same directory should not assume a particular loading order. Explicit dependencies should be imported directly where necessary.

## Module Discovery

Lumina recursively discovers JavaScript modules with the following extensions:

- `.js`
- `.cjs`
- `.mjs`

CommonJS modules can expose their integration methods through `module.exports`.

ECMAScript modules may also be used, provided they are compatible with the Node.js runtime's synchronous `require()` support.

Modules intended for automatic startup must expose an `execute()` method and must not expose a `data` property.

## Import Aliases

Lumina provides import aliases to simplify accessing shared resources without long relative paths.

```js
const { log } = require("#functions/core/log.mjs");
const config = require("#config/core/core");
```

Available aliases include:

| Alias | Directory |
|---|---|
| `#config/*` | `config/` |
| `#functions/*` | `functions/` |
| `#preload/*` | `preload/` |
| `#console/*` | `console/` |
| `#apps/*` | `apps/` |
| `#appHelpers/*` | `appHelpers/` |

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