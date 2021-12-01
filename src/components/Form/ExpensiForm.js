import React from 'react';
import _ from 'underscore';
import Onyx, {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import * as ValidationUtils from '../../libs/ValidationUtils';

const propTypes = {
    name: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    formDraft: PropTypes.object,

    // eslint-disable-next-line react/forbid-prop-types
    defaultValues: PropTypes.object,
};

const defaultProps = {
    formDraft: {},
    defaultValues: {},
};

class ExpensiForm extends React.Component {
    constructor(props) {
        super(props);

        // TODO: Loop over each form field and set default value to either the Onyx draft or the form default value or an empty value
        this.state = {
            defaultValues: this.props.formDraft || this.props.defaultValues,
            errors: {},
        };
        this.inputRefs.current = {};

        this.inputRefs = React.createRef();
        this.saveDraft = this.saveDraft.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.validate = this.validate.bind(this);
        this.clearInputErrors = this.clearInputErrors.bind(this);
    }

    onSubmit(submit) {
        // Get form values
        const formData = {};
        _.each(_.keys(this.inputRefs.current), (key) => {
            if (key && key !== 'undefined') {
                return;
            }
            formData[key] = this.inputRefs.current[key].value;
        });

        submit(formData);
    }

    // TODO: Skip saving draft if sensitive prop is passed to textInput (to prevent saving passwords, etc)
    saveDraft(e, name) {
        Onyx.merge(`${this.props.name}_draft`, {[name]: e.target.value});
    }

    // TODO: If we can pass a reference to the high level form input component, we can get a list of passed props and
    // automatically pick up validaiton rules, without needed to pass them as an argument.
    // TODO: Accept functions as validation prop?
    // TODO: Automatically check for required fields and other common validation rules, unless optional prop is passed
    validate(name, rules) {
        const validation = [ValidationUtils.REQUIRED_FIELD, ...rules];

        _.each(validation, (rule) => {
            if (!rule.pattern.test(this.inputRefs.current[name].value)) {
                return;
            }
            this.setState(prevState => ({
                ...prevState,
                errors: {
                    ...prevState.errors,
                    [name]: _.isEmpty(prevState.errors[name]) ? [rule.errorMessage] : [...prevState.errors[name], rule.errorMessage],
                },
            }));
        });
    }

    clearInputErrors(name) {
        this.setState(prevState => ({
            ...prevState,
            errors: {
                ...prevState.errors,
                [name]: null,
            },
        }));
    }

    render() {
        const childrenWrapperWithProps = children => (
            React.Children.map(children, (child) => {
                // Do nothing if child is not a valid React element
                if (!React.isValidElement(child)) {
                    return child;
                }

                // Depth first traversal of the render tree as the form element is likely to be the last node
                if (child.props.children) {
                    child = React.cloneElement(child, {
                        children: childrenWrapperWithProps(child.props.children),
                    });
                }

                // TODO: Only pass props to correct form components (we should follow a displayName pattern and filter by name here)
                // Do not pass props to non-form elements, e.g. View, Text, etc
                // if (!child.type.displayName || !/^Form/.test(child.type.displayName)) {
                //     return child;
                // }

                // Clone element passing down common form props
                // TODO: Figure out how to pass ref to main form input components to automatically get props (will be used in validation, saving drafts, etc)
                const inputRef = node => this.inputRefs.current[child.props.name] = node;
                return React.cloneElement(child, {
                    ref: inputRef,
                    saveDraft: this.saveDraft,
                    validate: this.validate,
                    clearInputErrors: this.clearInputErrors,
                    onSubmit: this.onSubmit,
                    defaultValue: this.state.defaultValues[child.props.name],
                    error: this.state.errors[child.props.name],
                });
            })
        );

        return (
            <>
                {childrenWrapperWithProps(this.props.children)}
            </>
        );
    }
}

ExpensiForm.propTypes = propTypes;
ExpensiForm.defaultProps = defaultProps;

// export default ExpensiForm;
export default withOnyx({
    formDraft: {key: 'ReimbursementAccountForm_draft'},
})(ExpensiForm);
