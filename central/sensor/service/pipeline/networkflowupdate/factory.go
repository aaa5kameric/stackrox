package networkflowupdate

import (
	"context"

	"github.com/pkg/errors"
	"github.com/stackrox/rox/central/networkflow/datastore"
	"github.com/stackrox/rox/central/sensor/service/pipeline"
)

// NewFactory returns a new instance of a FragmentFactory that returns Fragments handling NetworkFlowUpdate messages
// from sensor.
func NewFactory(clusterStore datastore.ClusterDataStore) pipeline.FragmentFactory {
	return &factoryImpl{
		clusterStore: clusterStore,
	}
}

type factoryImpl struct {
	clusterStore datastore.ClusterDataStore
}

// GetFragment returns a new pipeline fragment for the given cluster.
func (s *factoryImpl) GetFragment(ctx context.Context, clusterID string) (pipeline.Fragment, error) {
	flowStore, err := s.clusterStore.GetFlowStore(ctx, clusterID)
	if err != nil {
		return nil, errors.Wrapf(err, "could not obtain flow store for cluster %s", clusterID)
	}

	if flowStore == nil {
		flowStore, err = s.clusterStore.CreateFlowStore(ctx, clusterID)
		if err != nil {
			return nil, errors.Wrapf(err, "creating flow store for cluster %s", clusterID)
		}
	}
	return NewPipeline(clusterID, newFlowStoreUpdater(flowStore)), nil
}
