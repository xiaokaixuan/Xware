FROM daocloud.io/library/ubuntu:14.04

MAINTAINER xiaokaixuan xiaokaixuan@mail.com

RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone
RUN mv /etc/apt/sources.list /etc/apt/sources.list.old
COPY sources.list /etc/apt/

RUN apt-get update && apt-get install --no-install-recommends -y nginx lib32z1 lib32ncurses5 lib32bz2-1.0 2>/dev/null && apt-get clean

RUN echo '\n\nserver {\n\
	listen 9100;\n\
	location / {\n\
		proxy_redirect off;\n\
		proxy_set_header Host $host;\n\
		proxy_set_header X-Real-IP $remote_addr;\n\
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
		proxy_pass http://127.0.0.1:9000;\n\
	}\n\
}' >>/etc/nginx/sites-enabled/default

RUN mkdir /root/disk /mnt/disk

WORKDIR /root

ADD Xware Xware
RUN chmod a+x /root/Xware/*

EXPOSE 80 9100

ENTRYPOINT ["/root/Xware/start"]

