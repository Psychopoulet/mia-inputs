// deps

    // externals
    import React from "react";
    import {
        Card, CardHeader, CardBody, CardFooter,
        InputTextLabel, CheckBoxLabel,
        Button
    } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "../SDK";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { SDK } from "../SDK";
    import type { components } from "../../../lib/src/Descriptor";

    interface iProps extends iPropsNode {
        "onError": (error: Error) => void;
    }

    interface iState {
        "key": components["schemas"]["InputKey"]["key"];
        "alt": components["schemas"]["InputKey"]["alt"];
        "ctrl": components["schemas"]["InputKey"]["ctrl"];
        "shift": components["schemas"]["InputKey"]["shift"];
        "command": components["schemas"]["InputKey"]["command"];
        "running": boolean;
    }

// component

export default class InputKey extends React.PureComponent<iProps, iState> {

    // name

        public static displayName: string = "InputKey";

    // private

        private readonly _sdk: SDK = getSDK();

    // constructor

    public constructor (props: iProps) {

        super(props);

        // state

        this.state = {
            "key": "",
            "alt": false,
            "ctrl": false,
            "shift": false,
            "command": false,
            "running": false
        };

    }

    // interface handlers

    private readonly _handleChangeKey = (e: React.ChangeEvent<HTMLInputElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "key": newValue
        });

    };

    private readonly _handleChangeAlt = (e: React.ChangeEvent<HTMLInputElement>, newValue: boolean): void => {

        this.setState({
            "alt": newValue
        });

    };

    private readonly _handleChangeCtrl = (e: React.ChangeEvent<HTMLInputElement>, newValue: boolean): void => {

        this.setState({
            "ctrl": newValue
        });

    };

    private readonly _handleChangeShift = (e: React.ChangeEvent<HTMLInputElement>, newValue: boolean): void => {

        this.setState({
            "shift": newValue
        });

    };

    private readonly _handleChangeCommand = (e: React.ChangeEvent<HTMLInputElement>, newValue: boolean): void => {

        this.setState({
            "command": newValue
        });

    };

    private readonly _handleSubmit = (e: React.SubmitEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "running": true
        });

        this._sdk.inputKey({
            "key": this.state.key,
            "alt": this.state.alt,
            "ctrl": this.state.ctrl,
            "shift": this.state.shift,
            "command": this.state.command
        }).catch((error: Error): void => {

            this.props.onError(error);

        }).finally((): void => {

            this.setState({
                "running": false
            });

        });

    };

    // render

    public render (): React.JSX.Element {

        return <Card
            onSubmit={ this._handleSubmit }
        >

            <CardHeader>
                Input Key
            </CardHeader>

            <CardBody>

                <div className="row">

                    <div className="col-12">

                        <InputTextLabel label="Key"
                            value={ this.state.key } onChange={ this._handleChangeKey }
                            disabled={ this.state.running }
                        />
                    </div>

                    <div className="col-12 col-md-6">

                        <CheckBoxLabel label="Alt"
                            checked={ this.state.alt } onToogle={ this._handleChangeAlt }
                            disabled={ this.state.running }
                        />

                        <CheckBoxLabel label="Ctrl"
                            checked={ this.state.ctrl } onToogle={ this._handleChangeCtrl }
                            disabled={ this.state.running }
                        />

                    </div>

                    <div className="col-12 col-md-6">

                        <CheckBoxLabel label="Shift"
                            checked={ this.state.shift } onToogle={ this._handleChangeShift }
                            disabled={ this.state.running }
                        />

                        <CheckBoxLabel label="Command"
                            checked={ this.state.command } onToogle={ this._handleChangeCommand }
                            disabled={ this.state.running }
                        />

                    </div>

                </div>

            </CardBody>

            <CardFooter>

                <Button type="submit"
                    variant="success" block
                    disabled={ this.state.running }
                >
                    Send
                </Button>

            </CardFooter>

        </Card>;

    }

}
