import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import Header from './Header';
import Modal from './Modal';
import styles from '../styles/styles';
import CONST from '../CONST';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import ExpensifyButton from './ExpensifyButton';
import ExpensifyText from './ExpensifyText';

const propTypes = {
    /** Title of the modal */
    title: PropTypes.string.isRequired,

    /** A callback to call when the form has been submitted */
    onConfirm: PropTypes.func.isRequired,

    /** A callback to call when the form has been closed */
    onCancel: PropTypes.func,

    /** Modal visibility */
    isVisible: PropTypes.bool.isRequired,

    /** Confirm button text */
    confirmText: PropTypes.string,

    /** Cancel button text */
    cancelText: PropTypes.string,

    /** Modal content text/element */
    prompt: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

    /** Is the action destructive */
    danger: PropTypes.bool,

    /** Whether we should show the cancel button */
    shouldShowCancelButton: PropTypes.bool,

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    confirmText: '',
    cancelText: '',
    prompt: '',
    danger: false,
    onCancel: () => {},
    shouldShowCancelButton: true,
};

const ConfirmModal = props => (
    <Modal
        onSubmit={props.onConfirm}
        onClose={props.onCancel}
        isVisible={props.isVisible}
        type={props.isSmallScreenWidth
            ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED
            : CONST.MODAL.MODAL_TYPE.CONFIRM}
    >
        <View style={styles.m5}>
            <View style={[styles.flexRow, styles.mb4]}>
                <Header title={props.title} />
            </View>

            {_.isString(props.prompt)
                ? (
                    <ExpensifyText>
                        {props.prompt}
                    </ExpensifyText>
                ) : (props.prompt)}

            <ExpensifyButton
                success
                danger={props.danger}
                style={[styles.mt4]}
                onPress={props.onConfirm}
                pressOnEnter
                text={props.confirmText || props.translate('common.yes')}
            />
            {props.shouldShowCancelButton
            && (
                <ExpensifyButton
                    style={[styles.mt3]}
                    onPress={props.onCancel}
                    text={props.cancelText || props.translate('common.no')}
                />
            )}
        </View>
    </Modal>
);

ConfirmModal.propTypes = propTypes;
ConfirmModal.defaultProps = defaultProps;
ConfirmModal.displayName = 'ConfirmModal';
export default compose(
    withWindowDimensions,
    withLocalize,
)(ConfirmModal);
