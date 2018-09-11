#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)"

export PREVENT_IMAGE_TAG="${PREVENT_IMAGE_TAG:-$(git describe --tags --abbrev=10 --dirty)}"
echo "StackRox Prevent image tag set to $PREVENT_IMAGE_TAG"

export PREVENT_IMAGE="${PREVENT_IMAGE:-stackrox/prevent:$PREVENT_IMAGE_TAG}"
echo "StackRox Prevent image set to $PREVENT_IMAGE"

# generate_ca
# arguments:
#   - directory to drop files in
function generate_ca {
    OUTPUT_DIR="$1"

    if [ ! -f "$OUTPUT_DIR/ca-key.pem" ]; then
        echo "Generating CA key..."
        echo " + Getting cfssl..."
        go get -u github.com/cloudflare/cfssl/cmd/...
        echo " + Generating keypair..."
        PWD=$(pwd)
        cd "$OUTPUT_DIR"
        echo '{"CN":"CA","key":{"algo":"ecdsa"}}' | cfssl gencert -initca - | cfssljson -bare ca -
        cd "$PWD"
    fi
    echo
}

# wait_for_central
# arguments:
#   - API server endpoint to ping
function wait_for_central {
    LOCAL_API_ENDPOINT="$1"

    echo -n "Waiting for Central to respond."
    set +e
    until $(curl --output /dev/null --silent --fail -k "https://$LOCAL_API_ENDPOINT/v1/ping"); do
        echo -n '.'
        sleep 1
    done
    set -e
    echo
}

# get_cluster_zip
# arguments:
#   - central API server endpoint reachable from this host
#   - name of cluster
#   - type of cluster (e.g., SWARM_CLUSTER)
#   - image reference (e.g., stackrox/prevent:$(git describe --tags --abbrev=10 --dirty))
#   - central API endpoint reachable from the container (e.g., my-host:8080)
#   - directory to drop files in
#   - extra fields in JSON format
function get_cluster_zip {
    LOCAL_API_ENDPOINT="$1"
    CLUSTER_NAME="$2"
    CLUSTER_TYPE="$3"
    CLUSTER_IMAGE="$4"
    CLUSTER_API_ENDPOINT="$5"
    OUTPUT_DIR="$6"
    RUNTIME_SUPPORT="$7"
    EXTRA_JSON="$8"

    echo "Creating a new cluster"
    if [ "$EXTRA_JSON" != "" ]; then
        EXTRA_JSON=", $EXTRA_JSON"
    fi
    export CLUSTER_JSON="{\"name\": \"$CLUSTER_NAME\", \"type\": \"$CLUSTER_TYPE\", \"prevent_image\": \"$CLUSTER_IMAGE\", \"central_api_endpoint\": \"$CLUSTER_API_ENDPOINT\", \"runtime_support\": $RUNTIME_SUPPORT $EXTRA_JSON}"

    TMP=$(mktemp)
    STATUS=$(curl -X POST \
        -d "$CLUSTER_JSON" \
        -k \
        -s \
        -o $TMP \
        -w "%{http_code}\n" \
        https://$LOCAL_API_ENDPOINT/v1/clusters)
    >&2 echo "Status: $STATUS"
    if [ "$STATUS" == "500" ]; then
      cat $TMP
      exit 1
    fi

    ID="$(cat ${TMP} | jq -r .cluster.id)"

    echo "Getting zip file for cluster ${ID}"
    STATUS=$(curl -X POST \
        -d "{\"id\": \"$ID\"}" \
        -k \
        -s \
        -o $OUTPUT_DIR/sensor-deploy.zip \
        -w "%{http_code}\n" \
        https://$LOCAL_API_ENDPOINT/api/extensions/clusters/zip)
    echo "Status: $STATUS"
    echo "Saved zip file to $OUTPUT_DIR"
    echo
}

# create_cluster
# arguments:
#   - central API server endpoint reachable from this host
#   - name of cluster
#   - type of cluster (e.g., SWARM_CLUSTER)
#   - image reference (e.g., stackrox/prevent:$(git describe --tags --abbrev=10 --dirty))
#   - central API endpoint reachable from the container (e.g., my-host:8080)
#   - directory to drop files in
#   - extra fields in JSON format
function create_cluster {
    LOCAL_API_ENDPOINT="$1"
    CLUSTER_NAME="$2"
    CLUSTER_TYPE="$3"
    CLUSTER_IMAGE="$4"
    CLUSTER_API_ENDPOINT="$5"
    OUTPUT_DIR="$6"
    EXTRA_JSON="$7"

    >&2 echo "Creating a new cluster"
    if [ "$EXTRA_JSON" != "" ]; then
        EXTRA_JSON=", $EXTRA_JSON"
    fi
    export CLUSTER_JSON="{\"name\": \"$CLUSTER_NAME\", \"type\": \"$CLUSTER_TYPE\", \"prevent_image\": \"$CLUSTER_IMAGE\", \"central_api_endpoint\": \"$CLUSTER_API_ENDPOINT\" $EXTRA_JSON}"

    TMP=$(mktemp)
    STATUS=$(curl -X POST \
        -d "$CLUSTER_JSON" \
        -k \
        -s \
        -o $TMP \
        -w "%{http_code}\n" \
        https://$LOCAL_API_ENDPOINT/v1/clusters)
    >&2 echo "Status: $STATUS"
    >&2 echo "Response: $(cat ${TMP})"
    cat "$TMP" | jq -r .deploymentYaml > "$OUTPUT_DIR/sensor-deploy.yaml"
    cat "$TMP" | jq -r .deploymentCommand > "$OUTPUT_DIR/sensor-deploy.sh"
    chmod +x "$OUTPUT_DIR/sensor-deploy.sh"
    cat "$TMP" | jq -r .cluster.id
    rm "$TMP"
    >&2 echo
}

# get_identity
# arguments:
#   - central API server endpoint reachable from this host
#   - ID of a cluster that has already been created
#   - directory to drop files in
function get_identity {
    LOCAL_API_ENDPOINT="$1"
    CLUSTER_ID="$2"
    OUTPUT_DIR="$3"

    echo "Getting identity for new cluster"
    export ID_JSON="{\"id\": \"$CLUSTER_ID\", \"type\": \"SENSOR_SERVICE\"}"
    TMP=$(mktemp)
    STATUS=$(curl -X POST \
        -d "$ID_JSON" \
        -k \
        -s \
        -o "$TMP" \
        -w "%{http_code}\n" \
        https://$LOCAL_API_ENDPOINT/v1/serviceIdentities)
    echo "Status: $STATUS"
    echo "Response: $(cat ${TMP})"
    cat "$TMP" | jq -r .certificate > "$OUTPUT_DIR/sensor-cert.pem"
    cat "$TMP" | jq -r .privateKey > "$OUTPUT_DIR/sensor-key.pem"
    rm "$TMP"
    echo
}

# get_authority
# arguments:
#   - central API server endpoint reachable from this host
#   - directory to drop files in
function get_authority {
    LOCAL_API_ENDPOINT="$1"
    OUTPUT_DIR="$2"

    echo "Getting CA certificate"
    TMP="$(mktemp)"
    STATUS=$(curl \
        -k \
        -s \
        -o "$TMP" \
        -w "%{http_code}\n" \
        https://$LOCAL_API_ENDPOINT/v1/authorities)
    echo "Status: $STATUS"
    echo "Response: $(cat ${TMP})"
    cat "$TMP" | jq -r .authorities[0].certificate > "$OUTPUT_DIR/central-ca.pem"
    rm "$TMP"
    echo
}

