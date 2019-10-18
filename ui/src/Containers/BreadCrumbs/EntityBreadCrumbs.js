import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'react-feather';
import EntityBreadCrumb from 'Containers/BreadCrumbs/EntityBreadCrumb';
import { generateURL } from 'modules/URLReadWrite';
import EntityIcon from 'Components/EntityIcon';
import WorkflowStateMgr from 'modules/WorkflowStateManager';
import workflowStateContext from 'Containers/workflowStateContext';

const Icon = (
    <ChevronRight className="bg-base-200 border border-base-400 mx-4 rounded-full" size="14" />
);

function getBackLink(workflowState, enabled) {
    const url = enabled
        ? null
        : generateURL(new WorkflowStateMgr(workflowState).pop().workflowState);
    return url ? (
        <Link
            className="flex items-center justify-center text-base-600 border-r border-base-300 px-4 mr-4 h-full hover:bg-primary-200 w-16"
            to={url}
        >
            <ArrowLeft className="h-6 w-6 text-600" />
        </Link>
    ) : (
        <EntityIcon
            className="flex items-center justify-center border-r border-base-300 px-4 mr-4 h-full w-16"
            entityType={workflowState.getCurrentEntity().entityType}
        />
    );
}

const getUrl = (workflowState, steps) => {
    const mgr = new WorkflowStateMgr(workflowState);
    for (let x = 1; x < steps; x += 1) {
        mgr.pop();
    }
    const newURL = generateURL(mgr.workflowState);
    const currentURL = generateURL(workflowState);
    return newURL === currentURL ? null : newURL;
};

const BreadCrumbLinks = ({ workflowEntities }) => {
    const workflowState = useContext(workflowStateContext);

    let maxWidthClass = 'max-w-full';

    if (workflowEntities.length > 1) maxWidthClass = `max-w-1/${workflowEntities.length}`;

    const breadCrumbLinks = workflowEntities.map((workflowEntity, i, { length }) => {
        const icon = i !== length - 1 ? Icon : null;
        const url = getUrl(workflowState, length - i);

        return (
            <div key={`${workflowEntity.entityId}`} className={`flex ${maxWidthClass} truncate`}>
                <EntityBreadCrumb workflowEntity={workflowEntity} url={url} />
                <span className="flex items-center">{icon}</span>
            </div>
        );
    });
    const backButtonEnabled = !!workflowEntities.length > 1;
    return (
        <span
            style={{ flex: '10 1' }}
            className="flex items-center font-700 leading-normal text-base-600 tracking-wide truncate"
        >
            {getBackLink(workflowState, backButtonEnabled)}
            {breadCrumbLinks}
        </span>
    );
};

export default BreadCrumbLinks;
