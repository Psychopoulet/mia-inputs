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
    // import type { components } from "../../../lib/src/Descriptor";

    interface iProps extends iPropsNode {
        "onError": (error: Error) => void;
    }

    interface iState {
        "string": string;
        "enter": boolean;
        "running": boolean;
    }

// component

export default class InputString extends React.PureComponent<iProps, iState> {

    // name

        public static displayName: string = "InputString";

    // private

        private readonly _sdk: SDK = getSDK();

    // constructor

    public constructor (props: iProps) {

        super(props);

        // state

        this.state = {
            "string": "",
            "enter": false,
            "running": false
        };

    }

    // interface handlers

    private readonly _handleChangeString = (e: React.ChangeEvent<HTMLInputElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "string": newValue
        });

    };

    private readonly _handleChangeEnter = (e: React.ChangeEvent<HTMLInputElement>, newValue: boolean): void => {

        this.setState({
            "enter": newValue
        });

    };

    private readonly _handleSubmit = (e: React.SubmitEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "running": true
        });

        this._sdk.inputString({
            "string": this.state.string,
            "enter": this.state.enter
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
                Input String
            </CardHeader>

            <CardBody>

                <InputTextLabel label="String"
                    value={ this.state.string } onChange={ this._handleChangeString }
                    disabled={ this.state.running }
                />

                <CheckBoxLabel label="Enter"
                    checked={ this.state.enter } onToogle={ this._handleChangeEnter }
                    disabled={ this.state.running }
                />

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
