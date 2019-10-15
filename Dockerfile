FROM daocloud.io/library/ubuntu:14.04

MAINTAINER xiaokaixuan xiaokaixuan@mail.com

ENV DEBIAN_FRONTEND=noninteractive

RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone

ADD sources.list /etc/apt/
RUN apt-get update && apt-get install --no-install-recommends -y nginx lib32z1 lib32ncurses5 lib32bz2-1.0 2>/dev/null \
    && apt-get clean

ADD rootfs /
RUN chmod a+x /Xware/* && mkdir /data
    
VOLUME ["/data"]

EXPOSE 80

ENTRYPOINT ["/Xware/start"]

