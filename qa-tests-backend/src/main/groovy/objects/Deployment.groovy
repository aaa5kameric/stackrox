package objects

class Deployment {
    String name
    String namespace
    List<String> volNames = new ArrayList<String>()
    List<String> volMounts = new ArrayList<String>()
    String image
    String mountpath
    List<String> secretNames = new ArrayList<String>()
    Map<String, String> labels = new HashMap<>()
    Map<Integer, String> ports = new HashMap<>()
    List<String> command = new ArrayList<>()
    List<Pod> pods = new ArrayList<>()
    String deploymentUid
    Boolean skipReplicaWait = false
    List<String> args = new ArrayList<>()
    Boolean exposeAsService = false
    Map<String, String> env = new HashMap<>()

    Deployment setName(String n) {
        this.name = n
        // This label will be the selector used to select this deployment.
        this.addLabel("name", n)
        return this
    }

    Deployment setNamespace(String n) {
        this.namespace = n
        return this
    }

    Deployment setImage(String i) {
        this.image = i
        return this
    }

    Deployment addMountPath(String m) {
        this.mountpath = m
        return this
    }

    Deployment addLabel(String k, String v) {
        this.labels[k] = v
        return this
    }

    Deployment addPort(Integer p, String protocol = "TCP") {
        this.ports.put(p, protocol)
        return this
    }

    Deployment setCommand(List<String> command) {
        this.command = command
        return this
    }

    Deployment setArgs(List<String> args) {
        this.args = args
        return this
    }

    Deployment setExposeAsService(Boolean expose) {
        this.exposeAsService = expose
        return this
    }

    Deployment addSecretName(String s) {
        this.secretNames.add(s)
        return this
    }

    Deployment addVolName(String v) {
        this.volNames.add(v)
        return this
    }

    Deployment addVolMountName(String v) {
        this.volMounts.add(v)
        return this
    }

    Deployment setSkipReplicaWait(Boolean skip) {
        this.skipReplicaWait = skip
        return this
    }

    Deployment addPod(String podName, String podUid, List<String> containerIds, String podIP) {
        this.pods.add(
                new Pod(
                        name: podName,
                        namespace: this.namespace,
                        uid: podUid,
                        containerIds: containerIds,
                        podIP: podIP
                )
        )
        return this
    }

    Deployment setEnv(Map<String, String> env) {
        this.env = env
        return this
    }
}
