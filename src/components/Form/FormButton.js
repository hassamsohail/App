import React from 'react';
import {Pressable, Text} from 'react-native';

class FormButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Pressable
                onPress={this.props.onSubmit}
            >
                <Text>Submit</Text>
            </Pressable>
        );
    }
}

FormButton.displayName = 'FormButton';
export default FormButton;
