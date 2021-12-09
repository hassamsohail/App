import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import Str from 'expensify-common/lib/str';
import moment from 'moment';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import Navigation from '../../libs/Navigation/Navigation';
import Text from '../../components/Text';
import DatePicker from '../../components/DatePicker';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import styles from '../../styles/styles';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import TextLink from '../../components/TextLink';
import StatePicker from '../../components/StatePicker';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import * as ValidationUtils from '../../libs/ValidationUtils';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import ExpensiPicker from '../../components/ExpensiPicker';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import AddressSearch from '../../components/AddressSearch';
import ExpensiForm from '../../components/Form/ExpensiForm';

const propTypes = {
    /** Bank account currently in setup */
    // eslint-disable-next-line react/no-unused-prop-types
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    ...withLocalizePropTypes,
};

class CompanyStep extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);

        this.defaultWebsite = lodashGet(props, 'user.isFromPublicDomain', false)
            ? 'https://'
            : `https://www.${Str.extractEmailDomain(props.session.email, '')}`;

        this.state = {
            companyName: ReimbursementAccountUtils.getDefaultStateForField(props, 'companyName'),
            addressStreet: ReimbursementAccountUtils.getDefaultStateForField(props, 'addressStreet'),
            addressCity: ReimbursementAccountUtils.getDefaultStateForField(props, 'addressCity'),
            addressState: ReimbursementAccountUtils.getDefaultStateForField(props, 'addressState'),
            addressZipCode: ReimbursementAccountUtils.getDefaultStateForField(props, 'addressZipCode'),
            companyPhone: ReimbursementAccountUtils.getDefaultStateForField(props, 'companyPhone'),
            website: ReimbursementAccountUtils.getDefaultStateForField(props, 'website', this.defaultWebsite),
            companyTaxID: ReimbursementAccountUtils.getDefaultStateForField(props, 'companyTaxID'),
            incorporationType: ReimbursementAccountUtils.getDefaultStateForField(props, 'incorporationType'),
            incorporationDate: ReimbursementAccountUtils.getDefaultStateForField(props, 'incorporationDate'),
            incorporationState: ReimbursementAccountUtils.getDefaultStateForField(props, 'incorporationState'),
            hasNoConnectionToCannabis: ReimbursementAccountUtils.getDefaultStateForField(props, 'hasNoConnectionToCannabis', false),
        };

        // Map a field to the key of the error's translation
        this.errorTranslationKeys = {
            companyName: 'bankAccount.error.companyName',
            addressStreet: 'bankAccount.error.addressStreet',
            addressCity: 'bankAccount.error.addressCity',
            addressState: 'bankAccount.error.addressState',
            addressZipCode: 'bankAccount.error.zipCode',
            companyPhone: 'bankAccount.error.phoneNumber',
            website: 'bankAccount.error.website',
            companyTaxID: 'bankAccount.error.taxID',
            incorporationDate: 'bankAccount.error.incorporationDate',
            incorporationDateFuture: 'bankAccount.error.incorporationDateFuture',
            incorporationType: 'bankAccount.error.companyType',
            hasNoConnectionToCannabis: 'bankAccount.error.restrictedBusiness',
        };

        this.getErrorText = inputKey => ReimbursementAccountUtils.getErrorText(this.props, this.errorTranslationKeys, inputKey);
        this.clearError = inputKey => ReimbursementAccountUtils.clearError(this.props, inputKey);
        this.getErrors = () => ReimbursementAccountUtils.getErrors(this.props);
        this.clearDateErrorsAndSetValue = this.clearDateErrorsAndSetValue.bind(this);
    }

    getFormattedAddressValue() {
        let addressString = '';
        if (this.state.addressStreet) {
            addressString += `${this.state.addressStreet}, `;
        }
        if (this.state.addressCity) {
            addressString += `${this.state.addressCity}, `;
        }
        if (this.state.addressState) {
            addressString += `${this.state.addressState}, `;
        }
        if (this.state.addressZipCode) {
            addressString += `${this.state.addressZipCode}`;
        }
        return addressString;
    }

    /**
     * Clear both errors associated with incorporation date, and set the new value.
     *
     * @param {String} value
     */
    clearDateErrorsAndSetValue(value) {
        this.clearError('incorporationDate');
        this.clearError('incorporationDateFuture');
        this.setValue({incorporationDate: value});
    }

    submit() {
        if (!this.validate()) {
            BankAccounts.showBankAccountErrorModal();
            return;
        }

        const incorporationDate = moment(this.state.incorporationDate).format(CONST.DATE.MOMENT_FORMAT_STRING);
        BankAccounts.setupWithdrawalAccount({...this.state, incorporationDate});
    }

    render() {
        const shouldDisableCompanyName = Boolean(this.props.achData.bankAccountID && this.props.achData.companyName);
        const shouldDisableCompanyTaxID = Boolean(this.props.achData.bankAccountID && this.props.achData.companyTaxID);

        return (
            <>
                <HeaderWithCloseButton
                    title={this.props.translate('companyStep.headerTitle')}
                    stepCounter={{step: 2, total: 5}}
                    shouldShowBackButton
                    onBackButtonPress={() => BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT)}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <ExpensiForm
                    name="ReimbursementAccountForm"
                    defaultValues={this.state}
                    validation={{
                        'phoneNumber': ValidationUtils.PHONE_NUMBER,
                        'companyWebsite': ValidationUtils.WEBSITE,
                        'taxIDNumber': ValidationUtils.TAX_ID,
                    }}

                    // onSubmit={this.submit}
                >
                <View style={[styles.mh5]}>
                    <Text>{this.props.translate('companyStep.subtitle')}</Text>
                    <ExpensiTextInput
                        name="legalBusinessName"
                        label={this.props.translate('companyStep.legalBusinessName')}
                        containerStyles={[styles.mt4]}
                        disabled={shouldDisableCompanyName}
                    />
                    {!this.state.manualAddress && (
                        <>
                            <AddressSearch
                                label={this.props.translate('common.companyAddress')}
                                containerStyles={[styles.mt4]}
                                value={this.getFormattedAddressValue()}
                                onChangeText={(fieldName, value) => this.clearErrorAndSetValue(fieldName, value)}
                                errorText={this.getErrorText('addressStreet')}
                            />
                            <TextLink
                                style={[styles.textMicro]}
                                onPress={() => this.setState({manualAddress: true})}
                            >
                                Can&apos;t find your address? Enter it manually
                            </TextLink>
                        </>
                    )}
                    {this.state.manualAddress && (
                        <>
                            <ExpensiTextInput
                                label={this.props.translate('common.companyAddress')}
                                containerStyles={[styles.mt4]}
                                onChangeText={value => this.clearErrorAndSetValue('addressStreet', value)}
                                value={this.state.addressStreet}
                                errorText={this.getErrorText('addressStreet')}
                            />
                            <Text style={[styles.mutedTextLabel, styles.mt1]}>{this.props.translate('common.noPO')}</Text>
                            <View style={[styles.flexRow, styles.mt4]}>
                                <View style={[styles.flex2, styles.mr2]}>
                                    <ExpensiTextInput
                                        label={this.props.translate('common.city')}
                                        onChangeText={value => this.clearErrorAndSetValue('addressCity', value)}
                                        value={this.state.addressCity}
                                        errorText={this.getErrorText('addressCity')}
                                    />
                                </View>
                                <View style={[styles.flex1]}>
                                    <StatePicker
                                        onChange={value => this.clearErrorAndSetValue('addressState', value)}
                                        value={this.state.addressState}
                                        hasError={this.getErrors().addressState}
                                    />
                                </View>
                            </View>
                            <ExpensiTextInput
                                label={this.props.translate('common.zip')}
                                containerStyles={[styles.mt4]}
                                keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                                onChangeText={value => this.clearErrorAndSetValue('addressZipCode', value)}
                                value={this.state.addressZipCode}
                                errorText={this.getErrorText('addressZipCode')}
                            />
                        </>
                    )}

                    <ExpensiTextInput
                        name="phoneNumber"
                        label={this.props.translate('common.phoneNumber')}
                        containerStyles={[styles.mt4]}
                        keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                        placeholder={this.props.translate('companyStep.companyPhonePlaceholder')}
                        validation={ValidationUtils.PHONE_NUMBER}
                        maxLength={CONST.PHONE_MAX_LENGTH}
                    />
                    <ExpensiTextInput
                        name="companyWebsite"
                        label={this.props.translate('companyStep.companyWebsite')}
                        containerStyles={[styles.mt4]} // TODO: Maybe validation prop can also accept an object in addition to arrays?
                    />
                    <ExpensiTextInput
                        name="taxIDNumber"
                        label={this.props.translate('companyStep.taxIDNumber')}
                        containerStyles={[styles.mt4]}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMERIC}
                        disabled={shouldDisableCompanyTaxID}
                        placeholder={this.props.translate('companyStep.taxIDNumberPlaceholder')}
                        maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.TAX_ID_NUMBER}
                    />
                    <View style={styles.mt4}>
                        <ExpensiPicker
                            name="companyType"
                            label={this.props.translate('companyStep.companyType')}
                            items={_.map(this.props.translate('companyStep.incorporationTypes'), (label, value) => ({value, label}))}
                            placeholder={{value: '', label: '-'}}
                        />
                    </View>
                    <View style={styles.mt4}>
                        <DatePicker
                            name="incorporationDate"
                            label={this.props.translate('companyStep.incorporationDate')}
                            onChange={this.clearDateErrorsAndSetValue}
                            value={this.state.incorporationDate}
                            placeholder={this.props.translate('companyStep.incorporationDatePlaceholder')}
                            errorText={this.getErrorText('incorporationDate') || this.getErrorText('incorporationDateFuture')}
                            maximumDate={new Date()}
                        />
                    </View>
                    <View style={styles.mt4}>
                        <StatePicker
                            name="incorporationState"
                            label={this.props.translate('companyStep.incorporationState')}
                        />
                    </View>
                    <CheckboxWithLabel
                        isChecked={this.state.hasNoConnectionToCannabis}
                        onPress={() => {
                            this.setState((prevState) => {
                                const newState = {hasNoConnectionToCannabis: !prevState.hasNoConnectionToCannabis};
                                BankAccounts.updateReimbursementAccountDraft(newState);
                                return newState;
                            });
                            this.clearError('hasNoConnectionToCannabis');
                        }}
                        LabelComponent={() => (
                            <>
                                <Text>{`${this.props.translate('companyStep.confirmCompanyIsNot')} `}</Text>
                                <TextLink
                                    // eslint-disable-next-line max-len
                                    href="https://community.expensify.com/discussion/6191/list-of-restricted-businesses"
                                >
                                    {`${this.props.translate('companyStep.listOfRestrictedBusinesses')}.`}
                                </TextLink>
                            </>
                        )}
                        style={[styles.mt4]}
                        errorText={this.getErrorText('hasNoConnectionToCannabis')}
                        hasError={this.getErrors().hasNoConnectionToCannabis}
                    />
                    </View>
                </ExpensiForm>
            </>
        );
    }
}

CompanyStep.propTypes = propTypes;
export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        reimbursementAccountDraft: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(CompanyStep);
