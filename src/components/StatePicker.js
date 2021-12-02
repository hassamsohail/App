import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {CONST} from 'expensify-common/lib/CONST';
import ExpensiPicker from './ExpensiPicker';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const STATES = _.map(CONST.STATES, ({stateISO}) => ({
    value: stateISO,
    label: stateISO,
}));

const propTypes = {
    /** The label for the field */
    label: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    label: '',
};

const StatePicker = React.forwardRef((props, ref) => (
    <ExpensiPicker
        ref={ref}
        placeholder={{value: '', label: '-'}}
        items={STATES}
        label={props.label || props.translate('common.state')}
        {...props}
    />
));

StatePicker.propTypes = propTypes;
StatePicker.defaultProps = defaultProps;
StatePicker.displayName = 'StatePicker';

export default withLocalize(StatePicker);
