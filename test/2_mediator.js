// deps

    // natives
    const { join } = require("node:path");
    const { mkdir, mkdtemp, readFile, rm, writeFile } = require("node:fs/promises");
    const { tmpdir } = require("node:os");
    const { deepStrictEqual, rejects, strictEqual } = require("node:assert");

    // externals
    const robotjs = require("@hurdlegroup/robotjs");

    // locals
    const Mediator = require("../lib/cjs/Mediator.js").default;

// consts

    const DESCRIPTOR_FILE = join(__dirname, "..", "lib", "data", "Descriptor.json");
    const DIST_DIR = join(__dirname, "..", "public", "dist");
    const BUNDLE_FILE = join(DIST_DIR, "bundle.min.js");
    const MAP_FILE = join(DIST_DIR, "bundle.min.js.map");
    const MAX_TIMEOUT = 10000;

    const originalTypeString = robotjs.typeString.bind(robotjs);
    const originalKeyTap = robotjs.keyTap.bind(robotjs);

// tests

describe("mediator", () => {

    let descriptor = null;
    let resourcesDir = "";
    let mediator = null;
    let typeStringCalls = [];
    let keyTapCalls = [];

    before(() => {

        return readFile(DESCRIPTOR_FILE, "utf-8").then((content) => {

            descriptor = JSON.parse(content);

            return mkdtemp(join(tmpdir(), "mia-inputs-"));

        }).then((created) => {

            resourcesDir = created;

            return mkdir(DIST_DIR, {
                "recursive": true
            });

        }).then(() => {

            return writeFile(BUNDLE_FILE, "{{plugin.name}}|{{plugin.version}}|{{plugin.description}}", "utf-8");

        }).then(() => {

            return writeFile(MAP_FILE, "sourcemap", "utf-8");

        });

    });

    beforeEach(() => {

        typeStringCalls = [];
        keyTapCalls = [];

        robotjs.typeString = function typeString (value) {

            typeStringCalls.push(value);

            return true;

        };

        robotjs.keyTap = function keyTap (key, modifiers) {

            keyTapCalls.push({
                "key": key,
                "modifiers": modifiers
            });

            return true;

        };

        mediator = new Mediator({
            "descriptor": descriptor,
            "externalResourcesDirectory": resourcesDir
        });

    });

    afterEach(() => {

        robotjs.typeString = originalTypeString;
        robotjs.keyTap = originalKeyTap;

    });

    after(() => {

        robotjs.typeString = originalTypeString;
        robotjs.keyTap = originalKeyTap;

        return Promise.all([
            rm(resourcesDir, {
                "force": true,
                "recursive": true
            }),
            rm(BUNDLE_FILE, {
                "force": true
            }),
            rm(MAP_FILE, {
                "force": true
            })
        ]);

    });

    it("should init and release workspace", () => {

        return mediator._initWorkSpace().then(() => {

            return mediator._releaseWorkSpace();

        });

    }).timeout(MAX_TIMEOUT);

    it("should replace plugin placeholders in front index", () => {

        return mediator.getFrontIndex().then((content) => {

            strictEqual(content.includes(descriptor.info.title), true);
            strictEqual(content.includes("{{plugin.name}}"), false);

        });

    }).timeout(MAX_TIMEOUT);

    it("should replace plugin placeholders in front app", () => {

        return mediator.getFrontApp().then((content) => {

            strictEqual(content, descriptor.info.title + "|" + descriptor.info.version + "|" + descriptor.info.description);

        });

    }).timeout(MAX_TIMEOUT);

    it("should return front app sourcemap", () => {

        return mediator.getFrontAppMap().then((content) => {

            strictEqual(content, "sourcemap");

        });

    }).timeout(MAX_TIMEOUT);

    it("should type a string without enter", () => {

        return mediator.inputString({}, {
            "string": "hello"
        }).then(() => {

            deepStrictEqual(typeStringCalls, [ "hello" ]);
            deepStrictEqual(keyTapCalls, []);

        });

    }).timeout(MAX_TIMEOUT);

    it("should type a string and skip enter when false", () => {

        return mediator.inputString({}, {
            "enter": false,
            "string": "hello"
        }).then(() => {

            deepStrictEqual(typeStringCalls, [ "hello" ]);
            deepStrictEqual(keyTapCalls, []);

        });

    }).timeout(MAX_TIMEOUT);

    it("should type a string and tap enter", () => {

        return mediator.inputString({}, {
            "enter": true,
            "string": "hello"
        }).then(() => {

            deepStrictEqual(typeStringCalls, [ "hello" ]);
            strictEqual(1 === keyTapCalls.length, true);
            strictEqual(keyTapCalls[0].key, "enter");

        });

    }).timeout(MAX_TIMEOUT);

    it("should reject when typeString throws an Error", () => {

        robotjs.typeString = function typeString () {

            throw new Error("type failed");

        };

        return rejects(() => {

            return mediator.inputString({}, {
                "string": "hello"
            });

        }, {
            "message": "type failed"
        });

    }).timeout(MAX_TIMEOUT);

    it("should reject when typeString throws a non-Error", () => {

        robotjs.typeString = function typeString () {

            // eslint-disable-next-line no-throw-literal
            throw "type failed";

        };

        return rejects(() => {

            return mediator.inputString({}, {
                "string": "hello"
            });

        }, {
            "message": "type failed"
        });

    }).timeout(MAX_TIMEOUT);

    it("should tap a key without modifiers", () => {

        return mediator.inputKey({}, {
            "key": "a"
        }).then(() => {

            deepStrictEqual(keyTapCalls, [
                {
                    "key": "a",
                    "modifiers": []
                }
            ]);

        });

    }).timeout(MAX_TIMEOUT);

    it("should tap a key with all modifiers", () => {

        return mediator.inputKey({}, {
            "alt": true,
            "command": true,
            "ctrl": true,
            "key": "a",
            "shift": true
        }).then(() => {

            deepStrictEqual(keyTapCalls, [
                {
                    "key": "a",
                    "modifiers": [
                        "alt",
                        "control",
                        "shift",
                        "command"
                    ]
                }
            ]);

        });

    }).timeout(MAX_TIMEOUT);

    it("should skip modifiers when false", () => {

        return mediator.inputKey({}, {
            "alt": false,
            "command": false,
            "ctrl": false,
            "key": "escape",
            "shift": false
        }).then(() => {

            deepStrictEqual(keyTapCalls, [
                {
                    "key": "escape",
                    "modifiers": []
                }
            ]);

        });

    }).timeout(MAX_TIMEOUT);

    it("should reject when keyTap throws an Error", () => {

        robotjs.keyTap = function keyTap () {

            throw new Error("key failed");

        };

        return rejects(() => {

            return mediator.inputKey({}, {
                "key": "a"
            });

        }, {
            "message": "key failed"
        });

    }).timeout(MAX_TIMEOUT);

    it("should reject when keyTap throws a non-Error", () => {

        robotjs.keyTap = function keyTap () {

            // eslint-disable-next-line no-throw-literal
            throw "key failed";

        };

        return rejects(() => {

            return mediator.inputKey({}, {
                "key": "a"
            });

        }, {
            "message": "key failed"
        });

    }).timeout(MAX_TIMEOUT);

});
