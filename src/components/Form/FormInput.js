import React from 'react';
import styles from '../../styles/styles';
import BaseExpensiTextInput from './BaseExpensiTextInput';

class FormInput extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <BaseExpensiTextInput
                {...this.props}
                innerRef={this.props.forwardedRef}
                inputStyle={[styles.expensiTextInput, styles.expensiTextInputDesktop]}
                errorText={this.props.error}
                ignoreLabelTranslateX
            />
        );
    }
}

FormInput.displayName = 'FormInput';
// export default FormInput;
export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormInput {...props} forwardedRef={ref} />
));