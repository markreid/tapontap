# Raspberry Pi TaponTap

Quick guide to getting it up and running on a Pi.


_This was tested on a **Raspberry Pi Zero W** running **Raspbian Jessie**._

### Installation


Before you run the installation instructions from the [readme](../readme.md), you'll need to install the pcsclite libraries and pcscd:

```
apt-get install libpcsclite1 libpcsclite-dev pcscd
```

You should now be able to proceed with the regular installation process:

```
npm install
cp .env.example .env
# edit .env to configure
npm start
```


### ACR122 reader compatibility

If you're using an **ACS ACR122U** USB reader you might also need to prevent the kernel nfc drivers loading, as per [this blog post](https://choffee.co.uk/posts/2015/01/nfc_reader_acr122_linux/):

```
# add these two lines to /etc/modprobe.d/rfid-blacklist.conf:
blacklist pn533
blacklist nfc

# then run
modprobe -r pn533 nfc
reboot
```

#### Enabling LED & buzzer control

As per [this github issue](https://github.com/pokusew/nfc-pcsc/issues/13), to allow TapOnTap to control the LEDs and buzzer on an ACR122, you'll need to adjust the default behaviour of the system PCSC driver.

On Raspbian Jessie you need to edit `/usr/lib/pcsc/drivers/ifd-ccid.bundle/Contents/Info.plist`.

Find `ifdDriverOptions` and replace `0x0000` with `0x0001`.

A reboot may be required.


### Run as a service with PM2

You can use [PM2](http://pm2.keymetrics.io/) to bring the server back if it terminates or if your system reboots. PM2 also gives you a bunch of nice features like analytics, logging, remote deployments etc.


```
# install pm2
npm install -g pm2

# generate script to run pm2 as a service (copy and paste the output)
pm2 startup

# start the tapontap process and give it a name
pm2 index.js --name "tapontap"

# save the process to pm2 so it loads on boot
pm2 save
```

