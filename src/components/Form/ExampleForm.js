import React from 'react';
import {View} from 'react-native';
import ExpensiForm from './ExpensiForm';
import FormButton from './FormButton';
import ExpensiTextInput from './ExpensiTextInput';
import * as validationRules from './ValidationRules';
import styles from '../../styles/styles';

class ExampleForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <ExpensiForm
                name='bankAccount'
            >
                <ExpensiTextInput
                    name={'companyName'}
                    label={'Company name'}
                    validationRules={[
                        validationRules.MIN_LENGTH, // TODO: Separate common and custom errors into their own props, e.g. minLength={4}
                        validationRules.MAX_LENGTH,
                        validationRules.ONE_DIGIT,
                    ]}
                />
                <ExpensiTextInput
                    name={'address'}
                    label={'Stree address'}
                    containerStyles={[styles.mt4]}
                />
                <ExpensiTextInput
                    name={'phoneNumber'}
                    label={'Phone number'}
                    containerStyles={[styles.mt4]}
                />
                <ExpensiTextInput 
                    name={'companyWebsite'}
                    label={'Website'}
                    containerStyles={[styles.mt4]}
                />
                <View>
                    <ExpensiTextInput 
                        name={'companyType'}
                        label={'Company type'}
                        containerStyles={[styles.mt4]}
                    />
                </View>
                <View>
                    <ExpensiTextInput 
                        name={'incorporationDate'}
                        label={'Incorporation date'}
                        containerStyles={[styles.mt4]}
                    />
                </View>
                <View>
                    <ExpensiTextInput 
                        name={'incorporationState'}
                        label={'Incorporation state'}
                        containerStyles={[styles.mt4]}
                    />
                </View>
                <ExpensiTextInput 
                    name={'hasNoConnectionToCannabis'}
                    label={'Checkbox'}
                    containerStyles={[styles.mt4]}
                />
                <FormButton />
            </ExpensiForm>
        );
    }
}

export default ExampleForm;
