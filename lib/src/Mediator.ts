// deps

    // natives
    import { readFile } from "node:fs/promises";
    import { join } from "node:path";

    // externals
    import { Mediator } from "node-pluginsmanager-plugin";
    import robotjs from "@hurdlegroup/robotjs";

// types & interfaces

    // natives

    // externals
    import type ContainerPattern from "node-containerpattern";
    import type { iEventsMinimal } from "node-pluginsmanager-plugin";

    // locals
    import type { operations, components } from "./Descriptor";

// module

export default class MediatorInputs extends Mediator<iEventsMinimal & {
    "initialized": [ ContainerPattern ];
    "released": [ ContainerPattern ];
    "error": [ components["schemas"]["PushEventPluginError"]["data"] ];
}> {

    // constructor

    protected _initWorkSpace (): Promise<void> {

        // <init work space>

        return Promise.resolve();

    }

    protected _releaseWorkSpace (): Promise<void> {

        // <release work space>

        return Promise.resolve();

    }

    // front files

    public getFrontIndex (): Promise<operations["getFrontIndex"]["responses"]["200"]["content"]["text/html"]> {

        return readFile(join(__dirname, "..", "..", "public", "index.html"), "utf-8").then((content: string): string => {

            return content

                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription());

        });

    }

    public getFrontApp (): Promise<operations["getFrontApp"]["responses"]["200"]["content"]["application/javascript"]> {

        return readFile(join(__dirname, "..", "..", "public", "dist", "bundle.min.js"), "utf-8").then((content: string): string => {

            return content

                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription());

        });

    }

    public getFrontAppMap (): Promise<string> { // tricks return to avoid costful parsing
        return readFile(join(__dirname, "..", "..", "public", "dist", "bundle.min.js.map"), "utf-8");
    }

    // <api>

    public inputString (bodyParameters: operations["inputString"]["requestBody"]["content"]["application/json"]): Promise<void> {

        return new Promise((resolve: () => void, reject: (err: Error) => void): void => {

            try {

                robotjs.typeString(bodyParameters.string);

                if ("boolean" === typeof bodyParameters.enter && bodyParameters.enter) {
                    robotjs.keyTap("enter");
                }

                return resolve();

            }
            catch (e: unknown) {

                return reject(e instanceof Error ? e : new Error(String(e)));

            }

        });

    }

    public inputKey (bodyParameters: operations["inputKey"]["requestBody"]["content"]["application/json"]): Promise<void> {

        return new Promise((resolve: () => void, reject: (err: Error) => void): void => {

            try {

                const modifiers: string[] = [];

                if ("boolean" === typeof bodyParameters.alt && bodyParameters.alt) {
                    modifiers.push("alt");
                }
                if ("boolean" === typeof bodyParameters.ctrl && bodyParameters.ctrl) {
                    modifiers.push("control");
                }
                if ("boolean" === typeof bodyParameters.shift && bodyParameters.shift) {
                    modifiers.push("shift");
                }
                if ("boolean" === typeof bodyParameters.command && bodyParameters.command) {
                    modifiers.push("command");
                }

                // https://www.piathome.com/homepage/docs/robotjs-key-syntax.html
                robotjs.keyTap(bodyParameters.key, modifiers);

                return resolve();

            }
            catch (e: unknown) {

                return reject(e instanceof Error ? e : new Error(String(e)));

            }

        });

    }

}
