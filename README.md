### Docker-Xware
```bash
# Run Xware
docker run -d --privileged --mac-address 02:42:ac:11:00:02 --name xware -v ~/disk:/root/disk -p 81:80 xware

# Get Xware code
docker logs container-id or name

# You can visit http://localhost:81 manager Xware.
```


