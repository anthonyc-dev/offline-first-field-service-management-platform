FROM grafana/grafana:9.6.2-ubuntu-22.04

USER root
# Remove unneeded files to reduce size
RUN rm -rf /usr/share/grafana/public/explore /usr/share/grafana/public/img /usr/share/grafana/public/vendor

USER grafana
