import React from 'react';
import _ from 'underscore';
import Onyx from 'react-native-onyx';
import compose from '../../libs/compose';
import {withOnyx} from 'react-native-onyx';

class ExpensiForm extends React.Component {
    constructor(props) {
        super(props);

        this.inputRefs = React.createRef(),
        this.inputRefs.current = {},

        this.state = {
            defaultValues: this.props.formDraft || {},
            errors: {},
        },
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.validate = this.validate.bind(this);
        this.clearInputErrors = this.clearInputErrors.bind(this);
    }

    onSubmit(submit) {
        // get form values
        const formData = {}
        _.each(Object.keys(this.inputRefs.current), key => {
            if (key && key !== 'undefined') {
                formData[key] = this.inputRefs.current[key].value;
            }
        })

        submit(formData);
    }

    onChange(e, name) {
        Onyx.merge(`${this.props.name}_draft`, {[name]: e.target.value})
    }

    validate(name, rules) {
        _.each(rules, rule => {
            if (!rule.pattern.test(this.inputRefs.current[name].value)) {
                this.setState(prevState => ({
                    ...prevState,
                    errors: {
                        ...prevState.errors,
                        [name]: _.isEmpty(prevState.errors[name]) ? [rule.errorMessage] : [...prevState.errors[name], rule.errorMessage],
                    }
                }))
            }
        })
    }

    clearInputErrors(name) {
        this.setState(prevState => ({
            ...prevState,
            errors: {
                ...prevState.errors,
                [name]: null,
            }
        }));
    }

    render() {
        const childrenWrapperWithProps = (children) => {
            return React.Children.map(children, child => {
                // Do nothing if child is not a valid React element
                if (!React.isValidElement(child)) {
                    return child;
                }
                // Depth first traversal of the render tree as the form element is likely to be the last node
                if (child.props.children) {
                    child = React.cloneElement(child, {
                        children: childrenWrapperWithProps(child.props.children)
                    })
                }
                // Do not pass props to non-form elements, e.g. View, Text, etc
                // if (!child.type.displayName || !/^Form/.test(child.type.displayName)) {
                //     return child;
                // }
                
                // Clone element passing down common form props
                const inputRef = node => this.inputRefs.current[child.props.name] = node
                return React.cloneElement(child, {
                    ref: inputRef,
                    onChange: this.onChange,
                    validate: this.validate,
                    clearInputErrors: this.clearInputErrors,
                    onSubmit: this.onSubmit,
                    defaultValue: this.state.defaultValues[child.props.name],
                    error: this.state.errors[child.props.name],
                })
            })
        };

        return (
            <>
               {childrenWrapperWithProps(this.props.children)} 
            </>
        );
    }
}

export default ExpensiForm;
// export default compose(
//     withOnyx({
//         formDraft: {key: `${this.props.name}_draft`}
//     }),
// )(ExpensiForm);
