import _ from 'underscore';
import React, {Component} from 'react';
import {
    Animated, TextInput, View, TouchableWithoutFeedback, Pressable,
} from 'react-native';
import ExpensiTextInputLabel from './ExpensiTextInputLabel';
import * as baseExpensiTextInputPropTypes from './baseExpensiTextInputPropTypes';
import themeColors from '../../styles/themes/default';
import styles from '../../styles/styles';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import InlineErrorText from '../InlineErrorText';
import * as styleConst from './styleConst';

class BaseExpensiTextInput extends Component {
    constructor(props) {
        super(props);

        const activeLabel = props.forceActiveLabel || (this.input && this.input.value.length > 0);

        this.state = {
            isFocused: false,
            labelTranslateY: new Animated.Value(activeLabel ? styleConst.ACTIVE_LABEL_TRANSLATE_Y : styleConst.INACTIVE_LABEL_TRANSLATE_Y),
            labelScale: new Animated.Value(activeLabel ? styleConst.ACTIVE_LABEL_SCALE : styleConst.INACTIVE_LABEL_SCALE),
            passwordHidden: props.secureTextEntry,
        };

        this.input = null;
        this.isLabelActive = activeLabel;
        this.onPress = this.onPress.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onChange = this.onChange.bind(this);
        this.togglePasswordVisibility = this.togglePasswordVisibility.bind(this);
    }

    componentDidMount() {
        if (this.input && this.input.value) {
            this.activateLabel();
        }

        // We are manually managing focus to prevent this issue: https://github.com/Expensify/App/issues/4514
        if (!this.props.autoFocus || !this.input) {
            return;
        }

        this.input.focus();
    }

    componentDidUpdate() {
        if (this.input && this.props.value) {
            this.activateLabel();
        } else if (!this.state.isFocused) {
            this.deactivateLabel();
        }
    }

    onPress(event) {
        if (this.props.disabled) {
            return;
        }

        if (this.props.onPress) {
            this.props.onPress(event);
        }

        if (!event.isDefaultPrevented()) {
            this.input.focus();
        }
    }

    onFocus(event) {
        if (this.props.onFocus) { this.props.onFocus(event); }
        this.setState({isFocused: true});
        this.props.clearInputErrors(this.props.name);
        this.activateLabel();
    }

    onBlur(event) {
        if (this.props.onBlur) { this.props.onBlur(event); }
        this.setState({isFocused: false});
        this.deactivateLabel();
        this.props.validate(this.props.name);
    }

    onChange(event) {
        this.props.saveDraft({[this.props.name]: event.target.value});
    }

    activateLabel() {
        if (this.input.value.length < 0 || this.isLabelActive) {
            return;
        }

        this.animateLabel(
            styleConst.ACTIVE_LABEL_TRANSLATE_Y,
            styleConst.ACTIVE_LABEL_SCALE,
        );
        this.isLabelActive = true;
    }

    deactivateLabel() {
        if (this.props.forceActiveLabel || this.input.value.length !== 0) {
            return;
        }

        this.animateLabel(styleConst.INACTIVE_LABEL_TRANSLATE_Y, styleConst.INACTIVE_LABEL_SCALE);
        this.isLabelActive = false;
    }

    animateLabel(translateY, scale) {
        Animated.parallel([
            Animated.spring(this.state.labelTranslateY, {
                toValue: translateY,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(this.state.labelScale, {
                toValue: scale,
                duration: 80,
                useNativeDriver: true,
            }),
        ]).start();
    }

    togglePasswordVisibility() {
        this.setState(prevState => ({passwordHidden: !prevState.passwordHidden}));
    }

    render() {
        // eslint-disable-next-line react/forbid-foreign-prop-types
        const inputProps = _.omit(this.props, _.keys(baseExpensiTextInputPropTypes.propTypes));
        const hasLabel = Boolean(this.props.label.length);
        return (
            <View>
                <View
                    style={[
                        !this.props.multiline && styles.componentHeightLarge,
                        ...this.props.containerStyles,
                    ]}
                >
                    <TouchableWithoutFeedback onPress={this.onPress} focusable={false}>
                        <View
                            style={[
                                styles.expensiTextInputContainer,
                                this.state.isFocused && styles.borderColorFocus,
                                this.props.error && styles.borderColorDanger,
                            ]}
                        >
                            {hasLabel ? (
                                <>
                                    {/* Adding this background to the label only for multiline text input,
                                    to prevent text overlapping with label when scrolling */}
                                    {this.props.multiline && <View style={styles.expensiTextInputLabelBackground} pointerEvents="none" />}
                                    <ExpensiTextInputLabel
                                        label={this.props.label}
                                        labelTranslateY={this.state.labelTranslateY}
                                        labelScale={this.state.labelScale}
                                    />
                                </>
                            ) : null}
                            <View style={[styles.expensiTextInputAndIconContainer]}>
                                <TextInput
                                    ref={(ref) => {
                                        if (typeof this.props.innerRef === 'function') { this.props.innerRef(ref); }
                                        this.input = ref;
                                    }}
                                    // eslint-disable-next-line
                                    {...inputProps}
                                    placeholder={(this.state.isFocused || !this.props.label) ? this.props.placeholder : null}
                                    placeholderTextColor={themeColors.placeholderText}
                                    underlineColorAndroid="transparent"
                                    style={[this.props.inputStyle, styles.flex1, styles.w100, !hasLabel && styles.pv0, this.props.secureTextEntry && styles.pr2]}
                                    multiline={this.props.multiline}
                                    onFocus={this.onFocus}
                                    onBlur={this.onBlur}
                                    secureTextEntry={this.state.passwordHidden}
                                    onPressOut={this.props.onPress}
                                    defaultValue={this.props.defaultValue}
                                    onChange={this.onChange}
                                />
                                {this.props.secureTextEntry && (
                                <Pressable
                                    accessibilityRole="button"
                                    style={styles.secureInputEyeButton}
                                    onPress={this.togglePasswordVisibility}
                                >
                                    <Icon
                                        src={this.state.passwordHidden ? Expensicons.Eye : Expensicons.EyeDisabled}
                                        fill={themeColors.icon}
                                    />
                                </Pressable>
                                )}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                {!_.isEmpty(this.props.error) && _.map(this.props.error, errorMessage => (
                    <InlineErrorText>
                        {errorMessage}
                    </InlineErrorText>
                ))}
            </View>
        );
    }
}

BaseExpensiTextInput.propTypes = baseExpensiTextInputPropTypes.propTypes;
BaseExpensiTextInput.defaultProps = baseExpensiTextInputPropTypes.defaultProps;

export default BaseExpensiTextInput;
