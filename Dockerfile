FROM ubuntu:14.04

MAINTAINER xiaokaixuan xiaokaixuan@mail.com

RUN apt-get update && apt-get install -y lib32z1 lib32ncurses5 lib32bz2-1.0

RUN mkdir /root/disk /mnt/disk

WORKDIR /root

ADD Xware Xware
RUN chmod a+x /root/Xware/*

ENTRYPOINT ["/root/Xware/start"]

