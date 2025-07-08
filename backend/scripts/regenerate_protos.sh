#!/bin/bash

# Set up GOPATH if not already set
if [ -z "$GOPATH" ]; then
    export GOPATH=$HOME/go
    export PATH=$PATH:$GOPATH/bin
fi

# Ensure required protoc plugins are installed
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Create gen directory if it doesn't exist
mkdir -p proto/gen

# Remove old generated files
rm -rf proto/gen/*

# Generate protobuf/gRPC code
cd proto && \
for proto_file in *.proto; do
    protoc \
        --go_out=../proto/gen \
        --go_opt=paths=source_relative \
        --go-grpc_out=../proto/gen \
        --go-grpc_opt=paths=source_relative \
        -I. \
        "$proto_file"
done

# Make the script executable after regeneration
chmod +x ../scripts/regenerate_protos.sh 