import _ from 'underscore';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';

/**
 * Fetch and save locally the Onfido SDK token and applicantID
 * - The sdkToken is used to initialize the Onfido SDK client
 * - The applicantID is combined with the data returned from the Onfido SDK as we need both to create an
 *   identity check. Note: This happens in Web-Secure when we call Activate_Wallet during the OnfidoStep.
 */
function fetchOnfidoToken() {
    // Use Onyx.set() since we are resetting the Onfido flow completely.
    Onyx.set(ONYXKEYS.WALLET_ONFIDO, {loading: true});
    API.Wallet_GetOnfidoSDKToken()
        .then((response) => {
            const apiResult = lodashGet(response, ['requestorIdentityOnfido', 'apiResult'], {});
            Onyx.merge(ONYXKEYS.WALLET_ONFIDO, {
                applicantID: apiResult.applicantID,
                sdkToken: apiResult.sdkToken,
                loading: false,
                hasAcceptedPrivacyPolicy: true,
            });
        })
        .catch(() => Onyx.set(ONYXKEYS.WALLET_ONFIDO, {loading: false, error: CONST.WALLET.ERROR.UNEXPECTED}));
}

/**
 * Privately used to update the additionalDetails object in Onyx (which will have various effects on the UI)
 *
 * @param {Boolean} loading whether we are making the API call to validate the user's provided personal details
 * @param {String[]} [errorFields] an array of field names that should display errors in the UI
 * @param {String} [additionalErrorMessage] an additional error message to display in the UI
 * @private
 */
function setAdditionalDetailsStep(loading, errorFields = null, additionalErrorMessage = '') {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {loading, errorFields, additionalErrorMessage});
}

/**
 * This action can be called repeatedly with different steps until an Expensify Wallet has been activated.
 *
 * Possible steps:
 *
 *     - OnfidoStep - Creates an identity check by calling Onfido's API (via Web-Secure) with data returned from the SDK
 *     - AdditionalDetailsStep - Validates a user's provided details against a series of checks
 *     - TermsStep - Ensures that a user has agreed to all of the terms and conditions
 *
 * The API will always return the updated userWallet in the response as a convenience so we can avoid calling
 * Get&returnValueList=userWallet after we call Wallet_Activate.
 *
 * @param {String} currentStep
 * @param {Object} parameters
 * @param {String} [parameters.onfidoData] - JSON string
 * @param {Object} [parameters.personalDetails] - JSON string
 * @param {Boolean} [parameters.hasAcceptedTerms]
 */
function activateWallet(currentStep, parameters) {
    let personalDetails;
    let onfidoData;
    let hasAcceptedTerms;

    if (!_.contains(CONST.WALLET.STEP, currentStep)) {
        throw new Error('Invalid currentStep passed to activateWallet()');
    }

    if (currentStep === CONST.WALLET.STEP.ONFIDO) {
        onfidoData = parameters.onfidoData;
        Onyx.merge(ONYXKEYS.WALLET_ONFIDO, {error: '', loading: true});
    } else if (currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS) {
        setAdditionalDetailsStep(true);

        // Personal details are heavily validated on the API side. We will only do a quick check to ensure the values
        // exist in some capacity and then stringify them.
        const errorFields = _.reduce(CONST.WALLET.REQUIRED_ADDITIONAL_DETAILS_FIELDS, (missingFields, fieldName) => (
            !personalDetails[fieldName] ? [...missingFields, fieldName] : missingFields
        ), []);

        if (!_.isEmpty(errorFields)) {
            setAdditionalDetailsStep(false, errorFields);
            return;
        }

        personalDetails = JSON.stringify(parameters.personalDetails);
    } else if (currentStep === CONST.WALLET.STEP.TERMS) {
        hasAcceptedTerms = parameters.hasAcceptedTerms;
        Onyx.merge(ONYXKEYS.WALLET_TERMS, {loading: true});
    }

    API.Wallet_Activate({
        currentStep,
        personalDetails,
        onfidoData,
        hasAcceptedTerms,
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                if (currentStep === CONST.WALLET.STEP.ONFIDO) {
                    Onyx.merge(ONYXKEYS.WALLET_ONFIDO, {error: response.message, loading: false});
                    return;
                }

                if (currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS) {
                    if (response.title === CONST.WALLET.ERROR.MISSING_FIELD) {
                        setAdditionalDetailsStep(false, response.data.fieldNames);
                        return;
                    }

                    const errorTitles = [
                        CONST.WALLET.ERROR.IDENTITY_NOT_FOUND,
                        CONST.WALLET.ERROR.INVALID_SSN,
                        CONST.WALLET.ERROR.UNEXPECTED,
                        CONST.WALLET.ERROR.UNABLE_TO_VERIFY,
                    ];

                    if (_.contains(errorTitles, response.title)) {
                        setAdditionalDetailsStep(false, null, response.message);
                        return;
                    }

                    setAdditionalDetailsStep(false);
                    return;
                }

                return;
            }

            Onyx.merge(ONYXKEYS.USER_WALLET, response.userWallet);

            if (currentStep === CONST.WALLET.STEP.ONFIDO) {
                Onyx.merge(ONYXKEYS.WALLET_ONFIDO, {error: '', loading: true});
            } else if (currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS) {
                setAdditionalDetailsStep(false);
            } else if (currentStep === CONST.WALLET.STEP.TERMS) {
                Onyx.merge(ONYXKEYS.WALLET_TERMS, {loading: false});
            }
        });
}

/**
 * Fetches information about a user's Expensify Wallet
 *
 * @typedef {Object} UserWallet
 * @property {Number} availableBalance
 * @property {Number} currentBalance
 * @property {String} currentStep - used to track which step of the "activate wallet" flow a user is in
 * @property {('SILVER'|'GOLD')} tierName - will be GOLD when fully activated. SILVER is able to recieve funds only.
 */
function fetchUserWallet() {
    API.Get({returnValueList: 'userWallet'})
        .then((response) => {
            if (response.jsonCode !== 200) {
                return;
            }

            Onyx.merge(ONYXKEYS.USER_WALLET, response.userWallet);
        });
}

export {
    fetchOnfidoToken,
    setAdditionalDetailsStep,
    activateWallet,
    fetchUserWallet,
};
