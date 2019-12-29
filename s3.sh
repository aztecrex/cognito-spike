#!/usr/bin/env bash

aws s3 cp index-bar.html s3://cognitospikewebsitebar0432540e-content756c49df-14wvn7trpubtb/index.html && \
aws s3 cp index-foo.html s3://cognitospikewebsitefoodc02a22e-content756c49df-1j7aceqpb02be/index.html && \
aws s3 cp index-baz.html s3://cognitospikewebsitebaz5226c7e5-content756c49df-1obreylkrwyqk/index.html
