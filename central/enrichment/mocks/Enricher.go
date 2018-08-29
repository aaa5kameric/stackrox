// Code generated by mockery v1.0.0. DO NOT EDIT.
package mocks

import mock "github.com/stretchr/testify/mock"
import v1 "github.com/stackrox/rox/generated/api/v1"

// Enricher is an autogenerated mock type for the Enricher type
type Enricher struct {
	mock.Mock
}

// Enrich provides a mock function with given fields: deployment
func (_m *Enricher) Enrich(deployment *v1.Deployment) (bool, error) {
	ret := _m.Called(deployment)

	var r0 bool
	if rf, ok := ret.Get(0).(func(*v1.Deployment) bool); ok {
		r0 = rf(deployment)
	} else {
		r0 = ret.Get(0).(bool)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(*v1.Deployment) error); ok {
		r1 = rf(deployment)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// RemoveMultiplier provides a mock function with given fields: id
func (_m *Enricher) RemoveMultiplier(id string) {
	_m.Called(id)
}

// ReprocessDeploymentRiskAsync provides a mock function with given fields: deployment
func (_m *Enricher) ReprocessDeploymentRiskAsync(deployment *v1.Deployment) {
	_m.Called(deployment)
}

// ReprocessRiskAsync provides a mock function with given fields:
func (_m *Enricher) ReprocessRiskAsync() {
	_m.Called()
}

// UpdateMultiplier provides a mock function with given fields: multiplier
func (_m *Enricher) UpdateMultiplier(multiplier *v1.Multiplier) {
	_m.Called(multiplier)
}
