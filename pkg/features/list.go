package features

//lint:file-ignore U1000 we want to introduce this feature flag unused.

var (
	// csvExport enables CSV export of search results.
	csvExport = registerFeature("Enable CSV export of search results", "ROX_CSV_EXPORT", false)

	// NetworkDetectionBaselineSimulation enables new features related to the baseline simulation part of the network detection experience.
	NetworkDetectionBaselineSimulation = registerFeature("Enable network detection baseline simulation", "ROX_NETWORK_DETECTION_BASELINE_SIMULATION", true)

	// IntegrationsAsConfig enables loading integrations from config
	IntegrationsAsConfig = registerFeature("Enable loading integrations from config", "ROX_INTEGRATIONS_AS_CONFIG", false)

	// QuayRobotAccounts enables Robot accounts as credentials in Quay Image Integration.
	QuayRobotAccounts = registerFeature("Enable Robot accounts in Quay Image Integration", "ROX_QUAY_ROBOT_ACCOUNTS", true)

	// RoxctlNetpolGenerate enables 'roxctl netpol generate' command which integrates with NP-Guard
	RoxctlNetpolGenerate = registerFeature("Enable 'roxctl generate netpol' command", "ROX_ROXCTL_NETPOL_GENERATE", true)

	// RoxSyslogExtraFields enables user to add additional key value pairs in syslog alert notification in cef format.
	RoxSyslogExtraFields = registerFeature("Enable extra fields for syslog integration", "ROX_SYSLOG_EXTRA_FIELDS", true)

	// SourcedAutogeneratedIntegrations enables adding a "source" to autogenerated integrations.
	SourcedAutogeneratedIntegrations = registerFeature("Enable autogenerated integrations with cluster/namespace/secret source", "ROX_SOURCED_AUTOGENERATED_INTEGRATIONS", false)

	// VulnMgmtWorkloadCVEs enables APIs and UI pages for the VM Workload CVE enhancements
	VulnMgmtWorkloadCVEs = registerFeature("Vuln Mgmt Workload CVEs", "ROX_VULN_MGMT_WORKLOAD_CVES", true)

	// PostgresBlobStore enables the creation of the Postgres Blob Store
	PostgresBlobStore = registerFeature("Postgres Blob Store", "ROX_POSTGRES_BLOB_STORE", false)

	// StoreEventHashes stores the hashes of successfully processed objects we receive from Sensor into the database
	StoreEventHashes = registerFeature("Store Event Hashes", "ROX_STORE_EVENT_HASHES", true)

	// PreventSensorRestartOnDisconnect enables a new behavior in Sensor where it avoids restarting when the gRPC connection with Central ends.
	PreventSensorRestartOnDisconnect = registerFeature("Prevent Sensor restart on disconnect", "ROX_PREVENT_SENSOR_RESTART_ON_DISCONNECT", false)

	// SyslogNamespaceLabels enables sending namespace labels as part of the syslog alert notification.
	SyslogNamespaceLabels = registerFeature("Send namespace labels as part of the syslog alert notification", "ROX_SEND_NAMESPACE_LABELS_IN_SYSLOG", true)

	// ComplianceEnhancements enables APIs and UI pages for Compliance 2.0
	ComplianceEnhancements = registerFeature("Compliance enhancements", "ROX_COMPLIANCE_ENHANCEMENTS", false)

	// CentralEvents enables APIs (including collection) and UI pages for Central events.
	CentralEvents = registerFeature("Enable Central events", "ROX_CENTRAL_EVENTS", false)
)
