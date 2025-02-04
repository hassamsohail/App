import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ExpensifyText from '../../../components/ExpensifyText';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import WorkspaceSection from '../WorkspaceSection';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import CopyTextToClipboard from '../../../components/CopyTextToClipboard';
import * as Link from '../../../libs/actions/Link';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceReimburseNoVBAView = props => (
    <>
        <WorkspaceSection
            title={props.translate('workspace.reimburse.captureReceipts')}
            icon={Illustrations.ReceiptYellow}
            menuItems={[
                {
                    title: props.translate('workspace.reimburse.viewAllReceipts'),
                    onPress: () => Link.openOldDotLink(`expenses?policyIDList=${props.policyID}&billableReimbursable=reimbursable&submitterEmail=%2B%2B`),
                    icon: Expensicons.Receipt,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4, styles.flexRow, styles.flexWrap]}>
                <ExpensifyText>
                    {props.translate('workspace.reimburse.captureNoVBACopyBeforeEmail')}
                    <CopyTextToClipboard
                        text="receipts@expensify.com"
                        textStyles={[styles.textBlue]}
                    />
                    <ExpensifyText>{props.translate('workspace.reimburse.captureNoVBACopyAfterEmail')}</ExpensifyText>
                </ExpensifyText>
            </View>
        </WorkspaceSection>

        <WorkspaceSection
            title={props.translate('workspace.reimburse.unlockNextDayReimbursements')}
            icon={Illustrations.JewelBoxGreen}
            menuItems={[
                {
                    title: props.translate('workspace.common.bankAccount'),
                    onPress: () => Navigation.navigate(ROUTES.getWorkspaceBankAccountRoute(props.policyID)),
                    icon: Expensicons.Bank,
                    shouldShowRightIcon: true,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <ExpensifyText>{props.translate('workspace.reimburse.unlockNoVBACopy')}</ExpensifyText>
            </View>
        </WorkspaceSection>
    </>
);

WorkspaceReimburseNoVBAView.propTypes = propTypes;
WorkspaceReimburseNoVBAView.displayName = 'WorkspaceReimburseNoVBAView';

export default withLocalize(WorkspaceReimburseNoVBAView);
