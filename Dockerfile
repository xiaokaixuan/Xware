FROM daocloud.io/library/ubuntu:14.04

MAINTAINER xiaokaixuan xiaokaixuan@mail.com

RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone
RUN mv /etc/apt/sources.list /etc/apt/sources.list.old
COPY sources.list /etc/apt/

RUN apt-get update && apt-get install --no-install-recommends -y nginx lib32z1 lib32ncurses5 lib32bz2-1.0 2>/dev/null && apt-get clean

ADD rootfs.tar.gz /
ADD Xware /root/Xware

RUN chmod a+x /root/Xware/*

RUN mkdir /root/disk /mnt/disk

EXPOSE 80

ENTRYPOINT ["/root/Xware/start"]

