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

    // clearInputErrors: PropTypes.func.isRequired,
    // name: PropTypes.string.isRequired,
    // validate: PropTypes.func.isRequired,
    // error: PropTypes.arrayOf(PropTypes.string).isRequired,
    // validation: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {
    label: '',
    isDisabled: false,
};

class ExpensiPicker extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
        };

        // We don't keep the value on state so we can read it in inputRefs.current[name].value in ExpensiForm
        this.value = this.props.defaultValue || ''; 
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
                        name={this.props.name}
                        value={this.value}
                        onChange={(value) => {
                            this.value = value;
                            this.props.saveDraft({[this.props.name]: value});
                        }}
                        onOpen={() => {
                            this.setState({isOpen: true});
                            this.props.clearInputErrors(this.props.name);
                        }}
                        onClose={() => {
                            this.setState({isOpen: false});
                            this.props.validate(this.props.name);
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
