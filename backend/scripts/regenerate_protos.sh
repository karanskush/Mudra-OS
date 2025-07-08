#!/bin/bash

# Set up GOPATH if not already set
if [ -z "$GOPATH" ]; then
    export GOPATH=$HOME/go
    export PATH=$PATH:$GOPATH/bin
fi

# Ensure required protoc plugins are installed
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Remove old generated files
rm -rf proto/gen/*

# Create base gen directory
mkdir -p proto/gen

# Generate protobuf/gRPC code
cd proto/src && \
for proto_file in *.proto; do
    # Get the package name without extension
    package_name=$(basename "$proto_file" .proto)
    
    # Create package directory
    mkdir -p "../../proto/gen/$package_name"
    
    protoc \
        --go_out="../../proto/gen/$package_name" \
        --go_opt=paths=source_relative \
        --go-grpc_out="../../proto/gen/$package_name" \
        --go-grpc_opt=paths=source_relative \
        -I. \
        "$proto_file"
done

# Make the script executable after regeneration
chmod +x ../../scripts/regenerate_protos.sh 