# TapOnTap

Cheers a beer in [OnTap](https://github.com/commoncode/ontap) by touching an NFC token on a USB reader at the bar.


### Usage

Touch a valid NFC token on the reader once to Cheers the designated Keg. Once you've linked your token to your OnTap account, touches will be converted into Cheerses. You can touch before you register your token - any past touches will be linked with your account once you've registered.

TapOnTap attempts to send each touch to OnTap as they come in, but in the case of a network failure, it stores them locally until they can be synchronised.


### Install, configure and run

```
npm install
cp .env.example .env
# edit .env to configure
npm start
```

#### Installation on Linux

On linux you'll need the pcsclite libraries and pcscd:

```
apt-get install libpcsclite1 libpcsclite-dev pcscd
```

If you're using an **ACR122** you may also need to prevent the kernel nfc drivers loading as per [this blog post](https://choffee.co.uk/posts/2015/01/nfc_reader_acr122_linux/):

```
# add these two lines to /etc/modprobe.d/rfid-blacklist.conf:
blacklist pn533
blacklist nfc

# then run
modprobe -r pn533 nfc
reboot
```
^ these steps were required to get it running on a **Raspberry Pi Zero running Raspbian**.


### Network Connectivity

For simple Tap-to-Cheers functionality, TapOnTap just needs to be able to reach your OnTap instance.

For functionality that requires Ontap to read cards (ie card registration), OnTap has to reach TapOnTap. If you're behind a router/firewall, a quick'n'dirty hack is to open a reverse SSH tunnel:

```
# from your TapOnTap instance to your OnTap instance
ssh -R 5000:localhost:5000 user@yourontapserver

# TapOnTap now reachable on localhost:5000 of your OnTap instance
```

There are a couple of API endpoints for testing connectivity:

* `tapontap:/api/v1/ping` confirms you can reach TapOnTap
* `tapontap:/api/v1/pingontap` confirms that TapOnTap can reach OnTap
* `ontap:/api/v1/ping` confirms you can reach OnTap
* `ontap:/api/v1/pingtapontap` confirms OnTap can reach TapOnTap



### Hardware

Tested with an [ACS ACR-122](http://www.acs.com.hk/en/products/3/acr122u-usb-nfc-reader/) on MacOS and Raspbian, but it's using Martin Endler's [nfc-pcsc](https://github.com/pokusew/nfc-pcsc) under the hood so it should work with whatever readers it supports.

It doesn't do anything tricky with the tokens apart from attempt to read their uid, so the most basic gear should work there too.

Note [these instructions](#installation-on-linux) for getting the ACR122 to run on Linux.
