import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import styles from '../../styles/styles';
import ExpensifyButton from '../../components/ExpensifyButton';
import ExpensifyText from '../../components/ExpensifyText';
import * as Session from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import compose from '../../libs/compose';
import canFocusInputOnScreenFocus from '../../libs/canFocusInputOnScreenFocus';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import getEmailKeyboardType from '../../libs/getEmailKeyboardType';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import * as ValidationUtils from '../../libs/ValidationUtils';
import LoginUtil from '../../libs/LoginUtil';
import withToggleVisibilityView, {toggleVisibilityViewPropTypes} from '../../components/withToggleVisibilityView';

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** An error message to display to the user */
        error: PropTypes.string,

        /** Success message to display when necessary */
        success: PropTypes.string,

        /** Whether or not a sign on form is loading (being submitted) */
        loading: PropTypes.bool,
    }),

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,

    ...toggleVisibilityViewPropTypes,
};

const defaultProps = {
    account: {},
};

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.onTextInput = this.onTextInput.bind(this);
        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);

        this.state = {
            formError: false,
            login: '',
        };
    }

    componentDidMount() {
        if (!canFocusInputOnScreenFocus() || !this.input) {
            return;
        }
        this.input.focus();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isVisible || !this.props.isVisible) {
            return;
        }
        this.input.focus();

        if (this.state.login) {
            this.clearLogin();
        }
    }

    /**
     * Handle text input and clear formError upon text change
     *
     * @param {String} text
     */
    onTextInput(text) {
        this.setState({
            login: text,
            formError: null,
        });

        if (this.props.account.error) {
            Session.clearAccountMessages();
        }
    }

    /**
     * Clear Login from the state
     */
    clearLogin() {
        this.setState({login: ''}, this.input.clear);
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        if (!this.state.login.trim()) {
            this.setState({formError: 'common.pleaseEnterEmailOrPhoneNumber'});
            return;
        }

        const phoneLogin = LoginUtil.getPhoneNumberWithoutSpecialChars(this.state.login);
        const isValidPhoneLogin = Str.isValidPhone(phoneLogin);

        if (!Str.isValidEmail(this.state.login) && !isValidPhoneLogin) {
            if (ValidationUtils.isNumericWithSpecialChars(this.state.login)) {
                this.setState({formError: 'messages.errorMessageInvalidPhone'});
            } else {
                this.setState({formError: 'loginForm.error.invalidFormatEmailLogin'});
            }
            return;
        }

        this.setState({
            formError: null,
        });

        // Check if this login has an account associated with it or not
        Session.fetchAccountDetails(isValidPhoneLogin ? phoneLogin : this.state.login);
    }

    render() {
        return (
            <>
                <View style={[styles.mt3]}>
                    <ExpensiTextInput
                        ref={el => this.input = el}
                        label={this.props.translate('loginForm.phoneOrEmail')}
                        value={this.state.login}
                        autoCompleteType="username"
                        textContentType="username"
                        nativeID="username"
                        name="username"
                        onChangeText={this.onTextInput}
                        onSubmitEditing={this.validateAndSubmitForm}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType={getEmailKeyboardType()}
                    />
                </View>
                {this.state.formError && (
                    <ExpensifyText style={[styles.formError]}>
                        {this.props.translate(this.state.formError)}
                    </ExpensifyText>
                )}

                {!this.state.formError && !_.isEmpty(this.props.account.error) && (
                    <ExpensifyText style={[styles.formError]}>
                        {this.props.account.error}
                    </ExpensifyText>
                )}
                {!_.isEmpty(this.props.account.success) && (
                    <ExpensifyText style={[styles.formSuccess]}>
                        {this.props.account.success}
                    </ExpensifyText>
                )}
                <View style={[styles.mt5]}>
                    <ExpensifyButton
                        success
                        text={this.props.translate('common.continue')}
                        isLoading={this.props.account.loading}
                        onPress={this.validateAndSubmitForm}
                    />
                </View>
            </>
        );
    }
}

LoginForm.propTypes = propTypes;
LoginForm.defaultProps = defaultProps;

export default compose(
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
    withWindowDimensions,
    withLocalize,
    withToggleVisibilityView,
)(LoginForm);
