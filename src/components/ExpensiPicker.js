import _ from 'underscore';
import React, {PureComponent} from 'react';
import {Text, View} from 'react-native';
import PropTypes from 'prop-types';
import Picker from './Picker';
import styles from '../styles/styles';
import InlineErrorText from './InlineErrorText';

const propTypes = {
    /** Picker label */
    label: PropTypes.string,

    /** Should the picker appear disabled? */
    isDisabled: PropTypes.bool,

    /** Should the input be styled for errors  */
    hasError: PropTypes.bool,

    /** Error text to display */
    errorText: PropTypes.string,

    clearInputErrors: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    validate: PropTypes.func.isRequired,
    error: PropTypes.arrayOf(PropTypes.string).isRequired,
    validation: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {
    label: '',
    isDisabled: false,
    hasError: false,
    errorText: '',
};

class ExpensiPicker extends PureComponent {
    constructor() {
        super();
        this.state = {
            isOpen: false,
        };
    }

    render() {
        const pickerProps = _.omit(this.props, _.keys(propTypes));
        return (
            <>
                <View
                    style={[
                        styles.expensiPickerContainer,
                        this.props.isDisabled && styles.inputDisabled,
                    ]}
                >
                    {this.props.label && (
                        <Text style={[styles.expensiPickerLabel, styles.textLabelSupporting]}>{this.props.label}</Text>
                    )}
                    <Picker
                        onOpen={() => {
                            this.setState({isOpen: true});
                            this.props.clearInputErrors(this.props.name);
                        }}
                        onClose={() => {
                            this.setState({isOpen: false});
                            this.props.validate(this.props.name, this.props.validation || []);
                        }}
                        disabled={this.props.isDisabled}
                        focused={this.state.isOpen}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...pickerProps}
                    />
                </View>
                {!_.isEmpty(this.props.error) && _.map(this.props.error, errorMessage => (
                    <InlineErrorText>
                        {errorMessage}
                    </InlineErrorText>
                ))}
            </>
        );
    }
}

ExpensiPicker.propTypes = propTypes;
ExpensiPicker.defaultProps = defaultProps;

export default ExpensiPicker;
