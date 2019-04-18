import { stackroxSupport } from 'messages/common';
import { LICENSE_STATUS } from 'reducers/license';
import { distanceInWordsToNow, differenceInDays } from 'date-fns';

export const invalidText =
    'Your StackRox license key is invalid. In order to use StackRox, please obtain and install a new valid license key.';
export const expiredText = `Your license key has expired. Please upload a new license key, or contact our customer success team over email or by calling ${
    stackroxSupport.phoneNumber.withSpaces
} to renew  your StackRox Kubernetes Security  Platform license.`;
export const validText = 'Your StackRox license has been renewed';

export const getUploadResponseMessage = data => {
    const message = {
        text: '',
        type: 'info'
    };
    if (!data) return message;
    if (data.message) {
        message.text = data.message;
        message.type = 'error';
        return message;
    }
    switch (data) {
        case LICENSE_STATUS.VALID:
            message.text = validText;
            message.type = 'info';
            return message;
        case LICENSE_STATUS.RESTARTING:
            message.text = 'Restarting';
            message.type = 'info';
            return message;
        case LICENSE_STATUS.NONE_OR_INVALID:
            message.text = invalidText;
            message.type = 'error';
            return message;
        default:
            return message;
    }
};

export const getLicenseStatusMessage = licenseStatus => {
    let message = {
        text: '',
        type: 'info'
    };
    switch (licenseStatus) {
        case LICENSE_STATUS.VALID:
            message.text = validText;
            message.type = 'info';
            return message;
        case LICENSE_STATUS.RESTARTING:
            message.text = 'Restarting';
            message.type = 'info';
            return message;
        case LICENSE_STATUS.NONE_OR_INVALID:
            message.text = invalidText;
            message.type = 'error';
            return message;
        default:
            message = null;
            return message;
    }
};

export const createExpirationMessage = expirationDate => {
    const daysLeft = differenceInDays(expirationDate, new Date());
    const message = `Your license will expire in ${distanceInWordsToNow(
        expirationDate
    )}. Upload a new license key to renew your account.`;
    let type;

    if (daysLeft > 3 && daysLeft <= 14) {
        type = 'warn';
    } else if (daysLeft <= 3) {
        type = 'error';
    } else {
        return null;
    }
    return {
        message,
        type
    };
};
