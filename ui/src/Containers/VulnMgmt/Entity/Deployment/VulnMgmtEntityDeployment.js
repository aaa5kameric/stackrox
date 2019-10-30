import React from 'react';
import gql from 'graphql-tag';

import useCases from 'constants/useCaseTypes';
import { workflowEntityPropTypes, workflowEntityDefaultProps } from 'constants/entityPageProps';
import queryService from 'modules/queryService';
import entityTypes from 'constants/entityTypes';
import WorkflowEntityPage from 'Containers/Workflow/WorkflowEntityPage';
import { CVE_LIST_FRAGMENT } from 'Containers/VulnMgmt/VulnMgmt.fragments';
import VulnMgmtDeploymentOverview from './VulnMgmtDeploymentOverview';
import EntityList from '../../List/VulnMgmtList';

const VulmMgmtDeployment = ({ entityId, entityListType, search, entityContext, sort, page }) => {
    const overviewQuery = gql`
        query getDeployment($id: ID!, $query: String) {
            result: deployment(id: $id) {
                id
                priority
                policyStatus
                failingPolicies {
                    id
                    name
                    description
                    policyStatus
                    latestViolation
                    severity
                    deploymentCount
                    lifecycleStages
                    enforcementActions
                }
                annotations {
                    key
                    value
                }
                ${entityContext[entityTypes.CLUSTER] ? '' : 'cluster { id name}'}
                hostNetwork: id
                imagePullSecrets
                inactive
                labels {
                    key
                    value
                }
                name
                ${entityContext[entityTypes.NAMESPACE] ? '' : 'namespace namespaceId'}
                ports {
                    containerPort
                    exposedPort
                    exposure
                    exposureInfos {
                        externalHostnames
                        externalIps
                        level
                        nodePort
                        serviceClusterIp
                        serviceId
                        serviceName
                        servicePort
                    }
                    name
                    protocol
                }
                priority
                replicas
                ${
                    entityContext[entityTypes.SERVICE_ACCOUNT]
                        ? ''
                        : 'serviceAccount serviceAccountID'
                }
                failingPolicyCount(query: $query)
                tolerations {
                    key
                    operator
                    taintEffect
                    value
                }
                type
                created
                secretCount
                imageCount
                imageComponentCount
                vulnCount
                vulnerabilities: vulns {
                    ...cveListFields
                }
            }
        }
        ${CVE_LIST_FRAGMENT}
    `;

    function getListQuery(listFieldName, fragmentName, fragment) {
        return gql`
        query getDeployment${entityListType}($id: ID!, $query: String) {
            result: deployment(id: $id) {
                id
                ${listFieldName}(query: $query) { ...${fragmentName} }
            }
        }
        ${fragment}
    `;
    }

    const queryOptions = {
        variables: {
            id: entityId,
            query: queryService.objectToWhereClause(search)
        }
    };

    return (
        <WorkflowEntityPage
            entityId={entityId}
            entityType={entityTypes.DEPLOYMENT}
            entityListType={entityListType}
            useCase={useCases.VULN_MANAGEMENT}
            ListComponent={EntityList}
            OverviewComponent={VulnMgmtDeploymentOverview}
            overviewQuery={overviewQuery}
            getListQuery={getListQuery}
            search={search}
            sort={sort}
            page={page}
            queryOptions={queryOptions}
            entityContext={entityContext}
        />
    );
};

VulmMgmtDeployment.propTypes = workflowEntityPropTypes;
VulmMgmtDeployment.defaultProps = workflowEntityDefaultProps;

export default VulmMgmtDeployment;
