#!/usr/bin/env bash

aws s3 cp index-bar.html s3://cognitospikewebsitebar0432540e-content756c49df-1qti6js59sjuy/index.html && \
aws s3 cp login.html s3://cognitospikewebsitebar0432540e-content756c49df-1qti6js59sjuy/login.html && \
aws s3 cp index-foo.html s3://cognitospikewebsitefoodc02a22e-content756c49df-s0pqk0x84fmp/index.html && \
aws s3 cp index-baz.html s3://cognitospikewebsitebaz5226c7e5-content756c49df-12s38xg1ts5tq/index.html
