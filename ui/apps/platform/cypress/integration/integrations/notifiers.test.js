/* eslint-disable no-multi-str */
import { selectors } from '../../constants/IntegrationsPage';
import * as api from '../../constants/apiEndpoints';
import withAuth from '../../helpers/basicAuth';
import {
    generateNameWithDate,
    getHelperElementByLabel,
    getInputByLabel,
} from '../../helpers/formHelpers';
import sampleCert from '../../helpers/sampleCert';

describe('Notifiers Test', () => {
    withAuth();

    beforeEach(() => {
        cy.intercept('GET', api.integrations.notifiers, {
            fixture: 'integrations/notifiers.json',
        }).as('getNotifiers');

        cy.visit('/');
        cy.get(selectors.configure).click();
        cy.get(selectors.navLink).click({ force: true });
        cy.wait('@getNotifiers');
    });

    describe('Notifier forms', () => {
        it('should create a new AWS Security Hub integration', () => {
            const integrationName = generateNameWithDate('Nova AWS Security Hub');

            cy.get(selectors.awsSecurityHubTile).click();

            // @TODO: only use the the click, and delete the direct URL visit after forms official launch
            cy.get(selectors.buttons.new).click();
            cy.visit('/main/integrations/notifiers/awsSecurityHub/create');

            // Step 0, should start out with disabled Save and Test buttons
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 1, check empty fields
            getInputByLabel('Integration name').click().blur();
            getInputByLabel('AWS account number').click().blur();
            getInputByLabel('AWS region').focus().blur(); // focus, then blur, select in order to trigger validation
            getInputByLabel('Access key ID').click().blur();
            getInputByLabel('Secret access key').click().blur();

            getHelperElementByLabel('Integration name').contains('An integration name is required');
            getHelperElementByLabel('AWS account number').contains(
                'An AWS account number is required'
            );
            getHelperElementByLabel('AWS region').contains('An AWS region is required');
            getHelperElementByLabel('Access key ID').contains('An access key ID is required');
            getHelperElementByLabel('Secret access key').contains(
                'A secret access key is required'
            );
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 2, check fields for invalid formats
            getInputByLabel('Integration name').clear().type(integrationName);
            getInputByLabel('AWS region').select('US East (N. Virginia) us-east-1');
            getInputByLabel('Access key ID').click().type('AKIA5VNQSYCDODH7VKMK');
            getInputByLabel('Secret access key')
                .click()
                .type('3JBA+EtbcGwONcx+1CKvbCn4FxFLRGiDANfzD+Vr');
            getInputByLabel('AWS account number').clear().type('93935755277').blur();

            getHelperElementByLabel('AWS account number').contains(
                'AWS account numbers must be 12 characters long'
            );
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 3, check valid form and save
            getInputByLabel('AWS account number').clear().type('939357552771').blur();

            cy.get(selectors.buttons.test).should('be.enabled');
            cy.get(selectors.buttons.save).should('be.enabled').click();
        });

        it('should create a new Email integration', () => {
            cy.get(selectors.emailTile).click();

            cy.get(selectors.buttons.new).click();

            // Step 0, should start out with disabled Save and Test buttons
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 1, check empty fields
            getInputByLabel('Integration name').type(' ');
            getInputByLabel('Email server').type(' ');
            getInputByLabel('Username').type(' ');
            getInputByLabel('Password').type(' ');
            getInputByLabel('Sender').type(' ');
            getInputByLabel('Default recipient').type(' ').blur();

            getHelperElementByLabel('Integration name').contains('Required');
            getHelperElementByLabel('Email server').contains('A server address is required');
            getHelperElementByLabel('Username').contains('A username is required');
            getHelperElementByLabel('Password').contains('A password is required');
            getHelperElementByLabel('Sender').contains('A sender email address is required');
            getHelperElementByLabel('Default recipient').contains(
                'A default recipient email address is required'
            );
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 2, check fields for invalid formats
            getInputByLabel('Email server').type('example.');
            getInputByLabel('Sender').type('scooby@doo', {
                parseSpecialCharSequences: false,
            });
            getInputByLabel('Default recipient')
                .type('shaggy@', {
                    parseSpecialCharSequences: false,
                })
                .blur();

            getHelperElementByLabel('Email server').contains('Must be a valid server address');
            getHelperElementByLabel('Sender').contains('Must be a valid sender email address');
            getHelperElementByLabel('Default recipient').contains(
                'Must be a valid default recipient email address'
            );
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 3, check valid from and save
            getInputByLabel('Integration name')
                .clear()
                .type(`Nova Email ${new Date().toISOString()}`);
            getInputByLabel('Email server').type('smtp.example.com:465');
            getInputByLabel('Username').clear().type('scooby');
            getInputByLabel('Password').clear().type('monkey');
            getInputByLabel('From').clear().type('ACS');
            getInputByLabel('Sender').clear().type('scooby@doo.com', {
                parseSpecialCharSequences: false,
            });
            getInputByLabel('Default recipient').clear().type('shaggy@example.com', {
                parseSpecialCharSequences: false,
            });
            getInputByLabel('Annotation key for recipient').clear().type('email');
            getInputByLabel('Disable TLS certificate validation (insecure)').click();

            cy.get(selectors.buttons.test).should('be.enabled');
            cy.get(selectors.buttons.save).should('be.enabled').click();
        });

        it('should create a new Generic Webhook integration', () => {
            cy.get(selectors.genericWebhookTile).click();

            cy.get(selectors.buttons.new).click();

            // Step 0, should start out with disabled Save and Test buttons
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 1, check empty fields
            getInputByLabel('Integration name').type(' ');
            getInputByLabel('Endpoint').type(' ').blur();
            getHelperElementByLabel('Integration name').contains('Name is required');
            getHelperElementByLabel('Endpoint').contains('Endpoint is required');
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 2, check fields for invalid formats, or conditional validation
            getInputByLabel('Endpoint').type('example').blur();
            getHelperElementByLabel('Endpoint').contains('Endpoint must be a valid URL');

            getInputByLabel('Username').type('neo').blur();
            getInputByLabel('Password').type(' ').blur();
            getHelperElementByLabel('Password').contains(
                'A password is required if the integration has a username'
            );

            getInputByLabel('Password').clear().type('monkey').blur();
            getInputByLabel('Username').clear().type(' ').blur();
            getHelperElementByLabel('Username').contains(
                'A username is required if the integration has a password'
            );

            // Step 3, check valid from and save
            getInputByLabel('Integration name')
                .clear()
                .type(`Nova Generic Webhook ${new Date().toISOString()}`);
            getInputByLabel('Endpoint').clear().type('example.com:3000/hooks/123');
            getInputByLabel('CA certificate (optional)').type(sampleCert, { delay: 1 });
            getInputByLabel('Skip TLS verification').click();
            getInputByLabel('Enable audit logging').click();
            getInputByLabel('Username').clear().type('neo');
            getInputByLabel('Password').clear().type('spoon').blur();
            cy.get('button:contains("Add new header")').click();
            getInputByLabel('Key').type('x-org');
            getInputByLabel('Value').type('mysteryinc').blur();

            cy.get(selectors.buttons.test).should('be.enabled');
            cy.get(selectors.buttons.save).should('be.enabled').click();
        });

        it('should create a new Google Cloud SCC integration', () => {
            cy.get(selectors.googleCloudSCCTile).click();

            cy.get(selectors.buttons.new).click();

            // Step 0, should start out with disabled Save and Test buttons
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 1, check empty fields
            getInputByLabel('Integration name').type(' ');
            getInputByLabel('Cloud SCC Source ID').type(' ');
            getInputByLabel('Service Account Key (JSON)').type(' ').blur();

            getHelperElementByLabel('Integration name').contains('Required');
            getHelperElementByLabel('Cloud SCC Source ID').contains('A source ID is required');
            getHelperElementByLabel('Service Account Key (JSON)').contains(
                'A service account is required'
            );
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 2, check fields for invalid formats
            getInputByLabel('Cloud SCC Source ID').type('organization-123');
            getInputByLabel('Service Account Key (JSON)')
                .type('{ "type": "service_account", "project_id": "123456"', {
                    parseSpecialCharSequences: false,
                })
                .blur();

            getHelperElementByLabel('Cloud SCC Source ID').contains(
                'SCC source ID must match the format: organizations/[0-9]+/sources/[0-9]+'
            );
            getHelperElementByLabel('Service Account Key (JSON)').contains(
                'Service account must be valid JSON'
            );
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 3, check valid from and save
            getInputByLabel('Integration name')
                .clear()
                .type(`Nova Google Cloud SCC ${new Date().toISOString()}`);
            getInputByLabel('Cloud SCC Source ID').clear().type('organizations/123/sources/456');
            getInputByLabel('Service Account Key (JSON)')
                .clear()
                .type('{ "type": "service_account", "project_id": "123456" }', {
                    parseSpecialCharSequences: false,
                })
                .blur();

            cy.get(selectors.buttons.test).should('be.enabled');
            cy.get(selectors.buttons.save).should('be.enabled').click();
        });

        it('should create a new Jira integration', () => {
            // mocking create needed b/c backend Save actually pings your Jira on Save,
            //   not just on test
            cy.intercept('POST', api.integrations.notifiers, {
                body: { id: 'abcdefgh' },
            }).as('CreateJira');

            cy.get(selectors.jiraTile).click();

            cy.get(selectors.buttons.new).click();

            // Step 0, should start out with disabled Save and Test buttons
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 1, check empty fields
            getInputByLabel('Integration name').click();
            getInputByLabel('Username').click();
            getInputByLabel('Password or API token').click();
            getInputByLabel('Issue type').click();
            getInputByLabel('Jira URL').click();
            getInputByLabel('Default project').click().blur();

            getHelperElementByLabel('Integration name').contains('Name is required');
            getHelperElementByLabel('Username').contains('Username is required');
            getHelperElementByLabel('Password or API token').contains(
                'Password or API token is required'
            );
            getHelperElementByLabel('Issue type').contains('Issue type is required');
            getHelperElementByLabel('Jira URL').contains('Jira URL is required');
            getHelperElementByLabel('Default project').contains('A default project is required');
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 2, check fields for invalid formats
            // not certain if any fields have invalid formats at this time

            // Step 3, check valid form and save
            const isoString = new Date().toISOString();
            getInputByLabel('Integration name').clear().type(`Test new Jira ${isoString}`);
            getInputByLabel('Username').clear().type('socrates');
            getInputByLabel('Password or API token').clear().type('monkey');
            getInputByLabel('Issue type').clear().type('Bug');
            getInputByLabel('Jira URL').clear().type('https://example.atlassian.net');
            getInputByLabel('Default project').clear().type('Unicorn').blur();

            cy.get(selectors.buttons.test).should('be.enabled');
            cy.get(selectors.buttons.save).should('be.enabled').click();

            cy.wait(['@CreateJira']);
        });

        it('should create a new PagerDuty integration', () => {
            cy.get(selectors.pagerDutyTile).click();

            cy.get(selectors.buttons.new).click();

            // Step 0, should start out with disabled Save and Test buttons
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 1, check empty fields
            getInputByLabel('Integration name').type(' ').blur();
            getInputByLabel('PagerDuty integration key').type(' ').clear().blur();

            getHelperElementByLabel('Integration name').contains('Integration name is required');
            getHelperElementByLabel('PagerDuty integration key').contains(
                'PagerDuty integration key is required'
            );
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 2, check fields for invalid formats
            /*
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');
            */

            // Step 3, check valid form and save
            const integrationName = generateNameWithDate('Nova PagerDuty');
            getInputByLabel('Integration name').clear().type(integrationName);
            getInputByLabel('PagerDuty integration key').type('key');

            cy.get(selectors.buttons.test).should('be.enabled');
            cy.get(selectors.buttons.save).should('be.enabled').click();
        });

        it('should create a new Sumo Logic integration', () => {
            cy.get(selectors.sumologicTile).click();

            cy.get(selectors.buttons.new).click();

            // Step 0, should start out with disabled Save and Test buttons
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 1, check empty fields
            getInputByLabel('Integration name').type(' ');
            getInputByLabel('HTTP Collector Source Address').type(' ').blur();

            getHelperElementByLabel('Integration name').contains('Integration name is required');
            getHelperElementByLabel('HTTP Collector Source Address').contains(
                'HTTP Collector Source Address is required'
            );
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 2, check fields for invalid formats
            /*
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');
            */

            // Step 3, check valid from and save
            const integrationName = generateNameWithDate('Nova Sumo Logic');
            getInputByLabel('Integration name').clear().type(integrationName);
            getInputByLabel('HTTP Collector Source Address')
                .clear()
                .type('https://endpoint.sumologic.com/receiver/v1/http/');

            cy.get(selectors.buttons.test).should('be.enabled');
            cy.get(selectors.buttons.save).should('be.enabled').click();
        });

        it('should create a new Splunk integration', () => {
            cy.get(selectors.splunkTile).click();

            cy.get(selectors.buttons.new).click();

            // Step 0, should start out with disabled Save and Test buttons
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 1, check empty fields
            getInputByLabel('Integration name').type(' ');
            getInputByLabel('HTTP event collector URL').type(' ');
            getInputByLabel('HTTP event collector token').type(' ');
            getInputByLabel('HEC truncate limit').clear().type(' ');
            getInputByLabel('Source type for alert').clear().type(' ');
            getInputByLabel('Source type for audit').clear().type(' ').blur();

            getHelperElementByLabel('Integration name').contains('Name is required');
            getHelperElementByLabel('HTTP event collector URL').contains(
                'HTTP event collector URL is required'
            );
            getHelperElementByLabel('HTTP event collector token').contains(
                'HTTP token is required'
            );
            getHelperElementByLabel('HEC truncate limit').contains(
                'HEC truncate limit is required'
            );
            getHelperElementByLabel('Source type for alert').contains(
                'Source type for alert is required'
            );
            getHelperElementByLabel('Source type for audit').contains(
                'Source type for audit is required'
            );
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 2, check fields for invalid formats
            getInputByLabel('HTTP event collector URL').clear().type('https://input').blur();

            getHelperElementByLabel('HTTP event collector URL').contains(
                'Must be a valid server address'
            );
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 3, check valid from and save
            getInputByLabel('Integration name')
                .clear()
                .type(`Nova Splunk ${new Date().toISOString()}`);
            getInputByLabel('HTTP event collector URL')
                .clear()
                .type(
                    'https://input-prd-p-76sv8wzbfpdv.cloud.splunk.com:8088/services/collector/event'
                );
            getInputByLabel('HTTP event collector token').clear().type('asecrettoken');
            getInputByLabel('HEC truncate limit').type('5000');
            getInputByLabel('Disable TLS certificate validation (insecure)').click();
            getInputByLabel('Enable audit logging').click();
            getInputByLabel('Source type for alert').clear().type('stackrox-alert');
            getInputByLabel('Source type for audit').clear().type('stackrox-audit-message');

            cy.get(selectors.buttons.test).should('be.enabled');
            cy.get(selectors.buttons.save).should('be.enabled').click();
        });

        it('should create a new Slack integration', () => {
            cy.get(selectors.slackTile).click();

            cy.get(selectors.buttons.new).click();

            // Step 0, should start out with disabled Save and Test buttons
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 1, check empty fields
            getInputByLabel('Integration name').click().blur();
            getInputByLabel('Default Slack webhook').click().blur();
            getInputByLabel('Annotation key for Slack webhook').click().blur();

            getHelperElementByLabel('Integration name').contains('Name is required');
            getHelperElementByLabel('Default Slack webhook').contains('Slack webhook is required');
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 2, check fields for invalid formats
            getInputByLabel('Integration name')
                .clear()
                .type(`Nova Slack ${new Date().toISOString()}`);
            getInputByLabel('Default Slack webhook')
                .clear()
                .type('https://hooks.slack.com/services/')
                .blur();

            getHelperElementByLabel('Default Slack webhook').contains(
                'Must be a valid Slack webhook URL, like https://hooks.slack.com/services/EXAMPLE'
            );
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 3, check valid form and save
            getInputByLabel('Annotation key for Slack webhook').clear().type('slack');
            getInputByLabel('Default Slack webhook')
                .clear()
                .type('https://hooks.slack.com/services/scooby/doo')
                .blur();

            cy.get(selectors.buttons.test).should('be.enabled');
            cy.get(selectors.buttons.save).should('be.enabled').click();
        });

        it('should create a new Syslog integration', () => {
            cy.get(selectors.syslogTile).click();

            // @TODO: only use the the click, and delete the direct URL visit after forms official launch
            cy.get(selectors.buttons.new).click();
            cy.visit('/main/integrations/notifiers/syslog/create');

            // Step 0, should start out with disabled Save and Test buttons
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 1, check empty fields
            getInputByLabel('Integration name').click().blur();
            getInputByLabel('Logging facility').focus().blur(); // focus, then blur, select in order to trigger validation
            getInputByLabel('Receiver host').click().blur();
            getInputByLabel('Receiver port').click().clear().blur();

            getHelperElementByLabel('Integration name').contains('Integration name is required');
            getHelperElementByLabel('Logging facility').contains('Logging facility is required');
            getHelperElementByLabel('Receiver host').contains('Receiver host is required');
            getHelperElementByLabel('Receiver port').contains('Receiver port is required');
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 2, check fields for invalid formats
            const integrationName = generateNameWithDate('Nova Syslog');
            getInputByLabel('Integration name').clear().type(integrationName);
            getInputByLabel('Logging facility').select('local0').blur();
            getInputByLabel('Receiver host').clear().type('host.example.com').blur();
            getInputByLabel('Receiver port').clear().type('65536').blur();

            getHelperElementByLabel('Receiver port').contains(
                'Receiver port must be between 1 and 65535'
            );
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 3, check valid form and save
            getInputByLabel('Receiver port').clear().type('1').blur();

            cy.get(selectors.buttons.test).should('be.enabled');
            cy.get(selectors.buttons.save).should('be.enabled').click();
        });

        it('should create a new Teams integration', () => {
            cy.get(selectors.teamsTile).click();

            cy.get(selectors.buttons.new).click();

            // Step 0, should start out with disabled Save and Test buttons
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 1, check empty fields
            getInputByLabel('Integration name').click().blur();
            getInputByLabel('Default Teams webhook').click().blur();

            getHelperElementByLabel('Integration name').contains('Integration name is required');
            getHelperElementByLabel('Default Teams webhook').contains('Webhook is required');
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 2, check fields for invalid formats
            getInputByLabel('Integration name')
                .clear()
                .type(`Nova Teams ${new Date().toISOString()}`);
            getInputByLabel('Default Teams webhook')
                .clear()
                .type('https://outlook.office365.com/webhook')
                .blur();

            getHelperElementByLabel('Default Teams webhook').contains(
                'Must be a valid Teams webhook URL, like https://outlook.office365.com/webhook/EXAMPLE'
            );
            cy.get(selectors.buttons.test).should('be.disabled');
            cy.get(selectors.buttons.save).should('be.disabled');

            // Step 3, check valid form and save
            getInputByLabel('Default Teams webhook')
                .clear()
                .type('https://outlook.office365.com/webhook/scooby/doo')
                .blur();
            getInputByLabel('Annotation key for Teams webhook').clear().type('teams');

            cy.get(selectors.buttons.test).should('be.enabled');
            cy.get(selectors.buttons.save).should('be.enabled').click();
        });
    });
});
