import React from 'react';
import ExpensiForm from './ExpensiForm';
import FormInput from './FormInput';
import {View} from 'react-native';
import FormButton from './FormButton';

class ExampleForm extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ExpensiForm
                formName='bankAccount'
            >
                <FormInput 
                    name='companyName'
                    label={'Company name'}
                />
                <FormInput 
                    name='address'
                    label={'Stree address'}
                />
                <FormInput 
                    name='phoneNumber'
                    label={'Phone number'}
                />
                <FormInput 
                    name='companyWebsite'
                    label={'Website'}
                />
                <View>
                    <FormInput 
                        name='companyType'
                        label={'Company type'}
                    />
                </View>
                <View>
                    <FormInput 
                        name='incorporationDate'
                        label={'Incorporation date'}
                    />
                </View>
                <View>
                    <FormInput 
                        name='incorporationState'
                        label={'Incorporation state'}
                    />
                </View>
                <FormInput 
                    name='hasNoConnectionToCannabis'
                    label={'Checkbox'}
                />
                <FormButton />
            </ExpensiForm>
        );
    }
}

export default ExampleForm;
